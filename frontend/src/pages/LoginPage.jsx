import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Layers, ArrowRight, Lock, Mail, UserCheck, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isExpired = searchParams.get('expired') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await login(email.trim().toLowerCase(), password);
      showToast('Welcome back to DevTrack!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    setErrorMsg('');

    try {
      await login(demoEmail, demoPassword);
      showToast(`Logged in as demo account (${demoEmail})`, 'success');
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed. Make sure database is seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-main)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div className="logo-badge">
              <Layers size={22} />
            </div>
            <span className="logo-text" style={{ fontSize: '1.4rem' }}>DevTrack</span>
          </Link>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Sign in to manage team projects and monitor development health
          </p>
        </div>

        {/* 1-Click Quick Demo Accounts Bar */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', marginBottom: '0.75rem' }}>
            <UserCheck size={15} /> 1-Click Demo Accounts
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('priya@devtrack.io', 'Password123!')}
              className="btn btn-secondary btn-sm"
              disabled={loading}
              style={{ fontSize: '0.775rem', justifyContent: 'flex-start' }}
            >
              👑 Priya (Lead / PM)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('arun@devtrack.io', 'Password123!')}
              className="btn btn-secondary btn-sm"
              disabled={loading}
              style={{ fontSize: '0.775rem', justifyContent: 'flex-start' }}
            >
              💻 Arun (Full-Stack)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('karthik@devtrack.io', 'Password123!')}
              className="btn btn-secondary btn-sm"
              disabled={loading}
              style={{ fontSize: '0.775rem', justifyContent: 'flex-start' }}
            >
              🎨 Karthik (UI / UX)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@devtrack.io', 'Password123!')}
              className="btn btn-secondary btn-sm"
              disabled={loading}
              style={{ fontSize: '0.775rem', justifyContent: 'flex-start' }}
            >
              🛡️ System Admin
            </button>
          </div>
        </div>

        {/* Login Card Form */}
        <div className="card" style={{ padding: '2rem' }}>
          {isExpired && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-attention)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={16} /> Your session has expired. Please log in again.
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-critical)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
              </div>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
