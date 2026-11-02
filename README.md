# MultiFrontend

React + TypeScript + Vite dashboards for three active projects:

| Project | URL | Scenarios |
| --- | --- | --- |
| AquaSense | `/?project=aquasense` | `normal`, `low_oxygen`, `sensor_fouling` |
| FactSafe | `/?project=factsafe` | `normal`, `gas_leak`, `dust_event` |
| FireScout AI | `/?project=firescout` | `routine_recon`, `victim_hotspot`, `smoke_link_loss` |

AquaSense is the default. A supported `project` query parameter overrides
`VITE_PROJECT`. Missing/unknown query values fall back to a supported environment
value, or AquaSense when neither is valid. The settings dialog's project selector
contains only these three projects. Switching performs a page navigation that
closes the previous socket and clears client stores; incoming packets are also
filtered by project and session.

## Run locally

Requirements: Node.js 18+, Python 3.9+ and the dependencies below.

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r simulator/requirements.txt
npm --prefix frontend ci
```

Start the simulator from the repository root:

```bash
.venv/bin/python simulator/server.py --project aquasense
```

In another terminal:

```bash
npm --prefix frontend run dev
```

Open:

- [AquaSense](http://localhost:5173/?project=aquasense)
- [FactSafe](http://localhost:5173/?project=factsafe)
- [FireScout AI](http://localhost:5173/?project=firescout)

Alternatively, `./quickstart.sh aquasense` starts both processes using installed
dependencies (and installs them if missing). Substitute `factsafe` or `firescout`.
It stops its simulator when the frontend exits. Stop existing listeners before
running another launcher on the same ports.

Use **Scenarios** in the footer to choose a scenario, next-run speed, and Start.
AquaSense/FactSafe use simulated minutes. At 600x the 120-minute AquaSense
script finishes in approximately 12 real seconds and continues monitoring;
FactSafe completes its finite 60–100 minute scenarios in approximately 6–10 seconds. FireScout uses simulated seconds: 10x plays a
120-second mission in approximately 12 real seconds. Pause, Resume, Reset and
active speed changes are acknowledged by the backend. A simulator instance serves
one project/session at a time; starting a project switches that instance's session.

## Docker

```bash
docker compose up --build
```

The `frontend` service serves port 5173 and connects to `simulator` on port 8765.
The simulator image includes its server, scenario engine and scenario models.
`SIMULATOR_PROJECT=factsafe docker compose up --build` selects another initial
server project. All three URLs work with the same frontend image; they can start
their corresponding project on that simulator. `VITE_WS_URL` sets the browser's
WebSocket URL at build time (default `ws://localhost:8765`). Use a reachable server
hostname instead of localhost when opening the frontend from another machine.

```bash
docker compose down
```

## Shared architecture

```text
simulator/server.py
    → WebSocket telemetry, events, alerts, simulation_state
    → frontend/src/core/hooks/useDataBridge.ts
    → bounded Zustand stores
    → SimulationDashboard / Dashboard / FigmaDashboard
    → metric cards, LiveChart / ThresholdChart / Gauge, insights, timeline, controls
```

Project-specific configuration and insights live in
`frontend/src/projects/{aquasense,factsafe,firescout}/`. Common metric models,
alerts/anomaly interfaces, formatting, presentation components, state and transport
remain in `frontend/src/core/`. The canonical clock and deterministic scenario
models are shared in `simulator/scenario_engine.py` and `simulator/scenario_models.py`.

All current scenario readings and detection outputs are **SIMULATED**. No real
sensor, video stream, vision inference, hardware actuation or certified safety
assessment is claimed. Missing measurements show `—`; stale data retains its
original timestamp. FireScout suppresses sensor telemetry during its blackout and
uses an explicitly synthetic state channel to report that outage. AquaSense probe
fouling remains distinct from a confirmed pond oxygen emergency.

## Validate and build

```bash
.venv/bin/python -m unittest discover -s simulator/tests -v
npm --prefix frontend test
cd frontend
./node_modules/.bin/tsc --noEmit
npm run build
npm run lint
```

The existing lint command needs an ESLint dependency/configuration before it can
pass. Production output goes to `frontend/dist/`; run `npm --prefix frontend run
preview` and use the printed URL with the same `?project=` parameters. The simulator
still runs separately. Vite may report a non-fatal bundle-size warning.

## Repository resources

Reusable website media belongs in [assets/](assets/README.md); non-runtime research, specifications, development notes and design references belong in [documents/](documents/README.md). See the [migration inventory](documents/development/RESOURCE_INVENTORY.md) for every original and current resource path.

