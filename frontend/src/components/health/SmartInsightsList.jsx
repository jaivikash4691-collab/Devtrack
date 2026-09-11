import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Info, Lightbulb, ArrowRight } from 'lucide-react';

export const SmartInsightsList = ({ insights = [], recommendations = [] }) => {
  const getInsightStyle = (type) => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertCircle size={18} color="#f43f5e" />,
          bg: 'rgba(244, 63, 94, 0.08)',
          border: 'rgba(244, 63, 94, 0.25)',
          titleColor: '#f43f5e',
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={18} color="#f59e0b" />,
          bg: 'rgba(245, 158, 11, 0.08)',
          border: 'rgba(245, 158, 11, 0.25)',
          titleColor: '#f59e0b',
        };
      case 'positive':
        return {
          icon: <CheckCircle2 size={18} color="#10b981" />,
          bg: 'rgba(16, 185, 129, 0.08)',
          border: 'rgba(16, 185, 129, 0.25)',
          titleColor: '#10b981',
        };
      case 'info':
      default:
        return {
          icon: <Info size={18} color="#0ea5e9" />,
          bg: 'rgba(14, 165, 233, 0.08)',
          border: 'rgba(14, 165, 233, 0.25)',
          titleColor: '#0ea5e9',
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Smart Rule Insights */}
      <div>
        <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lightbulb size={16} color="#eab308" />
          Real-Time Project Insights
        </h4>

        {insights.length === 0 ? (
          <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No warning flags detected. All signals indicate normal execution.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {insights.map((item, idx) => {
              const style = getInsightStyle(item.type);
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: style.bg,
                    border: `1px solid ${style.border}`,
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div style={{ marginTop: '2px', flexShrink: 0 }}>{style.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: style.titleColor }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      {item.message}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommended Next Actions */}
      {recommendations.length > 0 && (
        <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
          <h5 style={{ fontSize: '0.825rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
            Recommended Priority Actions
          </h5>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: 0 }}>
            {recommendations.map((rec, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                <ArrowRight size={14} color="#6366f1" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
