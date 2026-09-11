import React from 'react';

export const HealthBadge = ({ status, score }) => {
  let badgeClass = 'badge-healthy';
  if (status === 'Critical') badgeClass = 'badge-critical';
  else if (status === 'At Risk') badgeClass = 'badge-risk';
  else if (status === 'Needs Attention') badgeClass = 'badge-attention';

  return (
    <span className={`badge ${badgeClass}`}>
      {score !== undefined && <span className="font-bold">{score} • </span>}
      {status || 'Unknown'}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  return (
    <span className={`badge priority-${priority}`}>
      {priority}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  let label = status;
  let bgClass = 'badge-subtle';

  switch (status) {
    case 'COMPLETED':
      bgClass = 'badge-healthy';
      label = 'Completed';
      break;
    case 'IN_PROGRESS':
      bgClass = 'badge-indigo';
      label = 'In Progress';
      break;
    case 'REVIEW':
      bgClass = 'badge-attention';
      label = 'Review';
      break;
    case 'TODO':
    default:
      bgClass = 'badge-subtle';
      label = 'To Do';
      break;
  }

  return <span className={`badge ${bgClass}`}>{label}</span>;
};
