import React from 'react';

export const HealthGauge = ({ score = 0, size = 160, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = '#10b981'; // Healthy
  let statusText = 'Healthy';

  if (score < 40) {
    color = '#f43f5e';
    statusText = 'Critical';
  } else if (score < 60) {
    color = '#f97316';
    statusText = 'At Risk';
  } else if (score < 80) {
    color = '#f59e0b';
    statusText = 'Needs Attention';
  }

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          style={{ transition: 'stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1), stroke 400ms ease' }}
        />
      </svg>
      {/* Central Score Text */}
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: size > 120 ? '2.4rem' : '1.5rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: size > 120 ? '0.75rem' : '0.65rem', fontWeight: 700, textTransform: 'uppercase', color, letterSpacing: '0.05em', marginTop: '0.2rem' }}>
          {statusText}
        </span>
      </div>
    </div>
  );
};
