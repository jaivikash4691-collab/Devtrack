import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { HealthBadge, StatusBadge, PriorityBadge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { Loader } from '../components/common/Loader';
import { HealthScoreWidget } from '../components/health/HealthScoreWidget';
import { TaskKanbanBoard } from '../components/tasks/TaskKanbanBoard';
import { TaskListView } from '../components/tasks/TaskListView';
import { TaskModal } from '../components/tasks/TaskModal';
import { MilestoneRoadmap } from '../components/milestones/MilestoneRoadmap';
import { MilestoneCreateModal } from '../components/milestones/MilestoneCreateModal';
import { GitHubStatsCard } from '../components/github/GitHubStatsCard';
import { InviteMemberModal } from '../components/projects/InviteMemberModal';
import api from '../services/api';
import {
  Layers,
  LayoutDashboard,
  CheckSquare,
  Milestone as MilestoneIcon,
  Users,
  GitBranch,
  BarChart3,
  Activity as ActivityIcon,
  Settings,
  Plus,
  Calendar,
  ExternalLink,
  Trash2,
  UserPlus,
  Kanban,
  List,
  Flame,
  Search,
} from 'lucide-react';

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    activeProject,
    tasks,
    milestones,
    health,
    activities,
    githubStats,
    loading,
    error,
    loadProject,
    updateTaskStatus,
    setTasks,
    setMilestones,
    setActiveProject,
  } = useProject();

  const [activeTab, setActiveTab] = useState('overview');
  const [taskViewMode, setTaskViewMode] = useState('kanban'); // 'kanban' | 'list'

  // Task filtering & modal state
  const [taskFilterStatus, setTaskFilterStatus] = useState('ALL');
  const [taskFilterPriority, setTaskFilterPriority] = useState('ALL');
  const [taskFilterAssignee, setTaskFilterAssignee] = useState('ALL');
  const [taskSearch, setTaskSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [initialTaskStatus, setInitialTaskStatus] = useState('TODO');

  // Milestone modal state
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Edit project settings state
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editGithubUrl, setEditGithubUrl] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id, loadProject]);

  useEffect(() => {
    if (activeProject) {
      setEditName(activeProject.name || '');
      setEditDesc(activeProject.description || '');
      setEditCategory(activeProject.category || 'Capstone');
      setEditDeadline(
        activeProject.deadline ? new Date(activeProject.deadline).toISOString().split('T')[0] : ''
      );
      setEditGithubUrl(activeProject.githubUrl || '');
      setEditStatus(activeProject.status || 'ACTIVE');
    }
  }, [activeProject]);

  if (loading) {
    return <Loader text="Loading project workspace..." />;
  }

  if (error || !activeProject) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--color-critical)', marginBottom: '0.5rem' }}>Project Access Notice</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {error || 'Project not found or you do not have permission to view it.'}
        </p>
        <button onClick={() => navigate('/projects')} className="btn btn-secondary">
          Back to Projects Directory
        </button>
      </div>
    );
  }

  const isManager =
    activeProject.owner?._id === user?._id ||
    activeProject.userRole === 'manager' ||
    user?.role === 'admin';

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (taskFilterStatus !== 'ALL' && t.status !== taskFilterStatus) return false;
    if (taskFilterPriority !== 'ALL' && t.priority !== taskFilterPriority) return false;
    if (taskFilterAssignee !== 'ALL') {
      if (taskFilterAssignee === 'UNASSIGNED') {
        if (t.assignedTo) return false;
      } else if (t.assignedTo?._id !== taskFilterAssignee) {
        return false;
      }
    }
    if (taskSearch.trim()) {
      const q = taskSearch.toLowerCase();
      const matchTitle = t.title?.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  // Task Handlers
  const handleOpenNewTask = (status = 'TODO') => {
    setSelectedTask(null);
    setInitialTaskStatus(status);
    setTaskModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  const handleTaskSaved = (savedTask) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t._id === savedTask._id);
      if (exists) {
        return prev.map((t) => (t._id === savedTask._id ? savedTask : t));
      }
      return [savedTask, ...prev];
    });
  };

  const handleTaskDeleted = (deletedId) => {
    setTasks((prev) => prev.filter((t) => t._id !== deletedId));
  };

  // Milestone Handlers
  const handleOpenNewMilestone = () => {
    setSelectedMilestone(null);
    setMilestoneModalOpen(true);
  };

  const handleOpenEditMilestone = (m) => {
    setSelectedMilestone(m);
    setMilestoneModalOpen(true);
  };

  const handleMilestoneSaved = (savedM) => {
    setMilestones((prev) => {
      const exists = prev.some((m) => m._id === savedM._id);
      if (exists) {
        return prev.map((m) => (m._id === savedM._id ? savedM : m));
      }
      return [...prev, savedM];
    });
  };

  const handleDeleteMilestone = async (mId) => {
    if (!window.confirm('Are you sure you want to delete this milestone?')) return;
    try {
      await api.delete(`/milestones/${mId}`);
      showToast('Milestone deleted.', 'info');
      setMilestones((prev) => prev.filter((m) => m._id !== mId));
    } catch (err) {
      showToast(err.message || 'Failed to delete milestone.', 'error');
    }
  };

  // Member Handlers
  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      const res = await api.delete(`/projects/${activeProject._id}/members/${userId}`);
      showToast('Member removed from project.', 'info');
      setActiveProject((prev) => ({ ...prev, members: res.data.members }));
    } catch (err) {
      showToast(err.message || 'Failed to remove member.', 'error');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.put(`/projects/${activeProject._id}/members/${userId}`, { role: newRole });
      showToast('Member role updated.', 'success');
      setActiveProject((prev) => ({ ...prev, members: res.data.members }));
    } catch (err) {
      showToast(err.message || 'Failed to update member role.', 'error');
    }
  };

  // Project Settings Handlers
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await api.put(`/projects/${activeProject._id}`, {
        name: editName.trim(),
        description: editDesc.trim(),
        category: editCategory,
        deadline: new Date(editDeadline).toISOString(),
        githubUrl: editGithubUrl.trim(),
        status: editStatus,
      });
      showToast('Project settings updated successfully.', 'success');
      setActiveProject((prev) => ({ ...prev, ...res.data.project }));
    } catch (err) {
      showToast(err.message || 'Failed to update settings.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('DANGER: This will permanently delete this project and all its tasks, milestones, and audit records. Proceed?')) {
      return;
    }
    try {
      await api.delete(`/projects/${activeProject._id}`);
      showToast('Project deleted successfully.', 'info');
      navigate('/projects');
    } catch (err) {
      showToast(err.message || 'Failed to delete project.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Project Header Banner */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-indigo">{activeProject.category}</span>
              <HealthBadge status={activeProject.healthStatus} score={activeProject.healthScore} />
              <span className="badge badge-subtle">{activeProject.status}</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>{activeProject.name}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '850px', margin: 0 }}>
              {activeProject.description}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {activeProject.githubUrl && (
              <a
                href={activeProject.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.4rem' }}
              >
                <GitBranch size={14} /> Repository <ExternalLink size={12} />
              </a>
            )}
            <button onClick={() => handleOpenNewTask('TODO')} className="btn btn-primary btn-sm">
              <Plus size={15} /> New Task
            </button>
          </div>
        </div>

        {/* Project Meta Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} /> Due: {new Date(activeProject.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span>Owner: <strong style={{ color: 'var(--text-primary)' }}>{activeProject.owner?.name}</strong></span>
            <span>Team: <strong style={{ color: 'var(--text-primary)' }}>{activeProject.members?.length || 1} members</strong></span>
          </div>

          <div className="avatar-group">
            {activeProject.members?.map((m, idx) => (
              <Avatar key={idx} user={m.user} size="sm" />
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Tab Navigation Bar */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <LayoutDashboard size={16} /> Overview & Health
        </button>

        <button
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <CheckSquare size={16} /> Tasks & Kanban ({tasks.length})
        </button>

        <button
          className={`tab-btn ${activeTab === 'milestones' ? 'active' : ''}`}
          onClick={() => setActiveTab('milestones')}
        >
          <MilestoneIcon size={16} /> Milestones ({milestones.length})
        </button>

        <button
          className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          <Users size={16} /> Team & Workload ({activeProject.members?.length || 1})
        </button>

        <button
          className={`tab-btn ${activeTab === 'github' ? 'active' : ''}`}
          onClick={() => setActiveTab('github')}
        >
          <GitBranch size={16} /> GitHub Intelligence
        </button>

        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={16} /> Analytics
        </button>

        <button
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <ActivityIcon size={16} /> Activity Audit
        </button>

        {isManager && (
          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={16} /> Settings
          </button>
        )}
      </div>

      {/* Tab 1: Overview & Health */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Health Score Calculation & Insights */}
          <HealthScoreWidget health={health} />

          {/* 2-Column: Milestones Snapshot + Team Snapshot */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {/* Milestones Snapshot */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MilestoneIcon size={16} color="#8b5cf6" /> Milestone Roadmap
                </h4>
                <button
                  onClick={() => setActiveTab('milestones')}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.775rem' }}
                >
                  View All ({milestones.length})
                </button>
              </div>

              {milestones.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No milestones created yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {milestones.slice(0, 4).map((m) => (
                    <div key={m._id} style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 600 }}>{m.name}</span>
                        <span style={{ fontWeight: 700, color: m.progress === 100 ? 'var(--color-healthy)' : 'var(--primary)' }}>
                          {m.progress}%
                        </span>
                      </div>
                      <div className="progress-bar-bg" style={{ height: '5px' }}>
                        <div
                          className={`progress-bar-fill ${m.progress === 100 ? 'progress-healthy' : 'progress-primary'}`}
                          style={{ width: `${m.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Team Members Snapshot */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} color="#10b981" /> Team Collaborators
                </h4>
                {isManager && (
                  <button
                    onClick={() => setInviteModalOpen(true)}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.775rem' }}
                  >
                    <UserPlus size={13} /> Invite
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {activeProject.members?.map((m, idx) => {
                  const u = m.user;
                  const memberTasks = tasks.filter((t) => t.assignedTo?._id === u._id);
                  const completed = memberTasks.filter((t) => t.status === 'COMPLETED').length;

                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--bg-subtle)',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <Avatar user={u} size="sm" />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{u.name}</div>
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {completed}/{memberTasks.length} tasks
                        </span>
                        <span className="badge badge-subtle">{m.role}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tasks & Kanban */}
      {activeTab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Toolbar */}
          <div
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '0.85rem 1.25rem',
            }}
          >
            {/* Search */}
            <div style={{ position: 'relative', width: '260px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search tasks..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                style={{ paddingLeft: '2.25rem', fontSize: '0.85rem', padding: '0.45rem 0.75rem 0.45rem 2.25rem' }}
              />
              <Search
                size={14}
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
            </div>

            {/* Filter Selects */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                value={taskFilterStatus}
                onChange={(e) => setTaskFilterStatus(e.target.value)}
                style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.825rem' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <select
                className="form-select"
                value={taskFilterPriority}
                onChange={(e) => setTaskFilterPriority(e.target.value)}
                style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.825rem' }}
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>

              <select
                className="form-select"
                value={taskFilterAssignee}
                onChange={(e) => setTaskFilterAssignee(e.target.value)}
                style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.825rem' }}
              >
                <option value="ALL">All Assignees</option>
                <option value="UNASSIGNED">Unassigned</option>
                {activeProject.members?.map((m) => (
                  <option key={m.user._id} value={m.user._id}>
                    {m.user.name}
                  </option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
                <button
                  onClick={() => setTaskViewMode('kanban')}
                  className={`btn-ghost ${taskViewMode === 'kanban' ? 'active' : ''}`}
                  style={{
                    padding: '0.35rem 0.6rem',
                    background: taskViewMode === 'kanban' ? 'var(--bg-card)' : 'transparent',
                    color: taskViewMode === 'kanban' ? 'var(--primary)' : 'var(--text-muted)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  title="Kanban Board View"
                >
                  <Kanban size={15} />
                </button>
                <button
                  onClick={() => setTaskViewMode('list')}
                  className={`btn-ghost ${taskViewMode === 'list' ? 'active' : ''}`}
                  style={{
                    padding: '0.35rem 0.6rem',
                    background: taskViewMode === 'list' ? 'var(--bg-card)' : 'transparent',
                    color: taskViewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  title="List Table View"
                >
                  <List size={15} />
                </button>
              </div>

              <button onClick={() => handleOpenNewTask('TODO')} className="btn btn-primary btn-sm">
                <Plus size={14} /> Add Task
              </button>
            </div>
          </div>

          {/* Kanban vs List Render */}
          {taskViewMode === 'kanban' ? (
            <TaskKanbanBoard
              tasks={filteredTasks}
              onTaskClick={handleOpenEditTask}
              onStatusChange={updateTaskStatus}
              onNewTask={handleOpenNewTask}
            />
          ) : (
            <TaskListView
              tasks={filteredTasks}
              onTaskClick={handleOpenEditTask}
              onStatusChange={updateTaskStatus}
            />
          )}
        </div>
      )}

      {/* Tab 3: Milestones */}
      {activeTab === 'milestones' && (
        <MilestoneRoadmap
          milestones={milestones}
          onEditMilestone={handleOpenEditMilestone}
          onDeleteMilestone={handleDeleteMilestone}
          onNewMilestone={handleOpenNewMilestone}
          canManage={isManager}
        />
      )}

      {/* Tab 4: Team & Workload */}
      {activeTab === 'team' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Team Members & Workload Distribution</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Track individual contributions, balance task allocations, and manage access roles.
              </p>
            </div>
            {isManager && (
              <button onClick={() => setInviteModalOpen(true)} className="btn btn-primary btn-sm">
                <UserPlus size={15} /> Add Team Member
              </button>
            )}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>Member</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>Tasks Assigned</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>Completion Rate</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>Skills</th>
                  {isManager && <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {activeProject.members?.map((m) => {
                  const u = m.user;
                  const memberTasks = tasks.filter((t) => t.assignedTo?._id === u._id);
                  const completed = memberTasks.filter((t) => t.status === 'COMPLETED').length;
                  const rate = memberTasks.length > 0 ? Math.round((completed / memberTasks.length) * 100) : 0;
                  const isOwner = activeProject.owner?._id === u._id;

                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <Avatar user={u} size="md" />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {u.name} {isOwner && <span style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>(Owner)</span>}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        {isManager && !isOwner ? (
                          <select
                            className="form-select"
                            value={m.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                          >
                            <option value="member">Member</option>
                            <option value="manager">Manager</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        ) : (
                          <span className="badge badge-subtle">{m.role}</span>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>
                        {completed} / {memberTasks.length}
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ width: '120px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                            <span>{rate}%</span>
                          </div>
                          <div className="progress-bar-bg" style={{ height: '6px' }}>
                            <div
                              className="progress-bar-fill progress-primary"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', maxWidth: '240px' }}>
                          {u.skills?.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="code-font" style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.1rem 0.35rem', borderRadius: '3px', color: 'var(--text-secondary)' }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      {isManager && (
                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                          {!isOwner && (
                            <button
                              onClick={() => handleRemoveMember(u._id)}
                              className="btn-ghost"
                              style={{ padding: '0.35rem', borderRadius: '4px', cursor: 'pointer' }}
                              title="Remove from project"
                            >
                              <Trash2 size={15} color="#f43f5e" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: GitHub Intelligence */}
      {activeTab === 'github' && (
        <GitHubStatsCard
          githubStats={githubStats}
          projectId={activeProject._id}
          onSynced={(data) => {}}
          canManage={isManager}
        />
      )}

      {/* Tab 6: Analytics */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Status Breakdown */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Tasks By Status</h4>
              {['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'].map((st) => {
                const count = tasks.filter((t) => t.status === st).length;
                const pct = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0;
                return (
                  <div key={st} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600 }}>{st.replace('_', ' ')}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                    </div>
                    <div className="progress-bar-bg" style={{ height: '7px' }}>
                      <div className="progress-bar-fill progress-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Priority Breakdown */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Tasks By Priority</h4>
              {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((pr) => {
                const count = tasks.filter((t) => t.priority === pr).length;
                const pct = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0;
                return (
                  <div key={pr} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span className={`priority-${pr}`} style={{ fontWeight: 600, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        {pr}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                    </div>
                    <div className="progress-bar-bg" style={{ height: '7px' }}>
                      <div className="progress-bar-fill progress-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Activity Audit */}
      {activeTab === 'activity' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Real-Time Project Activity Timeline</h3>

          {activities.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No activity logged yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {activities.map((act) => (
                <div
                  key={act._id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    background: 'var(--bg-subtle)',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <Avatar user={act.user} size="sm" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {act.description}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <span className="code-font" style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>
                      {act.action}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 8: Project Settings (Manager only) */}
      {activeTab === 'settings' && isManager && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '700px' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Edit Project Workspace</h3>

            <form onSubmit={handleSaveSettings}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  >
                    <option value="Capstone">Capstone Project</option>
                    <option value="Hackathon">Hackathon Project</option>
                    <option value="Open Source">Open Source</option>
                    <option value="Startup">Startup / Commercial</option>
                    <option value="Coursework">Coursework</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Deadline</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">GitHub Repository URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={editGithubUrl}
                    onChange={(e) => setEditGithubUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={savingSettings}>
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="card" style={{ padding: '1.5rem', borderColor: 'var(--color-critical-border)' }}>
            <h4 style={{ color: 'var(--color-critical)', marginBottom: '0.5rem' }}>Danger Zone</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Deleting a project is irreversible. All associated tasks, milestones, comments, and telemetry logs will be permanently deleted.
            </p>
            <button onClick={handleDeleteProject} className="btn btn-danger btn-sm">
              <Trash2 size={15} /> Delete Project Workspace
            </button>
          </div>
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        task={selectedTask}
        initialStatus={initialTaskStatus}
        projectId={activeProject._id}
        members={activeProject.members || []}
        milestones={milestones || []}
        onSaved={handleTaskSaved}
        onDeleted={handleTaskDeleted}
      />

      {/* Milestone Modal */}
      <MilestoneCreateModal
        isOpen={milestoneModalOpen}
        onClose={() => setMilestoneModalOpen(false)}
        projectId={activeProject._id}
        milestone={selectedMilestone}
        onSaved={handleMilestoneSaved}
      />

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        projectId={activeProject._id}
        onMemberAdded={(updatedMembers) => {
          setActiveProject((prev) => ({ ...prev, members: updatedMembers }));
        }}
      />
    </div>
  );
};
