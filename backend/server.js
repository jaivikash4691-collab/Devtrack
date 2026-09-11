const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');
const User = require('./models/User');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Auto-seed if empty in development mode
    const userCount = await User.countDocuments();
    if (userCount === 0 && process.env.NODE_ENV !== 'test') {
      console.log('🌱 Database is empty. Auto-seeding rich demo data...');
      try {
        const Project = require('./models/Project');
        const Task = require('./models/Task');
        const Milestone = require('./models/Milestone');
        const Activity = require('./models/Activity');
        const Notification = require('./models/Notification');
        const { calculateProjectHealth } = require('./services/projectHealthService');

        const priya = await User.create({
          name: 'Priya Sharma',
          email: 'priya@devtrack.io',
          password: 'Password123!',
          role: 'manager',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          bio: 'Full-stack lead & Scrum Master. Passionate about distributed systems, MERN architecture, and developer productivity tools.',
          skills: ['React', 'Node.js', 'System Architecture', 'Agile', 'MongoDB', 'Docker'],
          githubUsername: 'priyasharma',
        });

        const arun = await User.create({
          name: 'Arun Kumar',
          email: 'arun@devtrack.io',
          password: 'Password123!',
          role: 'student',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          bio: 'Backend & Cloud engineer. Building scalable APIs, microservices, and database query optimizations.',
          skills: ['Node.js', 'Express', 'Python', 'PostgreSQL', 'MongoDB', 'AWS'],
          githubUsername: 'arunkumar',
        });

        const karthik = await User.create({
          name: 'Karthik Varma',
          email: 'karthik@devtrack.io',
          password: 'Password123!',
          role: 'student',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
          bio: 'Frontend developer and UI/UX enthusiast. Crafting fluid, accessible, and high-performance user interfaces.',
          skills: ['React', 'TypeScript', 'TailwindCSS', 'Figma', 'Vite', 'Redux'],
          githubUsername: 'karthikv',
        });

        const admin = await User.create({
          name: 'System Admin',
          email: 'admin@devtrack.io',
          password: 'Password123!',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          bio: 'Platform administrator for DevTrack workspaces.',
          skills: ['DevOps', 'Security', 'Kubernetes', 'Monitoring'],
          githubUsername: 'devtrack-admin',
        });

        const now = new Date();
        const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const in15Days = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
        const in45Days = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);
        const past5Days = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
        const past2Days = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

        const project1 = await Project.create({
          name: 'AI Smart Attendance & Facial Recognition System',
          description: 'An automated student attendance monitoring system using deep learning face embeddings, real-time classroom camera verification, and professor analytics dashboard.',
          category: 'Capstone',
          owner: priya._id,
          members: [
            { user: priya._id, role: 'manager', joinedAt: past5Days },
            { user: arun._id, role: 'member', joinedAt: past5Days },
            { user: karthik._id, role: 'member', joinedAt: past5Days },
          ],
          startDate: past5Days,
          deadline: in30Days,
          technologies: ['React', 'Node.js', 'FastAPI', 'OpenCV', 'MongoDB', 'Socket.IO'],
          githubUrl: 'https://github.com/facebook/react',
          visibility: 'public',
          status: 'ACTIVE',
        });

        const project2 = await Project.create({
          name: 'DevTrack Platform v2.0',
          description: 'Next-generation project health and productivity monitoring platform with automated score calculation, GitHub analytics, and live collaboration.',
          category: 'Open Source',
          owner: priya._id,
          members: [
            { user: priya._id, role: 'manager', joinedAt: past5Days },
            { user: arun._id, role: 'member', joinedAt: past5Days },
            { user: karthik._id, role: 'member', joinedAt: past5Days },
          ],
          startDate: past5Days,
          deadline: in15Days,
          technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Chart.js'],
          githubUrl: 'https://github.com/expressjs/express',
          visibility: 'public',
          status: 'ACTIVE',
        });

        const project3 = await Project.create({
          name: 'Campus Eats — Micro Food Delivery App',
          description: 'Peer-to-peer campus food delivery platform connecting students in dorms with late-night food delivery runners.',
          category: 'Hackathon',
          owner: arun._id,
          members: [
            { user: arun._id, role: 'manager', joinedAt: past2Days },
            { user: karthik._id, role: 'member', joinedAt: past2Days },
          ],
          startDate: past2Days,
          deadline: in45Days,
          technologies: ['React Native', 'Node.js', 'Stripe', 'MongoDB'],
          githubUrl: 'https://github.com/vercel/next.js',
          visibility: 'private',
          status: 'ACTIVE',
        });

        const m1 = await Milestone.create({
          project: project1._id,
          name: 'M1: Architecture & Data Schema Specification',
          description: 'Define system architecture, entity relationship diagrams, and data pipeline schemas.',
          startDate: past5Days,
          deadline: past2Days,
          status: 'COMPLETED',
          progress: 100,
        });

        const m2 = await Milestone.create({
          project: project1._id,
          name: 'M2: Core Facial Recognition ML Pipeline',
          description: 'Implement OpenCV face detection and FaceNet embedding vectors with 98%+ verification accuracy.',
          startDate: past2Days,
          deadline: in15Days,
          status: 'IN_PROGRESS',
          progress: 75,
        });

        const m3 = await Milestone.create({
          project: project1._id,
          name: 'M3: Professor Dashboard & Student Portal',
          description: 'Build responsive React interface for tracking daily attendance records and generating exportable reports.',
          startDate: now,
          deadline: in30Days,
          status: 'IN_PROGRESS',
          progress: 40,
        });

        await Task.create({
          project: project1._id,
          title: 'Design MongoDB Schemas for Classrooms & Students',
          description: 'Create normalized schemas for Student, AttendanceRecord, Subject, and Classroom with proper indexing on date ranges.',
          assignedTo: arun._id,
          createdBy: priya._id,
          status: 'COMPLETED',
          priority: 'HIGH',
          deadline: past2Days,
          milestone: m1._id,
          tags: ['Database', 'Mongoose', 'Schema'],
          completedAt: past2Days,
        });

        await Task.create({
          project: project1._id,
          title: 'Develop Face Verification REST API Endpoints',
          description: 'Create POST /api/attendance/verify endpoint accepting image frames and returning student match confidence.',
          assignedTo: arun._id,
          createdBy: priya._id,
          status: 'COMPLETED',
          priority: 'CRITICAL',
          deadline: now,
          milestone: m2._id,
          tags: ['Backend', 'FastAPI', 'ML'],
          completedAt: now,
        });

        const t3 = await Task.create({
          project: project1._id,
          title: 'Build Interactive Teacher Attendance Grid UI',
          description: 'Develop responsive data table with quick toggle for Present, Absent, and Excused status with instant search and filter.',
          assignedTo: karthik._id,
          createdBy: priya._id,
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          deadline: in15Days,
          milestone: m3._id,
          tags: ['Frontend', 'React', 'UI'],
          subtasks: [
            { title: 'Create student card layout', completed: true },
            { title: 'Implement status badge pills', completed: true },
            { title: 'Add search by roll number', completed: false },
          ],
        });

        const t4 = await Task.create({
          project: project1._id,
          title: 'Setup Real-time WebSocket Notifications for Low Attendance',
          description: 'Send automated Socket.io alerts when student attendance drops below 75% threshold.',
          assignedTo: arun._id,
          createdBy: priya._id,
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          deadline: in15Days,
          milestone: m3._id,
          tags: ['Backend', 'Socket.IO'],
        });

        await Task.create({
          project: project1._id,
          title: 'Model Quantization & Inference Benchmark',
          description: 'Convert model to ONNX runtime format to run on low-power edge devices in classrooms.',
          assignedTo: priya._id,
          createdBy: priya._id,
          status: 'TODO',
          priority: 'HIGH',
          deadline: in30Days,
          milestone: m2._id,
          tags: ['ML', 'Optimization'],
        });

        await Task.create({
          project: project1._id,
          title: 'Student QR Code Fallback Generator',
          description: 'Provide dynamic rotating QR code for situations where lighting prevents camera facial recognition.',
          assignedTo: karthik._id,
          createdBy: priya._id,
          status: 'TODO',
          priority: 'LOW',
          deadline: in30Days,
          milestone: m3._id,
          tags: ['Frontend', 'QR'],
        });

        // Project 2 Tasks (with an overdue task)
        await Task.create({
          project: project2._id,
          title: 'Connect GitHub REST API Webhook Listener',
          description: 'Synchronize push events and pull requests with project activity timeline.',
          assignedTo: arun._id,
          createdBy: priya._id,
          status: 'COMPLETED',
          priority: 'HIGH',
          deadline: past2Days,
          completedAt: past2Days,
        });

        await Task.create({
          project: project2._id,
          title: 'Fix Kanban Column Drag & Drop State Sync',
          description: 'Ensure smooth optimistic UI updates when dragging tasks across columns.',
          assignedTo: karthik._id,
          createdBy: priya._id,
          status: 'IN_PROGRESS',
          priority: 'CRITICAL',
          deadline: past2Days, // Overdue on purpose
        });

        await Activity.create([
          {
            project: project1._id,
            user: priya._id,
            action: 'PROJECT_CREATED',
            description: 'Priya Sharma created the project "AI Smart Attendance & Facial Recognition System"',
            createdAt: past5Days,
          },
          {
            project: project1._id,
            user: arun._id,
            action: 'TASK_STATUS_CHANGED',
            description: 'Arun Kumar completed task "Design MongoDB Schemas for Classrooms & Students"',
            createdAt: past2Days,
          },
          {
            project: project1._id,
            user: arun._id,
            action: 'TASK_STATUS_CHANGED',
            description: 'Arun Kumar completed task "Develop Face Verification REST API Endpoints"',
            createdAt: now,
          },
        ]);

        await Notification.create([
          {
            recipient: arun._id,
            sender: priya._id,
            type: 'TASK_ASSIGNED',
            title: 'New Task Assigned',
            message: 'Priya Sharma assigned you "Setup Real-time WebSocket Notifications for Low Attendance".',
            relatedProject: project1._id,
            relatedTask: t4._id,
            read: false,
          },
          {
            recipient: karthik._id,
            sender: priya._id,
            type: 'TASK_ASSIGNED',
            title: 'New Task Assigned',
            message: 'Priya Sharma assigned you "Build Interactive Teacher Attendance Grid UI".',
            relatedProject: project1._id,
            relatedTask: t3._id,
            read: false,
          },
        ]);

        await calculateProjectHealth(project1._id);
        await calculateProjectHealth(project2._id);
        await calculateProjectHealth(project3._id);

        console.log('✅ Demo database auto-seeded successfully!');
      } catch (seedErr) {
        console.warn('Auto-seed notice:', seedErr.message);
      }
    }

    // 3. Create HTTP & WebSocket Server
    const httpServer = http.createServer(app);
    initSocket(httpServer);

    // 4. Start listening
    httpServer.listen(PORT, () => {
      console.log(`=============================================`);
      console.log(`🚀 DevTrack API Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`=============================================`);
    });
  } catch (error) {
    console.error(`Fatal server initialization error: ${error.message}`);
    process.exit(1);
  }
};

startServer();
