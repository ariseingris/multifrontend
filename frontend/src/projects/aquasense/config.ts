import { ProjectConfig } from '../../core/types';

export const aquasenseConfig: ProjectConfig = {
  id: 'aquasense',
  name: 'AquaSense',
  description: 'Pond health intelligence with biological rhythm monitoring',
  theme: { primary: '#06b6d4', secondary: '#22c55e', warning: '#f59e0b', critical: '#ef4444', recovered: '#34d399' },
  metrics: [
    { key: 'do_mg_l', name: 'Dissolved oxygen', unit: 'mg/L', min: 0, max: 10, normalMin: 4.5, normalMax: 7.5, warningMin: 4, warningMax: 8, criticalMin: 2.5, criticalMax: 10, precision: 2 },
    { key: 'ph', name: 'pH', unit: '', min: 5, max: 10, normalMin: 7, normalMax: 8.8, precision: 2 },
    { key: 'orp_mv', name: 'ORP', unit: 'mV', min: 0, max: 350, normalMin: 150, normalMax: 300, precision: 0 },
    { key: 'salinity_ppt', name: 'Salinity', unit: 'ppt', min: 0, max: 40, normalMin: 10, normalMax: 20, precision: 2 },
    { key: 'water_temperature_c', name: 'Water temperature', unit: '°C', min: 15, max: 40, normalMin: 24, normalMax: 32, precision: 1 },
  ],
  thresholds: { do_mg_l: { warning: 4.5, critical: 3.5 }, ph: { warning: 7, critical: 6.5 }, orp_mv: { warning: 150, critical: 100 }, salinity_ppt: { warning: 10, critical: 5 }, water_temperature_c: { warning: 32, critical: 35 } },
  scenarios: [
    { id: 'normal', name: 'Normal Day Cycle', duration: 120, steps: [{ name: 'Biological rhythm', phase: 'normal', startAt: 0, endAt: 120, metrics: {} }] },
    { id: 'low_oxygen', name: 'Dawn Oxygen Drop', description: 'DO dips near dawn, then recovers after aerator action', duration: 120, steps: [{ name: 'Dawn depletion', phase: 'warning', startAt: 0, endAt: 120, metrics: {} }] },
    { id: 'sensor_fouling', name: 'Sensor Fouling', description: 'DO signal becomes unstable while water remains steady', duration: 120, steps: [{ name: 'Maintenance signal', phase: 'warning', startAt: 0, endAt: 120, metrics: {} }] },
  ],
  devices: [{ id: 'aquasense-pond-a', name: 'Pond A node', type: 'Water quality node', status: 'online', location: 'Pond A' }],
  aiEngine: true,
  defaultScenario: 'normal',
  defaultSpeed: 1,
};
