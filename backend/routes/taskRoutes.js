const express = require('express');
const router = express.Router();
const {
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  toggleSubtask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.post('/:id/comments', protect, addComment);
router.patch('/:id/subtasks/:subtaskId', protect, toggleSubtask);

module.exports = router;
