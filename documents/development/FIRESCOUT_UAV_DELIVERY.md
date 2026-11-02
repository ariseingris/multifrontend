# FireScout UAV dashboard delivery

Specification read: `documents/specifications/FIRESCOUT_UAV_DASHBOARD_CODEX_SPEC.md` (the supplied file
was under docs, not the repository root). Implementation branch:
`feat/firescout-uav-dashboard`. No commit, push or merge was performed.
The working tree contained user documentation edits and also unrelated comment
cleanup during implementation; those edits were preserved. Sources were backed
up to `/tmp/multifrontend-before-firescout-uav.tar.gz` before implementation.

## Delivered behavior

The existing React application, project routing, shared Dashboard shell, metric
cards, ChartCard, LiveChart, Zustand stores, WebSocket bridge, EventTimeline and
scenario controls remain in use. A backwards-compatible optional `extraCharts`
slot allows FireScout's four panels with Description below; AquaSense and FactSafe
keep their original three-panel layout.

- Geographic mission map: Leaflet pan/zoom, Center UAV, UAV/trail, simulated home,
  incident scan ROI and hotspot marker. WGS84 coordinate readout, altitude reference,
  timestamps and provenance labels. Offline geographic coordinate grid by default;
  optional OpenStreetMap tiles with attribution and visible failure fallback.
  Fictional mission center is 12°N, 110°E, chosen as an illustrative demo zone;
  these are not real incident or UAV coordinates. Map trails break at blackout
  gaps and resets and never estimate movement during missing communication.
- Wind: compass pointing toward the source, meteorological **FROM**, clockwise
  from North; wind speed trend in **m/s**. All readings are simulated.
- Thermal: selected ROI temperature trend in **°C**, background comparison,
  highest observed mission estimate in the status strip. No camera footage or
  radiometric image is fabricated. Missing frames have no temperature estimate.
- Confidence: named single candidate track, 0–100%, configurable demo setting
  marker, uncalibrated model score label. Routine patrol has no candidate and no
  manufactured low-confidence series. Current missing observations show `—`;
  earlier observations remain visible as a historical series.
- Description: mission summary, clock/status/source, link chip, operator
  acknowledgment and embedded **Ask FireScout AI**. Acknowledgment logs an event;
  it cannot issue flight or rescue commands.

## Scenarios and synthetic telemetry

The three canonical scenarios are:

| ID | Scripted behavior | Continued behavior |
| --- | --- | --- |
| `routine_recon` | Smooth bounded flight, wind from ~40° to 65°, stable link, warm background | Continued patrol, no detected candidate |
| `hotspot_detection` | FS-H1 hotspot; estimate rises to 110°C; score crosses the demo setting after persistence | Continued monitoring, recorded candidate retained, event not replayed |
| `smoke_link_degradation` | Gradual wind shift; degraded link; observations unavailable at seconds 70–94; no packets at 78–90 | Explicit recovery and monitoring |

Legacy inputs `victim_hotspot` and `smoke_link_loss` are accepted as aliases for the
new IDs. All FireScout scenarios continue past their 120-second script; the clock
is not clamped. Pause/resume/reset and 1x/2x/5x/10x controls retain shared semantics.
Reset stops and clears the mission; select another scenario afterward.

The seed-based smooth variation and fixed-time waypoint interpolation are backend
generated, independent of rendering and playback cadence. Numeric ranges are demo
engineering assumptions, not validated flight/safety/weather data. Events are
evaluated every simulated second independently of packet sampling. Optional
`--firescout-sample-interval` sets the simulated sampling interval (default 1s),
with an upper limit of five real telemetry updates per second.

FireScout uses a 120-s rolling viewport and an independently bounded archive:
30 simulated minutes or 1,000 actual samples, whichever bound is reached first.
Events retain their separate 200-entry bound. Reconnect restores samples/events
with original timestamps; cached packets are never made artificially fresh.

Actual numeric metric keys:

| Keys | Units |
| --- | --- |
| `uav_latitude_deg`, `uav_longitude_deg` | WGS84 degrees |
| `uav_altitude_m` | m above fictional launch point (AGL demo assumption) |
| `wind_direction_deg` | ° FROM, clockwise from North |
| `wind_speed_m_s` | m/s |
| `hotspot_temp_c`, `background_temp_c` | °C simulated estimates |
| `detection_confidence_pct` | % uncalibrated |
| `uav_link_quality_pct` | % synthetic demo score |
| `hotspot_latitude_deg`, `hotspot_longitude_deg` | WGS84 degrees, only when a located hotspot candidate exists |
| `battery_percent`, `flight_elapsed_s`, `video_available`, `visibility_percent` | %, s, availability flag, % demo visibility |

