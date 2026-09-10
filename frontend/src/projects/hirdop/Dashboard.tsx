import React, { useEffect, useState } from 'react';
import { Dashboard, Gauge, LiveChart } from '../../core/components';
import { hirdopConfig } from './config';
import { useDataBridge } from '../../core/hooks/useDataBridge';
import { useScenarioStore, useSystemStore, useTelemetryStore, useTimelineStore } from '../../core/store';
import { TimelineEvent } from '../../core/types';

const read = (key: string, metrics?: Record<string, number>) => metrics?.[key] ?? 0;

export const HirdopDashboard: React.FC = () => {
  const latest = useTelemetryStore((state) => state.getLatest());
  const scenario = useScenarioStore((state) => state.scenario);
  const setPhase = useScenarioStore((state) => state.setPhase);
  const advanceElapsed = useScenarioStore((state) => state.advanceElapsed);
  const addEvent = useTimelineStore((state) => state.addEvent);
  const setStatus = useSystemStore((state) => state.setStatus);
  const [alarmAcknowledged, setAlarmAcknowledged] = useState(false);
  const { send } = useDataBridge(import.meta.env.VITE_WS_URL || 'ws://localhost:8765');

  useEffect(() => {
    if (scenario.status !== 'running') return;
    const interval = setInterval(() => advanceElapsed(0.1 * scenario.speed), 100);
    return () => clearInterval(interval);
  }, [scenario.status, scenario.speed, advanceElapsed]);

  useEffect(() => {
    if (!latest) return;
    setStatus({ online: true, dataStreamActive: true, sensorCount: 1, edgeAiActive: true, localAlarmActive: latest.status !== 'normal' });
    setPhase(latest.status === 'critical' ? 'critical' : latest.status === 'warning' ? 'warning' : 'normal');
  }, [latest, setPhase, setStatus]);

  const metrics = latest?.metrics;
  const floodRisk = read('water_level_m', metrics) >= 1.5;
  const turbineRisk = read('vibration_mm_s', metrics) >= 5;

  return (
    <Dashboard projectConfig={hirdopConfig}
      onScenarioStart={(scenarioId, speed) => {
        const selected = hirdopConfig.scenarios.find((item) => item.id === scenarioId);
        if (!selected) return;
        setAlarmAcknowledged(false);
        send({ type: 'start_scenario', project: 'hirdop', scenario: scenarioId, speed });
        setPhase('normal');
        const event: TimelineEvent = { timestamp: new Date().toISOString(), type: 'system_normal', message: `Scenario started: ${selected.name}`, severity: 'info', icon: '▶' };
        addEvent(event);
      }}
      onSpeedChange={(speed) => send({ type: 'set_speed', speed })}
      onScenarioPause={() => send({ type: 'pause' })}
      onScenarioResume={() => send({ type: 'resume' })}
      onScenarioReset={() => { setAlarmAcknowledged(false); send({ type: 'reset' }); }}
    >
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(170px, 1fr))', gap: 12, marginBottom: 16 }}>
        <MetricCard label="Power output" value={read('power_kw', metrics).toFixed(2)} unit="kW" />
        <MetricCard label="Voltage" value={read('voltage_v', metrics).toFixed(1)} unit="V" critical={read('voltage_v', metrics) < 215} />
        <MetricCard label="Energy generated" value={read('energy_kwh', metrics).toFixed(2)} unit="kWh" />
        <MetricCard label="Diesel saving" value={read('diesel_saving_usd', metrics).toFixed(2)} unit="USD" />
      </section>

      <LiveChart metricKeys={['power_kw']} title="Clean power generation" height={280} colors={['#22c55e']} />

      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(250px, .8fr)', gap: 16, marginBottom: 16 }}>
        <LiveChart metricKeys={['water_level_m', 'vibration_mm_s']} title="Infrastructure signals · demo reference units" height={260} colors={['#0ea5e9', '#f59e0b']} />
        <div style={{ background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: 8, padding: 18 }}><h3 style={{ color: '#e0e0e0', fontSize: 14, margin: '0 0 14px' }}>Local edge protection</h3><StatusRow label="Flood risk" status={floodRisk ? 'HIGH' : 'NORMAL'} tone={floodRisk ? '#ef4444' : '#34d399'} /><StatusRow label="Turbine health" status={turbineRisk ? 'CHECK REQUIRED' : 'STABLE'} tone={turbineRisk ? '#f59e0b' : '#34d399'} /><StatusRow label="Broadband dependency" status="NONE" tone="#22c55e" />{(floodRisk || turbineRisk) && !alarmAcknowledged && <button onClick={() => { setAlarmAcknowledged(true); addEvent({ timestamp: new Date().toISOString(), type: 'operator_acknowledged', message: 'Local Hirdop alarm acknowledged', severity: 'success', icon: '✓' }); }} style={{ marginTop: 16, background: '#0ea5e9', color: '#fff', border: 0, borderRadius: 4, padding: '9px 12px' }}>Acknowledge local alarm</button>}</div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}><div style={{ background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: 8, padding: 18 }}><h3 style={{ color: '#e0e0e0', fontSize: 14, margin: '0 0 10px' }}>Hydro vs diesel · estimated demo comparison</h3><div style={{ display: 'flex', gap: 10, alignItems: 'end', height: 110 }}><Bar label="Hirdop" value={read('diesel_saving_usd', metrics) * .35} color="#22c55e" /><Bar label="Diesel" value={read('diesel_saving_usd', metrics) * 1.35} color="#71717a" /></div></div><div style={{ background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: 8, padding: 18, display: 'flex', justifyContent: 'center' }}><Gauge value={Math.max(0, Math.min(100, (read('water_level_m', metrics) - .8) * 110))} min={0} max={100} label="Flood risk" unit="score" thresholdWarning={45} thresholdCritical={75} size={140} /></div></section>
    </Dashboard>
  );
};

const MetricCard: React.FC<{ label: string; value: string; unit: string; critical?: boolean }> = ({ label, value, unit, critical }) => <div style={{ background: '#1a1a1a', border: `1px solid ${critical ? '#ef4444' : '#2d2d2d'}`, borderRadius: 8, padding: 15 }}><div style={{ color: '#9ca3af', fontSize: 11, textTransform: 'uppercase' }}>{label}</div><strong style={{ color: critical ? '#ef4444' : '#22c55e', fontSize: 24, display: 'block', marginTop: 8 }}>{value}<small style={{ color: '#9ca3af', fontSize: 11, marginLeft: 4 }}>{unit}</small></strong></div>;
const StatusRow: React.FC<{ label: string; status: string; tone: string }> = ({ label, status, tone }) => <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2d2d2d', padding: '10px 0', fontSize: 12 }}><span style={{ color: '#9ca3af' }}>{label}</span><strong style={{ color: tone }}>{status}</strong></div>;
const Bar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => <div style={{ flex: 1, textAlign: 'center', color: '#9ca3af', fontSize: 11 }}><div style={{ height: Math.max(8, Math.min(90, value)), background: color, borderRadius: '4px 4px 0 0', marginBottom: 6 }} />{label}</div>;
