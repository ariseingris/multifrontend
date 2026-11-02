# MultiFrontend simulator

The shared WebSocket server supports only `aquasense`, `factsafe`, and `firescout`.
Default project: `aquasense`. Unknown project/scenario IDs are rejected without
replacing a valid session.

## Setup and run

From the repository root:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r simulator/requirements.txt
.venv/bin/python simulator/server.py --project aquasense
```

The server listens at `ws://localhost:8765` and waits for Start. Either the UI or an
explicit CLI flag starts playback:

```bash
.venv/bin/python simulator/server.py --project firescout --scenario victim_hotspot --speed 10 --seed 1729 --autostart
```

CLI options: `--host`, `--port`, `--project {aquasense,factsafe,firescout}`,
`--scenario`, `--speed`, `--seed`, `--autostart`. AquaSense additionally supports
`--finite`, `--history-hours` (default 6), `--history-bucket-seconds` (default 30),
and `--history-max-points` (default 1000). `python -m simulator.server` also
works from the repository root. Only one process should listen on port 8765.

## Scenarios

| Project | Scenario | Duration |
| --- | --- | --- |
| AquaSense | `normal`, `low_oxygen`, `sensor_fouling` | 120-minute script, then continuous monitoring |
| FactSafe | `normal` | 60 simulated minutes |
| FactSafe | `gas_leak`, `dust_event` | 100 simulated minutes each |
| FireScout AI | `routine_recon`, `victim_hotspot`, `smoke_link_loss` | 120 simulated seconds each |

`scenario_engine.py` owns the monotonic clock. All engine durations and canonical
elapsed values are seconds. `scenario_models.py` converts minute-based keyframes
once and retains deterministic seed-based generation, thresholds, hysteresis,
quality indicators, alert rules and transition events. Existing scenario IDs,
metric keys and durations are unchanged by the three-project cleanup.

AquaSense probe fouling separates observed raw DO from synthetic pond ground
truth. FactSafe centrally calculates zone risk as a demo score. FireScout uses
synthetic candidate detections, persistent relative hotspot rules and link
persistence/hysteresis. No real AI inference, sensor measurement, certified safety
limit or hardware feedback is claimed.

## WebSocket contract

Commands remain:

```json
{"type":"start_scenario","project":"aquasense","scenario":"low_oxygen","speed":600}
{"type":"pause","project":"aquasense"}
{"type":"resume","project":"aquasense"}
{"type":"set_speed","project":"aquasense","speed":60}
{"type":"reset","project":"aquasense"}
{"type":"get_state","project":"aquasense"}
```

A server serves one global project/session at a time. Start can switch projects;
other project-tagged commands are rejected if they target a different active
project. Speeds must be positive finite multipliers up to 600x, applied once to
future time. Start creates a new seeded session; pause sends no new telemetry;
resume continues the session; reset clears state and waits; completion emits once.

Existing messages remain `telemetry`, `simulation_state`, `event`, `alert`, and
`command_error`. AquaSense/FactSafe additionally send an optional `session_history`
bootstrap containing recorded telemetry and events for the current session. Telemetry retains numeric `metrics`, `deviceId`, `timestamp`,
`status`, `riskScore`, `scenario`, plus project/session IDs, elapsed simulation
seconds/minutes, source, quality, metric/sensor status and separate ground truth.
Missing values are omitted. FireScout keeps its one-real-second transport cadence. AquaSense/FactSafe poll
at 0.1s, emit at most 10Hz when accelerated, and avoid oversampling 1x time
(approximately one sample/second). Rules still evaluate each simulated second.

The `simulation_state` channel has `source: simulator_state`, distinct from sensor
telemetry. It continues expressly as synthetic state through FireScout's 78–90s
blackout; no telemetry is sent then. Thermal/detection/count/background outputs are
missing while frames are unavailable (70–94s), never manufactured as zeros.
Reconnect can restore the last actual cached packet without refreshing its
timestamp. Events carry simulation time and are transition-based, not per-packet.

## Tests and Docker

```bash
.venv/bin/python -m unittest discover -s simulator/tests -v
```

Tests cover all nine scenarios, seeded traces, keyframes/units, finite values,
water-vs-probe faults, gas-vs-dust incidents, detections, blackout, controls,
completion/reset, and exact registry/unsupported-project behavior.

The Docker image copies `server.py`, `scenario_engine.py`, `scenario_models.py`, `telemetry_history.py`
and requirements. From the repository root, `docker compose up --build` starts
`simulator` and `frontend`. See the [root README](../README.md) for browser URLs.


## Repaired AquaSense / FactSafe profiles and risk