Legacy numeric `detection_confidence` and `link_quality_percent` aliases remain.
String/null metadata lives in `TelemetryPoint.mission`: `telemetry_source`,
`positionSource`, `altitudeReference`, `home`, `incident`, `detection_type`,
`detection_track_id`, `hotspot_id`, `samplingIntervalSeconds`,
`confidenceUncalibrated`. Missing numeric observations are omitted, following the
existing numeric-record contract; missing track ID is null. No missing reading is
converted to a zero. State additionally reports `continuous`, `realElapsedSeconds`
and `highestObservedHotspotC`.

## Local Ollama chat

The existing Python backend now also serves an aiohttp API on **127.0.0.1:8766**:

- `GET /api/firescout/models`: discover installed models, filtered by optional allowlist.
- `POST /api/firescout/chat`: bounded nonstreaming chat with server-owned mission context.

Vite dev/preview and nginx proxy these relative endpoints. Browser code never
contacts Ollama directly and cannot select an upstream URL. No RAG, embeddings,
repository reading, document ingestion or tools are connected.

The backend accepts only user/assistant messages (up to 12, 2,000 characters each,
10,000 total), a 32-KiB request body, an installed allowed model, and the active
FireScout session ID. It supplies its own system message, timestamps, source,
units, state and last-known observations. It refuses other projects/stale sessions,
limits concurrency to two, bounds timeout (60s default, maximum 120s) and upstream
response size. Late responses from a changed session are rejected. Cross-origin
requests are restricted. Default API and Ollama listeners are loopback-only.
The local demo is not a hardened authenticated multi-user deployment.

Chat supports model discovery/refresh, loading, cancellation, error/retry, and
plain escaped text. Changing project, scenario or reset unmounts its session-scoped
conversation and aborts pending browser requests. The displayed recorded snapshot
is generated from backend values and takes precedence over model prose.

To run from the repository root:

```bash
.venv/bin/python -m pip install -r simulator/requirements.txt
npm --prefix frontend ci
```

Use separate terminals for these long-running commands:

```bash
ollama serve
```

Install/select any suitable local model; the small model used for the smoke test:

```bash
ollama pull qwen2.5:0.5b
ollama list
```

```bash
.venv/bin/python simulator/server.py --project firescout
```

```bash
npm --prefix frontend run dev
```

Open **http://localhost:5173/?project=firescout**, select a scenario and Run.
Inside Description, open **Ask FireScout AI**, select an installed model and send
a question. Do not start duplicate listeners if the preview services are running.
Model names are discovered dynamically; this test model is not hardcoded in the
application. A local test instance and downloaded model were left available.

Optional server environment settings:

```bash
OLLAMA_BASE_URL=http://127.0.0.1:11434 \
OLLAMA_MODEL=qwen2.5:0.5b \
OLLAMA_ALLOWED_MODELS=qwen2.5:0.5b \
OLLAMA_TIMEOUT_SECONDS=60 \
.venv/bin/python simulator/server.py --project firescout
```

`FIRESCOUT_ALLOWED_ORIGINS` can configure exact browser origins (defaults:
localhost:5173 and 127.0.0.1:5173). The upstream base is restricted to a local HTTP
origin, including `host.docker.internal` for Docker. Docker config/nginx support
the API internally; port 8766 is not published. Container-to-host Ollama requires
an appropriate local-only host networking arrangement; a loopback-only host
Ollama is not automatically reachable through the Docker bridge. Full Docker
image/build/runtime validation was not performed.

## Validation and evidence

Commands executed:

```bash
.venv/bin/python -m unittest discover -s simulator/tests -v
npm --prefix frontend test
npm --prefix frontend run build
npm --prefix frontend run lint
git diff --check
```

- **38 Python tests passed**: existing regressions, deterministic paths/ranges,
  continuous scenarios through two simulated hours, all supported speed clocks,
  debounce/event preservation, blackout/missing observations, aliases, archive
  retention, acknowledgment, chat schema/model/error/timeout/origin/size limits,
  stale/other-project isolation and late responses.
- **26 frontend tests passed**: coordinate bounds and missing values, trail gaps
  and reset isolation, metric metadata/units, escaped chat messages, reusable
  four-panel slot with unchanged legacy three-panel layout, and existing suites.
