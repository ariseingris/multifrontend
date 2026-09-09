import React, { useEffect } from 'react';
import { useProjectStore, useSystemStore } from '../store';
import { Header } from './Header';
import { AlertDisplay } from './AlertDisplay';
import { EventTimeline } from './EventTimeline';
import { ScenarioControl } from './ScenarioControl';
import { ProjectConfig } from '../types';

interface DashboardProps {
  projectConfig: ProjectConfig;
  children?: React.ReactNode;
  onScenarioStart?: (scenarioId: string, speed: number) => void;
  onScenarioPause?: () => void;
  onScenarioReset?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projectConfig,
  children,
  onScenarioStart,
  onScenarioPause,
  onScenarioReset,
}) => {
  const setConfig = useProjectStore((s) => s.setConfig);
  const setStatus = useSystemStore((s) => s.setStatus);

  useEffect(() => {
    setConfig(projectConfig);
    setStatus({
      sensorCount: projectConfig.devices.length,
      aiEngineActive: projectConfig.aiEngine ?? true,
    });
  }, [projectConfig, setConfig, setStatus]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#0f0f0f',
        color: '#e0e0e0',
      }}
    >
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '20px 24px' }}>
          {/* Scenario Control */}
          <ScenarioControl
            scenarios={projectConfig.scenarios.map((s) => ({
              id: s.id,
              name: s.name,
            }))}
            onScenarioStart={onScenarioStart}
            onScenarioPause={onScenarioPause}
            onScenarioReset={onScenarioReset}
          />

          {/* Custom Content */}
          {children}

          {/* Event Timeline */}
          <div
            style={{
              background: '#1a1a1a',
              border: '1px solid #2d2d2d',
              borderRadius: '8px',
              marginBottom: '16px',
              overflow: 'hidden',
            }}
          >
            <h3
              style={{
                margin: 0,
                padding: '12px 16px',
                fontSize: '13px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderBottom: '1px solid #2d2d2d',
                color: '#9ca3af',
              }}
            >
              📋 Live Events
            </h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <EventTimeline />
            </div>
          </div>
        </div>
      </div>

      {/* Alert Display */}
      <AlertDisplay />
    </div>
  );
};
