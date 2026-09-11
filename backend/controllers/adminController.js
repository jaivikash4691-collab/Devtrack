const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');

// @desc    Get platform-level statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'ACTIVE' });
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'COMPLETED' });
    const overdueTasks = await Task.countDocuments({
      status: { $ne: 'COMPLETED' },
      deadline: { $lt: new Date() },
    });

    // Health distribution across all projects
    const healthyProjects = await Project.countDocuments({ healthStatus: 'Healthy' });
    const needsAttentionProjects = await Project.countDocuments({ healthStatus: 'Needs Attention' });
    const atRiskProjects = await Project.countDocuments({ healthStatus: 'At Risk' });
    const criticalProjects = await Project.countDocuments({ healthStatus: 'Critical' });

    // Users by role
    const studentCount = await User.countDocuments({ role: 'student' });
    const managerCount = await User.countDocuments({ role: 'manager' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks,
        overdueTasks,
        overallTaskCompletionRate:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        healthDistribution: {
          healthy: healthyProjects,
          needsAttention: needsAttentionProjects,
          atRisk: atRiskProjects,
          critical: criticalProjects,
        },
        rolesDistribution: {
          student: studentCount,
          manager: managerCount,
          admin: adminCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin view)
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin only)
const toggleUserStatus = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot deactivate their own account.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user system role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['student', 'manager', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}.`,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlatformStats,
  getAllUsers,
  toggleUserStatus,
  changeUserRole,
};
