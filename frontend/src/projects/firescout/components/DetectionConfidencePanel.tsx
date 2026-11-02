import type { TelemetryPoint } from '../../../core/types';
import { useTelemetryStore } from '../../../core/store';
import { LiveChart } from '../../../core/components/Charts';
import { displayValue } from '../../../core/utils/telemetryPresentation';
export function DetectionConfidencePanel({ latest, stale, threshold }: { latest: TelemetryPoint | null; stale: boolean; threshold: number }) {
  const history = useTelemetryStore(s => s.telemetry);
  const recorded = [...history].reverse().find(p => p.mission?.detection_track_id)?.mission?.detection_track_id;
  const track = latest?.mission?.detection_track_id ?? recorded;

  return <div>
    <p className="fs-source">SIMULATED · unverified model confidence score (uncalibrated)</p>
    <p>Track: <strong>{track ?? 'None / no usable detection'}</strong> · {latest?.mission?.detection_track_id ? `type: ${latest.mission.detection_type}` : 'no current usable observation; historical track only'}<br />
      Confidence: <strong>{displayValue(latest?.metrics.detection_confidence_pct)}%</strong>{stale && ' · LAST KNOWN / STALE'}</p>
    <small>This score is not a calibrated probability of a victim. Each mission has one selected candidate track. Missing observations break the series.</small>
    {track ? <LiveChart theme="light" metricKeys={['detection_confidence_pct']}
      labels={{ detection_confidence_pct: `${track} · model confidence` }}
      domain={[0, 100]} unit="%" timeUnit="seconds" sessionTime windowSeconds={120} height={240}
      reference={{ value: threshold, label: `${threshold}% · demo setting` }} /> : <p className="fdb-empty">No selected candidate observation. Confidence is absent, not zero.</p>}
  </div>;
}
