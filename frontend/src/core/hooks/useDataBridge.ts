import { useEffect, useRef, useCallback, useState } from 'react';
import { useTelemetryStore, useAlertStore, useTimelineStore, useSimulationStore, useScenarioStore } from '../store';
import { TelemetryPoint } from '../types';

export function useDataBridge(wsUrl: string = 'ws://localhost:8765', projectId?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const addTelemetry = useTelemetryStore((state) => state.addTelemetry);
  const addAlert = useAlertStore((state) => state.addAlert);
  const addEvent = useTimelineStore((state) => state.addEvent);
  const [isConnected, setIsConnected] = useState(false);
  const hasLoggedConnectionErrorRef = useRef(false);

  useEffect(() => {
    // Each effect owns its socket and retry timer. A closed StrictMode socket must
    // never schedule retries into the next effect's connection.
    let disposed = false;
    let sessionId: string | undefined;
    if (projectId) {
      useSimulationStore.getState().clear();
      useTelemetryStore.getState().clearTelemetry();
      useTimelineStore.getState().clearEvents();
      useAlertStore.getState().clearAlerts();
      useAlertStore.getState().clearCurrentAlert();
      useScenarioStore.getState().resetScenario();
    }
    const acceptSession = (next: string | undefined) => {
      if (next && next !== sessionId) {
        sessionId = next;
        useTelemetryStore.getState().clearTelemetry();
        useTimelineStore.getState().clearEvents();
        useAlertStore.getState().clearAlerts();
        useAlertStore.getState().clearCurrentAlert();
      }
    };
    let retryTimer: ReturnType<typeof setTimeout>;
    let socket: WebSocket | null = null;
    const connect = () => {
      if (disposed) return;
      try {
        const ws = new WebSocket(wsUrl);
        socket = ws;
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          hasLoggedConnectionErrorRef.current = false;
          console.log('WebSocket connected');
          if (projectId) ws.send(JSON.stringify({ type: 'get_state', project: projectId }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'simulation_state' && ['aquasense', 'factsafe'].includes(projectId ?? '')) {
              useSimulationStore.getState().setServerProject(data.payload.project);
              if (data.payload.project !== projectId && useSimulationStore.getState().state) {
                // Another tab can replace the single server's active project.
                useSimulationStore.setState({ state: null, receivedAt: 0 });
                useScenarioStore.getState().resetScenario();
                useTelemetryStore.getState().clearTelemetry();
                useTimelineStore.getState().clearEvents();
                useAlertStore.getState().clearAlerts();
                useAlertStore.getState().clearCurrentAlert();
                sessionId = undefined;
              }
            }
            if (projectId && data.payload?.project !== projectId) return;
            if (projectId) acceptSession(data.payload?.sessionId);
            if (data.type === 'session_history' && projectId && ['aquasense', 'factsafe'].includes(projectId)) {
              const points = data.payload.telemetry.filter((point: TelemetryPoint) => point.project === projectId && point.sessionId === data.payload.sessionId);
              useTelemetryStore.getState().setTelemetry(points);
              useTimelineStore.getState().setEvents(data.payload.events.filter((event: { project?: string; sessionId?: string }) => event.project === projectId && event.sessionId === data.payload.sessionId));
              return;
            }
            if (data.type === 'simulation_state' && projectId && data.payload) {
              useSimulationStore.getState().setSimulation(data.payload);
              if (projectId === 'aquasense') {
                // Restore the actual active simulator alert after reconnect; no new detection.
                const active = data.payload.activeAlert ?? null;
                const alerts = useAlertStore.getState();
                if (alerts.currentAlert?.id !== active?.id) alerts.setCurrentAlert(active);
              }
              useScenarioStore.getState().setScenario({
                name: data.payload.scenario, status: data.payload.status,
                phase: data.payload.phase, speed: data.payload.speed,
                elapsedSeconds: data.payload.elapsedSimSeconds,
              });
              return;
            }
            if (data.type === 'command_error' && projectId) {
              useSimulationStore.getState().setCommandError(data.payload.message);
              return;
            }

            if (data.type === 'telemetry' && data.payload) {
              const previous = useTelemetryStore.getState().getLatest();
              if (projectId && previous?.sessionId === data.payload.sessionId && previous?.elapsedSimSeconds !== undefined && data.payload.elapsedSimSeconds <= previous.elapsedSimSeconds) return;
              addTelemetry(data.payload);
            } else if (data.type === 'alert' && data.payload) {
              addAlert(data.payload);
              const currentState = useSimulationStore.getState().state;
              if (projectId === 'aquasense' && currentState && 'activeAlert' in currentState) {
                // Catch-up can deliver historical crossings after recovery. Keep
                // them in history while the state owns the currently active banner.
                useAlertStore.getState().setCurrentAlert(currentState.activeAlert ?? null);
              }
              if (!data.payload.sessionId) addEvent({
                timestamp: data.payload.timestamp,
                type: 'threshold_exceeded',
                message: data.payload.message,
                severity: data.payload.severity,
                icon: data.payload.severity === 'critical' ? '🚨' : '⚠',
              });
            } else if (data.type === 'event' && data.payload) {
              if (projectId && ['normal_restored', 'link_recovered'].includes(data.payload.type)) useAlertStore.getState().clearCurrentAlert();
              addEvent(data.payload);
            }
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };

        ws.onerror = (error) => {
          if (!hasLoggedConnectionErrorRef.current) {
            console.error('WebSocket connection unavailable:', error);
            hasLoggedConnectionErrorRef.current = true;
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          console.log('WebSocket disconnected');
          if (!disposed) {
            retryTimer = setTimeout(connect, 2000);
          }
        };
      } catch (err) {
        console.error('Failed to connect WebSocket:', err);
      }
    };
    // Defer opening so StrictMode's setup/cleanup probe creates no extra socket.
    retryTimer = setTimeout(connect, 0);
    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        socket.close();
        if (wsRef.current === socket) wsRef.current = null;
      }
      setIsConnected(false);
    };
  }, [wsUrl, projectId, addTelemetry, addAlert, addEvent]);

  const send = useCallback((message: Record<string, unknown>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  return {
    isConnected,
    send,
  };
}

/**
 * Hook for local telemetry generation (for testing/demo without backend)
 */
export function useLocalTelemetrySimulation(
  enabled: boolean = false,
  project?: any
) {
  const addTelemetry = useTelemetryStore((state) => state.addTelemetry);

  useEffect(() => {
    if (!enabled || !project) return;

    const interval = setInterval(() => {
      const now = new Date().toISOString();
      const metrics: Record<string, number> = {};

      project.metrics.forEach((metric: any) => {
        metrics[metric.key] =
          Math.random() * (metric.max - metric.min) + metric.min;
      });

      const point: TelemetryPoint = {
        timestamp: now,
        deviceId: project.devices[0]?.id || 'device-1',
        metrics,
        status: 'normal',
        riskScore: Math.random() * 50,
        scenario: 'normal',
      };

      addTelemetry(point);
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, project, addTelemetry]);
}
