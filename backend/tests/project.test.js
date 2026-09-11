const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Project = require('../models/Project');

let mongoServer;
let token;
let user;

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

  const res = await request(app).post('/api/auth/register').send({
    name: 'Lead PM',
    email: 'pm@example.com',
    password: 'Password123!',
    role: 'manager',
  });
  token = res.body.token;
  user = res.body.user;
});

describe('Project API Endpoints', () => {
  it('should create a project with owner and manager role', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'DevTrack NextGen',
        description: 'Building project health tracker',
        category: 'Open Source',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.project.name).toBe('DevTrack NextGen');
    expect(res.body.project.owner._id.toString()).toBe(user._id.toString());
  });

  it('should fetch user projects list', async () => {
    await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Project 1',
        description: 'First project',
        category: 'Capstone',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.projects.length).toBe(1);
  });

  it('should reject non-members from accessing private project details', async () => {
    const projectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Secret Project',
        description: 'Private confidential project',
        visibility: 'private',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

    const otherUserRes = await request(app).post('/api/auth/register').send({
      name: 'Other Student',
      email: 'other@example.com',
      password: 'Password123!',
      role: 'student',
    });
    const otherToken = otherUserRes.body.token;

    const res = await request(app)
      .get(`/api/projects/${projectRes.body.project._id}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
