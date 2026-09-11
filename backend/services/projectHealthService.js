const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const Activity = require('../models/Activity');
const Project = require('../models/Project');

/**
 * Calculates the comprehensive Project Health Score and generates rule-based insights.
 * 
 * Formula:
 * Overall Health = (0.30 * Task Completion) +
 *                  (0.20 * Milestone Progress) +
 *                  (0.20 * Deadline Performance) +
 *                  (0.15 * Team Activity) +
 *                  (0.15 * Recent Activity)
 */
const calculateProjectHealth = async (projectId) => {
  const project = await Project.findById(projectId).populate('members.user', 'name email');
  if (!project) {
    throw new Error('Project not found');
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Fetch all tasks for this project
  const tasks = await Task.find({ project: projectId }).populate('assignedTo', 'name email');
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const reviewTasks = tasks.filter((t) => t.status === 'REVIEW').length;
  const todoTasks = tasks.filter((t) => t.status === 'TODO').length;

  // Overdue tasks: non-completed tasks whose deadline has passed
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'COMPLETED' && t.deadline && new Date(t.deadline) < now
  );

  // High priority pending tasks
  const criticalPendingTasks = tasks.filter(
    (t) => t.status !== 'COMPLETED' && (t.priority === 'CRITICAL' || t.priority === 'HIGH')
  );

  // 1. Task Completion Score (0 - 100)
  let taskCompletionScore = 100;
  if (totalTasks > 0) {
    // Give partial credit for IN_PROGRESS (50%) and REVIEW (80%)
    const weightedProgress =
      completedTasks * 1.0 + reviewTasks * 0.8 + inProgressTasks * 0.5;
    taskCompletionScore = Math.min(100, Math.round((weightedProgress / totalTasks) * 100));
  }

  // 2. Milestone Progress Score (0 - 100)
  const milestones = await Milestone.find({ project: projectId });
  let milestoneScore = 100;
  let delayedMilestones = [];

  if (milestones.length > 0) {
    let totalProgress = 0;
    milestones.forEach((m) => {
      totalProgress += m.progress || 0;
      if (m.status !== 'COMPLETED' && m.deadline && new Date(m.deadline) < now) {
        delayedMilestones.push(m);
      }
    });
    const avgProgress = totalProgress / milestones.length;
    // Penalty if milestones are past deadline but not completed
    const delayPenalty = delayedMilestones.length * 15;
    milestoneScore = Math.max(0, Math.min(100, Math.round(avgProgress - delayPenalty)));
  }

  // 3. Deadline Performance Score (0 - 100)
  let deadlineScore = 100;
  if (totalTasks > 0) {
    const overdueRatio = overdueTasks.length / totalTasks;
    deadlineScore = Math.max(0, Math.round((1 - overdueRatio) * 100));
  }

  // Check overall project deadline
  const projectDeadlinePassed = project.deadline && new Date(project.deadline) < now;
  const isProjectNearDeadline =
    project.deadline &&
    !projectDeadlinePassed &&
    new Date(project.deadline).getTime() - now.getTime() < 5 * 24 * 60 * 60 * 1000;

  if (projectDeadlinePassed && taskCompletionScore < 100) {
    deadlineScore = Math.max(0, deadlineScore - 30);
  } else if (isProjectNearDeadline && taskCompletionScore < 60) {
    deadlineScore = Math.max(0, deadlineScore - 15);
  }

  // 4. Team Activity Score (0 - 100)
  // Check distinct team members who logged activity or completed tasks in past 14 days
  const allTeamMemberIds = [
    project.owner.toString(),
    ...project.members.map((m) => m.user._id ? m.user._id.toString() : m.user.toString()),
  ];
  const uniqueMemberCount = new Set(allTeamMemberIds).size;

  const recentActivities = await Activity.find({
    project: projectId,
    createdAt: { $gte: fourteenDaysAgo },
  });

  const activeUserIds = new Set(recentActivities.map((a) => a.user.toString()));
  let teamActivityScore = 100;
  if (uniqueMemberCount > 0) {
    const participationRate = activeUserIds.size / uniqueMemberCount;
    teamActivityScore = Math.min(100, Math.round(participationRate * 100));
  }

  // 5. Recent Activity Score (0 - 100)
  // Measures cadence of activity events in last 7 days
  const last7DaysActivities = recentActivities.filter(
    (a) => new Date(a.createdAt) >= sevenDaysAgo
  );
  // Benchmark: 10+ activity logs/week = 100%
  const recentActivityScore = Math.min(100, Math.round((last7DaysActivities.length / 10) * 100));

  // Weighted overall calculation
  const overallScore = Math.round(
    0.30 * taskCompletionScore +
    0.20 * milestoneScore +
    0.20 * deadlineScore +
    0.15 * teamActivityScore +
    0.15 * recentActivityScore
  );

  // Determine Health Status
  let healthStatus = 'Healthy';
  if (overallScore < 40) {
    healthStatus = 'Critical';
  } else if (overallScore < 60) {
    healthStatus = 'At Risk';
  } else if (overallScore < 80) {
    healthStatus = 'Needs Attention';
  }

  // Generate Smart Rule-Based Insights & Action Recommendations
  const insights = [];
  const recommendations = [];

  // Overdue task insights
  if (overdueTasks.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Overdue Tasks Detected',
      message: `${overdueTasks.length} task${overdueTasks.length > 1 ? 's are' : ' is'} overdue and require immediate attention.`,
      impact: 'High',
    });
    recommendations.push(`Reassign or reschedule the ${overdueTasks.length} overdue task(s).`);
  }

  // Critical tasks pending
  if (criticalPendingTasks.length > 0) {
    insights.push({
      type: 'alert',
      title: 'Critical Priority Tasks Pending',
      message: `${criticalPendingTasks.length} High/Critical priority task(s) are currently unfinished.`,
      impact: 'High',
    });
  }

  // Milestone insights
  if (delayedMilestones.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Delayed Milestones',
      message: `${delayedMilestones.map((m) => `"${m.name}"`).join(', ')} missed target deadline.`,
      impact: 'High',
    });
    recommendations.push('Review delayed milestones with the team and adjust delivery milestones.');
  }

  // Workload distribution analysis
  const memberWorkload = {};
  tasks
    .filter((t) => t.status !== 'COMPLETED' && t.assignedTo)
    .forEach((t) => {
      const name = t.assignedTo.name || 'Unassigned';
      memberWorkload[name] = (memberWorkload[name] || 0) + 1;
    });

  const activePendingTasks = Object.values(memberWorkload).reduce((a, b) => a + b, 0);
  if (activePendingTasks >= 4) {
    Object.entries(memberWorkload).forEach(([memberName, count]) => {
      const share = count / activePendingTasks;
      if (share >= 0.6) {
        insights.push({
          type: 'info',
          title: 'Workload Concentration',
          message: `${memberName} is assigned to ${Math.round(share * 100)}% of all active tasks (${count}/${activePendingTasks}).`,
          impact: 'Medium',
        });
        recommendations.push(`Balance workload by redistributing some tasks from ${memberName} to other team members.`);
      }
    });
  }

  // Project deadline insight
  if (projectDeadlinePassed && taskCompletionScore < 100) {
    insights.push({
      type: 'danger',
      title: 'Project Deadline Passed',
      message: 'The scheduled project deadline has passed with incomplete tasks.',
      impact: 'Critical',
    });
    recommendations.push('Establish a revised completion date and prioritize core MVP features.');
  } else if (isProjectNearDeadline && taskCompletionScore < 80) {
    insights.push({
      type: 'warning',
      title: 'Approaching Project Deadline',
      message: `Project deadline is within 5 days. Current completion is ${taskCompletionScore}%.`,
      impact: 'High',
    });
    recommendations.push('Hold a sprint standup to clear blockers for the remaining deliverables.');
  }

  // Positive Momentum Insights
  if (last7DaysActivities.length >= 8 && overdueTasks.length === 0) {
    insights.push({
      type: 'positive',
      title: 'Strong Team Momentum',
      message: `Team logged ${last7DaysActivities.length} updates this week with zero overdue tasks.`,
      impact: 'Positive',
    });
  }

  if (overallScore >= 80 && insights.length === 0) {
    insights.push({
      type: 'positive',
      title: 'Project on Schedule',
      message: 'All milestones and tasks are progressing smoothly within planned timelines.',
      impact: 'Positive',
    });
    recommendations.push('Maintain current development velocity and keep testing coverage high.');
  }

  // Update Project Model with calculated score
  await Project.findByIdAndUpdate(projectId, {
    healthScore: overallScore,
    healthStatus,
    lastHealthCalculatedAt: now,
  });

  return {
    overallScore,
    healthStatus,
    factors: {
      taskCompletion: {
        score: taskCompletionScore,
        weight: 0.30,
        completed: completedTasks,
        total: totalTasks,
        inProgress: inProgressTasks,
        review: reviewTasks,
        todo: todoTasks,
      },
      milestoneProgress: {
        score: milestoneScore,
        weight: 0.20,
        totalMilestones: milestones.length,
        delayedCount: delayedMilestones.length,
      },
      deadlinePerformance: {
        score: deadlineScore,
        weight: 0.20,
        overdueCount: overdueTasks.length,
        projectDeadlinePassed,
        isProjectNearDeadline,
      },
      teamActivity: {
        score: teamActivityScore,
        weight: 0.15,
        activeMembers: activeUserIds.size,
        totalMembers: uniqueMemberCount,
      },
      recentActivity: {
        score: recentActivityScore,
        weight: 0.15,
        weeklyEvents: last7DaysActivities.length,
      },
    },
    insights,
    recommendations: recommendations.length > 0 ? recommendations : ['Continue current sprint execution.'],
    calculatedAt: now,
  };
};

module.exports = { calculateProjectHealth };
