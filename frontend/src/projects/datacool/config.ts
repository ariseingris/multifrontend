import { ProjectConfig } from '../../core/types';

export const datacoolConfig: ProjectConfig = {
  id: 'datacool',
  name: 'DataCool',
  description: 'Rack-level thermal intelligence for data center operations',
  theme: { primary: '#38bdf8', secondary: '#6366f1', warning: '#f59e0b', critical: '#ef4444', recovered: '#34d399' },
  metrics: [
    { key: 'pue', name: 'PUE', unit: '', min: 1, max: 2, normalMin: 1.4, normalMax: 1.65, precision: 2 },
    { key: 'it_power_kw', name: 'IT power', unit: 'kW', min: 0, max: 1500, normalMin: 700, normalMax: 1100, precision: 0 },
    { key: 'total_power_kw', name: 'Facility power', unit: 'kW', min: 0, max: 2000, normalMin: 1000, normalMax: 1800, precision: 0 },
    { key: 'energy_kwh', name: 'Energy', unit: 'kWh', min: 0, max: 100000, normalMin: 0, normalMax: 100000, precision: 0 },
    { key: 'carbon_kg', name: 'Carbon', unit: 'kg', min: 0, max: 100000, normalMin: 0, normalMax: 100000, precision: 0 },
  ],
  thresholds: { pue: { warning: 1.6, critical: 1.75 } },
  scenarios: [
    { id: 'normal', name: 'Normal Rack Load', duration: 120, steps: [{ name: 'Balanced cooling', phase: 'normal', startAt: 0, endAt: 120, metrics: {} }] },
    { id: 'hotspot', name: 'Rack Hotspot · Zone B', description: 'Localized thermal hotspot forms across a few racks', duration: 120, steps: [{ name: 'Hotspot formation', phase: 'warning', startAt: 0, endAt: 120, metrics: {} }] },
    { id: 'cooling_imbalance', name: 'Cooling Imbalance', description: 'Right side racks run warmer than the left side', duration: 120, steps: [{ name: 'Airflow imbalance', phase: 'warning', startAt: 0, endAt: 120, metrics: {} }] },
  ],
  devices: [{ id: 'datacool-cluster', name: 'Data center cluster', type: 'Rack thermal fabric', status: 'online', location: 'Primary facility' }],
  aiEngine: true,
  defaultScenario: 'normal',
  defaultSpeed: 1,
};
