import React from 'react';
import { PriorityBadge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { Calendar, MessageSquare, CheckSquare, AlertCircle } from 'lucide-react';

export const TaskCard = ({ task, onClick, onStatusChange }) => {
  const isOverdue =
    task.status !== 'COMPLETED' &&
    task.deadline &&
    new Date(task.deadline) < new Date();

  const formattedDate = task.deadline
    ? new Date(task.deadline).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const handleStatusSelect = (e) => {
    e.stopPropagation();
    onStatusChange(task._id, e.target.value);
  };

  return (
    <div
      className={`task-card ${isOverdue ? 'is-overdue' : ''}`}
      onClick={() => onClick(task)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task._id);
      }}
    >
      <div className="task-card-header">
        <PriorityBadge priority={task.priority} />
        <select
          className="status-select-btn"
          value={task.status}
          onChange={handleStatusSelect}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">Review</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div className="task-card-title">{task.title}</div>

      {task.description && (
        <div className="task-card-desc">{task.description}</div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.6rem' }}>
          {task.tags.map((t, idx) => (
            <span
              key={idx}
              className="code-font"
              style={{
                fontSize: '0.7rem',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                color: 'var(--text-secondary)',
              }}
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="task-card-footer">
        <div className="task-meta-left">
          {formattedDate && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: isOverdue ? 'var(--color-critical)' : 'var(--text-muted)',
                fontWeight: isOverdue ? 600 : 400,
              }}
            >
              {isOverdue ? <AlertCircle size={13} color="#f43f5e" /> : <Calendar size={13} />}
              {formattedDate}
            </span>
          )}

          {totalSubtasks > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckSquare size={13} />
              {completedSubtasks}/{totalSubtasks}
            </span>
          )}

          {task.comments?.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <MessageSquare size={13} />
              {task.comments.length}
            </span>
          )}
        </div>

        <Avatar user={task.assignedTo} size="sm" />
      </div>
    </div>
  );
};
