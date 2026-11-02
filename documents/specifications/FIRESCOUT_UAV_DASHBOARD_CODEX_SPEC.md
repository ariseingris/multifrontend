# FireScout AI — UAV Dashboard, Geographic Monitoring, Wind, Thermal Hotspots, Detection Confidence & Ollama Chat

**Implementation specification for Codex**  
**Target repository:** `https://github.com/ariseingris/multifrontend`  
**Scope:** FireScout AI frontend + its simulator/telemetry integration. **Do not redesign AquaSense or FactSafe.**  
**Priority:** Working visual dashboard and local Ollama chat first. RAG later.

## 0. Required workflow

1. Inspect the actual repository, current FireScout project registration, simulator, WebSocket/telemetry schemas, `Dashboard` shell, chart components, state stores, `App.tsx` and tests. Existing code is the source of truth; do not assume paths, framework versions or that FireScout already has the listed metric keys.
2. Protect uncommitted work; create an isolated branch when safe. Do not force-push, delete unrelated code, or push without explicit authorization.
3. Implement functional FireScout modules with realistic-looking **explicitly simulated** data when UAV hardware/AI model is absent. Connect modules to the existing scenario engine and show honest empty/error states.
4. Run available checks and verify the `?project=firescout` route; report test results and limitations.

## 1. Product context and evidence boundary

FireScout is a UAV/camera-based fire-reconnaissance concept. Its documents describe thermal and visible-camera sensing, AI-assisted candidate detection of people/hotspots, near-real-time command dashboard, and smoke/link difficulties. They **do not provide validated telemetry ranges, calibrated temperature datasets, field-proven inference confidence, real flight logs, or verified weather feeds**. All numeric ranges in this specification are **demo engineering assumptions**, not operational safety limits.

Do not imply detection confidence is a calibrated probability that a victim exists; show it as **model confidence score (uncalibrated)**. Thermal temperature must be a *measured/camera-derived estimate* only if the actual sensor supports temperature measurement; otherwise label as *simulated hotspot temperature*. Wind must be marked *simulated* or sourced from a real weather/vehicle sensor with provenance. No autonomous flight commands or rescue directives from chat.

## 2. Dashboard layout: preserve reusable Figma shell

- **Header:** FireScout AI logo/title, Settings.
- **Status strip:** up to 3 cards: UAV location/telemetry availability, highest observed hotspot temperature (°C), leading detection confidence (%). Show link quality as a small operational chip or fourth card if design supports it.
- **Primary content, responsive 2-column grid:**
  1. `GeoMissionPanel` (large interactive mission map): UAV position, flight trail, home/base, incident marker, candidate hotspot locations. Not a chart of raw latitude values.
  2. `WindDirectionPanel`: compass/polar wind-direction indicator and wind-speed trend. Convention: meteorological **direction FROM** which wind blows, 0°=North, 90°=East; speed m/s; clear arrow/legend convention.
  3. `ThermalHotspotPanel`: thermal heatmap/ROI or hotspot temperature trend with timestamps and selected hotspot identifier. Keep thermal view and measured temperature distinct. If no image stream exists, clearly show an illustrative heatmap/diagram or time-series, **not fake camera footage**.
  4. `DetectionConfidencePanel`: time-series confidence (0–100%) for identified candidate/track with a threshold marker explicitly labeled *demo setting*. Show detection type (person/hotspot) and track ID. Avoid collapsing multiple candidates into one ambiguous series.
- **Description:** brief mission summary, selected detection facts, data source labels, and a clearly visible `Ask FireScout AI` link/button opening an embedded chat panel/drawer (not only an external Ollama web link).
- **Logs:** time-stamped events and acknowledgments.
- **Footer:** scenario selection, start/pause/resume/reset, speed and simulation clock, using existing shared controls.
- For narrow screens, stack panels and preserve map/wind/heatmap readable dimensions. Preserve shared layout primitives and existing project selection.

### Map implementation

Prefer an existing map dependency; if none, `react-leaflet` + Leaflet may be added after verifying React/library compatibility. Include accessible controls, map tile attribution, map container explicit dimensions, and a graceful no-network tile fallback. Do not hardcode real incident coordinates or imply a simulated flight path is a current event. Use an explicitly fictional/demo mission center and visible `SIMULATED` badge. All displayed geo positions must derive from the same time-indexed telemetry state. Use WGS84 latitude/longitude (`degrees`), valid bounds and avoid joining unrelated position samples after scenario reset. Add accessible textual coordinate readout.

## 3. Proposed telemetry contract (adapt to existing architecture)

These names are proposals; use an adapter if the repo already has different keys:

