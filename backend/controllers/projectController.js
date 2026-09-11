const Project = require('../models/Project');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const User = require('../models/User');
const { logActivity, createNotification } = require('../services/activityService');
const { calculateProjectHealth } = require('../services/projectHealthService');
const { emitToProject } = require('../config/socket');

// @desc    Get projects for current user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const { category, status, search, scope } = req.query;

    let filter = {};

    if (scope === 'all' && req.user.role === 'admin') {
      // Admin sees everything
    } else if (scope === 'public') {
      filter.visibility = 'public';
    } else {
      // User's own or joined projects
      filter.$or = [
        { owner: req.user._id },
        { 'members.user': req.user._id },
      ];
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search && search.trim() !== '') {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    const projects = await Project.find(filter)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role')
      .sort({ updatedAt: -1 });

    // Attach task & milestone counts
    const projectsWithStats = await Promise.all(
      projects.map(async (p) => {
        const totalTasks = await Task.countDocuments({ project: p._id });
        const completedTasks = await Task.countDocuments({ project: p._id, status: 'COMPLETED' });
        const overdueTasks = await Task.countDocuments({
          project: p._id,
          status: { $ne: 'COMPLETED' },
          deadline: { $lt: new Date() },
        });
        const totalMilestones = await Milestone.countDocuments({ project: p._id });

        const pObj = p.toObject();
        pObj.stats = {
          totalTasks,
          completedTasks,
          overdueTasks,
          totalMilestones,
          taskCompletionPercentage:
            totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        };
        return pObj;
      })
    );

    res.status(200).json({
      success: true,
      count: projectsWithStats.length,
      projects: projectsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Manager/Lead or Admin)
const createProject = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      startDate,
      deadline,
      technologies,
      githubUrl,
      visibility,
    } = req.body;

    const project = await Project.create({
      name,
      description,
      category: category || 'General',
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'manager',
          joinedAt: new Date(),
        },
      ],
      startDate: startDate || new Date(),
      deadline,
      technologies: Array.isArray(technologies) ? technologies : [],
      githubUrl: githubUrl || '',
      visibility: visibility || 'private',
    });

    // Populate owner
    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role');

    // Audit log
    await logActivity({
      projectId: project._id,
      userId: req.user._id,
      action: 'PROJECT_CREATED',
      description: `${req.user.name} created the project "${project.name}"`,
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      project: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project details
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar bio skills githubUsername')
      .populate('members.user', 'name email avatar bio skills githubUsername role');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const totalTasks = await Task.countDocuments({ project: project._id });
    const completedTasks = await Task.countDocuments({
      project: project._id,
      status: 'COMPLETED',
    });
    const overdueTasks = await Task.countDocuments({
      project: project._id,
      status: { $ne: 'COMPLETED' },
      deadline: { $lt: new Date() },
    });
    const totalMilestones = await Milestone.countDocuments({ project: project._id });

    const response = project.toObject();
    response.stats = {
      totalTasks,
      completedTasks,
      overdueTasks,
      totalMilestones,
      taskCompletionPercentage:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
    response.userRole = req.projectRole || 'member';

    res.status(200).json({
      success: true,
      project: response,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Manager only)
const updateProject = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      startDate,
      deadline,
      technologies,
      githubUrl,
      status,
      visibility,
    } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (name) project.name = name;
    if (description) project.description = description;
    if (category) project.category = category;
    if (startDate) project.startDate = startDate;
    if (deadline) project.deadline = deadline;
    if (technologies) project.technologies = technologies;
    if (githubUrl !== undefined) project.githubUrl = githubUrl;
    if (status) project.status = status;
    if (visibility) project.visibility = visibility;

    await project.save();

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role');

    await logActivity({
      projectId: project._id,
      userId: req.user._id,
      action: 'PROJECT_UPDATED',
      description: `${req.user.name} updated project details`,
    });

    emitToProject(project._id.toString(), 'project:updated', populated);

    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      project: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Owner or Admin only)
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner or system admin can delete this project.',
      });
    }

    // Cascade delete associated records
    await Task.deleteMany({ project: project._id });
    await Milestone.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);

    res.status(200).json({
      success: true,
      message: 'Project and all associated tasks/milestones deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Invite/Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (Manager only)
const inviteMember = async (req, res, next) => {
  try {
    const { userId, email, role = 'member' } = req.body;

    let targetUser;
    if (userId) {
      targetUser = await User.findById(userId);
    } else if (email) {
      targetUser = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User with specified ID or email was not found.',
      });
    }

    const project = await Project.findById(req.params.id);
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === targetUser._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: `${targetUser.name} is already a member of this project.`,
      });
    }

    project.members.push({
      user: targetUser._id,
      role: role || 'member',
      joinedAt: new Date(),
    });

    await project.save();

    // Log Activity & Create Notification
    await logActivity({
      projectId: project._id,
      userId: req.user._id,
      action: 'MEMBER_ADDED',
      description: `${req.user.name} added ${targetUser.name} to the project as a ${role}`,
      metadata: { targetUserId: targetUser._id, role },
    });

    await createNotification({
      recipientId: targetUser._id,
      senderId: req.user._id,
      type: 'PROJECT_INVITE',
      title: 'Added to Project',
      message: `${req.user.name} added you to the project "${project.name}" as a ${role}.`,
      relatedProjectId: project._id,
    });

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar bio skills githubUsername role');

    emitToProject(project._id.toString(), 'project:members_updated', populated.members);

    res.status(200).json({
      success: true,
      message: `${targetUser.name} was added to the project.`,
      members: populated.members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (Manager only)
const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const project = await Project.findById(req.params.id);

    if (project.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'The project owner cannot be removed from the project.',
      });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== userId
    );

    await project.save();

    const removedUser = await User.findById(userId);
    const userName = removedUser ? removedUser.name : 'A member';

    await logActivity({
      projectId: project._id,
      userId: req.user._id,
      action: 'MEMBER_REMOVED',
      description: `${req.user.name} removed ${userName} from the project`,
    });

    const populated = await Project.findById(project._id)
      .populate('members.user', 'name email avatar role');

    emitToProject(project._id.toString(), 'project:members_updated', populated.members);

    res.status(200).json({
      success: true,
      message: `${userName} was removed from the project.`,
      members: populated.members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update member project role
// @route   PUT /api/projects/:id/members/:userId
// @access  Private (Manager only)
const updateMemberRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['manager', 'member', 'viewer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const project = await Project.findById(req.params.id);
    const member = project.members.find((m) => m.user.toString() === userId);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found in this project.' });
    }

    member.role = role;
    await project.save();

    const targetUser = await User.findById(userId);

    await logActivity({
      projectId: project._id,
      userId: req.user._id,
      action: 'MEMBER_ROLE_CHANGED',
      description: `${req.user.name} changed ${targetUser?.name || 'a member'}'s role to ${role}`,
    });

    res.status(200).json({
      success: true,
      message: 'Member role updated successfully.',
      members: project.members,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  inviteMember,
  removeMember,
  updateMemberRole,
};
