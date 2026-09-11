import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { NotificationBell } from '../notifications/NotificationBell';
import { Plus, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = ({ onToggleSidebar, onNewProject }) => {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          className="btn-ghost"
          style={{ padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title="Toggle Navigation"
        >
          <Menu size={20} color="var(--text-secondary)" />
        </button>
      </div>

      <div className="topbar-actions">
        {user?.role !== 'student' && (
          <button onClick={onNewProject} className="btn btn-primary btn-sm">
            <Plus size={15} /> New Project
          </button>
        )}

        <NotificationBell />

        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <Avatar user={user} size="sm" />
        </Link>
      </div>
    </header>
  );
};
