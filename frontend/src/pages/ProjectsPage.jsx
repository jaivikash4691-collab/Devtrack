import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HealthBadge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import api from '../services/api';
import {
  FolderGit2,
  Search,
  Plus,
  Calendar,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';

const CATEGORIES = ['All', 'Capstone', 'Hackathon', 'Open Source', 'Startup', 'Coursework'];
const STATUSES = ['All', 'ACTIVE', 'COMPLETED', 'ON_HOLD', 'ARCHIVED'];

export const ProjectsPage = () => {
  const { user } = useAuth();
  const { openCreateProject } = useOutletContext() || {};

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let queryParams = [];
      if (selectedCategory !== 'All') queryParams.push(`category=${selectedCategory}`);
      if (selectedStatus !== 'All') queryParams.push(`status=${selectedStatus}`);
      if (search.trim()) queryParams.push(`search=${encodeURIComponent(search.trim())}`);

      const url = `/projects${queryParams.length > 0 ? `?${queryParams.join('&')}` : ''}`;
      const res = await api.get(url);
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Project Workspaces</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Manage and monitor your team repositories and deliverables.
          </p>
        </div>

        {user?.role !== 'student' && openCreateProject && (
          <button onClick={openCreateProject} className="btn btn-primary">
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {/* Filters & Search Toolbar */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1rem',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 240px', maxWidth: '380px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search projects by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
            />
            <Search
              size={15}
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
          </div>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Category:</span>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Status:</span>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Project Grid */}
      {loading ? (
        <Loader text="Loading project workspaces..." />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No Matching Projects Found"
          description="Try clearing your search query or filters, or create a new project workspace."
          actionText={user?.role !== 'student' && openCreateProject ? 'Create Project' : null}
          onAction={openCreateProject}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
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

                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    {proj.name}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginBottom: '1rem',
                    }}
                  >
                    {proj.description}
                  </p>

                  {/* Tech stack tags */}
                  {proj.technologies?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '1.25rem' }}>
                      {proj.technologies.slice(0, 4).map((tech, idx) => (
                        <span
                          key={idx}
                          className="code-font"
                          style={{
                            fontSize: '0.7rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  {/* Progress Bar */}
                  <div style={{ marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                      <span>
                        Tasks: {proj.stats?.completedTasks || 0} / {proj.stats?.totalTasks || 0} completed
                      </span>
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
                      <span>Due {new Date(proj.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
  );
};
