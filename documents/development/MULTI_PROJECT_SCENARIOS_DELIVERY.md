# Multi-project scenarios delivery

> Historical planning/delivery reference preserved after the three-project cleanup.
> Only AquaSense, FactSafe and FireScout AI are active. Commands and project lists
> below describe an earlier repository state; use [the current README](../../README.md)
> and [cleanup report](KEEP_THREE_PROJECTS.md) for current paths and behavior.

Implementation of `documents/specifications/MULTIFRONTEND_SCENARIOS_CODEX_SPEC.md` (the specification
was found under `docs/`, not the repository root). Feature branch:
`feat/multi-project-scenarios`. Existing uncommitted Figma integration and uploaded
ZIP/images/specification were preserved. No commit, push or merge was performed.

## Implemented behavior

| Project | Scenarios | Canonical duration | Primary cards/charts |
| --- | --- | --- | --- |
| AquaSense | `normal`, `low_oxygen`, `sensor_fouling` | 7,200 seconds / 120 simulated minutes each | DO mg/L, water temperature °C, pH |
| FactSafe | `normal` | 3,600 seconds / 60 simulated minutes | NH3 ppm, PM2.5 µg/m³, unified zone risk (derived demo score) |
| FactSafe | `gas_leak`, `dust_event` | 6,000 seconds / 100 simulated minutes each | Same three metrics |
| FireScout AI | `routine_recon`, `victim_hotspot`, `smoke_link_loss` | 120 simulated seconds each | Synthetic confidence %, thermal estimate °C, UAV link diagnostic % |

FireScout had no implementation in `frontend/src` or `simulator`; its project and
engine were added after inspection. AquaSense/FactSafe scenario identifiers remain
stable. Their older simulator curves used seconds, lacked the specified recovery,
and did not match the supplied keyframes. They now follow the specification's
minute-based curves. FireScout uses second-based curves.

### Simulator and transport

- `scenario_engine.py` provides an accumulating monotonic clock. A speed change
  accounts for elapsed time at the old speed before applying the new speed; it
  cannot retroactively rescale a session. Legacy projects also use this clock.
- `scenario_models.py` implements deterministic smooth interpolation, seed-based
  continuous noise, bounded values, persistent/hysteretic rules, transition events,
  and completion exactly once. Rules are evaluated each simulated second even
  when accelerated transport sampling skips intermediate seconds.
- Start creates a fresh session and first sample. Pause freezes time and emits no
  new telemetry. Resume continues the same seed/session. Reset clears per-session
  event/rule state and waits for Start. Completion stops telemetry emission.
- The original WebSocket commands and numeric metric contract remain supported.
  New optional metadata adds project/session IDs, elapsed simulation seconds and
  minutes, source, quality, metric status, sensor status, and explicit ground truth.
  New playback acknowledgments use `simulation_state` with `source: simulator_state`.
- Register/reconnect can restore an actual cached sample with its original
  timestamp. The bridge rejects duplicate/out-of-order samples in that session.
  Backend and frontend distinguish this from a fresh measurement.
- Source filtering and session boundaries prevent mixed-project charts/events.
  Start/reset acknowledgments clear chart, event and current-alert state. Recovery
  events clear the current alert while preserving alert/event history.
- AquaSense fouling streams an observed raw signal and separate sensor quality;
  its synthetic pond ground truth is separate metadata. It never turns raw probe
  noise into a confirmed pond oxygen emergency. No filter/AI is claimed.
- FactSafe retains all secondary gases, dust, microclimate and zone metrics. Risk is
  calculated centrally in the simulator; gas affects Zone B, dust affects Zone D.
  PM10 follows PM2.5. Normalized gas severity is retained. The unverified hardcoded
  100% sensor-health display was replaced with unavailable/synthetic information.
- FireScout candidates require >=80% for three consecutive synthetic one-second
  frames. Hotspots use persistent background-relative ΔT, not an absolute fire or
  victim conclusion. Link quality uses five-second persistence and hysteresis.
  Default rules can be overridden through `FireScoutSimulator(..., rules={...})`.
- FireScout sends **no telemetry** during simulated seconds 78–90 of link loss.
  An expressly synthetic state channel remains available to show STALE / NO SIGNAL.
  Thermal, detection, background-temperature and candidate-count measurements are
  omitted while frames are unavailable (70–94s); they are never converted to zero.

### Frontend and reuse

