import { TelemetryPoint, MetricConfig, ScenarioPhase } from '../types';

/**
 * Format a number with specified precision and unit
 */
export function formatMetric(
  value: number,
  config: MetricConfig
): string {
  const precision = config.precision ?? 1;
  const formatted = value.toFixed(precision);
  return `${formatted}${config.unit ? ' ' + config.unit : ''}`;
}

/**
 * Determine status of a metric based on thresholds
 */
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

/**
 * Get overall system status from telemetry
 */
export function getOverallStatus(
  telemetry: TelemetryPoint | null
): 'normal' | 'warning' | 'critical' {
  if (!telemetry) return 'normal';
  return telemetry.status;
}

/**
 * Format elapsed time as HH:MM:SS
 */
export function formatElapsedTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format ISO timestamp to HH:MM:SS
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Parse scenario phase to human-readable label
 */
export function getPhaseName(phase: ScenarioPhase): string {
  const names: Record<ScenarioPhase, string> = {
    normal: 'Normal',
    early_signal: 'Early Signal',
    warning: 'Warning',
    critical: 'Critical',
    alert: 'Alert',
    action: 'Action',
    recovery: 'Recovery',
  };
  return names[phase];
}

/**
 * Get color for status
 */
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

/**
 * Check if value is in normal range
 */
export function isInNormalRange(value: number, config: MetricConfig): boolean {
  return value >= config.normalMin && value <= config.normalMax;
}

/**
 * Linear interpolation between two values
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/**
 * Easing functions for smooth animations
 */
export const easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
};
