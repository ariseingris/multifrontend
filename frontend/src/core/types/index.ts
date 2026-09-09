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
}

export interface TimelineEvent {
  timestamp: string;
  type: 'sensor_connected' | 'system_normal' | 'anomaly_detected' | 'threshold_exceeded' | 'critical_event' | 'alert_dispatched' | 'operator_acknowledged' | 'system_recovered' | 'action_approved' | 'action_rejected';
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  icon: string;
}

export type ScenarioStatus = 'stopped' | 'running' | 'paused';
export type ScenarioPhase = 'normal' | 'early_signal' | 'warning' | 'critical' | 'alert' | 'action' | 'recovery';

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
}

export interface KPIConfig {
  id: string;
  label: string;
  format: 'number' | 'percentage' | 'duration' | 'status';
  value?: number | string;
  unit?: string;
  target?: number;
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
