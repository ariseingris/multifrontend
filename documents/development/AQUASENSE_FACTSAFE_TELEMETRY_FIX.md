# AquaSense / FactSafe telemetry repair

Historical repair report: AquaSense generation, duration, sampling and viewport
were subsequently updated in [continuous simulation](AQUASENSE_CONTINUOUS_SIMULATION.md).
FactSafe behavior described here remains applicable.

Specification read in full: `documents/specifications/CODEX_FIX_AQUASENSE_FACTSAFE_TELEMETRY.md`
(found under docs rather than the repository root). Existing uncommitted work is
preserved; pre-repair sources were saved to
`/tmp/multifrontend-before-telemetry-repair.tar.gz`. Nothing was committed, pushed
or merged. Deleted projects were not restored.

## Diagnosis, with source references

The actual flow is:

```text
ScenarioControl → SimulationDashboard command(project, scenario, speed)
→ useDataBridge.send → server.handle_command / model registry
→ seeded elapsed-time generator → server telemetry/state/event broadcasts
→ useDataBridge project/session acceptance → bounded Zustand history/latest
→ MetricCard, LiveChart, ThresholdChart, insights and EventTimeline
```

Observed endpoint: `ws://localhost:8765`; frontend: `http://localhost:5173`.
No frontend random generator was enabled or added to hide backend failures.

Pre-fix references below identify line numbers in the saved source snapshot:

| Cause / verified fact | Pre-fix location | Evidence / fix |
| --- | --- | --- |
| The server serves one global project; opening FactSafe changes only the selected UI until Start | `simulator/server.py:33`, `:111`; `frontend/src/core/hooks/useDataBridge.ts:54` | Fresh FactSafe was connected while the server served AquaSense; other-project frames were correctly filtered. Actual Start with `project: factsafe` worked, returning two valid points in 1.4s at the old cadence. This was not a missing FactSafe class or registration. The page now identifies the active server project and opens its existing Start controls. |
| Start was hidden in a collapsed disclosure | `frontend/src/core/components/ScenarioControl.tsx:91` | Both dropdowns already had all three scenarios. New per-project initial-open configuration exposes them; no uncontrolled autoplay was introduced. |
| Reconnect/mount restored only the latest cached packet | `simulator/server.py:46` | It could start the plot at a late simulation minute with no previous history. New optional session bootstrap restores recorded samples and events, with original timestamps. |
| Sampling was sparse at fast speed | `simulator/server.py:179` (one-second real cadence) | A 120-minute run at 600x took ~12s, giving ~13 points. Minute-based projects now poll at 0.1s and emit up to 10Hz when accelerated, while 1x remains approximately 1Hz. Browser runs now retained 121 points. |
| History dropped the start of long sessions | `frontend/src/core/store.ts:26` | Keeping only the newest 1,000 points covered ~16.7 minutes at 1Hz. Ten-simulated-second buckets retain actual origin/latest and all phases within 1,000 points. |
| Axis labels could duplicate | `frontend/src/core/components/Charts.tsx:101` | Fixed one-decimal formatting lost distinctions in short windows. Session-time axes now start at zero and adapt precision to tick spacing. |
| Generator profiles differed from the repair specification | `simulator/scenario_models.py` AquaSense/FactSafe classes | Updated temperature/pH, factory baseline/gas/dust keyframes, secondary baselines, inclusive gas/dust entry thresholds and risk presentation. Existing risk calculation was reconciled and exposed as configurable demo normalization. |

Current implementation anchors: `simulator/scenario_models.py:221` (AquaSense),
`:277` (FactSafe), `:302` (risk); `simulator/server.py:54` (bootstrap), `:165`
(session archive), `:191` (cadence); `frontend/src/core/hooks/useDataBridge.ts:50`
(server target / session acceptance), `:69` (history);
`frontend/src/core/utils/telemetryPresentation.ts:8` (retention), `:24` (time ticks);
`frontend/src/core/components/ScenarioControl.tsx:41` (initial discovery of controls).

A short, almost-flat line over seconds at 1x is expected for minute-scale profiles.
It is not evidence of a missing scenario. High-speed playback now clearly shows
all phases, and reloading no longer discards the already-recorded trace.

## Implemented data behavior

AquaSense:

- `normal`: existing DO day-cycle keyframes retained; temperature now follows
  28.0 → 27.3 → 27.0 → 29.0 → 30.0°C at 0/30/60/90/120 minutes; pH follows
  7.9 → 7.7 → 7.7 → 8.0 → 8.2 at those minutes.
- `low_oxygen`: specified oxygen depletion/recovery keyframes, mildly varying
  temperature/pH, strict <4.5 warning / <3.5 critical, recovery hysteresis and an
  explicitly simulated intervention. No hardware aerator command is claimed.
