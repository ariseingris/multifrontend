import React, { useEffect } from 'react';
import { Dashboard, Gauge, LiveChart } from '../../core/components';
import { pulseguardConfig } from './config';
import { useDataBridge } from '../../core/hooks/useDataBridge';
import { useScenarioStore, useSystemStore, useTelemetryStore, useTimelineStore } from '../../core/store';
import { TimelineEvent } from '../../core/types';

const metricValue = (key: string, metrics?: Record<string, number>) => metrics?.[key] ?? 0;

export const PulseGuardDashboard: React.FC = () => {
  const latest = useTelemetryStore((state) => state.getLatest());
  const scenario = useScenarioStore((state) => state.scenario);
  const setPhase = useScenarioStore((state) => state.setPhase);
  const advanceElapsed = useScenarioStore((state) => state.advanceElapsed);
  const addEvent = useTimelineStore((state) => state.addEvent);
  const setStatus = useSystemStore((state) => state.setStatus);
  const { send } = useDataBridge(import.meta.env.VITE_WS_URL || 'ws://localhost:8765');

  useEffect(() => {
    if (scenario.status !== 'running') return;

    const interval = setInterval(() => {
      advanceElapsed(0.1 * scenario.speed);
    }, 100);

    return () => clearInterval(interval);
  }, [scenario.status, scenario.speed, advanceElapsed]);

  useEffect(() => {
    const metrics = latest?.metrics;
    if (!metrics) return;
    const networkOnline = metricValue('network_online', metrics) === 1;
    const localAlarmActive = metricValue('local_alarm', metrics) === 1;
    setStatus({ online: networkOnline, dataStreamActive: networkOnline, internetOffline: !networkOnline, localAlarmActive });
    setPhase(
      localAlarmActive
        ? 'alert'
        : latest.status === 'critical'
          ? 'critical'
          : latest.status === 'warning'
            ? 'warning'
            : 'normal'
    );
  }, [latest, setPhase, setStatus]);

  const metrics = latest?.metrics;
  const networkOnline = metricValue('network_online', metrics) === 1;
  const localAlarmActive = metricValue('local_alarm', metrics) === 1;

  return (
    <Dashboard
      projectConfig={pulseguardConfig}
      onScenarioStart={(scenarioId, speed) => {
        const selected = pulseguardConfig.scenarios.find((item) => item.id === scenarioId);
        if (!selected) return;
        send({ type: 'start_scenario', project: 'pulseguard', scenario: scenarioId, speed });
        setPhase('normal');
        const event: TimelineEvent = { timestamp: new Date().toISOString(), type: 'system_normal', message: `Scenario started: ${selected.name}`, severity: 'info', icon: '▶' };
        addEvent(event);
      }}
      onSpeedChange={(speed) => send({ type: 'set_speed', speed })}
      onScenarioPause={() => send({ type: 'pause' })}
      onScenarioResume={() => send({ type: 'resume' })}
      onScenarioReset={() => send({ type: 'reset' })}
    >
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        <MetricCard label="Rainfall" value={metricValue('rain_mm_h', metrics).toFixed(1)} unit="mm/h" />
        <MetricCard label="Soil moisture" value={metricValue('soil_moisture_percent', metrics).toFixed(1)} unit="%" />
        <MetricCard label="Tilt" value={metricValue('tilt_deg', metrics).toFixed(2)} unit="°" />
        <MetricCard label="Risk score" value={String(Math.round(latest?.riskScore ?? 0))} unit="/ 100" critical={(latest?.riskScore ?? 0) >= 75} />
      </section>
      <LiveChart metricKeys={['rain_index', 'soil_index', 'tilt_index']} title="Multi-sensor agreement · normalized severity" height={300} colors={['#22d3ee', '#14b8a6', '#f59e0b']} />
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 0.8fr) minmax(280px, 1.2fr)', gap: 16, marginBottom: 16 }}>
        <div style={{ background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: 8, padding: 20, display: 'flex', justifyContent: 'center' }}><Gauge value={latest?.riskScore ?? 0} min={0} max={100} label="Landslide risk" unit="score" thresholdWarning={55} thresholdCritical={75} size={170} /></div>
        <div style={{ background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: 8, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, color: '#e0e0e0' }}>Local safety controller</h3>
          <StatusRow label="Network" status={networkOnline ? 'ONLINE' : 'OFFLINE'} tone={networkOnline ? '#34d399' : '#f43f5e'} />
          <StatusRow label="Local controller" status="ACTIVE" tone="#22d3ee" />
          <StatusRow label="Siren" status={localAlarmActive ? 'ON' : 'STANDBY'} tone={localAlarmActive ? '#f43f5e' : '#34d399'} />
          {!networkOnline && <p style={{ color: '#fbbf24', fontSize: 12, lineHeight: 1.5, margin: '18px 0 0' }}>Cloud link degraded. Edge protection remains active.</p>}
        </div>
      </section>
    </Dashboard>
  );
};

const MetricCard: React.FC<{ label: string; value: string; unit: string; critical?: boolean }> = ({ label, value, unit, critical }) => <div style={{ background: '#1a1a1a', border: `1px solid ${critical ? '#f43f5e' : '#2d2d2d'}`, borderRadius: 8, padding: 16 }}><div style={{ color: '#9ca3af', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div><strong style={{ display: 'block', color: critical ? '#f43f5e' : '#22d3ee', fontSize: 25, marginTop: 8 }}>{value}<small style={{ color: '#9ca3af', fontSize: 12, marginLeft: 5 }}>{unit}</small></strong></div>;
const StatusRow: React.FC<{ label: string; status: string; tone: string }> = ({ label, status, tone }) => <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2d2d2d', padding: '12px 0', fontSize: 13 }}><span style={{ color: '#9ca3af' }}>{label}</span><strong style={{ color: tone }}>{status}</strong></div>;
