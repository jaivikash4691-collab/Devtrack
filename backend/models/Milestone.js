const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Milestone must belong to a project'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a milestone name'],
      trim: true,
      maxlength: [120, 'Milestone name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      required: [true, 'Please provide a milestone deadline'],
    },
    status: {
      type: String,
      enum: ['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED'],
      default: 'UPCOMING',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

milestoneSchema.index({ project: 1, deadline: 1 });

module.exports = mongoose.model('Milestone', milestoneSchema);
