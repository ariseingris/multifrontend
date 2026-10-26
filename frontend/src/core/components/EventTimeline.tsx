import React from 'react';
import { useTimelineStore } from '../store';
import { formatTime, formatElapsedTime, getStatusColor } from '../utils/formatting';

export const EventTimeline: React.FC<{ theme?: 'dark' | 'light'; limit?: number }> = ({ theme = 'dark', limit = 10 }) => {
  const events = useTimelineStore((s) => s.events);

  if (events.length === 0) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '13px',
          fontStyle: 'italic',
        }}
      >
        Waiting for events...
      </div>
    );
  }

  // Show last 10 events, most recent at top
  const displayEvents = [...events].reverse().slice(0, Math.min(200, limit));

  return (
    <div role="log" aria-live="polite" style={{ padding: '12px 0' }}>
      <style>{`
        @keyframes mfTimelineEventIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .mf-timeline-item { animation: none !important; }
        }
      `}</style>
      <div style={{ paddingBottom: '12px' }}>
        {displayEvents.map((event, index) => (
          <TimelineItem key={`${event.timestamp}-${index}`} event={event} theme={theme} />
        ))}
      </div>
    </div>
  );
};

interface TimelineItemProps {
  event: any;
  theme: 'dark' | 'light';
}

const TimelineItem: React.FC<TimelineItemProps> = ({ event, theme }) => {
  const iconMap: Record<string, string> = {
    sensor_connected: '📡',
    system_normal: '✓',
    anomaly_detected: '⚠',
    threshold_exceeded: '⚠',
    critical_event: '🔴',
    alert_dispatched: '🚨',
    operator_acknowledged: '✓',
    system_recovered: '✓',
    action_approved: '✓',
    action_rejected: '✗',
  };

  const color = getStatusColor(event.severity);
  const icon = iconMap[event.type] || '●';

  return (
    <div
      className="mf-timeline-item"
      style={{
        display: 'flex',
        gap: '12px',
        padding: '8px 12px',
        borderLeft: `3px solid ${color}`,
        background: theme === 'light' ? '#f1f5f9' : 'rgba(0,0,0,0.2)',
        marginBottom: '6px',
        borderRadius: '0 4px 4px 0',
        animation: 'mfTimelineEventIn 0.2s ease-out',
      }}
    >
      <div
        style={{
          minWidth: '60px',
          fontSize: '11px',
          color: theme === 'light' ? '#52657a' : '#9ca3af',
          fontFamily: 'monospace',
          fontWeight: '600',
        }}
      >
        {event.elapsedSimSeconds !== undefined ? `Sim ${formatElapsedTime(event.elapsedSimSeconds)}` : formatTime(event.timestamp)}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          minWidth: 0,
          gap: '8px',
          flex: 1,
        }}
      >
        <span
          style={{
            fontSize: '14px',
            display: 'inline-block',
            minWidth: '20px',
          }}
        >
          {icon}
        </span>

        <span
          style={{
            fontSize: '12px',
            color: theme === 'light' ? '#334155' : '#e0e0e0',
            flex: 1,
            overflowWrap: 'anywhere',
          }}
        >
          {event.message}
        </span>

        {event.severity !== 'info' && (
          <span
            style={{
              fontSize: '10px',
              color: color,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {event.severity}
          </span>
        )}
      </div>


    </div>
  );
};
