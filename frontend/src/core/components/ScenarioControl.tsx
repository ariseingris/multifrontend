import React, { useId, useState, useEffect, useRef } from 'react';
import {
  useScenarioStore,
  useTimelineStore,
  useAlertStore,
  useTelemetryStore,
} from '../store';
import { formatElapsedTime } from '../utils/formatting';

interface ScenarioControlProps {
  variant?: 'classic' | 'compact';
  initiallyOpen?: boolean;
  authoritative?: boolean;
  hasSession?: boolean;
  speeds?: number[];
  disabled?: boolean;
  scenarios: Array<{ id: string; name: string }>;
  onScenarioStart?: (scenarioId: string, speed: number) => void;
  onSpeedChange?: (speed: number) => void;
  onScenarioPause?: () => void;
  onScenarioResume?: () => void;
  onScenarioReset?: () => void;
}

export const ScenarioControl: React.FC<ScenarioControlProps> = ({
  scenarios,
  variant = 'classic',
  initiallyOpen = false,
  disabled = false,
  authoritative = false,
  hasSession = true,
  speeds = [1, 2, 5, 10],
  onScenarioStart,
  onSpeedChange,
  onScenarioPause,
  onScenarioResume,
  onScenarioReset,
}) => {
  const scenarioSelectId = useId();
  const disclosure = useRef<HTMLDetailsElement>(null);
  useEffect(() => { if (initiallyOpen && disclosure.current) disclosure.current.open = true; }, [initiallyOpen]);
  const [selection, setSelection] = useState(scenarios[0]?.id ?? '');
  const [nextSpeed, setNextSpeed] = useState(1);
  const scenario = useScenarioStore((s) => s.scenario);
  const {
    startScenario,
    pauseScenario,
    resumeScenario,
    resetScenario,
    setSpeed,
  } = useScenarioStore();
  useEffect(() => {
    if (authoritative && scenarios.some((item) => item.id === scenario.name)) setSelection(scenario.name);
  }, [authoritative, scenario.name]);
  useEffect(() => {
    if (authoritative && scenario.status !== 'stopped') setNextSpeed(scenario.speed);
  }, [authoritative, scenario.speed, scenario.status]);
  const canStart = scenario.status === 'stopped' || scenario.status === 'completed';
  const selectedSpeed = authoritative && canStart ? nextSpeed : scenario.speed;
  const clearTelemetry = useTelemetryStore((s) => s.clearTelemetry);
  const clearAlerts = useAlertStore((s) => s.clearAlerts);
  const clearEvents = useTimelineStore((s) => s.clearEvents);

  const handleStart = (scenarioId: string) => {
    if (!authoritative) {
      clearTelemetry(); clearAlerts(); clearEvents(); startScenario();
    }
    onScenarioStart?.(scenarioId, selectedSpeed);
  };

  const handlePauseResume = () => {
    if (scenario.status === 'running') {
      if (!authoritative) pauseScenario();
      onScenarioPause?.();
    } else {
      if (!authoritative) resumeScenario();
      onScenarioResume?.();
    }
  };

  const handleReset = () => {
    if (!authoritative) {
      resetScenario(); clearTelemetry(); clearAlerts(); clearEvents();
    }
    onScenarioReset?.();
  };

  const isRunning = scenario.status === 'running';

  if (variant === 'compact') {
    const selected = authoritative ? selection : scenarios.some((item) => item.id === scenario.name)
      ? scenario.name : scenarios[0]?.id ?? '';
    return (
      <div className="fdb-controls">
        <details ref={disclosure}>
          <summary>Scenarios</summary>
          <fieldset disabled={disabled} className="fdb-controls__panel">
            <legend>Scenario controls</legend>
            <label htmlFor={scenarioSelectId}>Scenario</label>
            <select id={scenarioSelectId} value={selected} disabled={isRunning || scenario.status === 'paused'}
              onChange={(event) => authoritative ? setSelection(event.target.value) : useScenarioStore.getState().setScenario({ name: event.target.value })}>
              {scenarios.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <span>Speed{authoritative && canStart ? ' for next run' : ''}</span>
            <div className="fdb-controls__buttons">
              {speeds.map((speed) => <button key={speed} aria-pressed={selectedSpeed === speed}
                onClick={() => {
                  setNextSpeed(speed);
                  if (authoritative && canStart) return;
                  if (!authoritative) setSpeed(speed);
                  onSpeedChange?.(speed);
                }}>{speed}x</button>)}
            </div>
            <div className="fdb-controls__buttons">
              {(scenario.status === 'stopped' || scenario.status === 'completed')
                ? <button onClick={() => handleStart(selected)}>Run scenario</button>
                : <button onClick={handlePauseResume}>{isRunning ? 'Pause' : 'Resume'}</button>}
              <button disabled={authoritative && !hasSession} onClick={handleReset}>Reset</button>
            </div>
            {disabled && <p className="fdb-empty">Connect the simulator to enable controls.</p>}
          </fieldset>
        </details>
        <span>{authoritative ? 'Simulation · ' : ''}{scenario.status} · {scenario.phase.replace(/_/g, ' ')} · {formatElapsedTime(scenario.elapsedSeconds)} · {scenario.speed}x</span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#1a1a1a',
        border: '1px solid #2d2d2d',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
      }}
    >
      <h3
        style={{
          margin: '0 0 16px 0',
          fontSize: '14px',
          fontWeight: '600',
          color: '#e0e0e0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        Scenario Control
      </h3>

      {/* Scenario Selection */}
      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#9ca3af',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Scenario
        </label>
        <select
          value={scenario.name || ''}
          onChange={(e) => {
            if (!isRunning) {
              useScenarioStore.setState({
                scenario: { ...scenario, name: e.target.value },
              });
            }
          }}
          disabled={isRunning}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: isRunning ? '#262626' : '#262626',
            border: '1px solid #404040',
            borderRadius: '4px',
            color: '#e0e0e0',
            fontSize: '13px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.6 : 1,
          }}
        >
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Speed Control */}
      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#9ca3af',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Speed: {scenario.speed}x
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 5, 10].map((speed) => (
            <button
              key={speed}
              onClick={() => {
                setSpeed(speed);
                onSpeedChange?.(speed);
              }}
              style={{
                flex: 1,
                padding: '8px',
                background:
                  scenario.speed === speed ? '#3b82f6' : '#262626',
                border: '1px solid ' +
                  (scenario.speed === speed ? '#3b82f6' : '#404040'),
                borderRadius: '4px',
                color:
                  scenario.speed === speed ? '#ffffff' : '#9ca3af',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Status Display */}
      <div
        style={{
          background: 'rgba(0,0,0,0.3)',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '16px',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#9ca3af',
        }}
      >
        <div style={{ marginBottom: '4px' }}>
          Phase: <span style={{ color: '#e0e0e0', fontWeight: '600' }}>
            {scenario.phase.toUpperCase().replace(/_/g, ' ')}
          </span>
        </div>
        <div>
          Time: <span style={{ color: '#e0e0e0', fontWeight: '600' }}>
            {formatElapsedTime(scenario.elapsedSeconds)}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {(scenario.status === 'stopped' || scenario.status === 'completed') ? (
          <button
            onClick={() => handleStart(scenario.name)}
            style={{
              flex: 1,
              padding: '12px',
              background: '#10b981',
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ▶ RUN SCENARIO
          </button>
        ) : (
          <button
            onClick={handlePauseResume}
            style={{
              flex: 1,
              padding: '12px',
              background: isRunning ? '#f59e0b' : '#10b981',
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isRunning ? '⏸ PAUSE' : '▶ RESUME'}
          </button>
        )}

        <button
          onClick={handleReset}
          style={{
            flex: 1,
            padding: '12px',
            background: '#6b7280',
            border: 'none',
            borderRadius: '4px',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          ↻ RESET
        </button>

        <button
          style={{
            padding: '12px',
            background: '#404040',
            border: '1px solid #555',
            borderRadius: '4px',
            color: '#9ca3af',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          ⚙
        </button>
      </div>
    </div>
  );
};
