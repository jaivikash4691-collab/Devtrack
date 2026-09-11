const Activity = require('../models/Activity');

// @desc    Get activity timeline for a project
// @route   GET /api/projects/:projectId/activity
// @access  Private
const getProjectActivity = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 50;

    const activities = await Activity.find({ project: projectId })
      .populate('user', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectActivity,
};
