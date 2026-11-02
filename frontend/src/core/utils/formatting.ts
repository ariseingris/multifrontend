import { TelemetryPoint, MetricConfig, ScenarioPhase } from '../types';

export function formatMetric(
  value: number,
  config: MetricConfig
): string {
  const precision = config.precision ?? 1;
  const formatted = value.toFixed(precision);
  return `${formatted}${config.unit ? ' ' + config.unit : ''}`;
}

export function getMetricStatus(
  value: number,
  config: MetricConfig
): 'normal' | 'warning' | 'critical' {
  if (
    config.criticalMin !== undefined ||
    config.criticalMax !== undefined
  ) {
    if (
      (config.criticalMin !== undefined && value < config.criticalMin) ||
      (config.criticalMax !== undefined && value > config.criticalMax)
    ) {
      return 'critical';
    }
  }

  if (config.warningMin !== undefined || config.warningMax !== undefined) {
    if (
      (config.warningMin !== undefined && value < config.warningMin) ||
      (config.warningMax !== undefined && value > config.warningMax)
    ) {
      return 'warning';
    }
  }

  return 'normal';
}

export function getOverallStatus(
  telemetry: TelemetryPoint | null
): 'normal' | 'warning' | 'critical' {
  if (!telemetry) return 'normal';
  return telemetry.status;
}

export function formatElapsedTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function getPhaseName(phase: ScenarioPhase): string {
  const names: Record<ScenarioPhase, string> = {
    normal: 'Normal',
    early_signal: 'Early Signal',
    warning: 'Warning',
    critical: 'Critical',
    alert: 'Alert',
    action: 'Action',
    recovery: 'Recovery',
    oxygen_decline: 'Oxygen decline',
    monitoring: 'Post-event monitoring',
    maintenance_required: 'Maintenance required',
  };
  return names[phase];
}

export function getStatusColor(
  status: 'normal' | 'warning' | 'critical' | 'recovered' | 'info'
): string {
  const colors: Record<string, string> = {
    normal: '#4ade80',
    warning: '#f59e0b',
    critical: '#ef4444',
    recovered: '#3b82f6',
    info: '#6b7280',
  };
  return colors[status] || colors.normal;
}

export function isInNormalRange(value: number, config: MetricConfig): boolean {
  return value >= config.normalMin && value <= config.normalMax;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

export const easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
};
