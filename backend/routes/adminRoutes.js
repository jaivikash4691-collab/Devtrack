const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getAllUsers,
  toggleUserStatus,
  changeUserRole,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(requireAdmin);

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.put('/users/:id/role', changeUserRole);

module.exports = router;
