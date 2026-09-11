const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const Activity = require('../models/Activity');
const { calculateProjectHealth } = require('../services/projectHealthService');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});
  await Milestone.deleteMany({});
  await Activity.deleteMany({});
});

describe('Project Health Algorithm', () => {
  it('should calculate 100% Healthy for a project with completed tasks and on-track milestones', async () => {
    const user = await User.create({
      name: 'Test Lead',
      email: 'lead@test.com',
      password: 'Password123!',
      role: 'manager',
    });

    const project = await Project.create({
      name: 'Alpha Project',
      description: 'Test project description',
      owner: user._id,
      members: [{ user: user._id, role: 'manager' }],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const milestone = await Milestone.create({
      project: project._id,
      name: 'Phase 1',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'COMPLETED',
      progress: 100,
    });

    await Task.create({
      project: project._id,
      title: 'Task 1',
      assignedTo: user._id,
      createdBy: user._id,
      status: 'COMPLETED',
      milestone: milestone._id,
      completedAt: new Date(),
    });

    await Activity.create({
      project: project._id,
      user: user._id,
      action: 'TASK_STATUS_CHANGED',
      description: 'Completed Task 1',
    });

    const health = await calculateProjectHealth(project._id);

    expect(health.overallScore).toBeGreaterThanOrEqual(80);
    expect(health.healthStatus).toBe('Healthy');
    expect(health.factors.taskCompletion.score).toBe(100);
    expect(health.factors.deadlinePerformance.score).toBe(100);
  });

  it('should penalize health score when tasks are overdue', async () => {
    const user = await User.create({
      name: 'Test Lead',
      email: 'lead2@test.com',
      password: 'Password123!',
      role: 'manager',
    });

    const project = await Project.create({
      name: 'Beta Project',
      description: 'Test project description',
      owner: user._id,
      members: [{ user: user._id, role: 'manager' }],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Create overdue tasks (deadline in past, not completed)
    const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    await Task.create([
      {
        project: project._id,
        title: 'Overdue Task 1',
        assignedTo: user._id,
        createdBy: user._id,
        status: 'TODO',
        deadline: pastDate,
      },
      {
        project: project._id,
        title: 'Overdue Task 2',
        assignedTo: user._id,
        createdBy: user._id,
        status: 'IN_PROGRESS',
        deadline: pastDate,
      },
    ]);

    const health = await calculateProjectHealth(project._id);

    expect(health.factors.deadlinePerformance.score).toBeLessThanOrEqual(50);
    expect(health.insights.some((i) => i.type === 'warning')).toBe(true);
  });
});
