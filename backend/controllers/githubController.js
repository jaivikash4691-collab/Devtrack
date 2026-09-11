const Project = require('../models/Project');
const { fetchGitHubStats } = require('../services/githubService');
const { logActivity } = require('../services/activityService');

// @desc    Get GitHub stats for a project
// @route   GET /api/projects/:projectId/github
// @access  Private
const getProjectGitHubStats = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const githubUrl = req.query.url || project.githubUrl;

    if (!githubUrl || githubUrl.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'No GitHub repository URL configured for this project.',
      });
    }

    const stats = await fetchGitHubStats(githubUrl);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync / Refresh GitHub repository stats
// @route   POST /api/projects/:projectId/github/sync
// @access  Private (Manager only)
const syncProjectGitHub = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (!project.githubUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid GitHub repository URL in project settings.',
      });
    }

    const stats = await fetchGitHubStats(project.githubUrl);

    await logActivity({
      projectId,
      userId: req.user._id,
      action: 'GITHUB_SYNCED',
      description: `${req.user.name} synchronized GitHub repository data (${stats.fullName})`,
      metadata: { repo: stats.fullName, stars: stats.stars, commits: stats.recentCommits?.length },
    });

    res.status(200).json({
      success: true,
      message: 'GitHub repository statistics synchronized successfully.',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectGitHubStats,
  syncProjectGitHub,
};
