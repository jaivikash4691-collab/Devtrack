import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HealthGauge } from '../components/health/HealthGauge';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  GitBranch,
  Activity,
  CheckCircle2,
  Clock,
  Users,
  Sparkles,
  BarChart3,
  Flame,
  Check,
} from 'lucide-react';

export const LandingPage = () => {
  // Interactive Live Simulator State
  const [taskCompletion, setTaskCompletion] = useState(85);
  const [milestoneProgress, setMilestoneProgress] = useState(80);
  const [deadlinePerformance, setDeadlinePerformance] = useState(70);
  const [teamActivity, setTeamActivity] = useState(90);
  const [recentActivity, setRecentActivity] = useState(80);

  // Compute Simulated Score
  const simulatedScore = Math.round(
    0.30 * taskCompletion +
    0.20 * milestoneProgress +
    0.20 * deadlinePerformance +
    0.15 * teamActivity +
    0.15 * recentActivity
  );

  let simulatedStatus = 'Healthy';
  if (simulatedScore < 40) simulatedStatus = 'Critical';
  else if (simulatedScore < 60) simulatedStatus = 'At Risk';
  else if (simulatedScore < 80) simulatedStatus = 'Needs Attention';

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh' }}>
      {/* Public Landing Navbar */}
      <header className="landing-nav">
        <div className="container landing-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="logo-badge">
              <Layers size={20} />
            </div>
            <span className="logo-text">DevTrack</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/login" className="btn btn-ghost btn-sm">
              Log In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-badge">
            <Sparkles size={14} color="#818cf8" />
            <span>Intelligent Project Health Engine for Developers</span>
          </div>

          <h1 className="hero-title">
            Stop guessing project status. <br />
            <span className="hero-title-gradient">Monitor real development health.</span>
          </h1>

          <p className="hero-subtitle">
            Built specifically for college capstone teams, hackathon groups, internship squads, and agile developers.
            Quantify progress with 5-factor health scoring, live GitHub telemetry, and automated bottleneck detection.
          </p>

          <div className="hero-cta-group">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Project Workspace <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Launch Demo Workspace
            </Link>
          </div>

          {/* Interactive Live Simulator */}
          <div className="health-simulator-card">
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Flame size={18} color="#f59e0b" />
                  Interactive Project Health Simulator
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Slide factors below to see the weighted algorithm compute real-time project health in action.
                </p>
              </div>
              <span className="badge badge-indigo">Live Formula Preview</span>
            </div>

            <div className="simulator-grid">
              {/* Sliders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600 }}>Task Completion (30%)</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{taskCompletion}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={taskCompletion}
                    onChange={(e) => setTaskCompletion(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600 }}>Milestone Progress (20%)</span>
                    <span style={{ color: '#8b5cf6', fontWeight: 700 }}>{milestoneProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={milestoneProgress}
                    onChange={(e) => setMilestoneProgress(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#8b5cf6' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600 }}>Deadline Adherence (20%)</span>
                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>{deadlinePerformance}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={deadlinePerformance}
                    onChange={(e) => setDeadlinePerformance(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#f59e0b' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600 }}>Team Active Participation (15%)</span>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>{teamActivity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={teamActivity}
                    onChange={(e) => setTeamActivity(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#10b981' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600 }}>Recent Activity Cadence (15%)</span>
                    <span style={{ color: '#0ea5e9', fontWeight: 700 }}>{recentActivity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={recentActivity}
                    onChange={(e) => setRecentActivity(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#0ea5e9' }}
                  />
                </div>
              </div>

              {/* Live Gauge & Output */}
              <div className="simulator-gauge-wrap">
                <HealthGauge score={simulatedScore} size={150} strokeWidth={11} />
                <div style={{ marginTop: '1.25rem', width: '100%' }}>
                  <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem' }}>
                    {simulatedScore >= 80 && (
                      <span style={{ color: 'var(--color-healthy)' }}>
                        ✓ Strong sprint velocity. Milestones and task completion on track.
                      </span>
                    )}
                    {simulatedScore >= 60 && simulatedScore < 80 && (
                      <span style={{ color: 'var(--color-attention)' }}>
                        ⚠ Needs attention: High task completion but deadline adherence has slipped.
                      </span>
                    )}
                    {simulatedScore < 60 && (
                      <span style={{ color: 'var(--color-critical)' }}>
                        ⚠ Critical warning: Bottlenecks detected in deliverables and active contributor engagement.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section className="features-section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
              Engineered for Real Engineering Teams
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Everything software teams need to deliver quality software before submission deadlines.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon-wrap">
                <Sparkles size={22} />
              </div>
              <h3 className="feature-title">Proprietary Health Intelligence</h3>
              <p className="feature-desc">
                Mathematical 5-factor scoring calculates exact project health from real task status, overdue deliverables, and team commits.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                <GitBranch size={22} />
              </div>
              <h3 className="feature-title">Live GitHub Repository Sync</h3>
              <p className="feature-desc">
                Connect your public GitHub repos to synchronize real-time commit timelines, active contributors, and open issue velocity.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
                <Clock size={22} />
              </div>
              <h3 className="feature-title">Milestone Roadmap Timeline</h3>
              <p className="feature-desc">
                Structure large multi-week deliverables into quantifiable milestones with automatic task linking and achievement celebration.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: 'rgba(14, 165, 233, 0.12)', color: '#0ea5e9' }}>
                <Users size={22} />
              </div>
              <h3 className="feature-title">Workload Balance & Team Insights</h3>
              <p className="feature-desc">
                Identify unbalanced task distributions early to ensure every team member contributes effectively during hackathons and capstones.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: 'rgba(236, 72, 153, 0.12)', color: '#ec4899' }}>
                <Activity size={22} />
              </div>
              <h3 className="feature-title">Real-Time Socket Synchronization</h3>
              <p className="feature-desc">
                Kanban status transitions, task comments, and activity audit logs update instantly across all team members without refreshing.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
                <ShieldCheck size={22} />
              </div>
              <h3 className="feature-title">Role-Based Access Control</h3>
              <p className="feature-desc">
                Strict granular authorization for Students, Project Managers / Leads, and University Administrators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="landing-footer">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="logo-badge" style={{ width: '28px', height: '28px' }}>
              <Layers size={16} />
            </div>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>DevTrack</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>— Full-Stack Project Management & Health Platform</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.875rem' }}>
            <Link to="/login" style={{ color: 'var(--text-secondary)' }}>Login</Link>
            <Link to="/register" style={{ color: 'var(--text-secondary)' }}>Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
