# Figma dashboard integration

> Historical planning/delivery reference preserved after the three-project cleanup.
> Only AquaSense, FactSafe and FireScout AI are active. Commands and project lists
> below describe an earlier repository state; use [the current README](../../README.md)
> and [cleanup report](KEEP_THREE_PROJECTS.md) for current paths and behavior.

> Historical report for the first layout integration. The subsequent scenario
> implementation changes simulator, project selection, playback state and FactSafe/FireScout
> integration. See [current scenario delivery report](MULTI_PROJECT_SCENARIOS_DELIVERY.md).

Implemented on `feat/figma-dashboard`, using the four files in
`documents/references/figma-react-patch.zip` as a starting point and the supplied screenshot as a
visual reference. The uploaded bead-pattern image is copied into a bundled logo
asset. Original uploads remain untouched. No dependencies or backend changes were
needed. The result follows the reference layout and colors; it is not a claim of
pixel-perfect reproduction.

## Behavior and architecture

AquaSense opts into `<Dashboard variant="figma" connected={isConnected}
wsUrl={wsUrl}>`. The default remains `classic`, preserving App.tsx's existing
`VITE_PROJECT` selection and the other dashboards. Existing scenario callbacks
still send `start_scenario`, `pause`, `resume`, `reset`, and `set_speed` over the
same WebSocket connection.

The shared Figma shell supplies the logo and settings gear, a main content slot,
and a muted blue footer with an expandable Scenarios control on the left.
Settings opens a keyboard-accessible native dialog with actual connection
information; Escape or Close dismisses it.

`FigmaDashboardContent` accepts project-independent metric, chart, description,
and log slots. `MetricCard` and `ChartCard` are also exported from the existing
component barrel. Supply three chart slots in display order; the first two occupy
the first row, followed by the third chart and Description. Logs span both columns.
The layout stacks on narrow screens, with all styles scoped to Figma classes.

AquaSense's `dashboardMetrics.ts` defines the primary order using the identifiers
in `config.ts`: `do_mg_l`, `water_temperature_c`, `ph`. Labels, precision, units and
chart ranges come from that configuration. Oxygen card alerts use the same
configured warning/critical thresholds as the simulator. Demo ranges are labeled
as such. ORP, salinity, probe quality, signal stability, and the existing
oxygen-derived risk gauge are available under **More water quality & diagnostics**.
Supporting metrics use separate charts so incompatible units do not share an axis.
The single configured Pond A is identified directly; the former Pond B/C buttons
had no switching handlers or corresponding device data.

The patch's summary text for logs was replaced with the real `EventTimeline`.
Missing or non-finite measurements show an em dash; charts show an explicit empty
state. No fallback sensor data is generated. A disconnected simulator disables
playback controls and labels any retained measurements as the last received sample.

Browser testing exposed a StrictMode reconnect race in the shared bridge. Each
effect now owns its socket and reconnect timer, preventing retired sockets from
starting additional reconnect loops. Details are recorded in BUGBOOK entry 18.

## Files

| File | Change |
| --- | --- |
| `frontend/src/core/components/FigmaDashboard/index.tsx` | Added reusable content layout, MetricCard and ChartCard adapted from the ZIP |
| `frontend/src/core/components/FigmaDashboard/figma-dashboard.css` | Added scoped, responsive layout and shell styles |
| `frontend/src/core/components/FigmaDashboard/Shell.tsx` | Added header, settings dialog and scenario footer slots |
| `assets/shared/logos/dashboard-logo.png` | Added bundled copy of the supplied logo image |
| `frontend/src/projects/aquasense/dashboardMetrics.ts` | Added project metric order, formatting and status adapter |
| `frontend/src/projects/aquasense/Dashboard.tsx` | Integrated the design with existing telemetry, diagnostics, charts and callbacks |
| `frontend/src/core/components/Dashboard.tsx` | Added optional Figma variant; classic remains the default |
| `frontend/src/core/components/Charts.tsx` | Added optional light styling for LiveChart, ThresholdChart and Gauge, and a visible normal range band in the light ThresholdChart |
| `frontend/src/core/components/EventTimeline.tsx` | Added optional light styling and responsive event text wrapping |
| `frontend/src/core/components/ScenarioControl.tsx` | Added compact accessible footer presentation using the existing handlers |
| `frontend/src/core/components/index.ts` | Exported shared Figma content and cards |
| `frontend/src/core/hooks/useDataBridge.ts` | Fixed StrictMode socket/reconnect cleanup |
| `frontend/index.html` | Referenced the bundled logo as favicon, avoiding a missing favicon request |
| `frontend/README.md` | Added preview instructions |
| `docs/BUGBOOK.md` | Recorded the connection lifecycle bug and prevention checks |
| `documents/development/FIGMA_DASHBOARD.md` | Added this integration and validation report |