`SimulationDashboard` shares the Figma shell, three cards, three chart slots,
Description, diagnostics, event logs and controls. Project components supply metric
configuration and insights. All three projects reuse Dashboard, LiveChart,
ThresholdChart, Gauge where applicable, EventTimeline, ScenarioControl,
AlertDisplay, Zustand stores and useDataBridge. All styling remains scoped to the
Figma shell; other project dashboards retain their classic layout.

The frontend consumes backend playback state; these three dashboards have no
simulation-advancement timer. A 500ms UI timer only detects a stale transport.
Stopped/completed controls label a local **Speed for next run** preference; active
speed is acknowledged by the backend. This also permits opening a different
project before the single simulator switches to it.

Charts use canonical simulation time on X and physical/demo units on Y. DO and
factory thresholds are visible and labeled as demo assumptions. FactSafe's
high-threshold metric bounds were normalized to agree with `thresholds`; AquaSense
DO warning/critical lower bounds now agree at 4.5/3.5. The FireScout thermal chart
includes the synthetic background series and the backend-configured ΔT reference.
Cards show SIMULATED, measurement kind, trend or missing/stale/paused state.

AquaSense retains ORP, salinity, probe quality, signal stability, pond identity and
an explicitly derived risk gauge in diagnostics. FactSafe retains all other gases,
PM10, temperature, humidity, zone risk and normalized severity in diagnostics.
FireScout shows instantaneous synthetic candidate count, battery, flight time,
last-seen simulation time, synthetic telemetry age and unavailable video/GPS data.
There is no real video feed or model inference.

EventTimeline displays simulation time and up to 50 recent events in the new
layout (store remains capped at 200). Its animation has a unique name and respects
reduced motion, avoiding collision with alert animations. Alert dismissal has an
accessible button name. Native settings dialogs support Escape/Close.

## File inventory

New files for this implementation:

- `simulator/scenario_engine.py`
- `simulator/scenario_models.py`
- `simulator/tests/test_scenarios.py`
- `frontend/src/core/components/SimulationDashboard.tsx`
- `frontend/src/projects/firescout/config.ts`
- `frontend/src/projects/firescout/Dashboard.tsx`
- `documents/development/MULTI_PROJECT_SCENARIOS_DELIVERY.md`

Modified for this implementation, including adaptations of prior uncommitted work:

- `.gitignore` (nested simulator test bytecode caches)
- `README.md`, `frontend/README.md`, `simulator/README.md`
- `simulator/vitalchain_simulator.py` (registry, transport, acknowledgments, new CLI options)
- `frontend/src/App.tsx` (FireScout route and optional URL project override)
- `frontend/src/core/types/index.ts`, `frontend/src/core/store.ts`
- `frontend/src/core/hooks/useDataBridge.ts`
- `frontend/src/core/components/Dashboard.tsx`, `ScenarioControl.tsx`, `Charts.tsx`, `EventTimeline.tsx`, `AlertDisplay.tsx`, `index.ts`
- `frontend/src/core/components/FigmaDashboard/figma-dashboard.css`
- `frontend/src/projects/aquasense/config.ts`, `Dashboard.tsx`, `dashboardMetrics.ts`
- `frontend/src/projects/factsafe/config.ts`, `Dashboard.tsx`
- `docs/BUGBOOK.md`, `documents/development/FIGMA_DASHBOARD.md` (historical-report annotation)

Prior Figma files retained in this working tree: `FigmaDashboard/index.tsx`,
`FigmaDashboard/Shell.tsx`, `assets/shared/logos/dashboard-logo.png`, and the favicon
reference in `frontend/index.html`. The original root uploads and the user's
specification are untouched. Package manifests, lockfiles and `.env` files were not
changed. Other project dashboard/config source files were not rewritten.

## Validation

