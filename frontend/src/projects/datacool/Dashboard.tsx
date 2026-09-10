import React, { useEffect, useState } from 'react';
import { Dashboard, Gauge, LiveChart } from '../../core/components';
import { datacoolConfig } from './config';
import { useDataBridge } from '../../core/hooks/useDataBridge';
import { useScenarioStore, useSystemStore, useTelemetryStore, useTimelineStore } from '../../core/store';
import { TimelineEvent } from '../../core/types';

const value = (key: string, metrics?: Record<string, number>) => metrics?.[key] ?? 0;
const heatColor = (temperature: number) => temperature >= 27 ? '#ef4444' : temperature >= 25 ? '#f59e0b' : temperature >= 23 ? '#38bdf8' : '#2563eb';

export const DataCoolDashboard: React.FC = () => {
  const latest = useTelemetryStore((state) => state.getLatest());
  const scenario = useScenarioStore((state) => state.scenario);
  const setPhase = useScenarioStore((state) => state.setPhase);
  const advanceElapsed = useScenarioStore((state) => state.advanceElapsed);
  const addEvent = useTimelineStore((state) => state.addEvent);
  const setStatus = useSystemStore((state) => state.setStatus);
  const [recommendationState, setRecommendationState] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const { send } = useDataBridge(import.meta.env.VITE_WS_URL || 'ws://localhost:8765');

  useEffect(() => {
    if (scenario.status !== 'running') return;
    const interval = setInterval(() => advanceElapsed(0.1 * scenario.speed), 100);
    return () => clearInterval(interval);
  }, [scenario.status, scenario.speed, advanceElapsed]);

  useEffect(() => {
    if (!latest) return;
    setStatus({ online: true, dataStreamActive: true, sensorCount: 32 });
    setPhase(latest.status === 'critical' ? 'critical' : latest.status === 'warning' ? 'warning' : 'normal');
  }, [latest, setPhase, setStatus]);

  const metrics = latest?.metrics;
  const racks = Array.from({ length: 32 }, (_, index) => ({ id: `R-${String(index + 1).padStart(2, '0')}`, temperature: value(`rack_${index + 1}_temp`, metrics), load: value(`rack_${index + 1}_load`, metrics) }));
  const hotspot = racks.some((rack) => rack.temperature >= 27);
  const recommendationVisible = hotspot || latest?.scenario === 'cooling_imbalance';

  const decision = (next: 'approved' | 'rejected') => {
    setRecommendationState(next);
    send({ type: next === 'approved' ? 'approve_recommendation' : 'reject_recommendation' });
    addEvent({ timestamp: new Date().toISOString(), type: next === 'approved' ? 'action_approved' : 'action_rejected', message: `Cooling recommendation ${next}`, severity: next === 'approved' ? 'success' : 'info', icon: next === 'approved' ? '✓' : '×' });
  };

  return (
    <Dashboard projectConfig={datacoolConfig}
      onScenarioStart={(scenarioId, speed) => {
        const selected = datacoolConfig.scenarios.find((item) => item.id === scenarioId);
        if (!selected) return;
        setRecommendationState('pending');
        send({ type: 'start_scenario', project: 'datacool', scenario: scenarioId, speed });
        setPhase('normal');
        const event: TimelineEvent = { timestamp: new Date().toISOString(), type: 'system_normal', message: `Scenario started: ${selected.name}`, severity: 'info', icon: '▶' };
        addEvent(event);
      }}
      onSpeedChange={(speed) => send({ type: 'set_speed', speed })}
      onScenarioPause={() => send({ type: 'pause' })}
      onScenarioResume={() => send({ type: 'resume' })}
      onScenarioReset={() => { setRecommendationState('pending'); send({ type: 'reset' }); }}
    >
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(170px, 1fr))', gap: 12, marginBottom: 16 }}>
        <Card label="PUE" value={value('pue', metrics).toFixed(2)} unit="" critical={value('pue', metrics) >= 1.75} />
        <Card label="IT load" value={String(Math.round(value('it_power_kw', metrics)))} unit="kW" />
        <Card label="Energy" value={String(Math.round(value('energy_kwh', metrics)))} unit="kWh" />
        <Card label="Carbon" value={String(Math.round(value('carbon_kg', metrics)))} unit="kg" />
      </section>

      <section style={{ background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}><h3 style={{ margin: 0, color: '#e0e0e0', fontSize: 14 }}>Rack thermal map · 4 × 8</h3><span style={{ color: hotspot ? '#f59e0b' : '#34d399', fontSize: 12 }}>{hotspot ? 'HOTSPOT DETECTED' : 'THERMAL BALANCED'}</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(52px, 1fr))', gap: 7 }}>{racks.map((rack) => <div key={rack.id} title={`${rack.id}: ${rack.temperature.toFixed(1)}°C · load ${Math.round(rack.load)}%`} style={{ aspectRatio: '1.15', borderRadius: 4, background: heatColor(rack.temperature), border: '1px solid rgba(255,255,255,.15)', padding: 7, color: '#f8fafc', fontSize: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: rack.temperature >= 27 ? '0 0 0 2px #fecaca, 0 0 18px #ef444466' : 'none' }}><strong>{rack.id}</strong><span>{rack.temperature.toFixed(1)}°</span><small>{Math.round(rack.load)}% load</small></div>)}</div>
        <div style={{ display: 'flex', gap: 14, marginTop: 14, color: '#9ca3af', fontSize: 11 }}><span><i style={{ display: 'inline-block', width: 10, height: 10, background: '#2563eb', marginRight: 5 }} />cool</span><span><i style={{ display: 'inline-block', width: 10, height: 10, background: '#38bdf8', marginRight: 5 }} />normal</span><span><i style={{ display: 'inline-block', width: 10, height: 10, background: '#f59e0b', marginRight: 5 }} />warm</span><span><i style={{ display: 'inline-block', width: 10, height: 10, background: '#ef4444', marginRight: 5 }} />critical</span></div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(250px, .8fr)', gap: 16, marginBottom: 16 }}>
        <LiveChart metricKeys={['pue', 'rack_hotspot_temp']} title="Efficiency and hotspot trend" height={250} colors={['#38bdf8', '#ef4444']} />
        <div style={{ background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: 8, padding: 20, display: 'flex', justifyContent: 'center' }}><Gauge value={Math.max(0, Math.min(100, (value('pue', metrics) - 1.4) * 250))} min={0} max={100} label="Thermal risk" unit="score" thresholdWarning={50} thresholdCritical={75} size={150} /></div>
      </section>

      {recommendationVisible && <section style={{ background: '#1a1a1a', border: '1px solid #f59e0b66', borderRadius: 8, padding: 18, marginBottom: 16 }}><div style={{ color: '#fbbf24', fontSize: 11, fontWeight: 700 }}>AI DETECTED · LOCALIZED THERMAL IMBALANCE</div><h3 style={{ color: '#e0e0e0', fontSize: 16, margin: '10px 0' }}>Hotspot concentration in Rack Zone B</h3><p style={{ color: '#cbd5e1', fontSize: 13 }}>Recommendation: increase airflow to Zone B and reduce cooling oversupply in Zone A.</p><p style={{ color: '#9ca3af', fontSize: 12 }}>Expected: temperature −1.2°C · PUE {value('pue', metrics).toFixed(2)} → {(value('pue', metrics) - .06).toFixed(2)}</p><div style={{ display: 'flex', gap: 8 }}>{recommendationState === 'pending' ? <><button onClick={() => decision('approved')} style={{ background: '#22c55e', color: '#fff', border: 0, borderRadius: 4, padding: '9px 14px', fontWeight: 700 }}>APPROVE</button><button onClick={() => decision('rejected')} style={{ background: '#3f3f46', color: '#e4e4e7', border: '1px solid #52525b', borderRadius: 4, padding: '9px 14px' }}>REJECT</button></> : <strong style={{ color: recommendationState === 'approved' ? '#34d399' : '#f59e0b' }}>{recommendationState === 'approved' ? 'ACTION APPROVED' : 'RECOMMENDATION REJECTED'}</strong>}</div></section>}
    </Dashboard>
  );
};

const Card: React.FC<{ label: string; value: string; unit: string; critical?: boolean }> = ({ label, value: cardValue, unit, critical }) => <div style={{ background: '#1a1a1a', border: `1px solid ${critical ? '#ef4444' : '#2d2d2d'}`, borderRadius: 8, padding: 15 }}><div style={{ color: '#9ca3af', fontSize: 11, textTransform: 'uppercase' }}>{label}</div><strong style={{ display: 'block', color: critical ? '#ef4444' : '#38bdf8', fontSize: 24, marginTop: 8 }}>{cardValue}<small style={{ color: '#9ca3af', fontSize: 11, marginLeft: 4 }}>{unit}</small></strong></div>;
