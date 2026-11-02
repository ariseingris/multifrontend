import type { TelemetryPoint } from '../../../core/types';
import { LiveChart } from '../../../core/components/Charts';
import { displayValue } from '../../../core/utils/telemetryPresentation';

export function WindDirectionPanel({ latest, stale }: { latest: TelemetryPoint | null; stale: boolean }) {
  const direction = latest?.metrics.wind_direction_deg;
  const speed = latest?.metrics.wind_speed_m_s;
  return <div>
    <p className="fs-source">SIMULATED wind · {stale ? 'last known / stale' : 'synthetic environmental state'}</p>
    {direction === undefined || speed === undefined ? <p className="fdb-empty">No wind telemetry.</p> : <div className="fs-wind-readout">
      <svg viewBox="0 0 200 200" width="180" height="180" role="img" aria-label={`Wind FROM ${direction.toFixed(0)} degrees at ${speed.toFixed(1)} metres per second`}>
        <circle cx="100" cy="100" r="72" fill="#eef5fa" stroke="#a5becf" />
        <path d="M100 30V170M30 100H170" stroke="#c5d7e3" />
        <text x="100" y="18" textAnchor="middle">N · 0°</text><text x="184" y="105" textAnchor="middle">E</text>
        <text x="100" y="194" textAnchor="middle">S · 180°</text><text x="14" y="105" textAnchor="middle">W</text>
        <g transform={`rotate(${direction} 100 100)`}><path d="M100 40L89 63H96V145H104V63H111Z" fill="#2878ad" /></g>
        <circle cx="100" cy="100" r="5" fill="#174e7b" />
      </svg>
      <p><strong>{displayValue(direction, 0)}° FROM</strong><br /><strong>{displayValue(speed)} m/s</strong></p>
    </div>}
    <small>Arrow points toward the source of wind: meteorological FROM, clockwise from North (90° = East). Air travels in the opposite direction.</small>
    {latest && <LiveChart theme="light" metricKeys={['wind_speed_m_s']} labels={{ wind_speed_m_s: 'Simulated wind speed' }} unit="m/s" domain={[0, 10]} timeUnit="seconds" sessionTime windowSeconds={120} height={180} showLegend={false} />}
  </div>;
}