| Key | Unit | Representation | Purpose |
| --- | --- | --- | --- |
| `uav_latitude_deg` | degrees | number [-90,90] | UAV map point |
| `uav_longitude_deg` | degrees | number [-180,180] | UAV map point |
| `uav_altitude_m` | m above specified reference | nonnegative number | Flight context (reference clearly documented) |
| `wind_direction_deg` | ° clockwise from North | [0,360) | Wind direction **from** |
| `wind_speed_m_s` | m/s | >=0 | Wind strength |
| `hotspot_temp_c` | °C | number or null | Selected hotspot reading |
| `detection_confidence_pct` | % | [0,100] or null | Selected candidate confidence |
| `detection_type` | enum/string | person/hotspot/none | Selected detection kind |
| `detection_track_id` | string/null | unique within mission | Candidate identity |
| `uav_link_quality_pct` | demo index, % | [0,100] or null | Communications health, explicitly synthetic unless defined against actual link stats |
| `hotspot_latitude_deg`, `hotspot_longitude_deg` | degrees | nullable | Geo-referenced hotspot candidate, only where derivation supports it |
| `telemetry_source` | enum | simulated/hardware | Provenance |
| `timestamp`, `simulation_elapsed_s` | ISO-8601 / s | monotonic within session | Consistent plots and logs |

**Missing data:** `null` and explicit empty state, never `0` for absent coordinates, confidence, temperature, wind or link quality. Validate and clamp only within representational bounds, not to conceal physically invalid source readings. Keep metric metadata (units, labels, formatting) central and reusable.

## 4. Three deterministic synthetic scenarios

Simulation lasts until user stops. Each has an initial finite scripted phase followed by continued monitoring; do not freeze telemetry after the last keyframe. Retain bounded chart history and an independent event log. Use seeded, temporally correlated noise, smooth interpolation, no identical repeated sine-wave signals, and deterministic results for tests. The values below illustrate demo progression; refine ranges after inspecting existing code. Sample at a configurable simulated interval and preserve event crossings at high playback speed.

### F1 — Routine Recon (`routine_recon`)
- Fictional UAV follows a small bounded flight path; GPS point and trail update smoothly.
- Wind **from** 40° → 65° with 1.5–3.0 m/s smooth variability.
- Hotspot reading near ambient/warm-background values, e.g., 29–38°C; no significant candidate hotspot.
- Detection confidence of selected candidates is `null` if no detection exists; never display a fabricated low confidence as a detected victim.
- Link-quality demo score remains high (90–100%). Status normal; logs record launch, waypoint, scan completion and ongoing patrol.

### F2 — Hotspot & Candidate Detection (`hotspot_detection`)
- UAV approaches one fictional incident ROI; mission map shows scan sector and a **simulated** hotspot candidate marker.
- Hotspot estimate rises gradually e.g., 42 → 70 → 110°C then decreases with changed viewpoint; do not interpret as a calibrated fire danger threshold.
- Create one candidate `hotspot` track whose model confidence rises, e.g., 25 → 62 → 88%, with a clear event when crossing a configurable demo threshold. Optionally add a distinct `person` candidate track; do not conflate it with hotspot detection.
- Wind e.g., from 100–135° at 2–5 m/s, with plausible continuity. Link remains adequate. Logs contain candidate ID, timestamp, location (if present), simulated confidence and human review required.
- On conclusion, remain in monitoring mode with the last candidates recorded; do not loop critical detections automatically.

### F3 — Smoke & Signal Degradation (`smoke_link_degradation`)
- UAV moves within a fictional smoke-affected region; visibility decreases (if that variable is supported).
- Model confidence becomes unstable/low or goes null when observations are unusable; do not pretend AI sees through arbitrarily dense smoke.
- Link-quality score drops, e.g., 95 → 65 → 25%, then either recovers with a clearly scripted recovery or remains degraded in monitoring state. Define warning/critical thresholds as **demo operational indicators**, not flight safety guidance.
- Wind direction shifts gradually, e.g., 210° → 245°, wind speed 2 → 7 m/s.
- Missing packets must be explicitly flagged and displayed as stale telemetry. Do not interpolate UAV location across real communication gaps as if it were known; map should distinguish last-known position.
- Logs record loss, stale readings and restoration, once per state transition rather than every frame.

## 5. Description and local Ollama AI chat (no RAG yet)

Add an `Ask FireScout AI` action visibly inside `Description` that opens a keyboard-accessible drawer/modal or embedded panel. The user can ask questions about the simulated mission, metrics, terms, and scenario status. Use the Ollama API via a **local backend proxy** where practical; avoid directly exposing arbitrary remote endpoints or private data through browser code.

