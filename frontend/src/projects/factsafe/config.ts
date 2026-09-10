import { ProjectConfig } from '../../core/types';

export const factsafeConfig: ProjectConfig = {
  id: 'factsafe',
  name: 'FactSafe',
  description: 'Factory safety command center for gas, dust and microclimate hazards',
  theme: { primary: '#f97316', secondary: '#eab308', warning: '#f59e0b', critical: '#ef4444', recovered: '#22c55e' },
  metrics: [
    { key: 'nh3_ppm', name: 'NH3', unit: 'ppm', min: 0, max: 80, normalMin: 0, normalMax: 30, warningMin: 30, warningMax: 50, criticalMin: 50, criticalMax: 80, precision: 1 },
    { key: 'co_ppm', name: 'CO', unit: 'ppm', min: 0, max: 120, normalMin: 0, normalMax: 35, warningMin: 35, warningMax: 70, criticalMin: 70, criticalMax: 120, precision: 1 },
    { key: 'h2s_ppm', name: 'H2S', unit: 'ppm', min: 0, max: 20, normalMin: 0, normalMax: 5, warningMin: 5, warningMax: 10, criticalMin: 10, criticalMax: 20, precision: 2 },
    { key: 'ch4_percent', name: 'CH4', unit: '%', min: 0, max: 10, normalMin: 0, normalMax: 5, warningMin: 5, warningMax: 8, criticalMin: 8, criticalMax: 10, precision: 2 },
    { key: 'pm25_ug_m3', name: 'PM2.5', unit: 'µg/m³', min: 0, max: 180, normalMin: 0, normalMax: 55, warningMin: 55, warningMax: 100, criticalMin: 100, criticalMax: 180, precision: 1 },
    { key: 'pm10_ug_m3', name: 'PM10', unit: 'µg/m³', min: 0, max: 250, normalMin: 0, normalMax: 100, warningMin: 100, warningMax: 160, criticalMin: 160, criticalMax: 250, precision: 1 },
    { key: 'temperature_c', name: 'Temperature', unit: '°C', min: 10, max: 45, normalMin: 18, normalMax: 32, precision: 1 },
    { key: 'humidity_percent', name: 'Humidity', unit: '%', min: 0, max: 100, normalMin: 35, normalMax: 70, precision: 1 },
  ],
  thresholds: { nh3_ppm: { warning: 30, critical: 50 }, co_ppm: { warning: 35, critical: 70 }, h2s_ppm: { warning: 5, critical: 10 }, ch4_percent: { warning: 5, critical: 8 }, pm25_ug_m3: { warning: 55, critical: 100 }, pm10_ug_m3: { warning: 100, critical: 160 } },
  scenarios: [
    { id: 'normal', name: 'Normal Factory', duration: 60, steps: [{ name: 'Stable operations', phase: 'normal', startAt: 0, endAt: 60, metrics: {} }] },
    { id: 'gas_leak', name: 'Ammonia Leak · Zone B', description: 'NH3 rises first while other gases remain near baseline', duration: 100, steps: [{ name: 'Localized gas event', phase: 'warning', startAt: 0, endAt: 100, metrics: {} }] },
    { id: 'dust_event', name: 'Dust Event · Zone D', description: 'PM2.5 and PM10 rise while gases remain stable', duration: 100, steps: [{ name: 'Localized dust event', phase: 'warning', startAt: 0, endAt: 100, metrics: {} }] },
  ],
  devices: [
    { id: 'factsafe-zone-a', name: 'Zone A sensor', type: 'Factory safety node', status: 'online', location: 'Packaging' },
    { id: 'factsafe-zone-b', name: 'Zone B sensor', type: 'Factory safety node', status: 'online', location: 'Mixing' },
    { id: 'factsafe-zone-c', name: 'Zone C sensor', type: 'Factory safety node', status: 'online', location: 'Storage' },
    { id: 'factsafe-zone-d', name: 'Zone D sensor', type: 'Factory safety node', status: 'online', location: 'Loading' },
  ],
  aiEngine: true,
  defaultScenario: 'normal',
  defaultSpeed: 1,
};
