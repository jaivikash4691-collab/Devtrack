import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ text = 'Loading...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        color: 'var(--text-muted)',
        gap: '0.75rem',
      }}
    >
      <Loader2 size={32} className="animate-spin" color="#6366f1" />
      <span style={{ fontSize: '0.9rem' }}>{text}</span>
      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
