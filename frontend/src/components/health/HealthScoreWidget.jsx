import React from 'react';
import { HealthGauge } from './HealthGauge';
import { SmartInsightsList } from './SmartInsightsList';
import { CheckCircle, Clock, Users, Activity as ActivityIcon, Milestone as MilestoneIcon } from 'lucide-react';

export const HealthScoreWidget = ({ health }) => {
  if (!health) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Project health data is computing...</p>
      </div>
    );
  }

  const { overallScore, factors, insights, recommendations } = health;

  const factorItems = [
    {
      title: 'Task Completion',
      score: factors?.taskCompletion?.score ?? 0,
      weight: '30%',
      icon: <CheckCircle size={15} color="#6366f1" />,
      detail: `${factors?.taskCompletion?.completed ?? 0} of ${factors?.taskCompletion?.total ?? 0} tasks completed`,
    },
    {
      title: 'Milestone Progress',
      score: factors?.milestoneProgress?.score ?? 0,
      weight: '20%',
      icon: <MilestoneIcon size={15} color="#8b5cf6" />,
      detail: `${factors?.milestoneProgress?.totalMilestones ?? 0} milestones tracked`,
    },
    {
      title: 'Deadline Performance',
      score: factors?.deadlinePerformance?.score ?? 0,
      weight: '20%',
      icon: <Clock size={15} color="#f59e0b" />,
      detail: `${factors?.deadlinePerformance?.overdueCount ?? 0} overdue tasks`,
    },
    {
      title: 'Team Activity',
      score: factors?.teamActivity?.score ?? 0,
      weight: '15%',
      icon: <Users size={15} color="#10b981" />,
      detail: `${factors?.teamActivity?.activeMembers ?? 0} active contributors`,
    },
    {
      title: 'Recent Activity',
      score: factors?.recentActivity?.score ?? 0,
      weight: '15%',
      icon: <ActivityIcon size={15} color="#0ea5e9" />,
      detail: `${factors?.recentActivity?.weeklyEvents ?? 0} actions in last 7 days`,
    },
  ];

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <HealthGauge score={overallScore} size={150} strokeWidth={11} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Project Health Intelligence</h3>
          <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            Calculated algorithmically from task status velocity, milestone deliverables, deadline adherence, and active team contributions.
          </p>

          {/* 5-Factor Mini Meters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {factorItems.map((f, i) => (
              <div key={i} style={{ background: 'var(--bg-subtle)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {f.icon} {f.title}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>
                    {f.score}% <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({f.weight})</span>
                  </span>
                </div>
                <div className="progress-bar-bg" style={{ height: '5px' }}>
                  <div
                    className="progress-bar-fill progress-primary"
                    style={{ width: `${f.score}%` }}
                  />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {f.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Smart Rule Insights */}
      <SmartInsightsList insights={insights} recommendations={recommendations} />
    </div>
  );
};
