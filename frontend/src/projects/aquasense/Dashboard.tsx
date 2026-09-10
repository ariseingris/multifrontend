import React, { useEffect } from 'react';
import { Dashboard, Gauge, LiveChart, ThresholdChart } from '../../core/components';
import { aquasenseConfig } from './config';
import { useDataBridge } from '../../core/hooks/useDataBridge';
import { useScenarioStore, useSystemStore, useTelemetryStore, useTimelineStore } from '../../core/store';
import { TimelineEvent } from '../../core/types';

const read = (key: string, metrics?: Record<string, number>) => metrics?.[key] ?? 0;

export const AquaSenseDashboard: React.FC = () => {
  const latest = useTelemetryStore((state) => state.getLatest());
  const scenario = useScenarioStore((state) => state.scenario);
  const setPhase = useScenarioStore((state) => state.setPhase);
  const advanceElapsed = useScenarioStore((state) => state.advanceElapsed);
  const addEvent = useTimelineStore((state) => state.addEvent);
  const setStatus = useSystemStore((state) => state.setStatus);
  const { send } = useDataBridge(import.meta.env.VITE_WS_URL || 'ws://localhost:8765');

  useEffect(() => {
    if (scenario.status !== 'running') return;
    const interval = setInterval(() => advanceElapsed(0.1 * scenario.speed), 100);
    return () => clearInterval(interval);
  }, [scenario.status, scenario.speed, advanceElapsed]);

  useEffect(() => {
    if (!latest) return;
    setStatus({ online: true, dataStreamActive: true, sensorCount: aquasenseConfig.devices.length });
    setPhase(latest.status === 'critical' ? 'critical' : latest.status === 'warning' ? 'warning' : 'normal');
  }, [latest, setPhase, setStatus]);

  const metrics = latest?.metrics;
  return (
    <Dashboard projectConfig={aquasenseConfig}
      onScenarioStart={(scenarioId, speed) => {
        const selected = aquasenseConfig.scenarios.find((item) => item.id === scenarioId);
        if (!selected) return;
        send({ type: 'start_scenario', project: 'aquasense', scenario: scenarioId, speed });
        setPhase('normal');
        const event: TimelineEvent = { timestamp: new Date().toISOString(), type: 'system_normal', message: `Scenario started: ${selected.name}`, severity: 'info', icon: '▶' };
        addEvent(event);
      }}
      onSpeedChange={(speed) => send({ type: 'set_speed', speed })}
      onScenarioPause={() => send({ type: 'pause' })}
      onScenarioResume={() => send({ type: 'resume' })}
      onScenarioReset={() => send({ type: 'reset' })}
    >
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
        <Card label="DO" value={read('do_mg_l', metrics).toFixed(2)} unit="mg/L" critical={read('do_mg_l', metrics) < 3.5} />
        <Card label="pH" value={read('ph', metrics).toFixed(2)} unit="" />
        <Card label="ORP" value={String(Math.round(read('orp_mv', metrics)))} unit="mV" />
        <Card label="Salinity" value={read('salinity_ppt', metrics).toFixed(2)} unit="ppt" />
        <Card label="Water temp" value={read('water_temperature_c', metrics).toFixed(1)} unit="°C" />
      </section>
      <ThresholdChart metricKey="do_mg_l" title="Biological rhythm · dissolved oxygen" height={300} normalMin={4.5} normalMax={7.5} warningMin={4} warningMax={8} criticalMin={2.5} criticalMax={10} unit="mg/L" />
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.25fr) minmax(220px, .75fr)', gap: 16, marginBottom: 16 }}>
        <LiveChart metricKeys={['ph', 'orp_mv', 'salinity_ppt', 'water_temperature_c']} title="Water quality · supporting signals" height={260} colors={['#22c55e', '#a855f7', '#f59e0b', '#06b6d4']} />
        <div style={{ background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: 8, padding: 20, display: 'flex', justifyContent: 'center' }}><Gauge value={Math.max(0, Math.min(100, (7 - read('do_mg_l', metrics)) * 20))} min={0} max={100} label="Aquatic risk" unit="score" thresholdWarning={50} thresholdCritical={75} size={160} /></div>
      </section>
      <section style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
        <strong style={{ color: '#e0e0e0', fontSize: 13 }}>Pond</strong>
        {['Pond A', 'Pond B', 'Pond C'].map((pond) => <button key={pond} style={{ background: pond === 'Pond A' ? '#0891b2' : '#262626', border: '1px solid #404040', color: '#e0e0e0', borderRadius: 4, padding: '7px 12px' }}>{pond}</button>)}
        <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: 12 }}>Sensor quality: <strong style={{ color: read('sensor_quality', metrics) < 70 ? '#f59e0b' : '#34d399' }}>{Math.round(read('sensor_quality', metrics))}%</strong></span>
      </section>
    </Dashboard>
  );
};

const Card: React.FC<{ label: string; value: string; unit: string; critical?: boolean }> = ({ label, value, unit, critical }) => <div style={{ background: '#1a1a1a', border: `1px solid ${critical ? '#ef4444' : '#2d2d2d'}`, borderRadius: 8, padding: 13 }}><div style={{ color: '#9ca3af', fontSize: 11, textTransform: 'uppercase' }}>{label}</div><strong style={{ display: 'block', color: critical ? '#ef4444' : '#06b6d4', fontSize: 22, marginTop: 7 }}>{value}<small style={{ color: '#9ca3af', fontSize: 11, marginLeft: 4 }}>{unit}</small></strong></div>;
