# AquaSense continuous synthetic simulation

This change supersedes the earlier AquaSense fixed temperature/pH keyframes and
120-minute completion behavior. FactSafe and FireScout project files and their
model classes are unchanged, verified against the pre-change source archive.
Existing working-tree changes were preserved on `chore/keep-three-projects`.
No commits, pushes or merges were made. A source backup is available locally at
`/tmp/multifrontend-before-continuous-aqua.tar.gz`.

## Diagnosis

- The shared `noise()` generator uses `sin(seconds * 0.017 + phase)`, repeating
  every 369.6 simulated seconds. AquaSense temperature/pH in the oxygen/fouling
  scenarios used that periodic signal directly. The normal scenario instead used
  two-hour temperature/pH keyframes; neither represented a continuous environment.
- The monotonic clock clamped elapsed time to the scenario duration. Evaluation
  then set `completed`, and the server suppressed subsequent telemetry.
- The session axis grew from zero, while history buckets preserved the origin;
  there was no separate rolling viewport/diagnostic retention policy.

## Model and lifecycle

`simulator/pond_environment.py` supplies seeded daily light and multi-hour weather
forcing. Water temperature follows ambient conditions with a three-hour response
time. pH follows light, water temperature and weather with a 75-minute response;
true DO follows light/temperature/weather with a 65-minute response. Small smooth
seeded variations add temporally correlated measurement variability. Integration
uses fixed simulated minute steps and interpolation, independent of speed or
telemetry sampling. Only 128 recent environment states are cached; older queries
replay deterministically. This is a **plausible synthetic demo**, not scientifically
validated pond data, a validated correction algorithm, or real sensor input.

- `normal`: naturally varying, stable pond conditions with no synthetic emergencies.
- `low_oxygen`: existing DO decline, strict warning below 4.5 mg/L and critical
  below 3.5 mg/L, hysteresis, intervention/recovery. After minute 120 it blends
  smoothly into the shared environment. The scripted event never automatically
  repeats.
- `sensor_fouling`: retains progressively degraded raw DO and quality. Ground truth
  comes from the separate pond environment. Degradation becomes a persistent
  `maintenance_required` state with an actual simulated warning. There is no
  automatic repair or validated filter; Reset starts a new session/probe.
- ORP, salinity, metric identifiers and units retain their existing generation.

AquaSense defaults to continuous playback. Its `durationSeconds=7200` identifies
the scripted phase, not a clock limit. Post-script phase is `monitoring` or
`maintenance_required`. The existing running/paused/stopped controls remain;
Reset stops and clears the session and returns its elapsed time to zero.
`realElapsedSeconds` excludes pauses and is displayed separately from simulated
time. `continuous:false` on Start or CLI `--finite` provides finite compatibility.
FactSafe and FireScout retain their finite clocks and completion semantics.

## Telemetry, charts, retention

The backend evaluates every simulated second, independently of WebSocket output,
so accelerated clock steps preserve warning/critical/recovery transitions. AquaSense
emits at most five telemetry packets per real second, approximately one at 1x.
Speed changes account for time spent at the old speed; resume resets the monotonic
reference to prevent paused wall time being added.

The existing LiveChart/ThresholdChart and Zustand architecture now accept an
optional window policy. AquaSense displays the latest **60 simulated minutes**,
clips older rendered points and continues scrolling beyond minute 120. Older
actual samples stay in the diagnostic history until they expire. Other projects
retain their existing axis behavior.

Default AquaSense retention: **6 simulated hours**, **30-second sample buckets**,
**1,000 points maximum**, bounded on both server and frontend. Sampling can be
coarser at high speed; no synthetic interpolated measurements are sent to fill
buckets. Retention options are configurable independently of the 60-minute view:

```bash
.venv/bin/python simulator/server.py --project aquasense --history-hours 12 --history-bucket-seconds 30 --history-max-points 1500
```

Metadata propagates the server policy to clients. Reconnection restores the actual
archived packets/events with their original timestamps and the actual active
AquaSense alert. Historical catch-up alerts remain in alert history without
replacing the authoritative current banner after recovery. Logs (200) and alerts
(100 frontend entries) have independent bounds; chart pruning never deletes them.
These histories are in memory, not durable recordings or a full-session export.

