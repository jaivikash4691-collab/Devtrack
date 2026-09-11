const Task = require('../models/Task');
const Project = require('../models/Project');
const { logActivity, createNotification } = require('../services/activityService');
const { calculateProjectHealth } = require('../services/projectHealthService');
const { emitToProject } = require('../config/socket');

// @desc    Get tasks for a project with rich filtering
// @route   GET /api/projects/:projectId/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assignedTo, milestone, search, overdue } = req.query;

    const query = { project: projectId };

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (priority && priority !== 'ALL') {
      query.priority = priority;
    }

    if (assignedTo && assignedTo !== 'ALL') {
      if (assignedTo === 'UNASSIGNED') {
        query.assignedTo = null;
      } else {
        query.assignedTo = assignedTo;
      }
    }

    if (milestone && milestone !== 'ALL') {
      query.milestone = milestone;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (overdue === 'true') {
      query.status = { $ne: 'COMPLETED' };
      query.deadline = { $lt: new Date() };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('milestone', 'name status progress')
      .populate('comments.user', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/projects/:projectId/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const {
      title,
      description,
      assignedTo,
      status = 'TODO',
      priority = 'MEDIUM',
      deadline,
      milestone,
      tags = [],
      subtasks = [],
    } = req.body;

    const task = await Task.create({
      project: projectId,
      title,
      description: description || '',
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      status,
      priority,
      deadline: deadline || null,
      milestone: milestone || null,
      tags,
      subtasks,
      completedAt: status === 'COMPLETED' ? new Date() : null,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('milestone', 'name status progress');

    // Audit log
    await logActivity({
      projectId,
      userId: req.user._id,
      action: 'TASK_CREATED',
      description: `${req.user.name} created task "${task.title}"`,
      metadata: { taskId: task._id, status, priority },
    });

    // Notify assigned member if someone else assigned it
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      const project = await Project.findById(projectId);
      await createNotification({
        recipientId: assignedTo,
        senderId: req.user._id,
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: `${req.user.name} assigned you the task "${task.title}" in ${project?.name || 'project'}.`,
        relatedProjectId: projectId,
        relatedTaskId: task._id,
      });
    }

    // Broadcast socket event
    emitToProject(projectId.toString(), 'task:created', populatedTask);

    // Recalculate health
    calculateProjectHealth(projectId).then((health) => {
      emitToProject(projectId.toString(), 'health:updated', health);
    }).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task details
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name owner deadline')
      .populate('assignedTo', 'name email avatar bio skills')
      .populate('createdBy', 'name email avatar')
      .populate('milestone', 'name deadline status progress')
      .populate('comments.user', 'name email avatar');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details or status
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const {
      title,
      description,
      assignedTo,
      status,
      priority,
      deadline,
      milestone,
      tags,
      subtasks,
    } = req.body;

    const previousStatus = task.status;
    const previousAssignee = task.assignedTo ? task.assignedTo.toString() : null;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (priority) task.priority = priority;
    if (deadline !== undefined) task.deadline = deadline || null;
    if (milestone !== undefined) task.milestone = milestone || null;
    if (tags !== undefined) task.tags = tags;
    if (subtasks !== undefined) task.subtasks = subtasks;

    if (status && status !== previousStatus) {
      task.status = status;
      if (status === 'COMPLETED') {
        task.completedAt = new Date();
      } else {
        task.completedAt = null;
      }
    }

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('milestone', 'name status progress')
      .populate('comments.user', 'name email avatar');

    // Audit log
    if (status && status !== previousStatus) {
      await logActivity({
        projectId: task.project,
        userId: req.user._id,
        action: 'TASK_STATUS_CHANGED',
        description: `${req.user.name} moved "${task.title}" to ${status}`,
        metadata: { taskId: task._id, oldStatus: previousStatus, newStatus: status },
      });
    } else {
      await logActivity({
        projectId: task.project,
        userId: req.user._id,
        action: 'TASK_UPDATED',
        description: `${req.user.name} updated task "${task.title}"`,
        metadata: { taskId: task._id },
      });
    }

    // Notify new assignee if reassigned
    if (
      assignedTo &&
      assignedTo.toString() !== previousAssignee &&
      assignedTo.toString() !== req.user._id.toString()
    ) {
      await createNotification({
        recipientId: assignedTo,
        senderId: req.user._id,
        type: 'TASK_ASSIGNED',
        title: 'Task Assigned',
        message: `${req.user.name} assigned you the task "${task.title}".`,
        relatedProjectId: task.project,
        relatedTaskId: task._id,
      });
    }

    // Broadcast socket event
    emitToProject(task.project.toString(), 'task:updated', populatedTask);

    // Recalculate health
    calculateProjectHealth(task.project).then((health) => {
      emitToProject(task.project.toString(), 'health:updated', health);
    }).catch(console.error);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const projectId = task.project;
    const taskTitle = task.title;

    await Task.findByIdAndDelete(task._id);

    await logActivity({
      projectId,
      userId: req.user._id,
      action: 'TASK_DELETED',
      description: `${req.user.name} deleted task "${taskTitle}"`,
    });

    emitToProject(projectId.toString(), 'task:deleted', { taskId: task._id });

    calculateProjectHealth(projectId).then((health) => {
      emitToProject(projectId.toString(), 'health:updated', health);
    }).catch(console.error);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Comment text is required.' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const newComment = {
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date(),
    };

    task.comments.push(newComment);
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.user', 'name email avatar');

    const addedComment = populatedTask.comments[populatedTask.comments.length - 1];

    await logActivity({
      projectId: task.project,
      userId: req.user._id,
      action: 'COMMENT_ADDED',
      description: `${req.user.name} commented on "${task.title}"`,
      metadata: { taskId: task._id, commentId: addedComment._id },
    });

    // Notify assigned user if different from author
    if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
      await createNotification({
        recipientId: task.assignedTo,
        senderId: req.user._id,
        type: 'COMMENT_ADDED',
        title: 'New Comment on Task',
        message: `${req.user.name} commented on "${task.title}": "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`,
        relatedProjectId: task.project,
        relatedTaskId: task._id,
      });
    }

    emitToProject(task.project.toString(), 'comment:added', {
      taskId: task._id,
      comment: addedComment,
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      comment: addedComment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle subtask completion
// @route   PATCH /api/tasks/:id/subtasks/:subtaskId
// @access  Private
const toggleSubtask = async (req, res, next) => {
  try {
    const { id, subtaskId } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({ success: false, message: 'Subtask not found.' });
    }

    subtask.completed = !subtask.completed;
    await task.save();

    res.status(200).json({
      success: true,
      subtask,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  toggleSubtask,
};
