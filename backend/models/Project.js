const mongoose = require('mongoose');

const projectMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['manager', 'member', 'viewer'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a project name'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a project description'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      enum: ['Hackathon', 'Capstone', 'Open Source', 'Startup', 'Coursework', 'General'],
      default: 'General',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [projectMemberSchema],
    startDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      required: [true, 'Please provide an expected completion deadline'],
    },
    technologies: {
      type: [String],
      default: [],
    },
    githubUrl: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'ON_HOLD', 'ARCHIVED'],
      default: 'ACTIVE',
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
    },
    healthScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    healthStatus: {
      type: String,
      enum: ['Healthy', 'Needs Attention', 'At Risk', 'Critical'],
      default: 'Healthy',
    },
    lastHealthCalculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ owner: 1, status: 1 });
projectSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Project', projectSchema);
