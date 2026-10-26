import { SimulationDashboard, displayValue } from '../../core/components/SimulationDashboard';
import { Gauge } from '../../core/components';
import { factsafeConfig } from './config';

const metric = (key: string) => factsafeConfig.metrics.find((item) => item.key === key)!;

export function FactSafeDashboard() {
  return <SimulationDashboard config={factsafeConfig} primary={[
    { metric: metric('nh3_ppm'), kind: 'raw sensor', thresholdDirection: 'high' },
    { metric: metric('pm25_ug_m3'), kind: 'raw sensor', thresholdDirection: 'high' },
    { metric: metric('risk_score'), kind: 'derived score', axisLabel: 'Risk score (0–100)' },
  ]} insight={({ latest, state }) => <>
    {!latest ? <p>Waiting for simulated factory telemetry. No factory safety assessment is available.</p>
      : <p>Demo status: <strong>{latest.status}</strong>. {state?.scenario === 'gas_leak' ? 'NH3 rises first in Zone B; dust remains near baseline.'
        : state?.scenario === 'dust_event' ? 'Particulates rise in Zone D; gases remain near baseline.' : 'Synthetic factory baseline; no event is expected.'}
        {state?.phase === 'recovery' && ' Simulated isolation/ventilation is followed by recovery monitoring; no equipment was actuated.'}</p>}
    <p><small>DEMO-DEFAULT: score = min(100, gain × max(NH3 / NH3 critical, PM2.5 / PM2.5 critical)); gain {state?.riskModel?.gain ?? 80}. Overall is the maximum zone score. Unified risk is a derived 0–100 demo score, not a certified dose or calibrated safety assessment. Thresholds require EHS approval before real use.</small></p>
  </>} details={({ latest }) => <>
    <dl>{factsafeConfig.metrics.filter((item) => !['nh3_ppm','pm25_ug_m3','risk_score'].includes(item.key)).map((item) =>
      <div className="fdb-diagnostic" key={item.key}><dt>{item.name}</dt><dd>{displayValue(latest?.metrics[item.key], item.precision)} {item.unit}</dd></div>)}
      <div className="fdb-diagnostic"><dt>Sensor health</dt><dd>Unavailable · synthetic data</dd></div>
      {['a','b','c','d'].map((zone) => <div className="fdb-diagnostic" key={zone}><dt>Zone {zone.toUpperCase()} risk</dt><dd>{displayValue(latest?.metrics[`zone_${zone}_risk`])} demo score</dd></div>)}
      {['nh3','co','h2s','ch4'].map((gas) => <div className="fdb-diagnostic" key={gas}><dt>{gas.toUpperCase()} normalized severity (demo)</dt><dd>{displayValue(latest?.metrics[`${gas}_severity`],2)}</dd></div>)}
    </dl>
    {latest && <Gauge value={latest.riskScore} min={0} max={100} theme="light" label="Unified zone risk (demo)" unit="score" thresholdWarning={55} thresholdCritical={75} />}
  </>} />;
}
