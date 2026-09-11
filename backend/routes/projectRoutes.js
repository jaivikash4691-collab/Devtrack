const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  inviteMember,
  removeMember,
  updateMemberRole,
} = require('../controllers/projectController');
const { getTasks, createTask } = require('../controllers/taskController');
const { getMilestones, createMilestone } = require('../controllers/milestoneController');
const { getProjectHealth } = require('../controllers/healthController');
const { getProjectGitHubStats, syncProjectGitHub } = require('../controllers/githubController');
const { getProjectActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');
const {
  requireProjectAccess,
  requireProjectManager,
} = require('../middleware/roleMiddleware');
const {
  projectValidation,
  taskValidation,
  milestoneValidation,
} = require('../utils/validators');

// Base project routes
router.route('/')
  .get(protect, getProjects)
  .post(protect, projectValidation, createProject);

router.route('/:id')
  .get(protect, requireProjectAccess, getProjectById)
  .put(protect, requireProjectManager, updateProject)
  .delete(protect, deleteProject);

// Member management
router.post('/:id/members', protect, requireProjectManager, inviteMember);
router.delete('/:id/members/:userId', protect, requireProjectManager, removeMember);
router.put('/:id/members/:userId', protect, requireProjectManager, updateMemberRole);

// Sub-resources routed through project ID
router.route('/:projectId/tasks')
  .get(protect, requireProjectAccess, getTasks)
  .post(protect, requireProjectAccess, taskValidation, createTask);

router.route('/:projectId/milestones')
  .get(protect, requireProjectAccess, getMilestones)
  .post(protect, requireProjectManager, milestoneValidation, createMilestone);

// Project Health & Insights
router.get('/:projectId/health', protect, requireProjectAccess, getProjectHealth);

// GitHub Integration
router.get('/:projectId/github', protect, requireProjectAccess, getProjectGitHubStats);
router.post('/:projectId/github/sync', protect, requireProjectManager, syncProjectGitHub);

// Activity Timeline
router.get('/:projectId/activity', protect, requireProjectAccess, getProjectActivity);

module.exports = router;
