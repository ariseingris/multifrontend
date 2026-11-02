import type { ProjectConfig } from '../../core/types';

export const firescoutConfig: ProjectConfig = {
  id: 'firescout', name: 'FireScout AI',
  description: 'Fictional UAV mission · SIMULATED positions, wind, temperature and uncalibrated detections',
  metrics: [
    { key: 'uav_latitude_deg', name: 'UAV latitude', unit: '° WGS84', min: -90, max: 90, normalMin: -90, normalMax: 90, precision: 5 },
    { key: 'uav_longitude_deg', name: 'UAV longitude', unit: '° WGS84', min: -180, max: 180, normalMin: -180, normalMax: 180, precision: 5 },
    { key: 'uav_altitude_m', name: 'UAV altitude above fictional launch', unit: 'm', min: 0, max: 150, normalMin: 0, normalMax: 150, precision: 1 },
    { key: 'wind_direction_deg', name: 'Wind FROM direction', unit: '°', min: 0, max: 360, normalMin: 0, normalMax: 360, precision: 0 },
    { key: 'wind_speed_m_s', name: 'Wind speed', unit: 'm/s', min: 0, max: 10, normalMin: 0, normalMax: 10, precision: 1 },
    { key: 'detection_confidence_pct', name: 'Model confidence (uncalibrated)', unit: '%', min: 0, max: 100, normalMin: 0, normalMax: 100, precision: 1 },
    { key: 'uav_link_quality_pct', name: 'Link demo score', unit: '%', min: 0, max: 100, normalMin: 40, normalMax: 100, precision: 1 },
    { key: 'detection_confidence', name: 'Target detection confidence', unit: '%', min: 0, max: 100, normalMin: 0, normalMax: 100, precision: 1 },
    { key: 'hotspot_temp_c', name: 'Thermal hotspot estimate', unit: '°C', min: 0, max: 140, normalMin: 28, normalMax: 63, precision: 1 },
    { key: 'link_quality_percent', name: 'UAV link quality', unit: '%', min: 0, max: 100, normalMin: 40, normalMax: 100, warningMin: 40, criticalMin: 15, precision: 1 },
    { key: 'battery_percent', name: 'UAV battery', unit: '%', min: 0, max: 100, normalMin: 20, normalMax: 100, precision: 1 },
    { key: 'background_temp_c', name: 'Thermal background estimate', unit: '°C', min: 0, max: 100, normalMin: 20, normalMax: 50, precision: 1 },
  ],
  thresholds: { link_quality_percent: { warning: 40, critical: 15 } },
  scenarios: [
    { id: 'routine_recon', name: 'Routine Reconnaissance', duration: 120, steps: [{ name: 'Search', phase: 'normal', startAt: 0, endAt: 120, metrics: {} }] },
    { id: 'hotspot_detection', name: 'Hotspot & Candidate Detection', duration: 120, steps: [{ name: 'Synthetic candidate', phase: 'warning', startAt: 0, endAt: 120, metrics: {} }] },
    { id: 'smoke_link_degradation', name: 'Smoke & Signal Degradation', duration: 120, steps: [{ name: 'Synthetic blackout', phase: 'warning', startAt: 0, endAt: 120, metrics: {} }] },
  ],
  devices: [{ id: 'firescout-uav-01', name: 'Simulated UAV', type: 'Synthetic visible/thermal source', status: 'offline' }],
  aiEngine: false, defaultScenario: 'routine_recon', defaultSpeed: 1,
  controlsInitiallyOpen: true, sessionHistory: true, chartWindowSeconds: 120,
  simulationTimeUnit: 'seconds', simulationSpeeds: [1, 2, 5, 10],
};
