const axios = require('axios');

async function verifyLiveSystem() {
  console.log('==============================================');
  console.log('🧪 DEVTRACK LIVE FULL-STACK VERIFICATION');
  console.log('==============================================');

  // 1. Health Check
  const healthCheck = await axios.get('http://localhost:5000/api/health-check');
  console.log('✅ 1. Backend Health Check:', healthCheck.data);

  // 2. Login as Priya (Project Lead)
  const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'priya@devtrack.io',
    password: 'Password123!',
  });
  console.log('✅ 2. Auth Login (Priya):', {
    success: loginRes.data.success,
    user: loginRes.data.user.name,
    role: loginRes.data.user.role,
  });

  const token = loginRes.data.token;
  const headers = { Authorization: `Bearer ${token}` };

  // 3. Fetch Projects
  const projectsRes = await axios.get('http://localhost:5000/api/projects', { headers });
  console.log(`✅ 3. Projects Loaded (${projectsRes.data.count} projects):`);
  projectsRes.data.projects.forEach((p) => {
    console.log(`   - [${p.category}] "${p.name}" | Health: ${p.healthScore} (${p.healthStatus}) | Tasks: ${p.stats.completedTasks}/${p.stats.totalTasks}`);
  });

  const targetProject = projectsRes.data.projects[0];

  // 4. Project Health & Insights
  const healthRes = await axios.get(`http://localhost:5000/api/projects/${targetProject._id}/health`, { headers });
  console.log('✅ 4. Project Health Algorithm Details:', {
    overallScore: healthRes.data.health.overallScore,
    status: healthRes.data.health.healthStatus,
    factors: {
      taskCompletion: healthRes.data.health.factors.taskCompletion.score + '%',
      milestoneProgress: healthRes.data.health.factors.milestoneProgress.score + '%',
      deadlinePerformance: healthRes.data.health.factors.deadlinePerformance.score + '%',
      teamActivity: healthRes.data.health.factors.teamActivity.score + '%',
      recentActivity: healthRes.data.health.factors.recentActivity.score + '%',
    },
    insightsCount: healthRes.data.health.insights.length,
    recommendations: healthRes.data.health.recommendations,
  });

  // 5. Tasks List
  const tasksRes = await axios.get(`http://localhost:5000/api/projects/${targetProject._id}/tasks`, { headers });
  console.log(`✅ 5. Tasks (${tasksRes.data.count} tasks):`);
  tasksRes.data.tasks.forEach((t) => {
    console.log(`   - [${t.status}] "${t.title}" | Priority: ${t.priority} | Assignee: ${t.assignedTo?.name || 'Unassigned'}`);
  });

  // 6. Milestones Roadmap
  const milestonesRes = await axios.get(`http://localhost:5000/api/projects/${targetProject._id}/milestones`, { headers });
  console.log(`✅ 6. Milestones (${milestonesRes.data.count} milestones):`);
  milestonesRes.data.milestones.forEach((m) => {
    console.log(`   - [${m.status}] "${m.name}" | Progress: ${m.progress}% | Linked Tasks: ${m.linkedTasksCount}`);
  });

  // 7. Create a new Task via API
  const newTaskRes = await axios.post(`http://localhost:5000/api/projects/${targetProject._id}/tasks`, {
    title: 'Automated CI/CD Pipeline Configuration',
    description: 'Setup GitHub Actions workflow to run automated tests on pull requests',
    status: 'TODO',
    priority: 'HIGH',
    tags: ['DevOps', 'CI/CD'],
  }, { headers });
  console.log('✅ 7. Task Created Successfully:', newTaskRes.data.task.title);

  // 8. Update Task Status to COMPLETED
  const updatedTaskRes = await axios.put(`http://localhost:5000/api/tasks/${newTaskRes.data.task._id}`, {
    status: 'COMPLETED',
  }, { headers });
  console.log('✅ 8. Task Status Updated to COMPLETED:', updatedTaskRes.data.task.title);

  // 9. Add a Comment to Task
  const commentRes = await axios.post(`http://localhost:5000/api/tasks/${newTaskRes.data.task._id}/comments`, {
    text: 'Workflow YAML is committed and passes all linting tests.',
  }, { headers });
  console.log('✅ 9. Comment Added to Task:', commentRes.data.comment.text);

  // 10. Verify Frontend Dev Server
  const frontRes = await axios.get('http://localhost:5173/');
  console.log(`✅ 10. Frontend Dev Server Responding: HTTP ${frontRes.status} (Vite React loaded)`);

  console.log('==============================================');
  console.log('🎉 ALL FULL-STACK SYSTEMS OPERATING FLAWLESSLY!');
  console.log('==============================================');
}

verifyLiveSystem().catch((err) => {
  console.error('❌ Verification failed:', err.response?.data || err.message);
  process.exit(1);
});
