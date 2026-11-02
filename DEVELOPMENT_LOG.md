# Development Log

## 2026-10-27 — AGENTS.md external documentation policy

- Objective: add the supplied Section 3.4 policy while preserving all existing instructions and the BUGBOOK workflow.
- Start: 2026-10-27T06:56:53+07:00. Completion: 2026-10-27T06:57:48+07:00.
- Files: modified root `AGENTS.md`; created root `DEVELOPMENT_LOG.md` with this first entry; no files deleted by this task.
- Implemented: appended the supplied no-explanatory-code-comments policy, mandatory end-of-task logging, confirmed-bug cross-references, and exceptions for necessary directives and legal notices. Added an explicit link to the existing `docs/BUGBOOK.md` workflow; no confirmed bug was fixed, so no BUGBOOK entry was required.
- Decision: the original root AGENTS.md contains only three instruction bullets, with no Section 3.3 or other numbered sections. Preserved those bytes and appended Section 3.4 rather than inventing or rewriting preceding sections.
- Algorithms, architecture, compatibility: no source-code, algorithm, or architectural changes; mandatory directives and legal notices remain protected.
- Verification: inspected `git status --short`, `git branch --show-current`, `git log -1 --format='%h %s'`, `git ls-files`, `git check-ignore -v`, root instructions, and the existing BUGBOOK update rules. Reviewed the full before/after diff using `git diff --no-index /tmp/multifrontend-agents-before.md AGENTS.md`. Python checks passed for byte-for-byte preservation of original instructions, one Section 3.4 heading, and no trailing whitespace.
- Validation caveats: `git diff --no-index --check` emitted no whitespace diagnostics but returned 1 for differing files, so a chained Python check did not execute; reran checks independently. An initial unrelated-file hash assertion failed because concurrent external edits were detected. A subsequent comparison identified changes in `frontend/src/projects/firescout/components/FireScoutChatPanel.tsx`, `frontend/src/projects/firescout/components/GeoMissionPanel.tsx`, `frontend/src/projects/firescout/services/missionTelemetryAdapter.ts`, `simulator/firescout_chat.py`, `frontend/index.html`, and `frontend/src/core/types/index.ts`. This task's write commands targeted only the two root Markdown files; unrelated changes were left untouched.
- Checks not run: application tests/builds, because this task changes documentation only.
- Known limitations: the working tree already contained extensive unrelated changes, and concurrent edits prevent claiming an otherwise unchanged workspace. Both root Markdown files are ignored by `.gitignore:51`; ignore rules were left unchanged.
- Next steps: no further policy edits required. If these files should be committed later, handle their ignored status with explicit user authorization; no commit or push performed.
- Git status: branch `feat/firescout-uav-dashboard`; observed HEAD `798915b` (`Update three-project dashboards and simulation scenarios`). Task changes are uncommitted and unstaged; no commit was created.
### Session — 2026-10-27 07:06

**Objective:** Remove unnecessary source comments without changing behavior, preserve existing work, and establish mandatory development session logging. Timestamp uses Asia/Bangkok (UTC+07:00).

**Changes made:**
- Created root `AGENTS.md` with mandatory append-only session logging and rules for avoiding unnecessary comments while preserving legal notices and technical directives. Preserved the additional external-documentation policy appended concurrently by another task.
- Appended the current session to `DEVELOPMENT_LOG.md`, preserving the entry created by concurrent documentation work. Added root `.gitignore` exceptions for `AGENTS.md` and `DEVELOPMENT_LOG.md` so the repository-wide Markdown ignore rule does not hide the required persistent files.
- Removed 84 explanatory comments across 31 source, test, configuration, HTML/CSS, and shell files. Removed empty JSX comment containers and comment-only lines.
- Files modified by this cleanup:
  - `frontend/index.html`
  - `frontend/src/core/components/AlertDisplay.tsx`
  - `frontend/src/core/components/AlertMessage.tsx`
  - `frontend/src/core/components/Charts.tsx`
  - `frontend/src/core/components/Dashboard.tsx`
  - `frontend/src/core/components/EventTimeline.tsx`
  - `frontend/src/core/components/FigmaDashboard/Shell.tsx`
  - `frontend/src/core/components/FigmaDashboard/figma-dashboard.css`
  - `frontend/src/core/components/FigmaDashboard/index.tsx`
  - `frontend/src/core/components/Header.tsx`
  - `frontend/src/core/components/ScenarioControl.tsx`
  - `frontend/src/core/components/SimulationDashboard.tsx`
  - `frontend/src/core/hooks/useDataBridge.ts`
  - `frontend/src/core/projects.ts`
  - `frontend/src/core/types/index.ts`
  - `frontend/src/core/utils/activeAlert.ts`
  - `frontend/src/core/utils/formatting.ts`
  - `frontend/src/core/utils/telemetryPresentation.ts`
  - `frontend/src/projects/aquasense/dashboardMetrics.ts`
  - `frontend/src/projects/firescout/components/GeoMissionPanel.tsx`
  - `frontend/src/projects/firescout/services/missionTelemetryAdapter.ts`
  - `frontend/tests/project-routing.test.mjs`
  - `frontend/tsconfig.json`
  - `quickstart.sh`
  - `simulator/firescout_chat.py`
  - `simulator/pond_environment.py`
  - `simulator/scenario_engine.py`
  - `simulator/scenario_models.py`
  - `simulator/server.py`
  - `simulator/tests/test_aquasense_continuous.py`
  - `simulator/tests/test_scenarios.py`
- No files removed, features implemented, or application bugs fixed by this cleanup.
- Existing and concurrent changes were preserved. Other work modified FireScout features, tests, configuration and documentation during this session, and deleted `AGENTS(3).md`; those changes were not performed by this cleanup. Browser tools also wrote snapshots/logs under `.playwright-mcp/`.

**Technical decisions:**
- Used installed Babel parsing for TypeScript/JavaScript/JSX comment locations, Python `tokenize` for Python comments, PostCSS for CSS including the HTML style block, and the TypeScript scanner for JSONC configuration. Removed only the known standalone shell usage comment; retained the shell shebang.
- Compared JavaScript/TypeScript syntax trees and emitted JavaScript before/after removal; verified unchanged emitted JavaScript after deleting empty JSX comment containers. Compared Python ASTs and executable tokens, CSS rules/declarations, and parsed TypeScript configuration. Checks ran against each file's actual pre-edit contents, including uncommitted work.
- Reviewed comments before deletion; no commented-out functionality requiring restoration or license/copyright headers were found in the removed text. Retained the Vite triple-slash type reference, executable shebangs, all Python docstrings/runtime strings, URLs, regexes and serialized values. Existing Markdown content was not edited by this session.
- Kept cleanup tools, manifests and pre-edit copies outside the repository in `/tmp/multifrontend-comment-cleanup/`. Did not edit dependencies, virtual environments or generated output by hand; the requested production build regenerated ignored build artifacts.
- Created root `AGENTS.md` because no file with that exact name existed at inspection. Inspected `AGENTS(3).md` without changing its instructions.

