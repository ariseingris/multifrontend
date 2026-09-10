import { useEffect, useRef, useCallback, useState } from 'react';
import { useTelemetryStore, useAlertStore, useTimelineStore } from '../store';
import { TelemetryPoint } from '../types';

export function useDataBridge(wsUrl: string = 'ws://localhost:8765') {
  const wsRef = useRef<WebSocket | null>(null);
  const addTelemetry = useTelemetryStore((state) => state.addTelemetry);
  const addAlert = useAlertStore((state) => state.addAlert);
  const addEvent = useTimelineStore((state) => state.addEvent);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const disposedRef = useRef(false);
  const hasLoggedConnectionErrorRef = useRef(false);

  const connect = useCallback(() => {
    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        hasLoggedConnectionErrorRef.current = false;
        console.log('WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'telemetry' && data.payload) {
            addTelemetry(data.payload);
          } else if (data.type === 'alert' && data.payload) {
            addAlert(data.payload);
            addEvent({
              timestamp: data.payload.timestamp,
              type: 'threshold_exceeded',
              message: data.payload.message,
              severity: data.payload.severity,
              icon: data.payload.severity === 'critical' ? '🚨' : '⚠',
            });
          } else if (data.type === 'event' && data.payload) {
            addEvent(data.payload);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      wsRef.current.onerror = (error) => {
        if (!hasLoggedConnectionErrorRef.current) {
          console.error('WebSocket connection unavailable:', error);
          hasLoggedConnectionErrorRef.current = true;
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
        if (!disposedRef.current) {
          reconnectTimeoutRef.current = setTimeout(connect, 2000);
        }
      };
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
    }
  }, [wsUrl, addTelemetry, addAlert, addEvent]);

  useEffect(() => {
    disposedRef.current = false;
    connect();

    return () => {
      disposedRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const send = useCallback((message: Record<string, unknown>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
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
