import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Avatar } from '../components/common/Avatar';
import { Loader } from '../components/common/Loader';
import api from '../services/api';
import {
  ShieldAlert,
  Users,
  FolderGit2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  Power,
} from 'lucide-react';

export const AdminPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data.stats);
      setUsersList(usersRes.data.users || []);
    } catch (err) {
      showToast(err.message || 'Failed to load administrative data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-status`);
      showToast(res.data.message, 'success');
      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: res.data.user.isActive } : u))
      );
    } catch (err) {
      showToast(err.message || 'Failed to toggle status.', 'error');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      showToast(res.data.message, 'success');
      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      showToast(err.message || 'Failed to update role.', 'error');
    }
  };

  if (loading) {
    return <Loader text="Loading administrator portal..." />;
  }

  const filteredUsers = usersList.filter((u) => {
    if (!searchUser.trim()) return true;
    const q = searchUser.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Admin Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
          <ShieldAlert size={24} color="#f43f5e" />
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>System Administration Portal</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Platform-level metrics, active workspaces telemetry, and user management.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Users
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem' }}>
              {stats.totalUsers}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-healthy)', marginTop: '0.2rem' }}>
              {stats.activeUsers} Active Accounts
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Workspaces
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem' }}>
              {stats.totalProjects}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
              {stats.activeProjects} Active Sprints
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Platform Tasks
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem' }}>
              {stats.totalTasks}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {stats.completedTasks} Completed ({stats.overallTaskCompletionRate}%)
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Health Distribution
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-healthy">{stats.healthDistribution?.healthy || 0} Healthy</span>
              <span className="badge badge-attention">{stats.healthDistribution?.needsAttention || 0} Attention</span>
              <span className="badge badge-critical">{stats.healthDistribution?.critical || 0} Critical</span>
            </div>
          </div>
        </div>
      )}

      {/* User Management Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>User Directory & Permissions</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Manage registered students, managers, and system credentials.
            </p>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search user name or email..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
            />
            <Search
              size={14}
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>User</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>Registered</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isSelf = u._id === user?._id;

                return (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Avatar user={u} size="md" />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {u.name} {isSelf && <span style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>(You)</span>}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      {!isSelf ? (
                        <select
                          className="form-select"
                          value={u.role}
                          onChange={(e) => handleChangeRole(u._id, e.target.value)}
                          style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                        >
                          <option value="student">Student</option>
                          <option value="manager">Manager / Lead</option>
                          <option value="admin">Administrator</option>
                        </select>
                      ) : (
                        <span className="badge badge-indigo">{u.role}</span>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <span className={`badge ${u.isActive ? 'badge-healthy' : 'badge-critical'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      {!isSelf && (
                        <button
                          onClick={() => handleToggleStatus(u._id)}
                          className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-secondary'}`}
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                        >
                          <Power size={13} />
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
