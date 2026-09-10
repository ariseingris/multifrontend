import { ProjectConfig } from '../../core/types';

export const pulseguardConfig: ProjectConfig = {
  id: 'pulseguard',
  name: 'PulseGuard',
  description: 'Landslide early warning with resilient local protection',
  theme: { primary: '#22d3ee', secondary: '#14b8a6', warning: '#f59e0b', critical: '#f43f5e', recovered: '#34d399' },
  metrics: [
    { key: 'rain_mm_h', name: 'Rainfall', unit: 'mm/h', min: 0, max: 100, normalMin: 0, normalMax: 20, warningMin: 30, warningMax: 60, criticalMin: 60, criticalMax: 100, precision: 1 },
    { key: 'soil_moisture_percent', name: 'Soil moisture', unit: '%', min: 0, max: 100, normalMin: 0, normalMax: 60, warningMin: 70, warningMax: 85, criticalMin: 85, criticalMax: 100, precision: 1 },
    { key: 'tilt_deg', name: 'Tilt', unit: '°', min: 0, max: 8, normalMin: 0, normalMax: 1, warningMin: 2, warningMax: 4, criticalMin: 4, criticalMax: 8, precision: 2 },
    { key: 'risk_score', name: 'Risk score', unit: '%', min: 0, max: 100, normalMin: 0, normalMax: 55, warningMin: 55, warningMax: 75, criticalMin: 75, criticalMax: 100, precision: 0 },
  ],
  thresholds: { rain_mm_h: { warning: 30, critical: 60 }, soil_moisture_percent: { warning: 70, critical: 85 }, tilt_deg: { warning: 2, critical: 4 }, risk_score: { warning: 55, critical: 75 } },
  scenarios: [
    { id: 'normal', name: 'Normal Weather', duration: 60, steps: [{ name: 'Stable sensors', phase: 'normal', startAt: 0, endAt: 60, metrics: {} }] },
    { id: 'heavy_rain', name: 'Heavy Rain', description: 'Rain leads soil saturation with a visible delay', duration: 90, steps: [{ name: 'Rain front', phase: 'early_signal', startAt: 0, endAt: 90, metrics: {} }] },
    { id: 'landslide', name: 'Landslide Risk', description: 'Multi-sensor agreement triggers local protection', duration: 100, steps: [{ name: 'Escalation', phase: 'critical', startAt: 0, endAt: 100, metrics: {} }] },
    { id: 'communication_loss', name: 'Communication Loss', description: 'Network fails while local protection continues', duration: 100, steps: [{ name: 'Offline protection', phase: 'alert', startAt: 0, endAt: 100, metrics: {} }] },
  ],
  devices: [{ id: 'pulseguard-node-01', name: 'Ridge Node 01', type: 'Landslide sensor', status: 'online', location: 'Northern ridge', battery: 92, signal: 78 }],
  aiEngine: true,
  defaultScenario: 'normal',
  defaultSpeed: 1,
};
