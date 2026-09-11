import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import api from '../services/api';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  ExternalLink,
  MessageSquare,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export const NotificationsPage = () => {
  const { socket } = useSocket();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/notifications${filterUnreadOnly ? '?unread=true' : ''}`);
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filterUnreadOnly]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      showToast('Notification marked as read.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update notification.', 'error');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      showToast('All notifications marked as read.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to mark all as read.', 'error');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      showToast('Notification removed.', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to delete notification.', 'error');
    }
  };

  const handleClickItem = (notif) => {
    if (!notif.read) {
      markAsRead(notif._id);
    }
    if (notif.relatedProject?._id) {
      navigate(`/projects/${notif.relatedProject._id}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Notifications Center</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Alerts for task assignments, deadline reminders, and team discussions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            className={`btn btn-sm ${filterUnreadOnly ? 'btn-primary' : 'btn-secondary'}`}
          >
            {filterUnreadOnly ? 'Showing Unread' : 'Filter Unread'}
          </button>
          <button onClick={markAllAsRead} className="btn btn-secondary btn-sm">
            <CheckCheck size={14} /> Mark All Read
          </button>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading your notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All Caught Up!"
          description="You don't have any notifications right now."
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleClickItem(n)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '1.15rem 1.25rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  background: n.read ? 'transparent' : 'rgba(99, 102, 241, 0.08)',
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = n.read ? 'transparent' : 'rgba(99, 102, 241, 0.08)'; }}
              >
                <div style={{ flex: 1, marginRight: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    {!n.read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />}
                    <span style={{ fontWeight: n.read ? 600 : 700, fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                      {n.title}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', lineHeight: 1.45 }}>
                    {n.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                    {n.relatedProject && (
                      <span style={{ color: 'var(--primary)', fontWeight: 500 }}>
                        📁 {n.relatedProject.name}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={(e) => e.stopPropagation()}>
                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="btn-ghost"
                      style={{ padding: '0.35rem', borderRadius: '4px', cursor: 'pointer' }}
                      title="Mark as read"
                    >
                      <Check size={16} color="#10b981" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n._id)}
                    className="btn-ghost"
                    style={{ padding: '0.35rem', borderRadius: '4px', cursor: 'pointer' }}
                    title="Delete notification"
                  >
                    <Trash2 size={15} color="#f43f5e" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
