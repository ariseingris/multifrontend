# MultiFrontend frontend

React 18, TypeScript 5, Vite 5, Recharts and Zustand. Only AquaSense, FactSafe and
FireScout AI are active. No new UI framework is required.

## Setup

From the repository root:

```bash
npm --prefix frontend ci
npm --prefix frontend run dev
```

Start the simulator separately with `.venv/bin/python simulator/server.py`.
The frontend defaults to http://localhost:5173 and `ws://localhost:8765`.
`VITE_WS_URL` overrides the WebSocket address.

## Routing and selection

- `http://localhost:5173/?project=aquasense`
- `http://localhost:5173/?project=factsafe`
- `http://localhost:5173/?project=firescout`

`src/core/projects.ts` defines exactly:

```ts
type ProjectId = 'aquasense' | 'factsafe' | 'firescout';
```

A supported query value takes priority. An absent, empty or unsupported query falls
back to a supported `VITE_PROJECT`; otherwise it renders AquaSense. For example:

```bash
VITE_PROJECT=factsafe npm --prefix frontend run dev
```

The settings gear opens a dialog with only the three supported projects. A
selection navigates to the project's URL, disposing the old socket and all page
state. The bridge additionally filters project/session packets and clears stores
on session changes. Selecting a dashboard does not automatically start a scenario.

## Source structure

- `src/projects/aquasense/`: DO, water temperature, pH; supporting pond diagnostics.
- `src/projects/factsafe/`: NH3, PM2.5, derived zone risk; supporting gases/zones.
- `src/projects/firescout/`: synthetic detection confidence, thermal estimate, link.
- `src/core/components/SimulationDashboard.tsx`: shared composition and command wiring.
- `src/core/components/FigmaDashboard/`: shared layout, cards, shell and scoped CSS.
- `src/core/components/Charts.tsx`: LiveChart, ThresholdChart, Gauge.
- `src/core/components/ScenarioControl.tsx`, `EventTimeline.tsx`, `AlertDisplay.tsx`:
  playback, logs, alerts.
- `src/core/hooks/useDataBridge.ts`, `store.ts`, `types/`, `utils/`: shared transport,
  bounded stores, telemetry/alert/anomaly interfaces and formatting.

The existing Dashboard and Header components and their shared APIs remain
available. Metric names, units and project-specific presentation stay in project
configuration; rules and the canonical simulation clock stay in the simulator.

All scenario data is labeled SIMULATED. Unknown/non-finite measurements show `—`.
FireScout missing frames are not replaced by zero. Raw values, derived risk,
synthetic detections and ground truth are distinguished. There is no real model,
video feed or hardware integration in these demos.

## Controls

Open **Scenarios** in the footer, select a scenario and next-run speed, then Run.
Use 600x for fast AquaSense/FactSafe review or 10x for FireScout. Active speed,
Pause, Resume, Reset and completion are driven by backend acknowledgments. Reset
clears the current session's charts/alerts and records a reset event. Reconnection
can restore the cached last measurement with its original timestamp.

## Checks and production preview

```bash
npm --prefix frontend test
cd frontend
./node_modules/.bin/tsc --noEmit
npm run build
npm run preview
```

The Node test runner exercises the actual TypeScript routing module using the
existing TypeScript dependency. Browser checks cover rendering and simulator
interaction. `npm run lint` currently requires missing ESLint setup; no lint success
is implied. Vite's bundle-size warning is non-fatal.

The production preview URL printed by Vite accepts all three `?project=` values.
It still requires a separately running simulator. See [the cleanup report](../documents/development/KEEP_THREE_PROJECTS.md).


## Repaired telemetry behavior

AquaSense/FactSafe open Scenarios on arrival. If the simulator is connected but
stopped, select a scenario and **Run scenario**. If another project owns the single
server session, the page identifies it and offers the same explicit Start path.
No readings are invented before a matching project/session packet arrives.

The bridge restores the optional `session_history` bootstrap and filters every
sample/event by project and session. Stored history uses backend-provided sampling
metadata to retain actual samples across the entire 60–120 minute run; reconnect
preserves timestamps and events. Starting another project clears a displaced
AquaSense/FactSafe view's stale session and offers Start again.

X axes show elapsed simulation minutes from zero, with adaptive label precision
that avoids repeated ticks on short runs. Y axes remain metric-specific: mg/L,
°C, unitless pH, ppm, µg/m³, or Risk score (0–100). Risk cards use the emitted
`metrics.risk_score`, which agrees with `riskScore`; integer precision and the
semantic demo-score label do not imply a physical unit or calibrated safety index.
See [repair evidence and launch instructions](../documents/development/AQUASENSE_FACTSAFE_TELEMETRY_FIX.md).
