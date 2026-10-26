import { useEffect, useState, type ReactNode } from 'react';
import { Dashboard } from './Dashboard';
import { AlertMessage } from './AlertMessage';
import { LiveChart, ThresholdChart } from './Charts';
import { EventTimeline } from './EventTimeline';
import { FigmaDashboardContent, type StatusMetric } from './FigmaDashboard';
import { useDataBridge } from '../hooks/useDataBridge';
import { useSimulationStore, useTelemetryStore } from '../store';
import type { MetricConfig, ProjectConfig, SimulationState, TelemetryPoint } from '../types';
import { displayValue } from '../utils/telemetryPresentation';
export { displayValue } from '../utils/telemetryPresentation';
import { formatElapsedTime, formatTime } from '../utils/formatting';

export interface SimulationContext {
  latest: TelemetryPoint | null;
  state: SimulationState | null;
  stale: boolean;
}

export interface PrimaryMetric {
  metric: MetricConfig;
  kind: 'raw sensor' | 'derived score' | 'synthetic detection' | 'diagnostic' | 'thermal estimate';
  axisLabel?: string;
  domain?: [number, number];
  thresholdDirection?: 'low' | 'high';
  comparison?: MetricConfig;
  comparisonRule?: string;
}

type Props = {
  config: ProjectConfig;
  primary: [PrimaryMetric, PrimaryMetric, PrimaryMetric];
  insight: (context: SimulationContext) => ReactNode;
  details?: (context: SimulationContext) => ReactNode;
};

