import React from 'react';
import { useProjectStore, useSystemStore, useDemoModeStore } from '../../store';
import { formatElapsedTime } from '../../utils/formatting';
import { useScenarioStore } from '../../store';

export const Header: React.FC = () => {
  const config = useProjectStore((s) => s.config);
  const status = useSystemStore((s) => s.status);
  const demoMode = useDemoModeStore((s) => s.demoMode);
  const scenario = useScenarioStore((s) => s.scenario);

  return (
    <header
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #262626 100%)',
        borderBottom: '1px solid #404040',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px',
      }}
    >
      {/* Left: Project Name */}
      <div style={{ flex: 1 }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: '600',
            margin: 0,
            letterSpacing: '-0.5px',
          }}
        >
          {config?.name || 'IoT Dashboard'}
        </h1>
      </div>

      {/* Center: System Status */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          fontSize: '12px',
          alignItems: 'center',
        }}
      >
        {status.internetOffline ? (
          <>
            <StatusBadge
              status="offline"
              label="INTERNET OFFLINE"
            />
            <StatusBadge
              status="warning"
              label="EDGE AI ACTIVE"
            />
            <StatusBadge
              status="info"
              label="LOCAL ALARM ACTIVE"
            />
          </>
        ) : (
          <>
            <StatusBadge
              status={status.online ? 'online' : 'offline'}
              label={status.online ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
            />
            {status.aiEngineActive && (
              <StatusBadge status="info" label="AI ENGINE ACTIVE" />
            )}
            {status.sensorCount > 0 && (
              <StatusBadge
                status="info"
                label={`${status.sensorCount} SENSORS`}
              />
            )}
            {status.dataStreamActive && (
              <StatusBadge status="info" label="DATA STREAM ACTIVE" />
            )}
          </>
        )}
      </div>

      {/* Right: Demo Mode Info */}
      {demoMode.enabled && demoMode.simulationActive && (
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600',
            color: '#ef4444',
            letterSpacing: '0.5px',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#ef4444',
              display: 'inline-block',
              animation: 'pulse 2s infinite',
            }}
          />
          DEMO MODE
          {scenario.name && (
            <>
              <span style={{ opacity: 0.6 }}>
                 Scenario: {scenario.name}
              </span>
              {scenario.elapsedSeconds > 0 && (
                <span style={{ opacity: 0.6 }}>
                   {formatElapsedTime(scenario.elapsedSeconds)}
                </span>
              )}
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </header>
  );
};

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'warning' | 'info';
  label: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const colors: Record<string, { bg: string; text: string; dot: string }> = {
    online: { bg: 'rgba(74, 222, 128, 0.1)', text: '#4ade80', dot: '#4ade80' },
    offline: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', dot: '#ef4444' },
    warning: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', dot: '#f59e0b' },
    info: { bg: 'rgba(107, 114, 128, 0.1)', text: '#9ca3af', dot: '#6b7280' },
  };

  const color = colors[status];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: color.bg,
        border: `1px solid ${color.text}33`,
        padding: '4px 8px',
        borderRadius: '3px',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: color.dot,
          display: 'inline-block',
        }}
      />
      <span style={{ color: color.text }}>{label}</span>
    </div>
  );
};