- Ollama default local API base: `http://localhost:11434`. Actual endpoint: `POST /api/chat` with `{model, messages, stream}`. The model name must be configurable; discover installed models if practical and show `Model unavailable` otherwise. Do not hardcode a model assumed installed.
- Provide a backend endpoint such as `POST /api/firescout/chat` (adapt existing backend) that forwards sanitized chat messages to the configured Ollama instance using server-side environment settings. Include bounded request timeout, size limits, model allowlist/config, and error handling. Never expose unauthenticated Ollama publicly.
- Provide context **only from current known FireScout telemetry and scenario state**, with timestamps, source `SIMULATED`, and units; do not send unrelated project telemetry, secrets, or unrelated repository files.
- System guidance: provide explanatory support; acknowledge stale/missing data and uncertainty; never invent observations, sensor capabilities, victims, fire locations, or operational safety instructions. Human incident command decisions remain with trained personnel.
- Chat UI states: idle, typing/loading, streamed response if feasible (nonstreaming MVP acceptable), connection lost, retry. Clear chat on project/scenario switch or ask the user before mixing mission contexts. Guard against HTML/script injection by rendering plain text/escaped Markdown.
- **RAG out of scope for now**: no embeddings, vector database, document ingestion, or fabricated citations. Design a clean interface so retrieval can be added later.
- If Ollama is not running, show a useful but nonblocking notice (e.g., `Ollama unavailable — start local Ollama and select an installed model`). Other dashboard features must remain functional.

### Example chat request (for understanding, adapt to backend)

```json
{
  "model": "<installed-model-name>",
  "messages": [
    {"role": "system", "content": "You are FireScout's demo analyst. Only use the provided SIMULATED mission telemetry; state uncertainties."},
    {"role": "user", "content": "What is the current wind direction and is the UAV link stable?"}
  ],
  "stream": false
}
```

## 6. Proposed components

```text
projects/firescout/
  Dashboard.tsx                  # integrate only, keep existing controls
  config.ts                     # scenarios, metric metadata, labels
  components/
    GeoMissionPanel.tsx
    WindDirectionPanel.tsx
    ThermalHotspotPanel.tsx
    DetectionConfidencePanel.tsx
    FireScoutChatPanel.tsx
  services/
    missionTelemetryAdapter.ts  # only if existing data format requires mapping
```

Keep common cards, titles, states, charts, alert boxes, logging, time controls, CSS tokens in shared core components. Avoid inventing an unrelated second app. Chart components must not themselves generate telemetry.

## 7. Testing and validation acceptance criteria

- [ ] `http://localhost:5173/?project=firescout` loads without errors, alongside unaffected AquaSense and FactSafe.
- [ ] Map draws a **simulated** mission path and distinct hotspot markers with consistent coordinates and timestamps; clear offline fallback.
- [ ] Wind direction compass labels degrees **FROM**, with speed in **m/s** and coherent simulated trend.
- [ ] Hotspot panel has **°C** labels, candidate/ROI identification, no fake live thermal video.
- [ ] Confidence chart is **0–100%** for a named track; `null` when no detection; simulated/unverified qualifier.
- [ ] Scenario picker supports all 3 FireScout scenarios and updates every panel using a single telemetry timeline.
- [ ] Play/pause/resume/reset, speeds, and indefinite post-event monitoring are correct; rolling plot window advances; memory remains bounded.
- [ ] Switching projects/scenarios resets or scopes chart history, location trail, logs and chat context correctly.
- [ ] Description contains functioning `Ask FireScout AI`; local Ollama integration works with installed model, and model/server errors are legible.
- [ ] Chat responses do not hallucinate telemetry or claim RAG integration. All outputs treated as informational demo only.
- [ ] Accessibility basics: labels, keyboard navigation, status roles, contrast, mobile layout.
- [ ] Available typecheck/build/tests pass; report failures honestly and do not claim checks were run if they were not.

## 8. Implementation order

**Phase A:** audit existing FireScout and telemetry structure; define minimal compatible adapter and metric catalog.  
**Phase B:** implement seeded scenarios, telemetry events, and tests.  
**Phase C:** implement map, wind, thermal and confidence panels using the new telemetry; maintain design continuity.  
**Phase D:** implement Ollama backend proxy and Description chat drawer; tests for unavailable Ollama.  
**Phase E:** integration testing, screen-width checks and final report.

Codex final report must include files changed, actual metric keys, data provenance, package changes, how to run Ollama and choose a local model, commands executed, scenario screenshots/tests, remaining limitations. **Do not push or merge without explicit user approval.**