- `sensor_fouling`: raw `do_mg_l` stays near 6.1 before minute 30, then drifts/spikes
  with a smooth onset of noise. Ground truth remains separately labeled 6.1 mg/L.
  Sensor quality degrades; raw excursions never confirm a pond oxygen emergency.
  Temperature and pH remain stable; ORP, salinity and diagnostics remain streamed.
  No filtered/AI output is fabricated.

FactSafe:

- `normal`: NH3 keyframes 6/9/7/10/8 ppm and PM2.5 18/22/20/25/19 µg/m³ at
  0/15/30/45/60 minutes. CO, H2S, CH4, PM10, temperature and humidity now fit the
  requested normal ranges.
- `gas_leak`: NH3 8/12/26/37/57/68/40/12 ppm at
  0/20/35/50/65/75/85/100 minutes, affecting Zone B. Dust/gases stay near baseline.
- `dust_event`: PM2.5 20/35/61/92/122/145/75/25 µg/m³ at those event minutes,
  affecting Zone D. NH3 stays near baseline and PM10 tracks PM2.5 at 1.5x.
- NH3 entries are >=30/50 ppm; PM2.5 entries >=55/100 µg/m³ with recovery
  hysteresis. Events depend on the event's own metric, not aggregate risk.
- Existing monotonic demo normalization is retained: clamp(gain × max(NH3 / NH3
  reference, PM2.5 / PM2.5 reference), 0, 100), default gain 80 and references
  50 ppm / 100 µg/m³. Zone mapping and synthetic background assumptions are
  documented in the simulator README. Effective configuration is published as
  `riskModel`; overall risk is the maximum zone score. This is not an EHS index.
- Card and chart both use emitted `metrics.risk_score`, equal to top-level
  `riskScore`. Risk card precision is integer; its semantic demo-score label is
  not a physical unit. All supporting gases/zone metrics remain available.

## Transport, controls, retention and layout

The backend remains the only simulation owner. Existing Start/Pause/Resume/Speed/
Reset commands and telemetry schema remain compatible; new metadata is optional.
AquaSense/FactSafe receive a `session_history` message with recorded telemetry and
up to 200 events, followed by compatibility cached telemetry with its original
timestamp. The bridge filters project/session IDs and rejects duplicate samples.
Reset changes session ID and clears archives. A displaced project view clears its
old session and identifies which project now owns the server.

Cadence is up to ten real samples/second when accelerated, with at least one
simulated second between emitted measurements; normal 1x and paused-state
heartbeats remain roughly 1Hz. Server and client bucket actual samples at ten
simulated seconds, preserving the initial measurement and the most recent sample.
The 120-minute maximum needs about 722 retained points at 1x, not unbounded arrays.
No historical sensor values are manufactured during render or reconnect.

The reusable Figma layout is preserved. Existing controls open on arrival for
these two projects. Missing data remains `—`; disconnect is shown separately from
stopped/paused/completed simulation state. DO, temperature and pH have distinct
axes, as do NH3, PM2.5 and risk. pH is unitless. Time is elapsed simulation minutes,
starting from zero, with unique tick labels even for very short runs.

## Changed files for this repair

- `simulator/scenario_models.py`: requested profiles, smooth fouling onset,
  corrected factory baselines, configurable risk defaults, inclusive high entries.
- `simulator/server.py`: target-aware recorded session bootstrap and adaptive
  sampling for the two minute-based projects.
- `simulator/telemetry_history.py` (new): bounded actual-sample archive.
- `simulator/Dockerfile`: includes the new archive module in the image.
- `frontend/src/core/utils/telemetryPresentation.ts` (new): formatting, real-sample
  retention and unambiguous elapsed-time axes; no data generator.
- `frontend/src/core/store.ts`, `types/index.ts`: optional history/risk metadata,
  retention and active-server target tracking.
- `frontend/src/core/hooks/useDataBridge.ts`: bootstrap acceptance, project/session
  isolation, displaced-session handling and send-failure feedback.
- `frontend/src/core/components/SimulationDashboard.tsx`, `Dashboard.tsx`,
  `ScenarioControl.tsx`, `Charts.tsx`: initial control discovery, actionable status,
  accurate axes/units and compatibility-preserving props.
- `frontend/src/projects/aquasense/config.ts`, `Dashboard.tsx`: session policy,
  unitless pH axis and useful per-metric display domains.
- `frontend/src/projects/factsafe/config.ts`, `Dashboard.tsx`: session policy,
  integer demo-score precision and transparent risk explanation.
- `simulator/tests/test_scenarios.py`: independent latest-spec fixtures, baselines,
  threshold boundaries, monotonic risk/timestamps and payload consistency.
- `simulator/tests/test_telemetry_history.py` (new): archive, reconnect/reset and
  FireScout protocol regression tests.
- `frontend/tests/telemetry-presentation.test.mjs` (new): real MetricCard SSR,
  missing/zero distinction, units, time ticks and two-hour retention checks.
- `README.md`, `frontend/README.md`, `simulator/README.md`, `docs/BUGBOOK.md` and this
  report: current behavior, formula, launch path and measured validation.

