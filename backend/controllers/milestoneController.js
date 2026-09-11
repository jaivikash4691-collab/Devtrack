const Milestone = require('../models/Milestone');
const Task = require('../models/Task');
const { logActivity } = require('../services/activityService');
const { calculateProjectHealth } = require('../services/projectHealthService');
const { emitToProject } = require('../config/socket');

// @desc    Get milestones for a project
// @route   GET /api/projects/:projectId/milestones
// @access  Private
const getMilestones = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const milestones = await Milestone.find({ project: projectId }).sort({ deadline: 1 });

    // Calculate linked tasks progress for each milestone
    const populatedMilestones = await Promise.all(
      milestones.map(async (m) => {
        const linkedTasks = await Task.find({ milestone: m._id });
        const total = linkedTasks.length;
        const completed = linkedTasks.filter((t) => t.status === 'COMPLETED').length;

        // Auto calculate progress if linked tasks exist
        let calculatedProgress = m.progress;
        if (total > 0) {
          calculatedProgress = Math.round((completed / total) * 100);
          if (calculatedProgress !== m.progress) {
            m.progress = calculatedProgress;
            if (calculatedProgress === 100 && m.status !== 'COMPLETED') {
              m.status = 'COMPLETED';
            }
            await m.save();
          }
        }

        const mObj = m.toObject();
        mObj.linkedTasksCount = total;
        mObj.completedTasksCount = completed;
        mObj.isOverdue = m.status !== 'COMPLETED' && m.deadline && new Date(m.deadline) < new Date();
        return mObj;
      })
    );

    res.status(200).json({
      success: true,
      count: populatedMilestones.length,
      milestones: populatedMilestones,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a milestone
// @route   POST /api/projects/:projectId/milestones
// @access  Private (Manager only)
const createMilestone = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name, description, startDate, deadline, status = 'UPCOMING', progress = 0 } = req.body;

    const milestone = await Milestone.create({
      project: projectId,
      name,
      description: description || '',
      startDate: startDate || new Date(),
      deadline,
      status,
      progress,
    });

    await logActivity({
      projectId,
      userId: req.user._id,
      action: 'MILESTONE_CREATED',
      description: `${req.user.name} created milestone "${milestone.name}"`,
      metadata: { milestoneId: milestone._id },
    });

    emitToProject(projectId.toString(), 'milestone:created', milestone);

    calculateProjectHealth(projectId).then((health) => {
      emitToProject(projectId.toString(), 'health:updated', health);
    }).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Milestone created successfully.',
      milestone,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update milestone
// @route   PUT /api/milestones/:id
// @access  Private (Manager only)
const updateMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found.' });
    }

    const { name, description, startDate, deadline, status, progress } = req.body;

    if (name) milestone.name = name;
    if (description !== undefined) milestone.description = description;
    if (startDate) milestone.startDate = startDate;
    if (deadline) milestone.deadline = deadline;
    if (status) milestone.status = status;
    if (progress !== undefined) milestone.progress = progress;

    if (milestone.progress === 100 && milestone.status !== 'COMPLETED') {
      milestone.status = 'COMPLETED';
    }

    await milestone.save();

    await logActivity({
      projectId: milestone.project,
      userId: req.user._id,
      action: 'MILESTONE_UPDATED',
      description: `${req.user.name} updated milestone "${milestone.name}" (${milestone.progress}% complete)`,
      metadata: { milestoneId: milestone._id, status: milestone.status, progress: milestone.progress },
    });

    emitToProject(milestone.project.toString(), 'milestone:updated', milestone);

    calculateProjectHealth(milestone.project).then((health) => {
      emitToProject(milestone.project.toString(), 'health:updated', health);
    }).catch(console.error);

    res.status(200).json({
      success: true,
      message: 'Milestone updated successfully.',
      milestone,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete milestone
// @route   DELETE /api/milestones/:id
// @access  Private (Manager only)
const deleteMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found.' });
    }

    const projectId = milestone.project;
    const milestoneName = milestone.name;

    // Unlink any tasks linked to this milestone
    await Task.updateMany({ milestone: milestone._id }, { $set: { milestone: null } });
    await Milestone.findByIdAndDelete(milestone._id);

    await logActivity({
      projectId,
      userId: req.user._id,
      action: 'MILESTONE_UPDATED',
      description: `${req.user.name} deleted milestone "${milestoneName}"`,
    });

    emitToProject(projectId.toString(), 'milestone:deleted', { milestoneId: milestone._id });

    calculateProjectHealth(projectId).then((health) => {
      emitToProject(projectId.toString(), 'health:updated', health);
    }).catch(console.error);

    res.status(200).json({
      success: true,
      message: 'Milestone deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
};
