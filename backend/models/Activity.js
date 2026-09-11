const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Activity must belong to a project'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'PROJECT_CREATED',
        'PROJECT_UPDATED',
        'TASK_CREATED',
        'TASK_UPDATED',
        'TASK_STATUS_CHANGED',
        'TASK_DELETED',
        'TASK_ASSIGNED',
        'COMMENT_ADDED',
        'MILESTONE_CREATED',
        'MILESTONE_UPDATED',
        'MEMBER_ADDED',
        'MEMBER_REMOVED',
        'MEMBER_ROLE_CHANGED',
        'GITHUB_SYNCED',
        'HEALTH_RECALCULATED',
      ],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
