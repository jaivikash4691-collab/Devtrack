import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';

export const NotificationBell = () => {
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen for real-time notification socket event
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification:new', handleNewNotification);
    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Error marking read:', err.message);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Error marking all read:', err.message);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      markAsRead(notif._id, { stopPropagation: () => {} });
    }
    setIsOpen(false);
    if (notif.relatedProject?._id) {
      navigate(`/projects/${notif.relatedProject._id}`);
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-ghost"
        style={{
          position: 'relative',
          padding: '0.5rem',
          borderRadius: 'var(--radius-full)',
          cursor: 'pointer',
        }}
        title="Notifications"
      >
        <Bell size={20} color="var(--text-secondary)" />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              background: '#f43f5e',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 800,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 8px rgba(244, 63, 94, 0.6)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '340px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="btn-ghost"
                style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                You're all caught up! No notifications.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    background: n.read ? 'transparent' : 'rgba(99, 102, 241, 0.08)',
                    cursor: 'pointer',
                    transition: 'background 150ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = n.read ? 'transparent' : 'rgba(99, 102, 241, 0.08)'; }}
                >
                  <div style={{ flex: 1, marginRight: '0.5rem' }}>
                    <div style={{ fontWeight: n.read ? 500 : 700, fontSize: '0.825rem', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {!n.read && (
                    <button
                      onClick={(e) => markAsRead(n._id, e)}
                      className="btn-ghost"
                      style={{ padding: '0.25rem', borderRadius: '4px', cursor: 'pointer' }}
                      title="Mark as read"
                    >
                      <Check size={14} color="#10b981" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
