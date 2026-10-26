import { SimulationDashboard, displayValue } from '../../core/components/SimulationDashboard';
import { formatElapsedTime } from '../../core/utils/formatting';
import { firescoutConfig } from './config';

const metric = (key: string) => firescoutConfig.metrics.find((item) => item.key === key)!;

export function FireScoutDashboard() {
  return <SimulationDashboard config={firescoutConfig} primary={[
    { metric: metric('detection_confidence'), kind: 'synthetic detection' },
    { metric: metric('hotspot_temp_c'), kind: 'thermal estimate', comparison: metric('background_temp_c'), comparisonRule: 'hotspotDeltaC' },
    { metric: metric('link_quality_percent'), kind: 'diagnostic' },
  ]} insight={({ latest, state, stale }) => <>
    <p><strong>Mission:</strong> {state?.missionStatus?.replace(/_/g, ' ') ?? 'Awaiting simulation'}</p>
    {stale && latest && <p><strong>STALE / NO SIGNAL</strong> — retained readings are last known values. The simulator state channel is synthetic and is not UAV sensor telemetry.</p>}
    {state?.candidateDetected ? <p><strong>SIMULATED CANDIDATE · needs operator confirmation.</strong> Inspect thermal/visible imagery in a real system. No person is confirmed or rescued by this demonstration.</p>
      : <p>No active candidate. No confirmed targets.</p>}
    {state?.hotspotDetected && <p>Persistent SIMULATED hotspot flagged with background-relative thresholds and hysteresis. Review imagery; this is not confirmation of fire or a victim.</p>}
    {state?.lastSeenSimSeconds != null && <p>Candidate last seen: Sim {formatElapsedTime(state.lastSeenSimSeconds)}.</p>}
    {latest?.quality?.hotspot_temp_c === 'missing' && <p>Thermal/visible frames unavailable. No temperature or confidence estimate is invented.</p>}
    <p><small>Confidence is synthetic output, not a calibrated probability. Persistent hotspot detection uses ΔT relative to background; no absolute temperature confirms a fire or victim. No video source or real AI model is connected.</small></p>
  </>} details={({ latest, state }) => <>
    <dl>
      <div className="fdb-diagnostic"><dt>Instantaneous simulated candidate count</dt><dd>{displayValue(latest?.metrics.detected_person_count,0)}</dd></div>
      <div className="fdb-diagnostic"><dt>Battery (simulated)</dt><dd>{displayValue(latest?.metrics.battery_percent)}%</dd></div>
      <div className="fdb-diagnostic"><dt>Flight elapsed (simulated)</dt><dd>{displayValue(latest?.metrics.flight_elapsed_s,0)} s</dd></div>
      <div className="fdb-diagnostic"><dt>Background estimate</dt><dd>{displayValue(latest?.metrics.background_temp_c)} °C</dd></div>
      <div className="fdb-diagnostic"><dt>Telemetry age (simulation time)</dt><dd>{state?.lastTelemetrySimSeconds != null ? displayValue(Math.max(0,state.elapsedSimSeconds-state.lastTelemetrySimSeconds)*1000,0) : '—'} ms</dd></div>
      <div className="fdb-diagnostic"><dt>Video source</dt><dd>None · synthetic frame availability only</dd></div>
      <div className="fdb-diagnostic"><dt>GPS quality</dt><dd>Unavailable</dd></div>
    </dl>
  </>} />;
}
