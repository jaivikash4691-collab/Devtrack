import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HealthBadge, StatusBadge, PriorityBadge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { HealthGauge } from '../components/health/HealthGauge';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import api from '../services/api';
import {
  FolderGit2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Plus,
  ArrowRight,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  Users,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { openCreateProject } = useOutletContext() || {};

  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const projRes = await api.get('/projects');
        const loadedProjects = projRes.data.projects || [];
        setProjects(loadedProjects);

        // Fetch assigned tasks across projects
        if (loadedProjects.length > 0) {
          const allTasksPromises = loadedProjects.map((p) =>
            api.get(`/projects/${p._id}/tasks?assignedTo=${user?._id}`)
          );
          const tasksResults = await Promise.allSettled(allTasksPromises);
          const collectedTasks = [];
          tasksResults.forEach((res, i) => {
            if (res.status === 'fulfilled' && res.value.data.tasks) {
              collectedTasks.push(...res.value.data.tasks);
            }
          });
          setMyTasks(collectedTasks);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return <Loader text="Loading workspace dashboard..." />;
  }

  // Aggregate Metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'ACTIVE').length;
  const totalAssignedTasks = myTasks.length;
  const completedTasks = myTasks.filter((t) => t.status === 'COMPLETED').length;
  const overdueTasks = myTasks.filter(
    (t) => t.status !== 'COMPLETED' && t.deadline && new Date(t.deadline) < new Date()
  ).length;

  const avgHealthScore =
    totalProjects > 0
      ? Math.round(
          projects.reduce((acc, p) => acc + (p.healthScore ?? 100), 0) / totalProjects
        )
      : 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
          border: '1px solid var(--primary-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)' }}>
              Developer Workspace
            </span>
          </div>
          <h2 style={{ fontSize: '1.65rem', marginBottom: '0.25rem' }}>
            Welcome back, {user?.name} 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Here is your development telemetry, project health summary, and assigned deliverables.
          </p>
        </div>

        {user?.role !== 'student' && openCreateProject && (
          <button onClick={openCreateProject} className="btn btn-primary">
            <Plus size={16} /> Create New Project
          </button>
        )}
      </div>

      {/* 4 Summary Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderGit2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{totalProjects}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Active Projects ({activeProjects})
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>
              {completedTasks}/{totalAssignedTasks}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              My Tasks Completed
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: overdueTasks > 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.12)', color: overdueTasks > 0 ? '#f43f5e' : '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1, color: overdueTasks > 0 ? 'var(--color-critical)' : 'inherit' }}>
              {overdueTasks}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Overdue Deliverables
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.12)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>
              {avgHealthScore} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/100</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Average Portfolio Health
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Active Project Workspaces</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Monitor health scores, milestone progress, and team assignments.
            </p>
          </div>
          <Link to="/projects" className="btn btn-ghost btn-sm" style={{ gap: '0.35rem' }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={FolderGit2}
            title="No Projects Yet"
            description="Create your first project workspace or ask your team lead for an invite."
            actionText={user?.role !== 'student' && openCreateProject ? 'Create Project' : null}
            onAction={openCreateProject}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {projects.map((proj) => {
              const compPercent = proj.stats?.taskCompletionPercentage ?? 0;
              const overdueCount = proj.stats?.overdueTasks ?? 0;

              return (
                <Link
                  key={proj._id}
                  to={`/projects/${proj._id}`}
                  className="card card-hover"
                  style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span className="badge badge-indigo">{proj.category}</span>
                      <HealthBadge status={proj.healthStatus} score={proj.healthScore} />
                    </div>

                    <h4 style={{ fontSize: '1.05rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                      {proj.name}
                    </h4>

                    <p
                      style={{
                        fontSize: '0.825rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.45,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: '1rem',
                      }}
                    >
                      {proj.description}
                    </p>
                  </div>

                  <div>
                    {/* Progress Bar */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>
                        <span>Progress ({proj.stats?.completedTasks || 0}/{proj.stats?.totalTasks || 0} tasks)</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{compPercent}%</span>
                      </div>
                      <div className="progress-bar-bg" style={{ height: '6px' }}>
                        <div
                          className="progress-bar-fill progress-primary"
                          style={{ width: `${compPercent}%` }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={13} />
                        <span>Due {new Date(proj.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>

                      <div className="avatar-group">
                        {proj.members?.slice(0, 4).map((m, idx) => (
                          <Avatar key={idx} user={m.user} size="sm" />
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* My Assigned Tasks Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>My Assigned Tasks</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Tasks assigned to you across all active workspaces.
            </p>
          </div>
        </div>

        {myTasks.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            You have no pending tasks assigned to you right now.
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Task</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Priority</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Deadline</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'right' }}>Workspace</th>
                  </tr>
                </thead>
                <tbody>
                  {myTasks.slice(0, 8).map((task) => {
                    const isOverdue =
                      task.status !== 'COMPLETED' &&
                      task.deadline &&
                      new Date(task.deadline) < new Date();

                    return (
                      <tr
                        key={task._id}
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                      >
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {isOverdue && <AlertTriangle size={14} color="#f43f5e" />}
                            <span>{task.title}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <StatusBadge status={task.status} />
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <PriorityBadge priority={task.priority} />
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: isOverdue ? 'var(--color-critical)' : 'var(--text-secondary)' }}>
                          {task.deadline
                            ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                            : '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          <Link
                            to={`/projects/${task.project}`}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            Open <ArrowRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