Reused: Dashboard, ScenarioControl, EventTimeline, AlertDisplay, LiveChart,
ThresholdChart, Gauge, useDataBridge, existing Zustand stores and metric types.
App.tsx, project configuration, package manifests, other project dashboards, and
the simulator were not modified.

## Validation performed (2026-10-23)

| Check | Result |
| --- | --- |
| `cd frontend && ./node_modules/.bin/tsc --noEmit` | PASS |
| `cd frontend && npm run build` | PASS, default project selection |
| `cd frontend && VITE_PROJECT=aquasense npm run build` | PASS |
| `cd frontend && npm run lint` | BLOCKED: existing script finds system ESLint 6.4.0; repository has no ESLint configuration or local ESLint dependency |
| Available repository tests | No test script or test suite is defined; `npm run test --if-present` has nothing to run |
| AquaSense browser runtime | PASS: no JavaScript exceptions or unhandled promise rejections in tested flows |
| Empty telemetry state | PASS: unavailable measurements and chart empty states, no invented values |
| Live telemetry | PASS: card values matched real simulator frames; all three primary charts rendered |
| Scenario control commands | PASS: captured start/project/scenario/speed, pause, resume, reset, and set_speed commands |
| Pause/resume | PASS: telemetry count and displayed elapsed time stayed constant during pause, then resumed |
| Reset | PASS: charts, values, timeline, and current alert cleared; timer returned to zero |
| Low oxygen scenario | PASS: normal, critical (about 2.6–3.2 mg/L), warning, and normal recovery frames; alert represented in Logs |
| Sensor fouling | PASS: diagnostics showed probe quality around 42%, reduced signal stability, and maintenance insight |
| Connection lifecycle | PASS: one simulator connection after StrictMode mount; disconnect state and disabled playback buttons; successful reconnect after server restart |
| Settings and diagnostics | PASS: dialog opens/closes with Escape; expandable diagnostics and supporting charts render |
| Responsive layout | PASS: 320, 390, 768, 1440 and 1920px widths, no horizontal overflow; desktop/mobile screenshots inspected; mobile scenario popup fits viewport |
| FactSafe regression | PASS: original layout and charts rendered, live gas telemetry received, start/pause/resume/speed/reset commands exercised; no runtime exceptions |
| History bounds | PASS: 1,200 additions retained 1,000 telemetry points, 200 events and 100 alerts; original state restored afterward |
| `git diff --check` | PASS |

The existing Python environment provided websockets 17.1. The simulator was run as
a separate process; frontend fallback data was not used as evidence. Console
connection-refused errors were expected while the simulator was intentionally
offline; connected browser flows had no runtime exceptions. Testing used existing
installed dependencies, so dependency installation was unnecessary.

## Remaining limitations

- Vite warns that the main JavaScript bundle exceeds 500 kB. Build succeeds;
  bundle splitting was outside this layout integration.
- The repository's lint setup needs a separate ESLint dependency/configuration
  decision before linting can pass. No new testing framework was installed.
- Runtime checks covered AquaSense and FactSafe. Remaining dashboards were
  typechecked and bundled, but not individually exercised in a browser.
- History replay verifies caps, not a multi-hour memory soak. No extended soak or
  production-preview server browser run was performed.
- Existing playback state/timing is maintained locally after commands. The current
  simulator protocol does not acknowledge playback commands or send authoritative
  elapsed-time/completion state; this integration preserves that behavior.
- Only AquaSense opts into the Figma shell. Other projects can reuse its shared
  components incrementally without replacing their existing layouts.

## Preview

Run these in separate terminals from the repository root:

```bash
.venv/bin/python simulator/vitalchain_simulator.py --project aquasense --scenario normal --speed 1
```

```bash
cd frontend
VITE_PROJECT=aquasense npm run dev
```

Open http://localhost:5173. For FactSafe, restart the frontend with
`VITE_PROJECT=factsafe npm run dev` and select/run its scenario. Only one simulator
process should listen on port 8765; the existing server can switch projects via
the frontend's start command.

Production preview, from `frontend/`:

```bash
VITE_PROJECT=aquasense npm run build
npm run preview
```

Open the URL printed by Vite (usually http://localhost:4173). The simulator still
runs separately. Local validation servers were stopped after testing.

## Git handoff

Branch: `feat/figma-dashboard`. Changes are uncommitted. No push or merge was
performed. Original root uploads are intentionally untracked; do not include them
in a source-only commit unless desired.

Suggested commit message:

```text
feat: integrate reusable Figma dashboard for AquaSense
```
