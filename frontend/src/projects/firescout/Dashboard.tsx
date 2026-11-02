import { useEffect, useState } from 'react';
import { Dashboard } from '../../core/components/Dashboard';
import { FigmaDashboardContent, type StatusMetric } from '../../core/components/FigmaDashboard';
import { EventTimeline } from '../../core/components/EventTimeline';
import { useDataBridge } from '../../core/hooks/useDataBridge';
import { useSimulationStore, useTelemetryStore, useTimelineStore } from '../../core/store';
import { displayValue } from '../../core/utils/telemetryPresentation';
import { formatElapsedTime } from '../../core/utils/formatting';
import { firescoutConfig } from './config';
import { GeoMissionPanel } from './components/GeoMissionPanel';
import { WindDirectionPanel } from './components/WindDirectionPanel';
import { ThermalHotspotPanel } from './components/ThermalHotspotPanel';
import { DetectionConfidencePanel } from './components/DetectionConfidencePanel';
import { FireScoutChatPanel } from './components/FireScoutChatPanel';
import { uavPosition } from './services/missionTelemetryAdapter';
import './firescout.css';

export function FireScoutDashboard() {
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8765';
  const { send, isConnected } = useDataBridge(wsUrl, 'firescout');
  const { state, receivedAt, serverProject, commandError } = useSimulationStore();
  const points = useTelemetryStore(s => s.telemetry);
  const acknowledged = useTimelineStore(s => s.events.some(event => event.type === 'operator_acknowledged'));
  const latest = points[points.length - 1] ?? null;
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const stale = !isConnected || (!!receivedAt && now - receivedAt > 3500) || state?.telemetryAvailable === false;
  const position = uavPosition(latest);
  const source = `SIMULATED · ${stale && latest ? 'STALE / LAST KNOWN' : state?.status ?? 'awaiting mission'}`;
  const metrics: StatusMetric[] = [
    { id: 'location', label: 'UAV location · WGS84', value: position ? `${position[0].toFixed(5)}°, ${position[1].toFixed(5)}°` : '—', status: source },
    { id: 'temperature', label: 'Highest observed ROI temperature', value: displayValue(state?.highestObservedHotspotC ?? undefined), unit: '°C', status: latest?.quality?.hotspot_temp_c === 'missing' ? 'SIMULATED · NO THERMAL FRAME' : source, tone: state?.hotspotDetected ? 'warning' : 'normal' },
    { id: 'confidence', label: 'Leading model confidence (uncalibrated)', value: displayValue(latest?.metrics.detection_confidence_pct), unit: '%', status: latest?.mission?.detection_track_id ? `${source} · ${latest.mission.detection_track_id}` : 'SIMULATED · no usable detection', tone: state?.candidateDetected ? 'warning' : 'normal' },
  ];
  const command = (type: string, extra: Record<string, unknown> = {}) => {
    if (!send({ type, project: 'firescout', ...extra })) useSimulationStore.getState().setCommandError('Simulator disconnected. Reconnect and retry.');
  };
  return <Dashboard projectConfig={firescoutConfig} variant="figma" authoritative hasSession={!!state} connected={isConnected} wsUrl={wsUrl}
    onScenarioStart={(scenario, speed) => command('start_scenario', { scenario, speed })}
    onScenarioPause={() => command('pause')} onScenarioResume={() => command('resume')}
    onScenarioReset={() => command('reset')} onSpeedChange={speed => command('set_speed', { speed })}>
    <div className="fs-dashboard"><FigmaDashboardContent metrics={metrics} charts={[
      { id: 'map', title: 'Geographic UAV mission', children: <GeoMissionPanel key={state?.sessionId ?? 'empty'} points={points} latest={latest} stale={stale} /> },
      { id: 'wind', title: 'Wind direction & speed', children: <WindDirectionPanel latest={latest} stale={stale} /> },
      { id: 'thermal', title: 'Thermal hotspot · °C', children: <ThermalHotspotPanel latest={latest} stale={stale} /> },
    ]} extraCharts={[
      { id: 'confidence', title: 'AI detection confidence · %', children: <DetectionConfidencePanel latest={latest} stale={stale} threshold={state?.rules?.candidateConfidence ?? 80} /> },
    ]} logs={<EventTimeline theme="light" limit={50} />} insight={<>
      <p><strong>{firescoutConfig.description}</strong></p>
      <p role="status">{!isConnected ? 'Simulator disconnected — no current telemetry.' : serverProject && serverProject !== 'firescout' ? `Simulator serving ${serverProject}. Run a FireScout scenario below.` : state ? `${source} · ${state.missionStatus?.replace(/_/g, ' ') ?? 'stopped'} · phase ${state.phase.replace(/_/g, ' ')}` : 'Choose and run a FireScout scenario below.'}</p>
      <p><strong>Scenario:</strong> {firescoutConfig.scenarios.find(s => s.id === state?.scenario)?.name ?? 'Not started'}<br />
        <strong>Simulation clock:</strong> {formatElapsedTime(state?.elapsedSimSeconds ?? 0)} · {state?.speed ?? 1}x · continuous after scripted scan<br />
        <strong>Active real runtime:</strong> {formatElapsedTime(state?.realElapsedSeconds ?? 0)} · plots show latest 120 simulated seconds</p>
      <p className="fs-chip">Link quality: {displayValue(latest?.metrics.uav_link_quality_pct)}% · synthetic demo index{stale && ' · LAST KNOWN'}</p>
      <p>Selected track: {latest?.mission?.detection_track_id ?? 'none'} · {latest?.mission?.detection_type ?? 'none'}. {state?.candidateDetected ? 'SIMULATED CANDIDATE · human review required.' : 'No candidate confirmed.'}<br />
        Last sample: {latest?.timestamp ?? 'none'} · Sim {displayValue(latest?.elapsedSimSeconds, 1)} s.</p>
      {stale && latest && <p className="fs-notice">STALE / NO SIGNAL: retained coordinates and observations are last known. No position is inferred across the telemetry gap.</p>}
      {state && state.status !== 'stopped' && <p><button disabled={acknowledged} onClick={() => command('acknowledge')}>{acknowledged ? 'Mission indicators acknowledged' : 'Acknowledge mission indicators'}</button></p>}
      {commandError && <p role="alert">{commandError}</p>}
      <FireScoutChatPanel key={state?.sessionId ?? 'empty'} sessionId={state?.sessionId} stopped={!state || state.status === 'stopped'} />
    </>} /></div>
  </Dashboard>;
}