/** Shared presentation and command wiring. The simulator owns the clock and rules. */
export function SimulationDashboard({ config, primary, insight, details }: Props) {
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8765';
  const { send, isConnected } = useDataBridge(wsUrl, config.id);
  const state = useSimulationStore((store) => store.state);
  const receivedAt = useSimulationStore((store) => store.receivedAt);
  const serverProject = useSimulationStore((store) => store.serverProject);
  const commandError = useSimulationStore((store) => store.commandError);
  const history = useTelemetryStore((store) => store.telemetry);
  const latest = history[history.length - 1] ?? null;
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    // This timer only detects a stale transport. It never advances simulation time.
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, []);
  const stale = !isConnected || (!!receivedAt && now - receivedAt > 3500) || state?.telemetryAvailable === false;
  const context = { latest, state, stale };
  const cards: StatusMetric[] = primary.map(({ metric, kind }) => {
    const value = latest?.metrics[metric.key];
    const previous = history[history.length - 2]?.metrics[metric.key];
    const available = value !== undefined && Number.isFinite(value);
    const trend = available && previous !== undefined && Number.isFinite(previous)
      ? Math.abs(value - previous) < .001 ? '→ steady' : value > previous ? '↑ rising' : '↓ falling' : '';
    const quality = latest?.quality?.[metric.key];
    const measured = latest?.source === 'sensor';
    return {
      id: metric.key, label: metric.name, unit: metric.unit, value: displayValue(value, metric.precision),
      tone: latest?.metricStatus?.[metric.key] ?? 'normal',
      status: `${measured ? 'SENSOR' : 'SIMULATED'} · ${kind} · ${!available ? quality === 'missing' ? 'NO FRAME / MISSING' : 'No telemetry' : stale ? 'STALE / LAST KNOWN' : state?.status === 'paused' ? 'PAUSED' : quality === 'degraded' ? 'degraded / unverified' : trend || 'sample received'}`,
    };
  });
  const charts = primary.map(({ metric, thresholdDirection, comparison, comparisonRule, axisLabel, domain }) => {
    const hasData = history.some((point) => Number.isFinite(point.metrics[metric.key]));
    const thresholds = config.thresholds[metric.key];
    const baseline = comparison ? latest?.metrics[comparison.key] : undefined;
    const delta = comparisonRule ? state?.rules?.[comparisonRule] : undefined;
    const reference = baseline !== undefined && delta !== undefined ? { value: baseline + delta, label: `Demo ΔT ${delta} ${metric.unit}` } : undefined;
    const keys = comparison ? [metric.key, comparison.key] : [metric.key];
    const labels = comparison ? { [metric.key]: metric.name, [comparison.key]: comparison.name } : { [metric.key]: metric.name };
    return {
      id: metric.key, title: `${metric.name}${metric.unit ? ` · ${metric.unit}` : ''}`,
      children: !hasData ? <p className="fdb-empty">No telemetry. Open Scenarios and run a simulation.</p>
        : thresholdDirection && thresholds ? <ThresholdChart theme="light" metricKey={metric.key} unit={metric.unit}
            timeUnit={config.simulationTimeUnit} sessionTime={config.sessionHistory} windowSeconds={config.chartWindowSeconds} axisLabel={axisLabel} domain={domain} height={210} normalMin={metric.normalMin} normalMax={metric.normalMax}
            warningThreshold={thresholds.warning} criticalThreshold={thresholds.critical} />
        : <LiveChart theme="light" metricKeys={keys} labels={labels} reference={reference}
            showLegend={!!comparison} unit={metric.unit} axisLabel={axisLabel} sessionTime={config.sessionHistory} windowSeconds={config.chartWindowSeconds} domain={domain ?? [metric.min, metric.max]} timeUnit={config.simulationTimeUnit} height={210} />,
    };
  }) as Parameters<typeof FigmaDashboardContent>[0]['charts'];
  const command = (type: string, extra: Record<string, unknown> = {}) => {
    if (!send({ type, project: config.id, ...extra })) useSimulationStore.getState().setCommandError(`Simulator disconnected. Run the server, then reconnect and retry ${type}.`);
  };
  return <Dashboard projectConfig={config} variant="figma" authoritative hasSession={state !== null} connected={isConnected} wsUrl={wsUrl}
    onScenarioStart={(scenario, speed) => command('start_scenario', { scenario, speed })}
    onScenarioPause={() => command('pause')} onScenarioResume={() => command('resume')}
    onScenarioReset={() => command('reset')} onSpeedChange={(speed) => command('set_speed', { speed })}>
    <FigmaDashboardContent metrics={cards} charts={charts} logs={<EventTimeline theme="light" limit={50} />}
      insight={<>
        <p><strong>{config.description}</strong></p>
        <p role="status">{!isConnected ? 'Simulator disconnected · No telemetry connection' : config.sessionHistory && serverProject && serverProject !== config.id
          ? `Connected to simulator · Currently serving ${serverProject}. Choose a scenario below and Start ${config.name}.`
          : stale && latest ? 'STALE / NO SIGNAL · last known telemetry'
          : !state || state.status === 'stopped' ? config.sessionHistory ? `Connected · ${config.name} scenario stopped. Choose a scenario in the open Scenarios panel and Run scenario.` : 'Connected · Start this project’s scenario' : `SIMULATED · ${state.status}`}</p>
        {state && <p><strong>Scenario:</strong> {config.scenarios.find((item) => item.id === state.scenario)?.name ?? state.scenario}<br />
          <strong>Simulation time:</strong> {formatElapsedTime(state.elapsedSimSeconds)}{state.continuous ? ' · continuous' : ` / ${formatElapsedTime(state.durationSeconds)}`} · {state.speed}x
          {state.continuous && <><br /><strong>Phase:</strong> {state.phase.replace(/_/g, ' ')}<br />
            <strong>Active real time:</strong> {formatElapsedTime(state.realElapsedSeconds ?? 0)} · 60 simulated minute chart window</>}</p>}
        {latest && <p><small>Last sample: Sim {formatElapsedTime(latest.elapsedSimSeconds ?? 0)} · received {formatTime(latest.timestamp)}</small></p>}
        {commandError && <AlertMessage message={`Command rejected: ${commandError}`} />}
        {insight(context)}
        {details && <details><summary>More metrics &amp; diagnostics</summary>{details(context)}</details>}
      </>} />
  </Dashboard>;
}
