import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import {
  LayoutDashboard,
  FolderGit2,
  CheckSquare,
  ShieldAlert,
  Bell,
  User,
  LogOut,
  Sparkles,
  Layers,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-badge">
            <Layers size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="logo-text">DevTrack</span>
            <span className="logo-subtext">Project Health</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Workspace</div>

          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <div className="nav-link-left">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </div>
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <div className="nav-link-left">
              <FolderGit2 size={18} />
              <span>Projects</span>
            </div>
          </NavLink>

          <div className="nav-section-title">Personal</div>

          <NavLink
            to="/notifications"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <div className="nav-link-left">
              <Bell size={18} />
              <span>Notifications</span>
            </div>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <div className="nav-link-left">
              <User size={18} />
              <span>Profile & Skills</span>
            </div>
          </NavLink>

          {user?.role === 'admin' && (
            <>
              <div className="nav-section-title">System Administration</div>
              <NavLink
                to="/admin"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <div className="nav-link-left">
                  <ShieldAlert size={18} color="#f43f5e" />
                  <span>Admin Portal</span>
                </div>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-snippet">
            <Avatar user={user} size="sm" />
            <div className="user-snippet-info">
              <span className="user-snippet-name">{user?.name}</span>
              <span className="user-snippet-role">{user?.role}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn-ghost"
            style={{ padding: '0.4rem', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
            title="Log Out"
          >
            <LogOut size={16} color="var(--text-muted)" />
          </button>
        </div>
      </aside>
    </>
  );
};
