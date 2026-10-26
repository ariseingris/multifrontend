import type { ProjectConfig } from '../../core/types';

export const firescoutConfig: ProjectConfig = {
  id: 'firescout', name: 'FireScout AI',
  description: 'Synthetic UAV rescue reconnaissance · no real vision inference',
  metrics: [
    { key: 'detection_confidence', name: 'Target detection confidence', unit: '%', min: 0, max: 100, normalMin: 0, normalMax: 100, precision: 1 },
    { key: 'hotspot_temp_c', name: 'Thermal hotspot estimate', unit: '°C', min: 0, max: 100, normalMin: 28, normalMax: 63, precision: 1 },
    { key: 'link_quality_percent', name: 'UAV link quality', unit: '%', min: 0, max: 100, normalMin: 40, normalMax: 100, warningMin: 40, criticalMin: 15, precision: 1 },
    { key: 'battery_percent', name: 'UAV battery', unit: '%', min: 0, max: 100, normalMin: 20, normalMax: 100, precision: 1 },
    { key: 'background_temp_c', name: 'Thermal background estimate', unit: '°C', min: 0, max: 100, normalMin: 20, normalMax: 50, precision: 1 },
  ],
  thresholds: { link_quality_percent: { warning: 40, critical: 15 } },
  scenarios: [
    { id: 'routine_recon', name: 'Routine Reconnaissance', duration: 120, steps: [{ name: 'Search', phase: 'normal', startAt: 0, endAt: 120, metrics: {} }] },
    { id: 'victim_hotspot', name: 'Possible Victim and Hotspot', duration: 120, steps: [{ name: 'Synthetic candidate', phase: 'warning', startAt: 0, endAt: 120, metrics: {} }] },
    { id: 'smoke_link_loss', name: 'Smoke / Obstruction and Link Loss', duration: 120, steps: [{ name: 'Synthetic blackout', phase: 'warning', startAt: 0, endAt: 120, metrics: {} }] },
  ],
  devices: [{ id: 'firescout-uav-01', name: 'Simulated UAV', type: 'Synthetic visible/thermal source', status: 'offline' }],
  aiEngine: false, defaultScenario: 'routine_recon', defaultSpeed: 1,
  simulationTimeUnit: 'seconds', simulationSpeeds: [1, 2, 5, 10],
};
