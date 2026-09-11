import React from 'react';

export const Avatar = ({ user, name, avatar, size = 'md' }) => {
  const userName = user?.name || name || 'User';
  const userAvatar = user?.avatar || avatar;
  const initial = userName.charAt(0).toUpperCase();

  const sizeClass = size === 'sm' ? 'avatar-sm' : size === 'lg' ? 'avatar-lg' : '';

  if (userAvatar && userAvatar.trim() !== '') {
    return (
      <div className={`avatar ${sizeClass}`} title={userName}>
        <img src={userAvatar} alt={userName} onError={(e) => { e.target.style.display = 'none'; }} />
        <span>{initial}</span>
      </div>
    );
  }

  // Generate deterministic subtle background color based on name
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];
  const charCode = userName.charCodeAt(0) || 0;
  const bgColor = colors[charCode % colors.length];

  return (
    <div
      className={`avatar ${sizeClass}`}
      style={{ backgroundColor: `${bgColor}25`, color: bgColor, border: `1px solid ${bgColor}40` }}
      title={userName}
    >
      {initial}
    </div>
  );
};