- **TypeScript/production build passed**. Existing Vite bundle warning remains
  (~758 kB main JavaScript before gzip; Leaflet adds map code). No UI framework
  or second frontend application was introduced.
- Lint attempted; blocked by the pre-existing absence of an ESLint configuration
  and local ESLint dependency. System ESLint 6.4.0 reports missing configuration.
- Isolated Playwright/Chrome tests passed: all three FireScout routes/scenarios
  continued beyond 135 simulated seconds, rolling axes advanced, real pause held
  time, map controls worked, offline tile failure retained the grid, acknowledgment
  logged, reset cleared chat. Smoke emitted no blackout packets, marked last-known
  position, showed missing observations and logged recovery. Captured JS runtime
  error arrays were empty.
- Desktop **1440px** and mobile **390px** inspected; no horizontal overflow, mobile
  map height 300px. Screenshots: [desktop](../references/screenshots/firescout-desktop.png),
  [mobile](../references/screenshots/firescout-mobile.png).
- Actual browser-to-backend-to-Ollama round trip with `qwen2.5:0.5b`: final wind
  response **135.1° FROM (SE), 4.1 m/s**, matching the server snapshot. Browser also
  checked the unavailable/retry notice. Backend tests exercise an unreachable
  Ollama instance and no-installed-model behavior without relying on a fake
  production fallback.
- The first small-model trial misnamed a compass direction. Explicit exact-value
  system guidance and the separate server-recorded snapshot were added; the final
  round trip quoted the correct values. Models can still hallucinate: generated
  prose is informational and unverified, never sensor evidence or a control input.
- FactSafe normal completed at 60 minutes/600x with charts. AquaSense normal
  continued beyond 124 minutes/600x with charts. Their model classes, shared base
  model/clock and pond environment compare identically by Python AST against the
  pre-change archive; their project components/configs compile identically after
  excluding comments. No AquaSense/FactSafe behavior was changed by this task.
- The shared browser-tool profile was locked; an independent local Playwright
  Chrome profile was used. No existing browser profile was terminated.

## Files created/modified by this implementation

Created:

- `frontend/src/projects/firescout/components/{GeoMissionPanel,WindDirectionPanel,ThermalHotspotPanel,DetectionConfidencePanel,FireScoutChatPanel}.tsx`
- `frontend/src/projects/firescout/services/missionTelemetryAdapter.ts`
- `frontend/src/projects/firescout/firescout.css`
- `frontend/tests/firescout-uav.test.mjs`
- `simulator/firescout_chat.py`
- `simulator/tests/test_firescout_uav.py`, `simulator/tests/test_firescout_chat.py`
- This report and the two screenshots.

Modified:

- FireScout `Dashboard.tsx`, `config.ts`.
- Shared `FigmaDashboard/index.tsx` (optional extra panels), `types/index.ts`
  (FireScout metadata), `hooks/useDataBridge.ts` (FireScout history/session bootstrap).
- `simulator/scenario_models.py` (FireScout class/registry only), `server.py`,
  `telemetry_history.py`, `requirements.txt`, `Dockerfile`, relevant scenario/history tests.
- `frontend/package.json`, lockfile, `vite.config.ts`, `nginx.conf`; root Compose.
- README launch notes; `.gitignore` narrowly allows this report/screenshots while
  leaving other ignored local documentation/archives alone.

Packages added: **leaflet 1.9.4**, **@types/leaflet 1.9.21**, **aiohttp >=3.10,<4**.
Leaflet is integrated directly through React lifecycle effects (compatible with
existing React 18); no additional React map wrapper or UI framework is required.

Reference contracts used: [Leaflet stable release](https://leafletjs.com/download.html),
[Ollama chat](https://docs.ollama.com/api/chat),
[Ollama model discovery](https://docs.ollama.com/api/tags),
[aiohttp server](https://docs.aiohttp.org/en/stable/web_quickstart.html).

Remaining limitations: all mission/wind/geographic/thermal/detection readings are
synthetic demo assumptions, not field validation; there is no real UAV/video/weather
integration, calibrated AI probability, operational safety assessment, RAG or
persistent recording. Only one project/session is active per simulator instance.
The online tile happy path depends on network/service availability; offline failure
was tested explicitly. No multi-day real-wall endurance test was performed.

Suggested commit: `feat(firescout): add geographic UAV dashboard and local Ollama analyst`
Review/stage this implementation selectively because the working tree also includes
unrelated user edits. Nothing was pushed or merged.
