import type { TelemetryPoint } from '../../../core/types';
import { LiveChart } from '../../../core/components/Charts';
import { displayValue } from '../../../core/utils/telemetryPresentation';
export function ThermalHotspotPanel({ latest, stale }: { latest: TelemetryPoint | null; stale: boolean }) {
  return <div>
    <p className="fs-source">SIMULATED temperature · {latest?.mission?.hotspot_id ?? 'No selected ROI'}</p>
    <p>Current estimate: <strong>{displayValue(latest?.metrics.hotspot_temp_c)} °C</strong>{stale && ' · LAST KNOWN / STALE'}</p>
    {latest?.quality?.hotspot_temp_c === 'missing' && <p role="status">Thermal observation unavailable. No temperature invented for the missing frame.</p>}
    <p><small>Temperature time-series only. No live camera or radiometric thermal image is connected. A high estimate does not confirm fire or a victim.</small></p>
    {latest ? <LiveChart theme="light" metricKeys={['hotspot_temp_c', 'background_temp_c']}
      labels={{ hotspot_temp_c: 'Simulated ROI estimate', background_temp_c: 'Simulated background' }}
      domain={[0, 140]} timeUnit="seconds" sessionTime windowSeconds={120} unit="°C" height={240} /> : <p className="fdb-empty">No thermal observations.</p>}
  </div>;
}
