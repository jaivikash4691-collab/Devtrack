const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const { emitToProject, emitToUser } = require('../config/socket');

/**
 * Log a project activity event and broadcast in real-time
 */
const logActivity = async ({ projectId, userId, action, description, metadata = {} }) => {
  try {
    const activity = await Activity.create({
      project: projectId,
      user: userId,
      action,
      description,
      metadata,
    });

    const populatedActivity = await Activity.findById(activity._id).populate(
      'user',
      'name email avatar role'
    );

    // Broadcast activity to the project room
    emitToProject(projectId.toString(), 'activity:new', populatedActivity);

    return populatedActivity;
  } catch (error) {
    console.error(`[ActivityService] Error logging activity: ${error.message}`);
  }
};

/**
 * Create a user notification and broadcast in real-time
 */
const createNotification = async ({
  recipientId,
  senderId,
  type,
  title,
  message,
  relatedProjectId = null,
  relatedTaskId = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
      relatedProject: relatedProjectId,
      relatedTask: relatedTaskId,
    });

    const populated = await Notification.findById(notification._id)
      .populate('sender', 'name email avatar')
      .populate('relatedProject', 'name')
      .populate('relatedTask', 'title');

    // Broadcast notification directly to the user's socket room
    emitToUser(recipientId.toString(), 'notification:new', populated);

    return populated;
  } catch (error) {
    console.error(`[ActivityService] Error creating notification: ${error.message}`);
  }
};

module.exports = {
  logActivity,
  createNotification,
};