The latest profiles are specified in `documents/specifications/CODEX_FIX_AQUASENSE_FACTSAFE_TELEMETRY.md`.
AquaSense temperature, pH and true oxygen now use `pond_environment.py`: shared
daily forcing, thermal inertia and slow seeded variability. Dawn Oxygen Drop keeps
its scripted DO thresholds/recovery and then monitors indefinitely. Fouling noise
ramps after minute 30 and remains a maintenance fault after the two-hour script. No synthetic
filtered signal is presented as a computed Kalman filter. FactSafe normal, gas and
dust profiles use the new independent keyframes and corrected secondary baselines.
Gas/dust threshold entries are inclusive (>=30/50 ppm NH3, >=55/100 µg/m³ PM2.5),
with recovery hysteresis. Oxygen entries remain strictly below 4.5/3.5 mg/L.

FactSafe retains and exposes its configurable **DEMO-DEFAULT** normalization:

```text
local score = clamp(gain * max(NH3 / NH3 reference, PM2.5 / PM2.5 reference), 0, 100)
reference defaults: 50 ppm NH3, 100 µg/m³ PM2.5; gain = 80
background references: NH3 = 6 ppm, PM2.5 = 18 µg/m³
```

Zone B receives the affected score in normal/gas runs, Zone D in dust runs.
Unaffected B/D use the synthetic background score; A/C use 0.85/0.8 of background.
Overall risk is the maximum zone score. This is a transparent synthetic mapping,
not independent measurements of all zones or an approved exposure index.
`FactSafeSimulator(..., risk_defaults={...})` configures normalization parameters;
effective values are included in `simulation_state.riskModel`. The existing metric
keys and top-level `riskScore` remain; both scalar risk representations agree.

`telemetry_history.py` buckets **actual generated packets**. FactSafe retains
ten-second buckets and session origin/latest under 1,000 records. AquaSense uses
30-second buckets, six simulated hours of rolling diagnostic retention and a
1,000-point cap; the frontend displays only the latest 60 simulated minutes. The same
policy is signaled with optional `historyBucketSeconds` metadata. Connection
bootstrap restores those packets and up to 200 actual session events. Reset uses
a new session ID and clears the archive. Cached compatibility telemetry retains
its original timestamp. FireScout does not use this new history/cadence policy.


## AquaSense continuous mode

AquaSense defaults to continuous playback; `durationSeconds: 7200` describes the
script, not an elapsed-time ceiling. `simulation_state.continuous` identifies it;
`realElapsedSeconds` counts active real time, excluding pauses. Phase becomes
`monitoring` after recovery, or `maintenance_required` for a degraded probe.
Dawn critical events do not loop. Reset stops playback, changes the session ID,
clears session archives and initializes a fresh environment/probe. No automatic
physical repair, validated filter or real aerator actuation is claimed.

Start commands can set `continuous: false` for finite AquaSense compatibility;
`--finite` sets that server's default. FactSafe/FireScout clocks remain finite.
The server validates retention options and propagates `historyBucketSeconds`,
`historyRetentionSeconds`, `historyMaxPoints` on AquaSense telemetry so reconnect
and frontend retention use the same policy. Runtime measurements retain UTC
receipt timestamps alongside canonical simulated elapsed seconds.

```bash
.venv/bin/python simulator/server.py --project aquasense --scenario low_oxygen --speed 600 --autostart --history-hours 12 --history-max-points 1500
```

The event evaluator processes every simulated second independently of output
sampling, preserving threshold transitions at 300x/600x. AquaSense broadcasts at
most 5Hz (about 1Hz at 1x). Older chart points expire independently of session
logs (200 entries) and frontend alerts (100 entries). These are bounded in-memory
archives, not a durable recording service; export is not implemented.
See [model details and validation](../documents/development/AQUASENSE_CONTINUOUS_SIMULATION.md).

## FireScout geographic missions and Ollama API

FireScout canonical IDs are now `routine_recon`, `hotspot_detection`, and
`smoke_link_degradation`, with old victim/smoke IDs accepted as aliases. FireScout
continues past its 120-second script, using a rolling 120-second display and bounded
mission archive. All coordinates/wind/temperature/detections remain simulated.

`server.py` also serves the local analyst API on 127.0.0.1:8766. Install the updated
requirements (aiohttp), start local Ollama, then select an installed model in the
Description chat. Configure `OLLAMA_BASE_URL`, optional `OLLAMA_MODEL`,
`OLLAMA_ALLOWED_MODELS`, `OLLAMA_TIMEOUT_SECONDS` server-side. Vite/nginx proxy
`/api/firescout/models` and `/api/firescout/chat`. No RAG or browser-supplied
telemetry context is used. `--api-host`, `--api-port`, and
`--firescout-sample-interval` provide local server/sampling options.
Full contract and limitations: [FireScout delivery](../documents/development/FIRESCOUT_UAV_DELIVERY.md).
