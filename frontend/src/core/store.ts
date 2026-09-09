import { create } from 'zustand';
import {
  TelemetryPoint,
  Alert,
  TimelineEvent,
  ScenarioState,
  ScenarioPhase,
  SystemStatus,
  DemoModeState,
  ProjectConfig,
} from '../types';

interface TelemetryStore {
  telemetry: TelemetryPoint[];
  addTelemetry: (point: TelemetryPoint) => void;
  clearTelemetry: () => void;
  setTelemetry: (points: TelemetryPoint[]) => void;
  getLatest: () => TelemetryPoint | null;
}

export const useTelemetryStore = create<TelemetryStore>((set, get) => ({
  telemetry: [],
  addTelemetry: (point: TelemetryPoint) =>
    set((state) => ({
      telemetry: [...state.telemetry.slice(-999), point], // Keep last 1000 points
    })),
  clearTelemetry: () => set({ telemetry: [] }),
  setTelemetry: (points: TelemetryPoint[]) => set({ telemetry: points }),
  getLatest: () => {
    const state = get();
    return state.telemetry.length > 0
      ? state.telemetry[state.telemetry.length - 1]
      : null;
  },
}));

interface AlertStore {
  alerts: Alert[];
  currentAlert: Alert | null;
  addAlert: (alert: Alert) => void;
  clearAlerts: () => void;
  clearCurrentAlert: () => void;
  setCurrentAlert: (alert: Alert | null) => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  currentAlert: null,
  addAlert: (alert: Alert) =>
    set((state) => ({
      alerts: [...state.alerts, alert],
      currentAlert: alert,
    })),
  clearAlerts: () => set({ alerts: [] }),
  clearCurrentAlert: () => set({ currentAlert: null }),
  setCurrentAlert: (alert: Alert | null) => set({ currentAlert: alert }),
}));

interface TimelineStore {
  events: TimelineEvent[];
  addEvent: (event: TimelineEvent) => void;
  clearEvents: () => void;
  setEvents: (events: TimelineEvent[]) => void;
}

export const useTimelineStore = create<TimelineStore>((set) => ({
  events: [],
  addEvent: (event: TimelineEvent) =>
    set((state) => ({
      events: [...state.events, event],
    })),
  clearEvents: () => set({ events: [] }),
  setEvents: (events: TimelineEvent[]) => set({ events }),
}));

interface ScenarioStore {
  scenario: ScenarioState;
  setScenario: (scenario: Partial<ScenarioState>) => void;
  resetScenario: () => void;
  startScenario: () => void;
  pauseScenario: () => void;
  resumeScenario: () => void;
  setPhase: (phase: ScenarioPhase) => void;
  setElapsed: (seconds: number) => void;
  setSpeed: (speed: number) => void;
}

const defaultScenario: ScenarioState = {
  name: 'normal',
  phase: 'normal',
  elapsedSeconds: 0,
  speed: 1,
  status: 'stopped',
};

export const useScenarioStore = create<ScenarioStore>((set) => ({
  scenario: defaultScenario,
  setScenario: (partial: Partial<ScenarioState>) =>
    set((state) => ({
      scenario: { ...state.scenario, ...partial },
    })),
  resetScenario: () => set({ scenario: { ...defaultScenario } }),
  startScenario: () =>
    set((state) => ({
      scenario: { ...state.scenario, status: 'running' },
    })),
  pauseScenario: () =>
    set((state) => ({
      scenario: { ...state.scenario, status: 'paused' },
    })),
  resumeScenario: () =>
    set((state) => ({
      scenario: { ...state.scenario, status: 'running' },
    })),
  setPhase: (phase: ScenarioPhase) =>
    set((state) => ({
      scenario: { ...state.scenario, phase },
    })),
  setElapsed: (seconds: number) =>
    set((state) => ({
      scenario: { ...state.scenario, elapsedSeconds: seconds },
    })),
  setSpeed: (speed: number) =>
    set((state) => ({
      scenario: { ...state.scenario, speed },
    })),
}));

interface SystemStore {
  status: SystemStatus;
  setStatus: (status: Partial<SystemStatus>) => void;
}

const defaultStatus: SystemStatus = {
  online: true,
  aiEngineActive: true,
  sensorCount: 0,
  dataStreamActive: true,
};

export const useSystemStore = create<SystemStore>((set) => ({
  status: defaultStatus,
  setStatus: (partial: Partial<SystemStatus>) =>
    set((state) => ({
      status: { ...state.status, ...partial },
    })),
}));

interface DemoModeStore {
  demoMode: DemoModeState;
  setDemoMode: (mode: Partial<DemoModeState>) => void;
}

export const useDemoModeStore = create<DemoModeStore>((set) => ({
  demoMode: {
    enabled: true,
    simulationActive: false,
  },
  setDemoMode: (partial: Partial<DemoModeState>) =>
    set((state) => ({
      demoMode: { ...state.demoMode, ...partial },
    })),
}));

interface ProjectStore {
  config: ProjectConfig | null;
  setConfig: (config: ProjectConfig) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  config: null,
  setConfig: (config: ProjectConfig) => set({ config }),
}));
