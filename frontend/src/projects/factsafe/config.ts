import { ProjectConfig } from '../../core/types';

export const factsafeConfig: ProjectConfig = {
  id: 'factsafe',
  name: 'FactSafe',
  description: 'Factory safety command center for gas, dust and microclimate hazards',
  theme: { primary: '#f97316', secondary: '#eab308', warning: '#f59e0b', critical: '#ef4444', recovered: '#22c55e' },
  metrics: [
    { key: 'nh3_ppm', name: 'NH3', unit: 'ppm', min: 0, max: 80, normalMin: 0, normalMax: 30, warningMin: 0, warningMax: 30, criticalMin: 0, criticalMax: 50, precision: 1 },
    { key: 'co_ppm', name: 'CO', unit: 'ppm', min: 0, max: 120, normalMin: 0, normalMax: 35, warningMin: 0, warningMax: 35, criticalMin: 0, criticalMax: 70, precision: 1 },
    { key: 'h2s_ppm', name: 'H2S', unit: 'ppm', min: 0, max: 20, normalMin: 0, normalMax: 5, warningMin: 0, warningMax: 5, criticalMin: 0, criticalMax: 10, precision: 2 },
    { key: 'ch4_percent', name: 'CH4', unit: '%', min: 0, max: 10, normalMin: 0, normalMax: 5, warningMin: 0, warningMax: 5, criticalMin: 0, criticalMax: 8, precision: 2 },
    { key: 'pm25_ug_m3', name: 'PM2.5', unit: 'µg/m³', min: 0, max: 180, normalMin: 0, normalMax: 55, warningMin: 0, warningMax: 55, criticalMin: 0, criticalMax: 100, precision: 1 },
    { key: 'pm10_ug_m3', name: 'PM10', unit: 'µg/m³', min: 0, max: 250, normalMin: 0, normalMax: 100, warningMin: 0, warningMax: 100, criticalMin: 0, criticalMax: 160, precision: 1 },
    { key: 'temperature_c', name: 'Temperature', unit: '°C', min: 10, max: 45, normalMin: 18, normalMax: 32, precision: 1 },
    { key: 'humidity_percent', name: 'Humidity', unit: '%', min: 0, max: 100, normalMin: 35, normalMax: 70, precision: 1 },
    { key: 'risk_score', name: 'Unified zone risk', unit: 'demo score', min: 0, max: 100, normalMin: 0, normalMax: 55, warningMax: 55, criticalMax: 75, precision: 0 },
  ],
  thresholds: { nh3_ppm: { warning: 30, critical: 50 }, co_ppm: { warning: 35, critical: 70 }, h2s_ppm: { warning: 5, critical: 10 }, ch4_percent: { warning: 5, critical: 8 }, pm25_ug_m3: { warning: 55, critical: 100 }, pm10_ug_m3: { warning: 100, critical: 160 } },
  scenarios: [
    { id: 'normal', name: 'Normal Factory', duration: 3600, steps: [{ name: 'Stable operations', phase: 'normal', startAt: 0, endAt: 3600, metrics: {} }] },
    { id: 'gas_leak', name: 'Ammonia Leak · Zone B', description: 'NH3 rises first while other gases remain near baseline', duration: 6000, steps: [{ name: 'Localized gas event', phase: 'warning', startAt: 0, endAt: 6000, metrics: {} }] },
    { id: 'dust_event', name: 'Dust Event · Zone D', description: 'PM2.5 and PM10 rise while gases remain stable', duration: 6000, steps: [{ name: 'Localized dust event', phase: 'warning', startAt: 0, endAt: 6000, metrics: {} }] },
  ],
  devices: [
    { id: 'factsafe-zone-a', name: 'Zone A sensor', type: 'Factory safety node', status: 'online', location: 'Packaging' },
    { id: 'factsafe-zone-b', name: 'Zone B sensor', type: 'Factory safety node', status: 'online', location: 'Mixing' },
    { id: 'factsafe-zone-c', name: 'Zone C sensor', type: 'Factory safety node', status: 'online', location: 'Storage' },
    { id: 'factsafe-zone-d', name: 'Zone D sensor', type: 'Factory safety node', status: 'online', location: 'Loading' },
  ],
  aiEngine: false,
  defaultScenario: 'normal',
  defaultSpeed: 1,
  sessionHistory: true,
  controlsInitiallyOpen: true,
  simulationTimeUnit: 'minutes',
  simulationSpeeds: [1, 10, 60, 300, 600],
};
