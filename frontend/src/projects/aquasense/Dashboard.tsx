import { SimulationDashboard, displayValue } from '../../core/components/SimulationDashboard';
import { Gauge, LiveChart } from '../../core/components';
import { aquasenseConfig } from './config';
import { primaryMetrics, supportingMetrics } from './dashboardMetrics';

export function AquaSenseDashboard() {
  const [oxygen, temperature, ph] = primaryMetrics;
  return <SimulationDashboard config={aquasenseConfig} primary={[
    { metric: oxygen, kind: 'raw sensor', thresholdDirection: 'low', domain: [0, 10] },
    { metric: temperature, kind: 'raw sensor', domain: [26, 31] },
    { metric: ph, kind: 'raw sensor', axisLabel: 'pH', domain: [7.4, 8.5] },
  ]} insight={({ latest, state }) => <>
    {!latest ? <p>Waiting for simulated pond measurements. No environmental assessment is available.</p>
      : state?.scenario === 'sensor_fouling' ? <p>Raw probe signal is unverified. After degradation, the maintenance fault persists; reset starts a fresh simulated probe. Sensor fouling is separate from a confirmed pond oxygen emergency. Clean/calibrate the simulated probe; no real filtering or AI inference is implemented.</p>
      : <p>Demo oxygen status: <strong>{latest.status}</strong>. {state?.phase === 'recovery' ? 'Recovering after a simulated intervention; no aerator hardware was commanded.'
        : latest.status === 'critical' ? 'Review oxygen and simulated aeration options.' : latest.status === 'warning' ? 'Monitor the downward oxygen trend.' : 'Oxygen is above the demo warning threshold.'}</p>}
    <p><small>Plausible synthetic pond demo; not scientifically validated. The oxygen event runs once, followed by continuous monitoring. Demo thresholds: warning below 4.5 mg/L, critical below 3.5 mg/L, with recovery hysteresis. These are not verified biological safety limits.</small></p>
  </>} details={({ latest, state }) => <>
    <p>Pond A · {aquasenseConfig.devices[0].name}</p>
    <dl>{supportingMetrics.map((metric) => <div key={metric.key} className="fdb-diagnostic">
      <dt>{metric.name}</dt><dd>{displayValue(latest?.metrics[metric.key], metric.precision)} {metric.unit}</dd>
    </div>)}
      <div className="fdb-diagnostic"><dt>Sensor quality (simulated)</dt><dd>{displayValue(latest?.metrics.sensor_quality, 0)}%</dd></div>
      <div className="fdb-diagnostic"><dt>Signal stability (simulated)</dt><dd>{displayValue(latest?.metrics.signal_stability, 0)}%</dd></div>
    </dl>
    {state?.scenario === 'sensor_fouling' && <p>Simulation ground truth only: pond DO {displayValue(latest?.groundTruth?.pond_do_mg_l)} mg/L. This is not a sensor measurement or validated filter output.</p>}
    {latest && state?.scenario !== 'sensor_fouling' && <Gauge value={latest.riskScore} min={0} max={100}
      theme="light" label="Oxygen-derived risk (demo)" unit="score" thresholdWarning={50} thresholdCritical={75} />}
    {latest && supportingMetrics.map((metric) => <LiveChart key={metric.key} metricKeys={[metric.key]}
      labels={{ [metric.key]: metric.name }} title={`${metric.name} · ${metric.unit}`} unit={metric.unit}
      timeUnit="minutes" sessionTime windowSeconds={aquasenseConfig.chartWindowSeconds} theme="light" showLegend={false} height={140} />)}
  </>} />;
}
