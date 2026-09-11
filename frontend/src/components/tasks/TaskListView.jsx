import React from 'react';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { Calendar, AlertCircle } from 'lucide-react';

export const TaskListView = ({ tasks = [], onTaskClick, onStatusChange }) => {
  if (tasks.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No tasks match the selected filter criteria.
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Task Title</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Priority</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Assignee</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Deadline</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'right' }}>Milestone</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const isOverdue =
                task.status !== 'COMPLETED' &&
                task.deadline &&
                new Date(task.deadline) < new Date();

              return (
                <tr
                  key={task._id}
                  onClick={() => onTaskClick(task)}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'background-color 150ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isOverdue && <AlertCircle size={15} color="#f43f5e" title="Task is overdue" />}
                      <span>{task.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <StatusBadge status={task.status} />
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Avatar user={task.assignedTo} size="sm" />
                      <span style={{ fontSize: '0.85rem' }}>
                        {task.assignedTo?.name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: isOverdue ? 'var(--color-critical)' : 'var(--text-secondary)' }}>
                    {task.deadline ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={13} />
                        {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                    {task.milestone?.name || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
