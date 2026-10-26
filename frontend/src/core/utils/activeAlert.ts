import type { Alert, SimulationState, TimelineEvent } from '../types';

type ActiveMessage = { message: string; severity: 'error' | 'warning' | 'success' | 'info' };

/** Select existing event text without generating alerts on telemetry updates. */
export function selectActiveAlert(
  project: string,
  alert: Alert | null,
  state: SimulationState | null,
  events: TimelineEvent[],
): ActiveMessage | null {
  if (state && (state.project !== project || state.status === 'stopped')) return null;

  // FireScout emits timeline events rather than threshold alert packets. The
  // authoritative state determines which of those events still needs attention.
  if (project === 'firescout') {
    if (!state) return null;
    const type = state.phase === 'critical' ? 'link_lost'
      : state.phase === 'warning' ? 'link_degraded'
      : state.candidateDetected ? 'candidate_detected'
      : state.hotspotDetected ? 'hotspot_detected' : null;
    const event = type && [...events].reverse().find((item) =>
      item.type === type && item.project === project && item.sessionId === state.sessionId);
    return event ? { message: event.message, severity: event.severity === 'critical' ? 'error' : event.severity } : null;
  }

  if (!alert || (alert.project && alert.project !== project)
    || (state && alert.sessionId && alert.sessionId !== state.sessionId)
    || (state?.phase === 'normal' && alert.severity !== 'info'
      && alert.type !== 'recovery' && alert.type !== 'resolved')) return null;

  return {
    message: alert.message,
    severity: alert.type === 'recovery' || alert.type === 'resolved' ? 'success'
      : alert.severity === 'critical' ? 'error' : alert.severity,
  };
}