**Validation:**
- Reviewed `git status --short`, `git diff --stat`, `git diff --numstat`, source diffs and pre-edit snapshots; `git diff --check` passed. The complete Git diff also contains existing/concurrent changes and must not be attributed entirely to this cleanup.
- Syntax/AST/emitted-code comparisons described above passed at cleanup time. Final source marker scan found only the retained Vite directive, Python shebang and Python integer division operators.
- `bash -n quickstart.sh`: passed.
- `npm --prefix frontend test`: passed initially (3 test files) and on the final run (4 test files, including the concurrently added FireScout tests).
- `npm --prefix frontend exec -- tsc --project frontend/tsconfig.json --noEmit`: passed.
- `npm --prefix frontend run build`: passed, including TypeScript compilation and Vite production bundling. Final build reported a 757.80 kB JavaScript chunk and the standard >500 kB chunk warning.
- `npm --prefix frontend run lint`: failed both before and after cleanup. Available ESLint 6.4.0 could not find an ESLint configuration. No lint configuration/dependency refactor was introduced.
- `.venv/bin/python -m unittest discover -s simulator/tests -v`: initial 28-test run reported 9 FireScout assertion failures. Pre-edit copies reproduced those same 9 failures after completing the snapshot with the then-untracked chat module. The first incomplete snapshot attempt failed three module imports because that module was missing.
- As concurrent FireScout work added tests, a later 37-test sandbox run reported 4 socket permission errors and 1 blackout-event count failure. Re-running with permission to bind local test servers passed the chat tests but initially retained the event-count failure (2 events versus 1 expected).
- A diagnostic run of the new UAV tests against older pre-edit model copies passed the blackout test but reported a missing `highest_observed_hotspot_c` attribute and an acknowledgement assertion failure; these copies predated those concurrent features and were not a valid complete baseline for the newer test suite.
- Final `.venv/bin/python -m unittest discover -s simulator/tests -v`, with local sockets permitted: **all 37 tests passed** after concurrent FireScout implementation/test updates. These functional fixes were not made by the comment cleanup.
- Started `npm run dev -- --host 127.0.0.1 --strictPort` in `frontend` and `.venv/bin/python -u simulator/server.py --project aquasense`. Initial sandbox simulator startup could not bind port 8766; permitted startup succeeded. Playwright verified AquaSense Run with real oxygen/temperature/pH telemetry, FactSafe Run with real NH3/PM2.5/risk telemetry, and FireScout mission location/wind/temperature telemetry plus Run, Pause, Resume and Reset state changes over the live simulator connection. Stopped the processes started for these checks.
- Full exhaustive visual, long-duration, real-device and real-Ollama inference checks were not performed: this session scoped verification to source preservation, the existing automated suites and live dashboard smoke checks. Chat backend tests used their local stub service.

**Known issues:**
- Repository lint remains blocked by missing ESLint configuration; this existed before cleanup.
- Production bundling succeeds with the large-chunk warning above.
- Concurrent working-tree edits continued during this session. Validation describes the inspected snapshots and final commands, rather than guaranteeing later edits.

**Next steps:**
- Restore/configure the repository's intended ESLint setup in a separate scoped task.
- Review the combined working-tree changes, including concurrent FireScout work, before any commit.
- At the end of every future coding task, append a new session using these same fields; preserve all previous entries and report actual changes, failed/successful checks, unresolved issues and Git state.

**Git status:**
- Current branch: `feat/firescout-uav-dashboard`.
- HEAD: `798915b86f79810c667fc661667aa1727f7a4e5a` (existing commit; no commit created during this session).
- Required root Markdown files are untracked and visible to Git after the `.gitignore` exceptions; changes are uncommitted. Existing uncommitted work and concurrent additions/deletions remain present. No commit, push, force-push or destructive reset was performed.


## 2026-10-27 — FireScout geographic UAV dashboard and local Ollama analyst

**Objective and timing:** Implement the supplied FireScout specification inside
the existing application while preserving AquaSense/FactSafe behavior. The spec
was found at `docs/FIRESCOUT_UAV_DASHBOARD_CODEX_SPEC.md`. The pre-edit archive was
created at **2026-10-27 06:50:48 +07:00**; implementation/verification finished
around **07:08 +07:00**. Exact task-start timestamp was not recorded.

**Implemented files and functionality:**
- Created five FireScout panels under `frontend/src/projects/firescout/components/`
  (geographic mission, wind, thermal, confidence, embedded Ollama chat),
  `services/missionTelemetryAdapter.ts`, scoped `firescout.css`, and frontend UAV tests.
- Updated FireScout Dashboard/config, numeric metric catalog and typed mission
  metadata. Reused Dashboard, Figma cards/layout, LiveChart, stores, bridge,
  scenarios and timeline. Added an optional fourth chart slot and full-width
  Description only when extra panels are present; existing projects retain their
  layout. FireScout now participates in session history bootstrap.
- Updated FireScout's class/registry in `simulator/scenario_models.py`, server
  cadence/history/API lifecycle, bounded telemetry archive, and relevant tests.
  Canonical scenarios: routine_recon, hotspot_detection, smoke_link_degradation;
  old victim_hotspot/smoke_link_loss inputs remain aliases. Continuous monitoring
  follows the finite script; missing observations/blackout remain explicit.
- Created `simulator/firescout_chat.py` and chat/UAV backend tests. Relative API
  routes proxy a configured local Ollama instance; only backend-owned FireScout
  context is supplied. Request/model/origin/size/timeout/concurrency/session
  boundaries, unavailable/retry behavior and escaped UI text are implemented.
- Updated frontend package/lockfile (Leaflet 1.9.4 and @types/leaflet), simulator
  requirements (aiohttp), Vite dev/preview proxy, nginx, Dockerfile and Compose.
- Added `docs/FIRESCOUT_UAV_DELIVERY.md`, desktop/mobile screenshots, root and
  simulator README notes, narrowly scoped `.gitignore` exceptions for delivery
  artifacts, and BUGBOOK entry 25. No unrelated files were deleted by this task.
  Existing user documentation and concurrent comment-policy cleanup were preserved.

