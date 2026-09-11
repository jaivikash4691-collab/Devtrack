import React from 'react';
import { FolderPlus, CheckCircle, BellOff, Layers } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Layers,
  title = 'No items found',
  description = 'Get started by creating a new item.',
  actionText,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--border-color)',
        margin: '1rem 0',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.1)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <Icon size={28} />
      </div>
      <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p style={{ maxWidth: '420px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: actionText ? '1.5rem' : '0' }}>
        {description}
      </p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionText}
        </button>
      )}
    </div>
  );
};
