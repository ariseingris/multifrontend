import { ProjectConfig } from '../../core/types';

export const pamConfig: ProjectConfig = {
  id: 'pam',
  name: 'PAM Safety Device',
  description: 'Minimal physical alarm simulation for particulate and gas hazards',
  theme: { primary: '#22c55e', secondary: '#f59e0b', warning: '#f59e0b', critical: '#ef4444', recovered: '#34d399' },
  metrics: [
    { key: 'pm25_ug_m3', name: 'PM2.5', unit: 'µg/m³', min: 0, max: 150, normalMin: 0, normalMax: 35, warningMin: 35, warningMax: 75, criticalMin: 75, criticalMax: 150, precision: 1 },
    { key: 'gas_index', name: 'Gas index', unit: '', min: 0, max: 120, normalMin: 0, normalMax: 50, warningMin: 50, warningMax: 80, criticalMin: 80, criticalMax: 120, precision: 0 },
  ],
  thresholds: { pm25_ug_m3: { warning: 35, critical: 75 }, gas_index: { warning: 50, critical: 80 } },
  scenarios: [
    { id: 'normal', name: 'Safe Air', duration: 90, steps: [{ name: 'Green state', phase: 'normal', startAt: 0, endAt: 90, metrics: {} }] },
    { id: 'gas_leak', name: 'Gas Leak', description: 'Local device turns red and buzzer stays active until acknowledgement', duration: 120, steps: [{ name: 'Physical alarm', phase: 'critical', startAt: 0, endAt: 120, metrics: {} }] },
  ],
  devices: [{ id: 'pam-unit-01', name: 'PAM Unit 01', type: 'Physical alarm device', status: 'online', location: 'Workshop entrance' }],
  aiEngine: false,
  defaultScenario: 'normal',
  defaultSpeed: 1,
};
