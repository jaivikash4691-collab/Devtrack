import React, { useState } from 'react';
import { GitBranch, Star, GitFork, AlertCircle, RefreshCw, ExternalLink, GitCommit, Users } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const GitHubStatsCard = ({ githubStats, projectId, onSynced, canManage = false }) => {
  const { showToast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await api.post(`/projects/${projectId}/github/sync`);
      showToast('GitHub repository data synchronized successfully.', 'success');
      onSynced(res.data.data);
    } catch (err) {
      showToast(err.message || 'Failed to sync with GitHub API.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  if (!githubStats) {
    return (
      <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          No GitHub repository statistics synchronized yet.
        </p>
        {canManage && (
          <button onClick={handleSync} className="btn btn-secondary btn-sm" disabled={syncing}>
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync Repository Stats'}
          </button>
        )}
      </div>
    );
  }

  const {
    fullName,
    description,
    stars,
    forks,
    openIssues,
    language,
    defaultBranch,
    htmlUrl,
    recentCommits = [],
    contributors = [],
    syncedAt,
  } = githubStats;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Repo Summary Card */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{fullName}</h3>
              <a
                href={htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
                style={{ padding: '0.2rem', color: 'var(--text-muted)' }}
                title="Open on GitHub"
              >
                <ExternalLink size={15} />
              </a>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, maxWidth: '700px' }}>
              {description}
            </p>
          </div>

          {canManage && (
            <button onClick={handleSync} className="btn btn-secondary btn-sm" disabled={syncing}>
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing...' : 'Refresh Stats'}
            </button>
          )}
        </div>

        {/* Stats Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <Star size={15} color="#eab308" />
            <span style={{ fontWeight: 700 }}>{stars?.toLocaleString()}</span>
            <span style={{ color: 'var(--text-muted)' }}>Stars</span>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <GitFork size={15} color="#6366f1" />
            <span style={{ fontWeight: 700 }}>{forks?.toLocaleString()}</span>
            <span style={{ color: 'var(--text-muted)' }}>Forks</span>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <AlertCircle size={15} color="#10b981" />
            <span style={{ fontWeight: 700 }}>{openIssues?.toLocaleString()}</span>
            <span style={{ color: 'var(--text-muted)' }}>Open Issues</span>
          </div>

          {language && (
            <div style={{ background: 'var(--bg-subtle)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }} />
              <span style={{ fontWeight: 600 }}>{language}</span>
            </div>
          )}

          {defaultBranch && (
            <div style={{ background: 'var(--bg-subtle)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
              <GitBranch size={15} color="var(--text-muted)" />
              <span className="code-font" style={{ fontSize: '0.8rem' }}>{defaultBranch}</span>
            </div>
          )}
        </div>

        {syncedAt && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            Last synced: {new Date(syncedAt).toLocaleString()}
          </div>
        )}
      </div>

      {/* Grid: Commits & Contributors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Commits */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GitCommit size={16} color="#6366f1" /> Recent Commit Activity
          </h4>

          {recentCommits.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent commits recorded.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '340px', overflowY: 'auto' }}>
              {recentCommits.map((c, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                    background: 'var(--bg-subtle)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="code-font" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                      #{c.sha}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(c.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }} className="truncate">
                    {c.message}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    by {c.author}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Contributors */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} color="#10b981" /> Top Repository Contributors
          </h4>

          {contributors.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No contributors recorded.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '340px', overflowY: 'auto' }}>
              {contributors.map((contrib, idx) => (
                <a
                  key={idx}
                  href={contrib.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-subtle)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    transition: 'background-color 150ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden' }}>
                      <img src={contrib.avatarUrl} alt={contrib.username} style={{ width: '100%', height: '100%' }} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {contrib.username}
                    </span>
                  </div>
                  <span className="badge badge-indigo">
                    {contrib.contributions} commits
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
