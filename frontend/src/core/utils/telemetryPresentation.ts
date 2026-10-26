import type { TelemetryPoint } from '../types';

export function displayValue(value: number | undefined, precision = 1) {
  return value !== undefined && Number.isFinite(value) ? value.toFixed(precision) : '—';
}

/** Retain actual samples from every time bucket, including origin and latest. */
export function appendTelemetry(points: TelemetryPoint[], point: TelemetryPoint): TelemetryPoint[] {
  const previous = points[points.length - 1];
  if (previous && (previous.project !== point.project || previous.sessionId !== point.sessionId)) return [point];
  const bucketSeconds = point.historyBucketSeconds;
  let result: TelemetryPoint[];
  if (bucketSeconds && bucketSeconds > 0 && points.length > 1 && point.elapsedSimSeconds !== undefined
      && previous.elapsedSimSeconds !== undefined
      && Math.floor(point.elapsedSimSeconds / bucketSeconds) === Math.floor(previous.elapsedSimSeconds / bucketSeconds)) {
    result = [...points.slice(0, -1), point];
  } else result = [...points, point];
  if (point.historyRetentionSeconds && point.elapsedSimSeconds !== undefined) {
    const cutoff = point.elapsedSimSeconds - point.historyRetentionSeconds;
    return result.filter(p => (p.elapsedSimSeconds ?? 0) >= cutoff).slice(-(point.historyMaxPoints ?? 1000));
  }
  if (result.length <= 1000) return result;
  // FireScout/older streams keep their existing rolling history behavior.
  return bucketSeconds ? [result[0], ...result.slice(1, -1).filter((_, i) => i % 2 === 0), point] : result.slice(-1000);
}

/** Equal simulation intervals; precision follows spacing so short runs never repeat labels. */
export function elapsedAxis(points: TelemetryPoint[], unit: 'minutes' | 'seconds', windowSeconds?: number) {
  const divisor = unit === 'minutes' ? 60 : 1;
  const latest = points[points.length - 1]?.elapsedSimSeconds ?? 0;
  const end = Math.max(latest, 1) / divisor;
  const start = windowSeconds ? Math.max(0, latest - windowSeconds) / divisor : 0;
  const step = (end - start) / 5;
  const precision = Math.max(1, Math.min(10, Math.ceil(-Math.log10(step)) + 1));
  return { domain: [start, end] as [number, number], ticks: Array.from({ length: 6 }, (_, i) => start + i * step),
    format: (value: number) => Number(value).toFixed(precision) };
}

/** Viewport only: older retained samples remain available for diagnostics. */
export function visibleTelemetry(points: TelemetryPoint[], windowSeconds?: number) {
  if (!windowSeconds || !points.length) return points;
  const cutoff = (points[points.length - 1].elapsedSimSeconds ?? 0) - windowSeconds;
  const first = points.findIndex(p => (p.elapsedSimSeconds ?? 0) >= cutoff);
  return points.slice(Math.max(0, first - 1));
}
