import type { TelemetryPoint } from '../../../core/types';

export function coordinate(lat: unknown, lon: unknown): [number, number] | null {
  return typeof lat === 'number' && Number.isFinite(lat) && Math.abs(lat) <= 90
    && typeof lon === 'number' && Number.isFinite(lon) && Math.abs(lon) <= 180 ? [lat, lon] : null;
}
export function uavPosition(point: TelemetryPoint | null) {
  return point ? coordinate(point.metrics.uav_latitude_deg, point.metrics.uav_longitude_deg) : null;
}
export function flightSegments(points: TelemetryPoint[]) {
  const segments: [number, number][][] = [];
  let previous: TelemetryPoint | undefined;
  for (const point of points) {
    const position = uavPosition(point);
    if (!position) { previous = undefined; continue; }
    const interval = Math.max(3, (point.mission?.samplingIntervalSeconds ?? 1) * 3);
    const gap = !previous || previous.sessionId !== point.sessionId
      || (point.elapsedSimSeconds ?? 0) - (previous.elapsedSimSeconds ?? 0) > interval;
    if (gap) segments.push([]);
    segments[segments.length - 1].push(position);
    previous = point;
  }
  return segments;
}
