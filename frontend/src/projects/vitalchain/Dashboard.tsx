import React, { useEffect, useState } from 'react';
import { Dashboard, ThresholdChart, Gauge } from '../../core/components';
import { vitalchainConfig } from './config';
import { useTelemetryStore, useScenarioStore, useTimelineStore, useAlertStore } from '../../core/store';
import { getMetricStatus, formatElapsedTime } from '../../core/utils/formatting';
import { useDataBridge, useLocalTelemetrySimulation } from '../../core/hooks/useDataBridge';
import { KPIConfig, TelemetryPoint, TimelineEvent, Alert } from '../../core/types';

export const VitalChainDashboard: React.FC = () => {
  const latest = useTelemetryStore((s) => s.getLatest());
  const scenario = useScenarioStore((s) => s.scenario);
  const alerts = useAlertStore((s) => s.alerts);
  const addEvent = useTimelineStore((s) => s.addEvent);
  const addAlert = useAlertStore((s) => s.addAlert);
  const setPhase = useScenarioStore((s) => s.setPhase);
  const setElapsed = useScenarioStore((s) => s.setElapsed);
  const [useSimulation] = useState(true);

  // Try to connect to WebSocket, but fall back to local simulation
  const { isConnected } = useDataBridge('ws://localhost:8765');
  useLocalTelemetrySimulation(useSimulation && !isConnected, vitalchainConfig);

  // Scenario progression and event generation
  useEffect(() => {
    if (scenario.status !== 'running') return;

    const interval = setInterval(() => {
      setElapsed(scenario.elapsedSeconds + 0.1 * scenario.speed);
    }, 100);

    return () => clearInterval(interval);
  }, [scenario.status, scenario.elapsedSeconds, scenario.speed, setElapsed]);

  // Generate events and alerts based on telemetry
  useEffect(() => {
    if (!latest) return;

    const tempStatus = getMetricStatus(latest.metrics.temperature, vitalchainConfig.metrics[0]);
    const humidityStatus = getMetricStatus(latest.metrics.humidity, vitalchainConfig.metrics[1]);

    if (tempStatus === 'critical' || humidityStatus === 'critical') {
      const event: TimelineEvent = {
        timestamp: latest.timestamp,
        type: 'critical_event',
        message: `Critical condition: Temp=${latest.metrics.temperature}°C, Humidity=${latest.metrics.humidity}%`,
        severity: 'critical',
        icon: '🔴',
      };
      addEvent(event);

      const alert: Alert = {
        id: `alert-${Date.now()}`,
        timestamp: latest.timestamp,
        type: 'threshold_exceeded',
        severity: 'critical',
        message: 'Cold chain integrity compromised!',
        metric: tempStatus === 'critical' ? 'temperature' : 'humidity',
        value: tempStatus === 'critical' ? latest.metrics.temperature : latest.metrics.humidity,
        threshold: tempStatus === 'critical' ? 2 : 30,
        deviceId: latest.deviceId,
      };
      addAlert(alert);
    } else if (tempStatus === 'warning' || humidityStatus === 'warning') {
      const event: TimelineEvent = {
        timestamp: latest.timestamp,
        type: 'threshold_exceeded',
        message: `Warning: Temp=${latest.metrics.temperature}°C, Humidity=${latest.metrics.humidity}%`,
        severity: 'warning',
        icon: '⚠',
      };
      addEvent(event);
    } else {
      const event: TimelineEvent = {
        timestamp: latest.timestamp,
        type: 'system_normal',
        message: 'System operating normally',
        severity: 'info',
        icon: '✓',
      };
      addEvent(event);
    }
  }, [latest, addEvent, addAlert]);

  const tempMetric = vitalchainConfig.metrics.find((m) => m.key === 'temperature')!;
  const humidityMetric = vitalchainConfig.metrics.find((m) => m.key === 'humidity')!;

  return (
    <Dashboard
      projectConfig={vitalchainConfig}
      onScenarioStart={(scenarioId) => {
        const scenario = vitalchainConfig.scenarios.find((s) => s.id === scenarioId);
        if (scenario) {
          const firstStep = scenario.steps[0];
          setPhase(firstStep.phase);

          const event: TimelineEvent = {
            timestamp: new Date().toISOString(),
            type: 'system_normal',
            message: `Scenario started: ${scenario.name}`,
            severity: 'info',
            icon: '▶',
          };
          addEvent(event);
        }
      }}
    >
      {/* KPIs Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        {vitalchainConfig.kpis?.map((kpi) => (
          <KPICard
            key={kpi.id}
            kpi={kpi}
            latest={latest}
            elapsedSeconds={scenario.elapsedSeconds}
            alertCount={alerts.length}
            activeSensorCount={vitalchainConfig.devices.filter((device) => device.status === 'online').length}
          />
        ))}
      </div>

      {/* Main Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        {/* Temperature Chart */}
        <ThresholdChart
          metricKey="temperature"
          title="Temperature Monitoring"
          height={300}
          normalMin={tempMetric.normalMin}
          normalMax={tempMetric.normalMax}
          warningMin={tempMetric.warningMin}
          warningMax={tempMetric.warningMax}
          criticalMin={tempMetric.criticalMin}
          criticalMax={tempMetric.criticalMax}
          unit="°C"
        />

        {/* Humidity Chart */}
        <ThresholdChart
          metricKey="humidity"
          title="Humidity Monitoring"
          height={300}
          normalMin={humidityMetric.normalMin}
          normalMax={humidityMetric.normalMax}
          warningMin={humidityMetric.warningMin}
          warningMax={humidityMetric.warningMax}
          criticalMin={humidityMetric.criticalMin}
          criticalMax={humidityMetric.criticalMax}
          unit="%"
        />
      </div>

      {/* Gauge Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '16px',
          background: '#1a1a1a',
          border: '1px solid #2d2d2d',
          borderRadius: '8px',
          padding: '24px',
        }}
      >
        {latest && (
          <>
            <Gauge
              value={latest.metrics.temperature ?? 0}
              min={tempMetric.min}
              max={tempMetric.max}
              label={tempMetric.name}
              unit={tempMetric.unit}
              thresholdWarning={tempMetric.warningMax}
              thresholdCritical={tempMetric.criticalMax}
              size={100}
            />
            <Gauge
              value={latest.metrics.humidity ?? 0}
              min={humidityMetric.min}
              max={humidityMetric.max}
              label={humidityMetric.name}
              unit={humidityMetric.unit}
              thresholdWarning={humidityMetric.warningMax}
              thresholdCritical={humidityMetric.criticalMax}
              size={100}
            />
            <Gauge
              value={latest.metrics.battery ?? 0}
              min={0}
              max={100}
              label="Battery"
              unit="%"
              thresholdWarning={20}
              thresholdCritical={5}
              size={100}
            />
            <Gauge
              value={Math.abs(latest.metrics.signal ?? -65)}
              min={30}
              max={120}
              label="Signal Strength"
              unit="dBm"
              thresholdWarning={100}
              thresholdCritical={120}
              size={100}
            />
          </>
        )}
      </div>
    </Dashboard>
  );
};

interface KPICardProps {
  kpi: KPIConfig;
  latest: TelemetryPoint | null;
  elapsedSeconds: number;
  alertCount: number;
  activeSensorCount: number;
}

const KPICard: React.FC<KPICardProps> = ({
  kpi,
  latest,
  elapsedSeconds,
  alertCount,
  activeSensorCount,
}) => {
  const value = (() => {
    switch (kpi.id) {
      case 'alert_time':
        return latest?.status === 'critical'
          ? formatElapsedTime(elapsedSeconds)
          : kpi.value;
      case 'sensors_active':
        return activeSensorCount;
      case 'events_handled':
        return alertCount;
      default:
        return kpi.value;
    }
  })();

  return (
    <div
      style={{
        background: '#1a1a1a',
        border: '1px solid #2d2d2d',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: '600',
          color: '#9ca3af',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {kpi.label}
      </div>
      <div
        style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#3b82f6',
        }}
      >
        {value}
        {kpi.unit && <span style={{ fontSize: '14px', opacity: 0.7 }}>{kpi.unit}</span>}
      </div>
      {kpi.target && (
        <div
          style={{
            fontSize: '10px',
            color: '#6b7280',
          }}
        >
          Target: {kpi.target}{kpi.unit}
        </div>
      )}
    </div>
  );
};