**Technical decisions and calculations:**
- Leaflet integrates directly through React lifecycle effects, with an offline
  latitude/longitude grid and optional attributed online tiles. All vehicle/base/
  ROI/hotspot positions are labeled simulated and use the same telemetry session.
  Trails split at session changes, missing coordinates or gaps beyond three
  expected sample intervals (minimum three seconds). Map zoom animations were
  disabled so Center UAV responds reliably after zoom controls.
- Fixed-time smooth waypoint interpolation and seeded correlated variation are
  backend-generated. Wind uses meteorological FROM clockwise from North; compass
  annotation derives the eight-way sector from `(degrees + 22.5) / 45`. Thermal is
  an explicit simulated ROI trend, not fabricated video. Confidence is a named
  track score, omitted when unavailable, never a manufactured victim probability.
- FireScout evaluates events every simulated second and emits at most 5 real Hz.
  A 120-second rolling view is independent of a 30-minute/1,000-point archive.
  Logs/acknowledgments have their own bound; scenario hazards do not automatically
  repeat after the script. All existing shared clock units remain seconds.
- Chat is nonstreaming MVP without RAG/tools. Installed models are discovered,
  not assumed. The local API listens on 127.0.0.1:8766 and the Ollama instance on
  loopback port 11434. A small qwen2.5:0.5b model was downloaded for actual testing;
  it is not hardcoded into the application. Generated prose remains unverified.
  Backend-recorded wind facts/timestamps are displayed separately and take
  precedence over model prose. Model and browser requests are bounded; late
  responses from another mission are rejected or aborted on context reset.

**Successful validation:**
- `npm --prefix frontend run build`: TypeScript and Vite production build passed;
  main JavaScript ~757.80 kB, existing >500 kB bundle warning remains.
- `npm --prefix frontend test`: **26 tests passed**.
- `.venv/bin/python -m unittest discover -s simulator/tests -v`: **38 tests passed**.
- `git diff --check`: passed.
- Independent local Playwright/Chrome session: all three FireScout scenarios
  continue past 135 simulated seconds; rolling axes, map controls, offline tile
  failure, mobile 390px with no horizontal overflow, true pause/resume/reset,
  acknowledgment, missing smoke observations and blackout/recovery were verified.
  No captured JavaScript runtime exceptions in the successful runs.
- Actual UI → backend → Ollama response completed with discovered qwen2.5:0.5b.
  Final reply and independently rendered snapshot agreed on **135.1° FROM (SE),
  4.1 m/s**. Browser also exercised the unavailable/retry UI; automated backend
  tests cover unreachable Ollama and no installed models.
- FactSafe normal still completed at 60 simulated minutes/600x with charts;
  AquaSense normal continued beyond 124 minutes/600x with charts. Python AST
  comparisons confirmed unchanged AquaSense, FactSafe, DemoScenario, clock and pond
  environment behavior. Their project files compile identically to the pre-task
  archive after excluding comments.

**Unsuccessful attempts and corrections:**
- Initial FireScout assertions expected finite completion, legacy IDs and cached
  packet-only bootstrap. They were updated for the requested continuous missions
  and history contract, without weakening AquaSense/FactSafe regressions.
- A smoke event-count assertion expected one degraded entry; the actual finite
  decline/recovery has two legitimate degraded transitions (before/after critical).
  The corrected test retains one loss, stale, reconnect and restoration transition.
- Existing dev listeners occupied ports; redundant startups failed, and the
  repository simulator was restarted to load the updated backend. The shared
  Playwright profile was locked; a separate local Chrome profile was used without
  terminating an existing browser. A temporary preview-script generation typo was
  corrected; its final isolated check showed four panels and running monitoring at 1x.
