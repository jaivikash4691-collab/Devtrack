import React from 'react';
import confetti from 'canvas-confetti';
import { Calendar, CheckCircle2, Clock, AlertTriangle, Plus, Trash2, Edit3 } from 'lucide-react';

export const MilestoneRoadmap = ({
  milestones = [],
  onEditMilestone,
  onDeleteMilestone,
  onNewMilestone,
  canManage = false,
}) => {
  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  if (milestones.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          No milestones defined for this project yet.
        </p>
        {canManage && (
          <button onClick={onNewMilestone} className="btn btn-primary btn-sm">
            <Plus size={15} /> Create Milestone Roadmap
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem' }}>Milestone Progression Roadmap</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Track project deliverables and verify delivery timelines.
          </p>
        </div>
        {canManage && (
          <button onClick={onNewMilestone} className="btn btn-primary btn-sm">
            <Plus size={15} /> Add Milestone
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {milestones.map((m, idx) => {
          const isCompleted = m.status === 'COMPLETED' || m.progress === 100;
          const isOverdue = !isCompleted && m.deadline && new Date(m.deadline) < new Date();

          let statusBadgeClass = 'badge-indigo';
          if (isCompleted) statusBadgeClass = 'badge-healthy';
          else if (isOverdue) statusBadgeClass = 'badge-critical';
          else if (m.status === 'IN_PROGRESS') statusBadgeClass = 'badge-attention';

          return (
            <div
              key={m._id}
              className="card"
              style={{
                borderLeft: isCompleted
                  ? '4px solid var(--color-healthy)'
                  : isOverdue
                  ? '4px solid var(--color-critical)'
                  : '4px solid var(--primary)',
                padding: '1.25rem 1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                    <h4 style={{ fontSize: '1.05rem', margin: 0 }}>{m.name}</h4>
                    <span className={`badge ${statusBadgeClass}`}>
                      {isCompleted ? 'Completed' : isOverdue ? 'Delayed / Overdue' : m.status.replace('_', ' ')}
                    </span>
                  </div>
                  {m.description && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {m.description}
                    </p>
                  )}
                </div>

                {canManage && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => onEditMilestone(m)}
                      className="btn-ghost"
                      style={{ padding: '0.35rem', cursor: 'pointer', borderRadius: '4px' }}
                      title="Edit milestone"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => onDeleteMilestone(m._id)}
                      className="btn-ghost"
                      style={{ padding: '0.35rem', cursor: 'pointer', borderRadius: '4px' }}
                      title="Delete milestone"
                    >
                      <Trash2 size={15} color="#f43f5e" />
                    </button>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div style={{ margin: '1rem 0 0.75rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {m.linkedTasksCount > 0
                      ? `${m.completedTasksCount} of ${m.linkedTasksCount} Linked Tasks Finished`
                      : 'Milestone Completion'}
                  </span>
                  <span style={{ fontWeight: 700, color: isCompleted ? 'var(--color-healthy)' : '#ffffff' }}>
                    {m.progress}%
                  </span>
                </div>
                <div className="progress-bar-bg" style={{ height: '8px' }}>
                  <div
                    className={`progress-bar-fill ${isCompleted ? 'progress-healthy' : isOverdue ? 'progress-critical' : 'progress-primary'}`}
                    style={{ width: `${m.progress}%` }}
                  />
                </div>
              </div>

              {/* Dates & Metrics */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={13} /> Target: {new Date(m.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {m.linkedTasksCount > 0 && (
                    <span>{m.linkedTasksCount} Total Tasks</span>
                  )}
                </div>

                {isCompleted && (
                  <span
                    onClick={triggerCelebration}
                    style={{ color: 'var(--color-healthy)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
                    title="Click for celebration confetti!"
                  >
                    <CheckCircle2 size={14} /> Milestone Achieved 🎉
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
