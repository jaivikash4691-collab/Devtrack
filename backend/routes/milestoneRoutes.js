const express = require('express');
const router = express.Router();
const {
  updateMilestone,
  deleteMilestone,
} = require('../controllers/milestoneController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:id')
  .put(protect, updateMilestone)
  .delete(protect, deleteMilestone);

module.exports = router;
