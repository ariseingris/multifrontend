import { ProjectConfig } from '../../core/types';

export const hirdopConfig: ProjectConfig = {
  id: 'hirdop',
  name: 'Hirdop Power',
  description: 'Small hydro generation with local flood intelligence',
  theme: { primary: '#22c55e', secondary: '#0ea5e9', warning: '#f59e0b', critical: '#ef4444', recovered: '#34d399' },
  metrics: [
    { key: 'power_kw', name: 'Power output', unit: 'kW', min: 0, max: 15, normalMin: 7.5, normalMax: 10, precision: 2 },
    { key: 'voltage_v', name: 'Voltage', unit: 'V', min: 180, max: 260, normalMin: 225, normalMax: 235, precision: 1 },
    { key: 'energy_kwh', name: 'Energy generated', unit: 'kWh', min: 0, max: 1000, normalMin: 0, normalMax: 1000, precision: 2 },
    { key: 'water_level_m', name: 'Water level', unit: 'm', min: 0, max: 3, normalMin: 0.5, normalMax: 1.2, warningMin: 1.2, warningMax: 1.5, criticalMin: 1.5, criticalMax: 3, precision: 2 },
    { key: 'vibration_mm_s', name: 'Vibration', unit: 'mm/s', min: 0, max: 8, normalMin: 0, normalMax: 3, warningMin: 3, warningMax: 5, criticalMin: 5, criticalMax: 8, precision: 2 },
    { key: 'diesel_saving_usd', name: 'Estimated diesel saving', unit: 'USD', min: 0, max: 1000, normalMin: 0, normalMax: 1000, precision: 2 },
  ],
  thresholds: { water_level_m: { warning: 1.2, critical: 1.5 }, vibration_mm_s: { warning: 3, critical: 5 }, voltage_v: { warning: 215, critical: 205 } },
  scenarios: [
    { id: 'normal', name: 'Normal Generation', duration: 120, steps: [{ name: 'Stable hydro output', phase: 'normal', startAt: 0, endAt: 120, metrics: {} }] },
    { id: 'flood_warning', name: 'Flood Warning', description: 'Water rises first, vibration follows with delay', duration: 120, steps: [{ name: 'Rising water', phase: 'warning', startAt: 0, endAt: 120, metrics: {} }] },
    { id: 'turbine_anomaly', name: 'Turbine Anomaly', description: 'Vibration rises while water remains stable', duration: 120, steps: [{ name: 'Mechanical anomaly', phase: 'warning', startAt: 0, endAt: 120, metrics: {} }] },
  ],
  devices: [{ id: 'hirdop-main-unit', name: 'Main hydro unit', type: 'Hydro generator', status: 'online', location: 'River station' }],
  aiEngine: true,
  defaultScenario: 'normal',
  defaultSpeed: 1,
};
