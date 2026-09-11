const { calculateProjectHealth } = require('../services/projectHealthService');

// @desc    Get project health score, factors breakdown, and smart insights
// @route   GET /api/projects/:projectId/health
// @access  Private
const getProjectHealth = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const healthData = await calculateProjectHealth(projectId);

    res.status(200).json({
      success: true,
      health: healthData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectHealth,
};