```text
assets/
  shared/{logos,icons,backgrounds}/
  aquasense/{images,videos}/
  factsafe/{images,videos}/
  firescout/{images,videos}/
documents/
  research/{aquasense,factsafe,firescout}/
  specifications/
  development/
  references/screenshots/
```

Place new project images/videos under that project's assets directory. Keep one copy of shared logos, icons and backgrounds under `assets/shared/`. New marketing, financial and competitor reports go in `documents/research/<project>/`; retain their useful original formats. Technical specifications and Codex task specifications go in `documents/specifications/`; delivery notes go in `documents/development/`.

Vite explicitly uses root `assets/` as its public directory. Reference a shared logo as `${import.meta.env.BASE_URL}shared/logos/dashboard-logo.png` in React or `%BASE_URL%shared/logos/dashboard-logo.png` in HTML. These resources are served from the URL root and copied into production output; `/assets/` is not an automatic browser prefix. Keep private documents out of this public directory. Docker includes the same canonical media without maintaining runtime copies; standalone frontend builds use `docker build -f frontend/Dockerfile .` from the repository root.

Keep imported source assets, CSS, React components, package-owned icons, simulator code and runtime configuration in supported runtime locations unless their consumers and build contexts are migrated together. Root `AGENTS.md`, `README.md`, `DEVELOPMENT_LOG.md`, any root BUGBOOK/package manifests and root configuration remain in place. The existing `docs/BUGBOOK.md` and component-local READMEs retain their workflow locations. Update references and validate asset loading whenever resources move.

## Documentation

- [Frontend setup and routing](frontend/README.md)
- [Simulator commands and contracts](simulator/README.md)
- [Troubleshooting](documents/development/TROUBLESHOOTING.md)
- [Three-project cleanup report](documents/development/KEEP_THREE_PROJECTS.md)
- [Bugbook](docs/BUGBOOK.md)

Earlier project plans, research, specifications and delivery reports are retained
as historical references and explicitly marked where their project lists or paths
predate this cleanup. They do not register additional active projects.


## AquaSense / FactSafe telemetry repair

See [the telemetry repair report](documents/development/AQUASENSE_FACTSAFE_TELEMETRY_FIX.md).
The Scenarios panel opens initially for these two projects; choose a scenario and
press **Run scenario**. A connected socket does not automatically start a session.
The page identifies when the shared server is serving a different project.

FactSafe retains its repair-specification keyframes, finite timeline, up-to-10Hz
accelerated sampling and ten-simulated-second archived buckets. Reconnecting
restores recorded session history/events with original timestamps. FireScout
retains its existing generation, cadence and cached-packet protocol.

AquaSense now uses a seeded shared pond environment with daily forcing, thermal
inertia and slow correlated variability. Its three scenarios run continuously by
default. Dawn Oxygen Drop occurs once and recovers into monitoring; Sensor Fouling
keeps a degraded, unverified probe until Reset starts a fresh session. This is a
plausible synthetic demo, not scientifically validated pond data.

Charts show the latest **60 simulated minutes**. Diagnostic retention defaults to
**6 simulated hours**, sampled in 30-second buckets and capped at 1,000 points;
actual transmitted sampling can be coarser at high speed. Events and alerts have
separate bounded histories and are not removed with chart points. AquaSense
emits at most five telemetry packets per real second. The dashboard distinguishes
elapsed simulated time from active real runtime, excluding pauses.

See [continuous AquaSense model and validation](documents/development/AQUASENSE_CONTINUOUS_SIMULATION.md)
for retention options, finite-mode compatibility and testing details.

## FireScout UAV dashboard and local analyst

FireScout now includes a simulated geographic mission map, meteorological wind
FROM compass/speed trend, °C thermal ROI trend, named-track uncalibrated confidence,
and embedded **Ask FireScout AI** in Description. Scenarios `routine_recon`,
`hotspot_detection` and `smoke_link_degradation` continue into monitoring. Existing
`victim_hotspot` / `smoke_link_loss` inputs remain aliases. AquaSense and FactSafe
behavior is unchanged.

Run `ollama serve`, install/select a local model, and start
`.venv/bin/python simulator/server.py --project firescout` plus
`npm --prefix frontend run dev`. Open `http://localhost:5173/?project=firescout`.
The backend proxies local Ollama on port 8766; the browser uses relative API routes.
No RAG is implemented. Model prose is unverified and cannot control a UAV.
See [setup, telemetry contract, screenshots and validation](documents/development/FIRESCOUT_UAV_DELIVERY.md).