| Check | Result |
| --- | --- |
| `python -m unittest discover -s simulator/tests -v` using repository `.venv` | PASS: 16 tests, including parameterized checks for all nine scenarios |
| Complete deterministic model traces | PASS: repeated seeds produce identical metrics/events; bounded finite numbers and expected keyframes; units/config durations checked |
| Threshold/persistence/hysteresis | PASS: water vs sensor fault; gas vs dust; candidate debounce; link loss/recovery |
| Registry / transport unit tests | PASS: all nine IDs start and complete; one completion event, no packets while paused/blackout, invalid commands rejected, sessions reset |
| Clock and cache tests | PASS: no retrospective speed jump; pause/resume/reset; legacy clock regression; cached timestamp retained |
| AquaSense browser scenarios | PASS: all three selected and completed through real WebSocket telemetry; three charts each; normal/no false alarms, oxygen critical/recovery, separate fouling warning |
| FactSafe browser scenarios | PASS: all three completed; three charts each; correct gas/dust events, no mixed-project history |
| FireScout browser scenarios | PASS: all three completed; synthetic candidate/hotspot events; no candidate in routine or smoke runs |
| FireScout outage in browser | PASS: STALE / LAST KNOWN during blackout, no packets in blackout, missing thermal/confidence cards show `—`, then link recovery |
| Backend-authoritative UI control checks | PASS: pause left elapsed time and sample count unchanged; changing paused speed did not move time; resume retained session; reset cleared samples; one socket per mounted dashboard |
| Reconnect in browser | PASS: buttons disabled while disconnected; cached sample timestamp and history count preserved after reconnect |
| Legacy browser regression | PASS: VitalChain door-open telemetry, classic layout, charts and run/pause/resume/speed/reset controls; no runtime/console errors |
| Other legacy models | PASS: VitalChain, PulseGuard, DataCool, Hirdop, PAM finite metric/status/control and clock tests |
| Responsive visual checks | PASS: all three dashboards at 320/390/768/1440px without horizontal overflow; desktop/mobile screenshots inspected, popups fit and settings dialogs close with Escape |
| TypeScript `tsc --noEmit` | PASS |
| `npm run build` | PASS |
| `npm run lint` | BLOCKED by existing missing ESLint configuration/local dependency; system ESLint 6.4.0 is found |
| Frontend test script | Not defined; `npm run test --if-present` has nothing to run; browser checks performed separately |
| `git diff --check` | PASS |

No new dependencies were required. Vite still warns about its >500kB main bundle;
the production build succeeds. The installed websockets 17.1 emits a deprecation
warning for the existing legacy protocol type import. There are no connected-flow
browser runtime or console errors in the validated scenarios. Intentional connection
closures were tested separately. History remains bounded by existing store caps:
1,000 telemetry points, 200 events, 100 alerts. No multi-hour memory soak or real
sensor, drone, filter, model or hardware-in-the-loop test was performed.

## Preview and tests

The local dev server is left running at http://localhost:5173 with the simulator on
port 8765 for review. Open:

- [AquaSense](http://localhost:5173/?project=aquasense)
- [FactSafe](http://localhost:5173/?project=factsafe)
- [FireScout AI](http://localhost:5173/?project=firescout)

Use **Scenarios** to select the scenario and run it. For quick review, choose 600x
for AquaSense/FactSafe or 10x for FireScout. Only one project/session is active per
simulator; starting a project switches that server's active session. Viewing another
project does not silently start it. No extra header navigation button was added.
`VITE_PROJECT` still supplies the default when no URL override is given.

If the processes have stopped, run these from the repository root in separate
terminals:

```bash
.venv/bin/python simulator/vitalchain_simulator.py --project aquasense
```

```bash
cd frontend
npm run dev
```

For an explicit standalone scenario, for example:

```bash
.venv/bin/python simulator/vitalchain_simulator.py --project firescout --scenario victim_hotspot --speed 10 --seed 1729 --autostart
```

Stop the existing simulator before using that standalone command on port 8765.
Without `--autostart`, the three new demos await Start in the UI. Their CLI scenario
arguments choose a configuration rather than silently autoplaying.

```bash
.venv/bin/python -m unittest discover -s simulator/tests -v
cd frontend
./node_modules/.bin/tsc --noEmit
npm run build
npm run preview
```

Production preview uses the URL printed by Vite (usually port 4173); the same
`?project=` overrides work there. It still needs the simulator separately. The
production bundle was built; browser checks used the dev server.

## Remaining limitations and Git

All nine scenarios are synthetic demonstrations. No model accuracy, real rescue,
regulatory compliance or hardware feedback is asserted. Single-server global
project selection is inherited from the current architecture; simultaneous isolated
project sessions would require a separate transport/session design.

The lint setup remains incomplete. No full browser regression of every scenario
in the other legacy projects or long-duration memory soak was performed. Their
models were tested and source compiled, and VitalChain was exercised in-browser.

The working tree is intentionally uncommitted on `feat/multi-project-scenarios`.
Untracked uploads and the supplied spec remain preserved. Review the diff before
committing; nothing has been pushed or merged. Suggested commit message:

```text
feat: add deterministic AquaSense FactSafe and FireScout scenarios
```
