import React, { useEffect } from 'react';
import { Dashboard, Gauge, LiveChart } from '../../core/components';
import { factsafeConfig } from './config';
import { useDataBridge } from '../../core/hooks/useDataBridge';
import { useScenarioStore, useSystemStore, useTelemetryStore, useTimelineStore } from '../../core/store';
import { TimelineEvent } from '../../core/types';

const metric = (key: string, metrics?: Record<string, number>) => metrics?.[key] ?? 0;
const zoneTone = (risk: number) => risk >= 75 ? '#ef4444' : risk >= 55 ? '#f59e0b' : '#22c55e';

export const FactSafeDashboard: React.FC = () => {
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
    setStatus({ online: true, dataStreamActive: true, sensorCount: factsafeConfig.devices.length });
    setPhase(latest.status === 'critical' ? 'critical' : latest.status === 'warning' ? 'warning' : 'normal');
  }, [latest, setPhase, setStatus]);

  const metrics = latest?.metrics;
  const zoneRisks = [
    { id: 'A', risk: metric('zone_a_risk', metrics) },
    { id: 'B', risk: metric('zone_b_risk', metrics) },
    { id: 'C', risk: metric('zone_c_risk', metrics) },
    { id: 'D', risk: metric('zone_d_risk', metrics) },
  ];

  return (
    <Dashboard projectConfig={factsafeConfig}
      onScenarioStart={(scenarioId, speed) => {
        const selected = factsafeConfig.scenarios.find((item) => item.id === scenarioId);
        if (!selected) return;
        send({ type: 'start_scenario', project: 'factsafe', scenario: scenarioId, speed });
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
        <MetricCard label="Overall risk" value={String(Math.round(latest?.riskScore ?? 0))} unit="/ 100" critical={(latest?.riskScore ?? 0) >= 75} />
        <MetricCard label="Active alerts" value={String(zoneRisks.filter((zone) => zone.risk >= 55).length)} unit="zones" />
        <MetricCard label="Highest-risk zone" value={zoneRisks.reduce((highest, zone) => zone.risk > highest.risk ? zone : highest, zoneRisks[0]).id} unit="" />
        <MetricCard label="Sensor health" value="100" unit="%" />
      </section>

      <LiveChart metricKeys={['nh3_severity', 'co_severity', 'h2s_severity', 'ch4_severity']} title="Gas severity · normalized to DEMO-DEFAULT thresholds" height={290} colors={['#f97316', '#eab308', '#ef4444', '#a855f7']} />

      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(220px, 0.8fr)', gap: 16, marginBottom: 16 }}>
        <LiveChart metricKeys={['pm25_ug_m3', 'pm10_ug_m3']} title="Dust concentration · latest sample" chartType="bar" height={250} colors={['#f59e0b', '#fb923c']} latestOnly />
        <div style={{ background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: 8, padding: 20, display: 'flex', justifyContent: 'center' }}><Gauge value={latest?.riskScore ?? 0} min={0} max={100} label="Unified risk" unit="score" thresholdWarning={55} thresholdCritical={75} size={160} /></div>
      </section>

      <section style={{ background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: 8, padding: 20, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 16px', color: '#e0e0e0', fontSize: 14 }}>Factory zone risk</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {zoneRisks.map((zone) => <div key={zone.id} style={{ minHeight: 92, border: `1px solid ${zoneTone(zone.risk)}66`, background: `${zoneTone(zone.risk)}18`, borderRadius: 6, padding: 12 }}><strong style={{ color: '#e0e0e0' }}>ZONE {zone.id}</strong><div style={{ color: zoneTone(zone.risk), fontSize: 24, fontWeight: 700, marginTop: 12 }}>{Math.round(zone.risk)}</div><small style={{ color: '#9ca3af' }}>risk score</small></div>)}
        </div>
      </section>
    </Dashboard>
  );
};

const MetricCard: React.FC<{ label: string; value: string; unit: string; critical?: boolean }> = ({ label, value, unit, critical }) => <div style={{ background: '#1a1a1a', border: `1px solid ${critical ? '#ef4444' : '#2d2d2d'}`, borderRadius: 8, padding: 16 }}><div style={{ color: '#9ca3af', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</div><strong style={{ display: 'block', color: critical ? '#ef4444' : '#f97316', fontSize: 25, marginTop: 8 }}>{value}<small style={{ color: '#9ca3af', fontSize: 12, marginLeft: 5 }}>{unit}</small></strong></div>;