- The first exact model-label lookup failed; explicit label association fixed it.
  The first small-model response misnamed a wind compass direction; exact-value
  prompt guidance and the independent recorded snapshot were added. See
  [BUGBOOK entry 25](docs/BUGBOOK.md#25-firescout-model-selection-and-generated-wind-prose).

**Checks not completed and limitations:**
- Lint was attempted; system ESLint 6.4.0 cannot find a repository configuration.
  No unrelated lint dependency/configuration work was introduced.
- Full Docker build/runtime and multi-day real-wall endurance were not performed.
  Docker-to-host Ollama requires a suitable local networking arrangement.
- All mission, geographic, wind, thermal and detection data are synthetic demo
  assumptions. No actual UAV, radiometric stream, weather feed, calibrated model,
  RAG, persistent recording, autonomous flight or rescue integration is claimed.
  LLM outputs can still be inaccurate; the local demo is not a hardened public
  multi-user service. One simulator instance serves one project/session at a time.

**Next steps and Git state:**
- Open `http://localhost:5173/?project=firescout`; preview services and a local
  Ollama model were left available. Use Description → Ask FireScout AI, select an
  installed model and send a question. Full setup, actual metric keys and screenshots
  are in `docs/FIRESCOUT_UAV_DELIVERY.md`.
- Review the combined working tree selectively before committing; it contains
  unrelated user/concurrent edits. Branch `feat/firescout-uav-dashboard`, HEAD
  `798915b86f79810c667fc661667aa1727f7a4e5a`. All task changes remain uncommitted.
  No push, merge, force-push or destructive reset occurred.
- Suggested commit: `feat(firescout): add geographic UAV dashboard and local Ollama analyst`.


## 2026-10-27 — Centralize repository assets and development documents

**Objective and timing:** Make resources manageable as AquaSense, FactSafe and FireScout grow, without redesigning dashboards or changing simulator behavior. Started 2026-10-27T10:07:39+07:00; completed 2026-10-27T10:23:20+07:00.

**Inventory and moves:** Audited all repository files, including ignored root media, Markdown and the Figma ZIP, before moving anything. Excluded dependency/build/cache/Git directories. Recorded classifications and every original/destination path in [RESOURCE_INVENTORY.md](documents/development/RESOURCE_INVENTORY.md), created before relocation. Moved 19 files: five specifications to `documents/specifications/`, eight development reports/guides to `documents/development/`, the executive summary, original design screenshot, two FireScout delivery screenshots and original Figma archive to `documents/references/`, and the runtime logo to `assets/shared/logos/dashboard-logo.png`. Consolidated the byte-identical loose `bead-pattern(2).png` into the canonical logo only after new runtime references, production bytes and browser loading were verified. All original binary resource bytes remain preserved. No PDF, DOCX, PPTX, video or original research reports were present.

**Files created/modified:** Created `assets/README.md`, `documents/README.md`, the inventory, `.dockerignore`, and `.gitkeep` placeholders in empty project media/research/shared directories. Updated root `README.md`, appended Section 3.5 to `AGENTS.md`, and appended this entry to `DEVELOPMENT_LOG.md`. Updated links/path references in moved Markdown, `frontend/README.md`, `simulator/README.md`, and two references in `docs/BUGBOOK.md`. Modified `.gitignore` to allow canonical assets/documents, including original formats previously globally ignored. Runtime changes are limited to `frontend/vite.config.ts`, `frontend/index.html`, `frontend/src/core/components/FigmaDashboard/Shell.tsx`, `frontend/Dockerfile`, and the frontend build context in `docker-compose.yml`.

**Technical decisions:**
- Vite `publicDir: '../assets'` makes the root media directory explicitly accessible and copies one canonical resource set to production output. Header and favicon use base-aware public URLs instead of the former source import. Root assets are public; guides warn against placing private documents there. No automatic `/assets/` URL prefix is assumed.
- Docker Compose now builds the frontend from repository root; the Dockerfile copies `frontend/` and `assets/` under compatible relative locations. Added root Docker ignore rules for dependencies, generated files, Git metadata and environment files. No runtime source, components, CSS or simulator files were moved into assets/documents.
- Kept root workflow/configuration files, component-local setup guides and authoritative `docs/BUGBOOK.md` at their existing paths. All original AGENTS content remains byte-for-byte intact before the new policy. The policy preserves mandatory directives, legal notices, no-comment rules, end-of-task logging and BUGBOOK reporting. No confirmed bug was discovered and fixed; BUGBOOK changes only maintain existing references.
- Used filesystem renames rather than `git mv` to preserve the pre-existing index/unstaged user work and avoid staging any changes. No original source research was discarded. Preserved historical development-log entries unchanged; their old path mentions remain historical evidence, with the inventory providing current locations. Original plan tree examples remain historical.
- No algorithms, business logic, architecture beyond asset-serving/build paths, package dependencies, simulator contracts or project registration changed. Project-specific resource/research directories are intentionally empty placeholders until real resources are added.

**Validation and actual results:**
- `npm --prefix frontend run build`: passed; Vite transformed 877 modules. Existing non-fatal chunk-size warning remains (approximately 758 kB JavaScript).
- `./frontend/node_modules/.bin/tsc --noEmit -p frontend/tsconfig.json`: passed.
- `npm --prefix frontend test`: passed, 4 test files, 0 failures, including routing and FireScout tests.
- `.venv/bin/python -m unittest discover -s simulator/tests -v`: 38 tests passed with local socket access. First sandbox run had 33 passing tests and 5 HTTP integration setup errors because sockets were forbidden; reran with approved access rather than modifying tests.
- `docker compose config --quiet`: passed. `docker info --format '{{.ServerVersion}}'` initially lacked sandbox socket access, then passed with approved access. `docker build -f frontend/Dockerfile -t multifrontend-resource-verification .`: passed, including clean `npm ci`, TypeScript/Vite build and nginx output packaging. Image remains local; nothing published.
- Production browser checks on temporary preview port 4273: AquaSense, FactSafe and FireScout headings/routes rendered, logo decoded successfully, favicon returned HTTP 200/image/png with 363024 original bytes. Each project started its normal scenario against a separate temporary simulator on ports 8875/8876 and displayed live values/charts through real WebSocket messages. Browser-only WebSocket URL substitution isolated these checks from the existing simulator on 8765; no runtime source was changed for isolation. Existing simulator session was left untouched.
- Settings selector contained exactly the three active projects and navigated successfully to each; unsupported `?project=unknown` rendered AquaSense. Frontend unit tests also cover environment/query precedence.
- Development-mode browser checks on temporary port 5273: all three project headings, logo loading and favicon HTTP 200 passed; no page errors or HTTP responses >=400 during those checks. Generated SVG/inline icons and FireScout map/wind/thermal panels rendered; no local videos existed to test.
- Python link audit checked 46 current relative Markdown file targets across maintained guides, moved documents, AGENTS and BUGBOOK: 0 missing targets. Append-only prior log entries were intentionally excluded from current-link rewriting. Hash/line-count checks verified all 20 original resource paths map to preserved destinations (including the consolidated duplicate), binary resources remain byte-identical, and moved Markdown retains all original lines with reference substitutions only. Production logo bytes match the original SHA-256 recorded in the inventory.
- Reviewed actual task diffs against `/tmp/multifrontend-resource-before`, not just the already-dirty Git HEAD. Hash audit confirmed all unrelated original files remained byte-identical; only the 11 expected pre-existing paths were edited before this log append. `git diff --check` passed. Original AGENTS and development-log prefixes were verified preserved.

**Unsuccessful attempts and checks not performed:** Initial sandbox preview and HTTP test startup were blocked by socket permissions; approved retries passed. One dev launch from repository root failed because there is no root package.json; corrected to `frontend/`. One temporary browser assertion incorrectly called Fetch Response `status` as a method; corrected to its property and all dev checks passed. Initial sandbox curl/netlink checks could not inspect local listeners; browser checks and isolated ports supplied the needed runtime evidence. Full Docker Compose runtime, online map tiles, local Ollama model inference and video playback were not exercised; they are outside the resource moves or have no local media to verify. Lint was not run: this change does not configure the known missing repository ESLint setup.

**Remaining issues and next steps:** No unresolved resource/link/build regressions found. Existing build chunk-size warning remains; clean Docker installation also reported existing dependency deprecation and 3 audit vulnerabilities (1 moderate, 2 high); dependencies were deliberately unchanged. Review these independently. Temporary preview, dev and isolated simulator processes were stopped after verification. Review the migration inventory and combined dirty working tree before any future commit. New media belongs under the matching assets project; research belongs under its documents research project.

**Git state:** Branch `feat/firescout-uav-dashboard`, observed HEAD `798915b86f79810c667fc661667aa1727f7a4e5a`. Existing uncommitted changes were preserved. Resource moves and task edits remain uncommitted/unstaged; new canonical resource/document paths are visible to Git. No commit, push, merge, force-push or destructive reset performed.


## 2026-10-27 — Public research tools and competitor intelligence pilot

**Objective and timing:** Audit research capabilities; evaluate minimum compatible free tools; establish a repeatable public-source workflow and business/marketing research for AquaSense, FactSafe and FireScout AI without changing dashboards. First recorded audit time: 2026-10-27T11:26:45+07:00. Implementation/validation completion and log append: 2026-10-27T11:49:14+07:00 (Asia/Bangkok).

**Actual changes:** Created 18 files: `scripts/research_dataset.py`; four guides under `documents/research-tools/` (`TOOL_COMPARISON.md`, `SETUP_GUIDE.md`, `RESEARCH_WORKFLOW.md`, `DATASET_CONTRACT.md`); six project reports (`AQUASENSE_MARKETING.md`, `AQUASENSE_EVIDENCE.md`, `FACTSAFE_MARKETING.md`, `FACTSAFE_EVIDENCE.md`, `FIRESCOUT_MARKETING.md`, `FIRESCOUT_EVIDENCE.md`); dated JSON and generated Markdown source registers in each project's research directory; and `documents/research/shared/2026-10-27_coverage.md`. Appended this root log entry. No files deleted or moved. Existing research placeholders retained. No application, dashboard, asset, manifest, lockfile, MCP configuration, credential, or permission edits. No BUGBOOK update: no existing implementation bug found or fixed.

**Audit and tool decisions:** Read AGENTS.md and the resource guides/inventory. Inspected safe global TOML metadata and local/session skills without printing secret values. Configured MCP names: gemini-notebook-mcp, openaiDeveloperDocs, playwright, github; only Playwright operationally exercised here. Used OpenAI Docs and Plugin Management skills. Directory discovery found unconnected Firecrawl and Ahrefs; AgentPatch directory search returned no matches (not proof of universal absence). Evaluated competitor-intel examples, AgentPatch marketplace and unrelated model-merging project, Playwright, Firecrawl, Crawl4AI, DataForSEO, Ahrefs and Semrush with official sources. Reused existing web search/open and Playwright; installed no third-party packages, skills, MCP servers or accounts. Added a dependency-free local validator/exporter. Firecrawl/Crawl4AI optional for later volume; generic competitor skills unnecessary; AgentPatch availability unresolved and redundant; paid SEO providers require explicit authorization. Global configuration or broad permission changes remain approval-gated. Pricing and license distinctions, authentication and limitations are documented in the comparison.

**Research completed:** 22 normalized page records: AquaSense 7 (Innovasea, AKVA, RYNAN and FAO); FactSafe 7 (Blackline, Dräger, Honeywell, ILO and one Daviteq search-only lead); FireScout 8 (DJI, Flyability, CT UAV, FLIR and NIFC). Ten directly inspected official company sites meet the minimum for every project (3/3/4). Of 22 records, 21 were readable through web open and one is SEARCH_ONLY/UNVERIFIED. Fourteen quantitative entries preserve units, period, model/geography, context and limits. Reports separate observed marketing patterns and vendor claims from proposed personas/landing-page sections labeled PROJECT_ASSUMPTION. Vendor prices, official statistics and missing financial/market/ROI data are explicit. No market-size calculation, currency conversion, invented number or competitor media reuse.

**Technical decisions:** Keep non-runtime research in existing documents structure. Store one dated canonical record per project/page and link reports to it. Null means unavailable/not established, not necessarily absent from all public sources. The standard-library validator enforces required fields/types, dates, HTTPS without credentials, IDs, duplicate URLs, evidence labels and quantitative provenance; it is not a general JSON Schema engine and does not verify truth or network availability. Export deterministically renders adjacent Markdown; authored reports are preserved. Bounded search/open and browser inspection supply discovery/extraction; no unattended crawler, scheduler or change-monitoring service was implemented. No runtime architecture or API compatibility changes.

**Commands and verification:**
- `python3 scripts/research_dataset.py --export documents/research/*/2026-10-27_sources.json`: PASS, project counts 7/7/8, combined 22 unique records.
- Python/runpy negative checks: PASS, seven invalid cases rejected (duplicate, missing field, bad date, credentials in URL, search-only evidence promotion, missing figure scope, invalid confidence).
- Recomputed Markdown output matched all three generated source registers byte-for-byte. Python source compiled in memory; token audit found no code comments.
- Local Markdown file-target audit: PASS, 22 targets. Coverage assertions: PASS, 3/3/4 readable company sites. Quantitative entry count: 14.
- Public web search/open tested and source contexts inspected. Playwright navigation/read-only DOM extraction succeeded on Innovasea and AKVA; browser closed afterward. Third-party console errors/warnings were observed; they did not prevent titles/headings/link extraction.
- SHA-256 comparison against `/tmp/multifrontend-research-baseline.json`: all 85 audited pre-existing files unchanged before this log append, including global Codex configuration and application tracked files. This log's previous bytes are preserved as an exact prefix.
- `git diff --check`: PASS. Node v22.22.1 and Python 3.14.4 observed.

**Unsuccessful attempts and limitations:** Shell HTTPS initially failed sandbox DNS; required approved escalation retry received HTTP 403 for Innovasea robots.txt. Direct fetch was not bypassed. Six early web click attempts used URL rather than fetched reference IDs and failed; corrected reference-ID calls succeeded. Daviteq direct page timed out twice; no snippet-derived numbers admitted. Legacy FLIR UAS and an initial Honeywell path returned 404; accessible narrower/current sources were found and scope preserved. AgentPatch marketplace consumer docs returned 410, homepage timed out, blog returned 502; indexed first-party docs and MIT SDK repository establish historical offering, not current operational access. An initial local-link audit found the not-yet-written coverage document; created it and all links passed. Some robots URLs were inaccessible; Dräger/DJI rules were retrieved, but a complete robots/terms audit was not completed. No recursive crawl ran; future batches require established permission. AKVA cookie/carousel repetitions were filtered manually; Flyability zero animation placeholders discarded. Country, publication dates, baseline methods, vendor financials and local market data remain incomplete where stated. Videos were not analyzed. No paid API, credentialed integration or unexposed MCP was tested. Frontend/simulator/Docker suites not run because no runtime/dependency changes were made.

**Next steps:** Validate target geography, buyer needs and demonstrated project capabilities; gather official regional procurement/financial evidence and independent customer/agency studies; measure project-specific outcomes before publishing performance or ROI claims. Recheck commercial terms and numbers before drafting website copy. Workflow can be rerun with existing Codex web/Playwright tools and dated JSON, then the local validation/export command. No marketing website implementation authorized or performed in this session.

**Git status:** Branch `feat/firescout-uav-dashboard`, observed HEAD `798915b86f79810c667fc661667aa1727f7a4e5a`. Substantial pre-existing uncommitted work preserved; new task artifacts and this append remain uncommitted/unstaged. No commit, push, merge, reset or global configuration mutation performed.


## 2026-10-27 — Deep competitor research and Vietnamese marketing content packages

**Objective and dates:** Research and prepare business-oriented website content for AquaSense, FactSafe and FireScout AI; no frontend/dashboard/simulator implementation. First recorded audit: 2026-10-27T11:52:36+07:00. Research, drafting and verification completed/logged: 2026-10-27T12:29:46+07:00 (Asia/Bangkok).

**Repository knowledge review:** Read AGENTS.md, current README, development log, specifications, delivery reports, resource organization, historical executive summary and prior business-research pilot. Inspected actual project config and simulator classes, plus FireScout chat implementation, to distinguish demo artifacts from product proposals. A filename walk including ignored documents found no PDF/DOCX/PPTX/XLSX originals. Referenced AquaSense proposal/pitch, FactSafe proposal and FireScout proposal/pitch are missing. Recorded indirect source locations and version conflicts: AquaSense device/BOM costs, FireScout prototype costs (both original values absent); historical versus current simulation lifecycle, scenario aliases, AI proposals and compliance/integration claims. Did not invent missing financial assumptions or resolve conflicting prices silently.

**Files created:** 26 research artifacts, all under `documents/research/`. Each project received seven files: `PROJECT_FACT_SHEET.md`, `COMPETITOR_RESEARCH.md`, `MARKET_EVIDENCE.md`, `MARKETING_STRATEGY.md`, `WEBSITE_CONTENT.md`, `CLAIM_REGISTRY.md`, `CLAIM_REGISTRY.json` (21 files). Added `RESEARCH_SUMMARY.md` and four shared files: `2026-10-27_PROJECT_KNOWLEDGE_AUDIT.md`, `2026-10-27_EDITORIAL_REVIEW.md`, `2026-10-27_ACCESS_LEDGER.json`, `2026-10-27_VISUAL_OBSERVATIONS.json`. Appended this log. No existing research overwritten, files moved or deleted, source code comments added, runtime/source/dependency/configuration/asset changes made. Previous pilot reports and source records preserved. No confirmed implementation bug found/fixed; docs/BUGBOOK.md was not modified by this task.

**Research performed:** Eight companies per project, 24 total. AquaSense: RYNAN, Innovasea, AKVA, Farmext/Tep Bac, JALA, OxyGuard, CageEye (Bluegrove redirect), Hanna. FactSafe: Blackline, Dräger, Honeywell, Daviteq, Industrial Scientific, MSA, RKI, Viet An. FireScout: DJI Enterprise, Flyability, Teledyne FLIR OEM, CT UAV, Skydio, Parrot, Fotokite, Gremsy. Clearly identified adjacent providers and discontinued products rather than treating all as identical direct competitors. Coverage tables distinguish readable/partial/missing homepage, solution, industry, case, about, commercial and contact evidence. Not every company had eight fully inspected page categories. Ledger records 119 observations across 96 distinct URL strings including failed/partial and repeat checks, not 96 independent usable sources. Browser sampled 24 company sites: 18 useful DOM/style samples, six limited/unavailable. No competitor media copied into assets; no form, login, account, paid API or recursive crawl used.

**Primary-source findings:** FAO and VASEP aquaculture/export context; peer-reviewed shrimp hypoxia study; ILO occupational burden; NIOSH monitor-evaluation criteria; Ministry of Public Security fire statistics; NIST thermal limitations; Cheshire police thermal-UAV rescue report; AAIB record-only incident limitations; FAA forecast source discovery; official Vietnamese UAV regulatory explanation. Preserved measurement units, reporting years/windows, publication dates when available and confidence. Vietnam occupational accident totals remain secondary-source verified pending signed-original inspection. Official fire sources labeled 2025 contain different totals; recorded both, did not merge them, and explicitly selected the later publication with defined window/preliminary status for copy. SIRAS official end-of-sales and support dates recorded; not presented as a currently sold-new UAV. QCVN/other legal retrieval and current-applicability gaps remain flagged; no legal-compliance claim admitted. No revenue, ROI, TAM, currency conversion, market share or CAGR fabricated/calculated.

**Content and technical decisions:** New materials primarily professional Vietnamese. Each website draft contains all ten requested content areas, eight FAQ answers, title/meta, Vietnamese/English keyword hypotheses and H1/H2/H3 outline. Copy describes a prototype and explicitly simulated demos; proposed buyer benefits, commercial models and pilot invitations are separated from delivered capabilities. Each project has 16 traceable claims in Markdown/JSON, 48 total: 45 PENDING (no real publication approval supplied), three NO (unsupported guarantee/certification/achievement wording). No YES approval invented. Local paths used for uncommitted project evidence instead of fabricated GitHub permalinks. Contact details/partners/customers/endorsements absent unless actually supported; no invented contacts added. Existing web and Playwright tools reused; no new tool, MCP, skill or global configuration installed/changed. Existing research validator left unchanged.

**Validation actually executed:**
- Python structural/content audit: PASS for all three packages, seven files each; website sections numbered 1–10; eight FAQ answers each; 16 unique claim IDs per project; required registry fields, approval/confidence enums and local source paths valid.
- Claim cross-reference check: PASS, all website claim IDs resolve; no registry claim marked NO is used as a claim ID in website copy. All 48 IDs globally unique; JSON/Markdown headings consistent. Counts: 45 PENDING, three NO.
- New JSON parsing and local Markdown target audit: PASS, 162 local targets exist. Website copy audit found no invented email or +84 phone number. Keyword recommendations explicitly hypotheses, demonstrations explicitly simulated.
- Ledger/profile count assertions: PASS, 119 observations, 96 URL strings, 24 visual samples split 18/6. Failure/challenge/empty-DOM styles excluded from brand conclusions.
- `python3 scripts/research_dataset.py documents/research/*/2026-10-27_sources.json`: PASS, unchanged pilot 7/7/8 project records, 22 combined unique records.
- `git diff --check`: PASS.
- SHA-256 comparison with `/tmp/multifrontend-content-baseline.json`: all 124 pre-existing audited files unchanged before log append, including frontend, simulator, old research, instructions and configuration. Prior development-log bytes preserved as an exact prefix; afterward this log is the sole modified baseline file.
- Read-only Playwright navigation/DOM inspection completed; browser tab closed after research. Third-party console errors/warnings observed; these do not verify or disprove product claims.

**Unsuccessful retrievals / verification limits:** YSI home web returned 403 and was not adopted as an eighth fully reviewed company; Hanna was used as a separate equipment benchmark. Hanna US, FLIR and Dräger browser views had challenge/access-denied screens; Honeywell navigation failed; MSA/Fotokite DOM samples lacked useful headings (limited rather than invented styles). Several JALA detail pages exposed footer/navigation only. Innovasea attempted about URL 404; RYNAN about, CageEye news and Farmext contact not retrievable through web. Ministry of Health PDF timed out, VBPL returned 403, VSQI pages returned Website Disabled; signed UAV PDF opened without extractable text, so legal context uses the official explanatory article with applicability still pending. Trà Vinh attachment for accident report timed out; secondary reproduction and VOV are labeled accordingly. No authentication or anti-bot restrictions bypassed. Missing case-study baselines, public regional bundle prices, financials, adoption surveys and independent project outcomes explicitly recorded. No full pixel-based visual audit or competitor video evaluation claimed. Frontend build, simulator suites and Docker were not rerun because this task only adds documents; historical test results are not reported as new tests.

**Remaining work / next phase:** Obtain original proposal/pitch versions and reconcile costs; verify real contact channels and approve copy/claims; validate buyer hypotheses and regulatory applicability with responsible specialists; establish field pilot methodology and independent ground truth; collect commercial evidence before adding prices/ROI/traction. Then derive original landing-page design and implementation from the three content packages, retaining truthful demo labels and excluding unsupported claims. This task produced no frontend design/implementation, deployed site, functioning form, signed pilot, legal approval or publication.

**Git state:** Branch `feat/firescout-uav-dashboard`, HEAD `798915b86f79810c667fc661667aa1727f7a4e5a`. Substantial pre-existing uncommitted changes preserved. Research artifacts and log append remain uncommitted/unstaged. No commit, push, merge, reset or broad permissions/configuration change performed.


## 2026-10-27 — Continue research into landing-page content handoff and pilot validation

**Objective / dates:** Continued the user's “tiep tuc di” within the existing research/content-only scope. Prepared concrete editorial handoff materials and investigated outstanding official evidence; no frontend implementation or publication inferred. First recorded audit: 2026-10-27T23:08:34+07:00. Completed and logged: 2026-10-27T23:14:33+07:00 (Asia/Bangkok).

**Changes:** Created eight documents under `documents/research/`: `LANDING_PAGE_HANDOFF.md` and `CONTENT_MAP.json` in each of `aquasense/`, `factsafe/`, `firescout/` (six files), plus `shared/PILOT_VALIDATION_PLAN.md` and `shared/2026-10-27_FOLLOWUP_SOURCES.json`. Appended a supplementary verification section to `factsafe/MARKET_EVIDENCE.md` and a handoff index to `RESEARCH_SUMMARY.md`. Appended this log. No files deleted or moved; no runtime code, assets, dependencies, MCP/global configuration, pilot datasets or claim registries changed. No confirmed implementation bug found/fixed, so `docs/BUGBOOK.md` unchanged by this session.

**Decisions / content:** Kept WEBSITE_CONTENT.md as the canonical copy; new JSON maps reference exact headings, claim IDs and supporting sources instead of duplicating text. Ten content areas per project, with SEO marked metadata rather than a visible section. Briefs specify buyer journey, section purposes, media needs, demo scenario sequence, mandatory simulation labels, CTA behavior when contact/demos are unavailable and editorial acceptance criteria. Existing `?project=` selection logic/config scenario IDs inspected as code evidence only; no public demo URL or new route invented. Unconfirmed contact destinations and publication approval remain null. Existing 48 claims retain 45 PENDING / three NO. Pilot plan proposes buyer interviews, project-specific measurements, units, independent ground truth, versioning, baseline/cost methodology and evidence-to-copy workflow; no pilot, customer, performance target or ROI result asserted.

**Research / problems:** Reused built-in web capabilities; no installation needed. Follow-up ledger records six unique source URLs, including failures/metadata, not six fully verified sources. Read the 36-page archived Ministry of Health Circular 10/2019/TT-BYT PDF text sufficiently to verify identity, initial dates and scope; not a review of every exposure table or subsequent amendments. Circular 02 official metadata accessible; attachment timed out. Tuyen Quang .doc-suffixed URL serves HTML metadata, not retrieved DOC text. VBPL still returned 403. Candidate Quang Ngai accident-report PDF exceeded tool size limit (20,632,092 bytes); search-index date differs from existing reproductions, so no signed-original verification or automatic date correction claimed. PDF screenshot attempts included one error; conclusions rely on readable text/metadata rather than an asserted complete visual audit. No access restriction bypass, paid service, account, form submission or outreach used. Original evidence ledger/history preserved; supplementary sources do not increase competitor count.

**Verification actually run:**
- Python content-map audit: PASS for all three projects, ten unique sections each, exact source headings, registry references, exclusion of NO claims, matching current config scenario IDs, source paths, explicit simulation labels and null unconfirmed approval/contact/public-URL fields.
- Registry preservation/count audit: PASS, 48 existing claims, 45 PENDING and three NO; no statuses promoted.
- New/updated Markdown target audit: PASS, 67 local links exist; follow-up JSON contains six unique URL records and parses; eight new documents present.
- `python3 scripts/research_dataset.py documents/research/aquasense/2026-10-27_sources.json documents/research/factsafe/2026-10-27_sources.json documents/research/firescout/2026-10-27_sources.json`: PASS, 7/7/8 records, 22 combined unique records.
- `git diff --check`: PASS before log append.
- SHA-256 baseline `/tmp/multifrontend-continued-research-baseline.json`: 150 existing files checked; before logging, only the two intended research Markdown files changed. Frontend/simulator, previous research, claim registries and pre-existing dirty work preserved. Development log retained as exact previous byte prefix.
- Frontend build, browser runtime demo tests, simulator tests and Docker not run: documentation-only continuation, with no runtime modification. These checks do not certify external source availability, regulatory applicability or real product performance.

**Remaining work:** Obtain original proposal/pitch files and reconcile costs; validate contact destination, media rights and wording with project owners; verify current legal applicability before describing field deployment; run buyer/pilot research only under a separately agreed practical protocol. New briefs are ready for editorial/design handoff, not a deployed site. Frontend implementation remains outside this continuation. No installation, commit, push or deployment performed.

**Git state:** Branch `feat/firescout-uav-dashboard`; observed HEAD `798915b86f79810c667fc661667aa1727f7a4e5a`. Existing substantial uncommitted work preserved; new documents and log append remain uncommitted/unstaged.


## 2026-10-28 — Completion audit of research and content preparation

- User requested continuation only if work remained incomplete. Rechecked required artifacts and content references; the research/content deliverables are complete. No frontend work inferred or started.
- Verification recorded at 2026-10-28T18:50:01+07:00: PASS, nine deliverables per project, ten website content sections and 16 registry claims per project; website claim references resolve and exclude NO entries. Shared summary, pilot validation plan, tool comparison/setup/workflow and prior session logs exist. `git diff --check` passed. No external-source revalidation or runtime tests performed in this documentation audit.
- Only this dated entry appended; no research, runtime, configuration or asset changes. Existing uncommitted work preserved; no commit/push. Remaining original documents, contact details, publication decisions and field evidence are documented follow-up inputs, not fabricated results. Frontend development requires a subsequent task. No confirmed bug found; BUGBOOK unchanged.

## 2026-10-28 — AquaSense website content and information architecture research

- Objective: execute the revised marketing brief, prioritize actual website content and navigation over financial analysis, and produce five research deliverables without React changes.
- Session start observed: 2026-10-28 19:04:27 +07:00; deliverables reviewed and validation completed at 19:11:47 +07:00. Documentation entry appended afterward in the same session.
- Created under `documents/research/aquasense/`: `WEBSITE_MENU_BENCHMARK.md`, `WEBSITE_SECTION_INVENTORY.md`, `RESOURCES_CONTENT_PLAN.md`, `WEBSITE_COPY_DRAFT.md`, `SOURCE_AND_CLAIM_REGISTER.md`. Modified this root log by appending; no files deleted or moved by this task.
- Research: inspected four requested official domains (two related RYNAN domains, Innovasea and AKVA; three company groups), recording 22 page records, exact source links, page order/content, evidence/media/CTA types, relevance and project-support judgments. Covered solutions, services, learning resources, news, cases, identity and enquiry routes; noted card-level versus body-level coverage. Proposed a phased Vietnamese sitemap and eight article outlines with readers, questions, sources and review gates. Drafted 16 Vietnamese sections plus an explicitly unsupported claim quarantine and metadata.
- Decisions: treat synthetic demo capability separately from proposed features and field evidence; exclude financial analysis, performance guarantees, fabricated services, contacts and customer results. READY is evidence-safe draft wording, not publication approval. No UI routes, resource articles, service contracts or form backend were implemented. Existing research retained as historical evidence.
- Source limitations / unsuccessful access: requested root brief was absent; canonical brief found and read at `documents/research/aquasense/AQUASENSE_CODEX_WEBSITE_CONTENT_RESEARCH.md`. Repository DOCX/PDF search found no original marketing attachment, so pp.3–6 feedback/screenshots are attributed to its transcription rather than claimed visually inspected. AKVA extraction omits complete dynamic navigation and gates some manuals; did not bypass login. Innovasea resource extraction exposed deprecation notices but usable content. Its contact page was reopened successfully to confirm form fields. External press stories, all linked blog bodies, AKVA dedicated customer-case coverage and form submission behavior were not independently verified.
- Validation: Python checks passed for all five deliverables, local Markdown targets, 22 page records, at least eight resource ideas and READY/NEEDS_REVIEW/UNSUPPORTED/COMING_SOON labels. Reviewed generated content and adjusted contact-page evidence after fresh inspection. `git diff --check` passed. `find frontend simulator -type f -newermt '2026-10-28T19:04:27+07:00'` with dependency/cache exclusions returned no files, consistent with no runtime edits during this task. External source URLs were opened through web research; this is not an exhaustive linked-site crawl or availability guarantee. Runtime tests/build/typecheck were not run because changes are Markdown-only; historical test results were not presented as rerun results.
- No application architecture or algorithms changed. No confirmed application bug fixed; `docs/BUGBOOK.md` not modified by this task.
- Known issues / next steps: obtain original reference for visual verification; review full dynamic menus before implementation; approve identity/contact/privacy and demo destination; write/review planned articles; obtain hardware/service specifications and consented pilot evidence before public claims. Biological explainers require specialist sources/review. No financial modelling follow-up required.
- Git: branch `feat/firescout-uav-dashboard`; observed HEAD `798915b86f79810c667fc661667aa1727f7a4e5a`. Large pre-existing modified/untracked working tree preserved. Five new deliverables and this appended log remain uncommitted; no staging, commit or push performed.

## 2026-11-02 — Commit and publish the outstanding working tree

- Objective: fulfill the user's clarification that outstanding modified and untracked work must also reach GitHub; the preceding push published only the existing branch commit.
- Start observed: 2026-11-02T23:48:16+07:00. Validation finished by 23:50:25+07:00; commit/push to follow this entry. Branch: `feat/firescout-uav-dashboard`, initial HEAD `798915b86f79810c667fc661667aa1727f7a4e5a`, tracking `origin/feat/firescout-uav-dashboard`.
- Reviewed existing tracked diff/stat and untracked inventory. Publishing accumulated work includes FireScout UAV panels, telemetry adapter and local chat integration/tests; shared simulator/frontend changes; Docker/build configuration; canonical assets and documentation migration; research tooling and all three projects' research, including the five AquaSense website deliverables. Existing moves/deletions are preserved. This session adds only this log entry; it introduces no new runtime implementation or refactor.
- Validation: `npm --prefix frontend test` passed all four test files; `npm --prefix frontend run build` passed TypeScript and Vite, with the existing large-chunk warning (757.79 kB JS before gzip). `.venv/bin/python -m unittest discover -s simulator/tests` initially ran 38 tests with five socket-permission errors inside the sandbox; rerun outside the sandbox passed all 38 tests. `git diff --check` passed. Credential-pattern scan of candidate files and the four-entry reference ZIP found no matching private-key/AWS/GitHub/OpenAI credential patterns; no files exceeded 20 MiB. This limited pattern scan is not a comprehensive security audit.
- No new confirmed bug was fixed in this publishing session; accumulated changes to `docs/BUGBOOK.md` are included as previously authored. Browser, Docker build and live Ollama integration were not rerun; no new code was written in this session. Known warning: frontend bundle size. Secrets/build dependencies remain subject to existing ignore rules; no force-add of ignored files.
- Commit plan/status at entry: stage all nonignored outstanding changes, create a normal commit and push to the current upstream, then verify a clean working tree and matching local/upstream commit. The new hash and actual push outcome will be reported after execution rather than invented here. No force push, history rewrite, deployment or merge requested.
- Final staging review at 2026-11-02T23:52:10+07:00: 152 files in the staged diff, with Git detecting canonical document/asset renames. Initial `git add -A` was blocked by read-only sandbox Git metadata; staging outside the sandbox succeeded. Default `git diff --cached --check` flagged existing Markdown end-of-line spaces, including intentional hard breaks. Preserved source formatting; `git -c core.whitespace=-blank-at-eol diff --cached --check` passed. No repository-wide whitespace setting changed.
