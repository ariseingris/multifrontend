/**
 * Shared Data Models for Demo IoT Framework
 */

export interface TelemetryPoint {
  timestamp: string;
  deviceId: string;
  metrics: Record<string, number>;
  status: 'normal' | 'warning' | 'critical';
  riskScore: number;
  scenario: string;
  project?: string;
  sessionId?: string;
  elapsedSimSeconds?: number;
  elapsedSimMinutes?: number;
  historyBucketSeconds?: number;
  historyRetentionSeconds?: number;
  historyMaxPoints?: number;
  source?: 'simulator' | 'sensor';
  quality?: Record<string, 'valid' | 'degraded' | 'missing' | 'simulated'>;
  sensorStatus?: 'valid' | 'degraded' | 'missing';
  missionStatus?: string | null;
  metricStatus?: Record<string, 'normal' | 'warning' | 'critical'>;
  groundTruth?: Record<string, number>;
}

export interface Alert {
  id: string;
  timestamp: string;
  type: 'anomaly_detected' | 'threshold_exceeded' | 'recovery' | 'acknowledged' | 'resolved';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  metric?: string;
  value?: number;
  threshold?: number;
  deviceId?: string;
  project?: string;
  sessionId?: string;
  source?: string;
  elapsedSimSeconds?: number;
}

export interface TimelineEvent {
  timestamp: string;
  type: 'sensor_connected' | 'system_normal' | 'anomaly_detected' | 'threshold_exceeded' | 'critical_event' | 'alert_dispatched' | 'operator_acknowledged' | 'system_recovered' | 'action_approved' | 'action_rejected' | 'started' | 'completed' | 'reset' | 'pause' | 'resume' | 'set_speed' | 'warning_entered' | 'critical_entered' | 'normal_restored' | 'simulated_intervention' | 'recovery' | 'sensor_quality_warning' | 'simulated_containment' | 'normal_telemetry' | 'suspected_leak' | 'dust_detected' | 'link_lost' | 'link_degraded' | 'link_recovered' | 'telemetry_stale' | 'reconnecting' | 'candidate_detected' | 'track_lost' | 'hotspot_detected' | 'telemetry_healthy' | 'monitoring_started';
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  icon: string;
  project?: string;
  sessionId?: string;
  elapsedSimSeconds?: number;
  source?: string;
}

export type ScenarioStatus = 'stopped' | 'running' | 'paused' | 'completed';
export type ScenarioPhase = 'normal' | 'early_signal' | 'warning' | 'critical' | 'alert' | 'action' | 'recovery' | 'oxygen_decline' | 'monitoring' | 'maintenance_required';

export interface SimulationState {
  project: string;
  scenario: string;
  sessionId: string;
  status: ScenarioStatus;
  phase: ScenarioPhase;
  speed: number;
  elapsedSimSeconds: number;
  durationSeconds: number;
  continuous?: boolean;
  activeAlert?: Alert | null;
  realElapsedSeconds?: number;
  source: 'simulator_state';
  timestamp: string;
  seed: number;
  riskModel?: Record<string, number>;
  telemetryAvailable: boolean;
  sensorStatus: 'valid' | 'degraded' | 'missing';
  missionStatus: string | null;
  candidateDetected: boolean;
  hotspotDetected: boolean;
  rules: Record<string, number> | null;
  lastSeenSimSeconds: number | null;
  lastTelemetrySimSeconds: number | null;
}

export interface ScenarioState {
  name: string;
  phase: ScenarioPhase;
  elapsedSeconds: number;
  speed: number;
  status: ScenarioStatus;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'error';
  location?: string;
  battery?: number;
  signal?: number;
}

export interface MetricConfig {
  key: string;
  name: string;
  unit: string;
  min: number;
  max: number;
  normalMin: number;
  normalMax: number;
  warningMin?: number;
  warningMax?: number;
  criticalMin?: number;
  criticalMax?: number;
  precision?: number;
}

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  duration: number;
  speed?: number;
  steps: ScenarioStep[];
}

export interface ScenarioStep {
  name: string;
  phase: ScenarioPhase;
  startAt: number; // seconds
  endAt: number;
  metrics: Record<string, { start: number; end: number; ease?: string }>;
}

export interface ProjectConfig {
  id: string;
  name: string;
  description?: string;
  theme?: {
    primary: string;
    secondary: string;
    warning: string;
    critical: string;
    recovered: string;
  };
  metrics: MetricConfig[];
  thresholds: Record<string, { warning: number; critical: number }>;
  scenarios: Scenario[];
  kpis?: KPIConfig[];
  devices: Device[];
  aiEngine?: boolean;
  defaultScenario?: string;
  defaultSpeed?: number;
  sessionHistory?: boolean;
  chartWindowSeconds?: number;
  controlsInitiallyOpen?: boolean;
  simulationTimeUnit?: 'minutes' | 'seconds';
  simulationSpeeds?: number[];
}

export interface KPIConfig {
  id: string;
  label: string;
  format: 'number' | 'percentage' | 'duration' | 'status';
  value?: number | string;
  unit?: string;
  target?: number | string;
  trend?: 'up' | 'down' | 'stable';
}

export interface SystemStatus {
  online: boolean;
  aiEngineActive: boolean;
  sensorCount: number;
  dataStreamActive: boolean;
  internetOffline?: boolean;
  edgeAiActive?: boolean;
  localAlarmActive?: boolean;
}

export interface DemoModeState {
  enabled: boolean;
  simulationActive: boolean;
  scenario?: string;
  elapsed?: string;
}
