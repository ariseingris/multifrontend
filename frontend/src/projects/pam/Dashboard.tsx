import React, { useEffect, useState } from 'react';
import { Dashboard } from '../../core/components';
import { pamConfig } from './config';
import { useDataBridge } from '../../core/hooks/useDataBridge';
import { useScenarioStore, useSystemStore, useTelemetryStore, useTimelineStore } from '../../core/store';
import { TimelineEvent } from '../../core/types';

const read = (key: string, metrics?: Record<string, number>) => metrics?.[key] ?? 0;
const ledState = (pm25: number, gas: number) => pm25 >= 75 || gas >= 80 ? 'RED' : pm25 >= 35 || gas >= 50 ? 'YELLOW' : 'GREEN';
const ledColor = { GREEN: '#22c55e', YELLOW: '#f59e0b', RED: '#ef4444' } as const;

export const PamDashboard: React.FC = () => {
  const latest = useTelemetryStore((state) => state.getLatest());
  const scenario = useScenarioStore((state) => state.scenario);
  const setPhase = useScenarioStore((state) => state.setPhase);
  const advanceElapsed = useScenarioStore((state) => state.advanceElapsed);
  const addEvent = useTimelineStore((state) => state.addEvent);
  const setStatus = useSystemStore((state) => state.setStatus);
  const [acknowledged, setAcknowledged] = useState(false);
  const { send } = useDataBridge(import.meta.env.VITE_WS_URL || 'ws://localhost:8765');

  useEffect(() => {
    if (scenario.status !== 'running') return;
    const interval = setInterval(() => advanceElapsed(0.1 * scenario.speed), 100);
    return () => clearInterval(interval);
  }, [scenario.status, scenario.speed, advanceElapsed]);

  useEffect(() => {
    if (!latest) return;
    const state = ledState(read('pm25_ug_m3', latest.metrics), read('gas_index', latest.metrics));
    const alarmActive = state === 'RED' && !acknowledged;
    setStatus({ online: true, dataStreamActive: true, sensorCount: 1, localAlarmActive: alarmActive });
    setPhase(state === 'RED' ? 'critical' : state === 'YELLOW' ? 'warning' : 'normal');
  }, [latest, acknowledged, setPhase, setStatus]);

  const pm25 = read('pm25_ug_m3', latest?.metrics);
  const gas = read('gas_index', latest?.metrics);
  const state = ledState(pm25, gas);
  const alarmActive = state === 'RED' && !acknowledged;

  const acknowledge = () => {
    setAcknowledged(true);
    send({ type: 'acknowledge_alarm' });
    addEvent({ timestamp: new Date().toISOString(), type: 'operator_acknowledged', message: 'PAM physical alarm acknowledged', severity: 'success', icon: '✓' });
  };

  return (
    <Dashboard projectConfig={pamConfig}
      onScenarioStart={(scenarioId, speed) => {
        const selected = pamConfig.scenarios.find((item) => item.id === scenarioId);
        if (!selected) return;
        setAcknowledged(false);
        send({ type: 'start_scenario', project: 'pam', scenario: scenarioId, speed });
        setPhase('normal');
        const event: TimelineEvent = { timestamp: new Date().toISOString(), type: 'system_normal', message: `Scenario started: ${selected.name}`, severity: 'info', icon: '▶' };
        addEvent(event);
      }}
      onSpeedChange={(speed) => send({ type: 'set_speed', speed })}
      onScenarioPause={() => send({ type: 'pause' })}
      onScenarioResume={() => send({ type: 'resume' })}
      onScenarioReset={() => { setAcknowledged(false); send({ type: 'reset' }); }}
    >
      <main style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', padding: '12px 0 30px' }}>
        <section style={{ background: '#1a1a1a', border: `1px solid ${ledColor[state]}66`, borderRadius: 12, padding: '34px 24px 28px', marginBottom: 16 }}>
          <div style={{ width: 210, height: 210, margin: '0 auto 22px', borderRadius: '50%', background: `${ledColor[state]}18`, border: `8px solid ${ledColor[state]}`, boxShadow: alarmActive ? `0 0 35px ${ledColor[state]}, 0 0 90px ${ledColor[state]}66` : `0 0 22px ${ledColor[state]}55`, display: 'grid', placeItems: 'center', animation: alarmActive ? 'pamPulse .9s infinite' : 'none' }}><div><div style={{ color: ledColor[state], fontWeight: 800, fontSize: 38 }}>{state}</div><div style={{ color: '#9ca3af', fontSize: 12 }}>STATUS LED</div></div></div>
          <h2 style={{ color: '#f8fafc', margin: '0 0 7px', fontSize: 22 }}>PAM physical safety device</h2>
          <p style={{ color: '#9ca3af', margin: 0, fontSize: 13 }}>Local device state · demo mapping only</p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}><Value label="PM2.5" value={pm25.toFixed(1)} unit="µg/m³" /><Value label="Gas index" value={String(Math.round(gas))} unit="" /></section>
        <section style={{ background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: 8, padding: 18, textAlign: 'left' }}><Row label="Buzzer" value={alarmActive ? 'ON' : 'OFF'} color={alarmActive ? '#ef4444' : '#34d399'} /><Row label="Alarm state" value={acknowledged && state === 'RED' ? 'ACKNOWLEDGED' : alarmActive ? 'ACTIVE' : 'STANDBY'} color={acknowledged && state === 'RED' ? '#f59e0b' : alarmActive ? '#ef4444' : '#34d399'} />{alarmActive && <button onClick={acknowledge} style={{ width: '100%', marginTop: 16, background: '#0ea5e9', color: '#fff', border: 0, borderRadius: 4, padding: 11, fontWeight: 700 }}>ACKNOWLEDGE ALARM</button>}</section>
        <style>{`@keyframes pamPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.035); } }`}</style>
      </main>
    </Dashboard>
  );
};

const Value: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => <div style={{ background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: 8, padding: 17, textAlign: 'left' }}><div style={{ color: '#9ca3af', fontSize: 11, textTransform: 'uppercase' }}>{label}</div><strong style={{ color: '#e0e0e0', fontSize: 25, display: 'block', marginTop: 7 }}>{value}<small style={{ color: '#9ca3af', fontSize: 11, marginLeft: 4 }}>{unit}</small></strong></div>;
const Row: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2d2d2d', padding: '11px 0', color: '#9ca3af', fontSize: 13 }}><span>{label}</span><strong style={{ color }}>{value}</strong></div>;