Other uncommitted files from other work remain preserved and are
not attributed to this repair. No dependency upgrades or `.env` changes were made.

## Validation results

| Check | Result |
| --- | --- |
| Backend/scenario/history tests | PASS: 21 tests, covering all nine existing scenarios plus new normal profiles/bounds, high-threshold equality, risk monotonicity/source consistency, timestamp ordering, archive/reset/reconnect and FireScout protocol preservation |
| Frontend Node tests | PASS: 3 test files, including existing routing/alert tests and new actual-card SSR / history / units / axis tests |
| TypeScript `tsc --noEmit` | PASS |
| Production build | PASS; existing non-fatal >500kB main-bundle warning remains |
| AquaSense `normal`, browser / real WebSocket | PASS: 121 points, 0–120 min, DO minimum ~5.19, temperature 27–30°C, pH 7.7–8.2, no warning events |
| AquaSense `low_oxygen` | PASS: 121 points, warning/critical/recovery/normal events; minimum DO ~2.99 mg/L; no runtime/console errors |
| AquaSense `sensor_fouling` | PASS: 121 points, degraded quality warning with observed DO ~3.33 at its minimum; no false pond-critical event; stable pH/temp |
| FactSafe `normal` | PASS: 61 points, 0–60 min; NH3 6→~10→8, PM2.5 18→~25→19, no warning events |
| FactSafe `gas_leak` | PASS: 101 points, 0–100 min; NH3 ~67.93 ppm peak, Zone B peak score 100, correct leak/recovery events |
| FactSafe `dust_event` | PASS: 101 points, 0–100 min; PM2.5 ~144.74 µg/m³ peak, Zone D peak score 100, correct dust/recovery events |
| Metric source / units | PASS: 3 actual charts per project; mg/L, °C, unitless pH, ppm, µg/m³, Risk score (0–100); every factory packet's two risk representations agree |
| Pause/resume/speed/reset | PASS in both AquaSense and FactSafe: frozen elapsed/count during pause, no retroactive speed jump, same resumed session, reset produces empty charts/zero elapsed/stopped |
| Reload/history restoration | PASS: FactSafe retained all 101 points and events after reload, with origin zero and unchanged latest timestamp |
| Socket disconnect/reconnect | PASS: UI showed Disconnected / No telemetry connection; paused reconnect retained timestamps and history count, with no manufactured reading |
| Switching active projects in separate tabs | PASS: displaced AquaSense cleared samples/events, became stopped and identified the FactSafe server target |
| Unique X tick labels | PASS: short-run unit tests and completed browser plots |
| FireScout source preservation | PASS: class source and frontend project files match the pre-repair snapshot exactly |
| FireScout browser regression | PASS: all 3 missions completed with 3 charts, expected candidate/link events, honest blackout, no runtime/console errors |
| Desktop/mobile visual check | PASS: repaired FactSafe captured at desktop and 390px; no mobile horizontal overflow; current shared layout retained |
| Python compile / Compose config / Git whitespace | PASS |
| Lint | BLOCKED by existing missing ESLint configuration/local dependency (system ESLint 6.4.0); no lint success claimed |

The onset-continuity test initially exposed a real fouling discontinuity at minute
30. The noise now ramps smoothly over minutes 30–35; the strict continuity test was
retained and passes. Old keyframe fixtures were replaced with independent values
from this repair specification, not relaxed to accept conflicting profiles.

No real hardware, video/model inference, certified exposure assessment, Docker
image runtime or multi-hour memory soak was tested. Full-session bucket bounds
were tested using 7,201 actual-format sample additions without waiting two hours.
Browser checks used the dev server; the production bundle was built separately.

## Launch both dashboards

One concise path, from the repository root when ports are free:

```bash
./quickstart.sh aquasense
```

It starts the simulator and frontend. Open:

- http://localhost:5173/?project=aquasense
- http://localhost:5173/?project=factsafe

The server is shared and supports both project IDs. **It serves one active
project/session at a time.** Choose the desired scenario in the initially open
Scenarios panel, select a speed, then **Run scenario**. Start selects the correct
server project. At 1x the curves advance in real time; use 600x for a complete
6–12 real-second demonstration. Opening a page alone does not invent telemetry or
automatically replace another running project.

The repaired local preview is left running on 5173/8765. If restarting manually,
use separate terminals from the repository root:

```bash
.venv/bin/python simulator/server.py --project aquasense
```

```bash
npm --prefix frontend run dev
```

To explicitly request standalone automatic FactSafe playback instead of starting
from the UI, stop the existing simulator first and run:

```bash
.venv/bin/python simulator/server.py --project factsafe --scenario gas_leak --speed 600 --autostart
```

Tests:

```bash
.venv/bin/python -m unittest discover -s simulator/tests -v
npm --prefix frontend test
npm --prefix frontend run build
```

Changes remain uncommitted on the existing working branch. No push, merge or commit
was performed; commit requires the user's approval.
