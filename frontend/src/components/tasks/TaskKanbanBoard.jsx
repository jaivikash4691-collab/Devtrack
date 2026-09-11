import React, { useState } from 'react';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

const COLUMNS = [
  { id: 'TODO', title: 'To Do', pillClass: 'col-todo' },
  { id: 'IN_PROGRESS', title: 'In Progress', pillClass: 'col-progress' },
  { id: 'REVIEW', title: 'In Review', pillClass: 'col-review' },
  { id: 'COMPLETED', title: 'Completed', pillClass: 'col-completed' },
];

export const TaskKanbanBoard = ({ tasks = [], onTaskClick, onStatusChange, onNewTask }) => {
  const [dragOverCol, setDragOverCol] = useState(null);

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e, colId) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onStatusChange(taskId, colId);
    }
  };

  return (
    <div className="kanban-board">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        const isHovered = dragOverCol === col.id;

        return (
          <div
            key={col.id}
            className="kanban-column"
            style={{
              borderColor: isHovered ? 'var(--primary)' : 'var(--border-color)',
              backgroundColor: isHovered ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-surface)',
            }}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="kanban-column-header">
              <div className="column-title-wrap">
                <span className={`column-pill ${col.pillClass}`} />
                <span>{col.title}</span>
                <span className="column-count">{colTasks.length}</span>
              </div>
              <button
                onClick={() => onNewTask(col.id)}
                className="btn-ghost"
                style={{ padding: '0.25rem', borderRadius: '4px', cursor: 'pointer' }}
                title="Add task to column"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="kanban-card-list">
              {colTasks.length === 0 ? (
                <div
                  style={{
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.825rem',
                    border: '1px dashed rgba(255, 255, 255, 0.06)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  No tasks in {col.title.toLowerCase()}
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onClick={onTaskClick}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
