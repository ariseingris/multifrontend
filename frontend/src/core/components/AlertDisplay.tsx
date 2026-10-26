import { useAlertStore, useSimulationStore, useTimelineStore } from '../store';
import { selectActiveAlert } from '../utils/activeAlert';
import { AlertMessage } from './AlertMessage';

/** Store adapter shared by all project dashboards. */
export function AlertDisplay({ projectId }: { projectId: string }) {
  const alert = useAlertStore((store) => store.currentAlert);
  const state = useSimulationStore((store) => store.state);
  const events = useTimelineStore((store) => store.events);
  const active = selectActiveAlert(projectId, alert, state, events);

  return active ? <div style={{ margin: '16px 0' }}>
    <AlertMessage message={active.message} severity={active.severity} />
  </div> : null;
}
