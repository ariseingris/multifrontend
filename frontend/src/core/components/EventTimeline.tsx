import React from 'react';
import { useTimelineStore } from '../../store';
import { formatTime, getStatusColor } from '../../utils/formatting';

export const EventTimeline: React.FC = () => {
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
  const displayEvents = [...events].reverse().slice(0, 10);

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ paddingBottom: '12px' }}>
        {displayEvents.map((event, index) => (
          <TimelineItem key={`${event.timestamp}-${index}`} event={event} />
        ))}
      </div>
    </div>
  );
};

interface TimelineItemProps {
  event: any;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ event }) => {
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
      style={{
        display: 'flex',
        gap: '12px',
        padding: '8px 12px',
        borderLeft: `3px solid ${color}`,
        background: 'rgba(0,0,0,0.2)',
        marginBottom: '6px',
        borderRadius: '0 4px 4px 0',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <div
        style={{
          minWidth: '60px',
          fontSize: '11px',
          color: '#9ca3af',
          fontFamily: 'monospace',
          fontWeight: '600',
        }}
      >
        {formatTime(event.timestamp)}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
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
            color: '#e0e0e0',
            flex: 1,
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

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};
