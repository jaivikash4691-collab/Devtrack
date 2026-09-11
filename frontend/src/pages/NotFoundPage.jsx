import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div className="logo-badge" style={{ width: '48px', height: '48px', marginBottom: '1.5rem' }}>
        <Layers size={28} />
      </div>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', marginBottom: '1.5rem' }}>
        The workspace or page you are looking for does not exist or has been moved.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        <ArrowLeft size={16} /> Return to Dashboard
      </Link>
    </div>
  );
};