## Files changed for this task

Created:

- `simulator/pond_environment.py`
- `simulator/tests/test_aquasense_continuous.py`
- `documents/development/AQUASENSE_CONTINUOUS_SIMULATION.md`

Modified:

- Simulator: `scenario_engine.py`, `scenario_models.py`, `server.py`,
  `telemetry_history.py`, `Dockerfile`, `tests/test_scenarios.py`.
- Frontend core: `components/Charts.tsx`, `components/SimulationDashboard.tsx`,
  `hooks/useDataBridge.ts`, `types/index.ts`, `utils/formatting.ts`,
  `utils/telemetryPresentation.ts`.
- AquaSense: `Dashboard.tsx`, `config.ts`.
- Frontend tests: `tests/telemetry-presentation.test.mjs`.
- Documentation: root `README.md`, `simulator/README.md`, historical repair report
  `documents/development/AQUASENSE_FACTSAFE_TELEMETRY_FIX.md` (superseded-behavior notice).

Shared Dashboard, metric cards, event timeline, controls, charts, gauge, stores and
WebSocket bridge remain in use. No dependencies, secrets, metric units or CSS
layout were changed.

## Validation

- Python unittest suite: **28 tests passed**, including all nine project scenarios,
  continuous operation beyond one day, deterministic order-independent generation,
  three-day physical ranges/slow variability, DO thresholds/recovery, persistent
  fouling, finite opt-out, all five speeds, pause/resume/reset/speed changes,
  bounded archives, retained events/alerts and active fault reconnect.
- Frontend Node tests: **21 passed**, including actual telemetry/event/alert store
  isolation during pruning, advancing 60-minute viewport after two days, units,
  project routing, missing values and existing alert component behavior.
- TypeScript and production Vite build: passed. Existing non-fatal bundle-size
  warning remains (~592 kB JavaScript before gzip).
- Lint attempted: unavailable because the repository has no ESLint configuration
  or local ESLint dependency; system ESLint 6.4.0 reports missing configuration.
- Browser at 1440px desktop and 390px mobile: rendered charts, no horizontal
  overflow, no captured JavaScript runtime exceptions in the successful runs.
- Dawn Oxygen Drop at 600x reached **400 simulated minutes** in ~40 real seconds.
  Axis advanced to approximately **340–400 minutes**; history retained 178 actual
  ordered samples spanning six hours, with older points removed. Warning,
  critical, intervention, recovery and monitoring events/alerts remained present.
- Browser pause held exactly; 300x resume advanced from the paused position;
  Reset cleared telemetry/alerts. Sensor Fouling remained degraded after minute
  120; reload restored its actual warning banner and archived samples.
- FactSafe gas leak at 600x completed at minute 100 with 100 retained samples and
  three populated charts. FireScout victim/hotspot at 10x completed its 120-second
  mission with 14 samples, populated charts and detection/track events. Navigation
  started with empty stores and retained only the selected project's samples.
- One extended browser attempt was interrupted when the development simulator
  process received SIGTERM (exit 143). Restarting it in a persistent terminal
  allowed the complete 400-minute run above. This was not scenario completion.
- Full-day/multi-day checks use accelerated automated time; no multi-day real-wall
  endurance run or scientific calibration was performed. Docker image was updated
  to copy the new model module; a full image build was not performed.

## Launch

From the repository root, using installed dependencies:

```bash
.venv/bin/python simulator/server.py --project aquasense
```

In a second terminal:

```bash
npm --prefix frontend run dev
```

Open `http://localhost:5173/?project=aquasense`, choose a scenario/speed in the
footer and press **Run scenario**. At 600x the two-hour script takes about 12 real
seconds; telemetry then continues. **Reset** before selecting another scenario.
The browser preview was left on Normal Day Cycle at 60x with both services running.
Do not start duplicate processes on the same ports.

Suggested commit message: `fix(aquasense): add realistic continuous pond simulation and rolling charts`
Review the working tree before staging: it includes pre-existing user changes.
