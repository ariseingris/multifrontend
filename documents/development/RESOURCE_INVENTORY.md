# Resource inventory and migration map

Audit date: 2026-10-27. Prepared before relocation. Paths are repository-relative. File bytes were backed up and hashed before changes. Filesystem renames preserve existing edits and leave the Git index unstaged; no original document content is discarded.

| Original path | Destination | Classification and decision |
| --- | --- | --- |
| `EXECUTIVE_SUMMARY.md` | `documents/references/EXECUTIVE_SUMMARY.md` | Non-runtime development/history document |
| `Screenshot From 2026-10-23 20-10-12.png` | `documents/references/screenshots/figma-dashboard-reference-2026-10-23.png` | Design reference; preserve original archive/image bytes |
| `docs/AQUASENSE_CONTINUOUS_SIMULATION.md` | `documents/development/AQUASENSE_CONTINUOUS_SIMULATION.md` | Non-runtime development/history document |
| `docs/AQUASENSE_FACTSAFE_TELEMETRY_FIX.md` | `documents/development/AQUASENSE_FACTSAFE_TELEMETRY_FIX.md` | Non-runtime development/history document |
| `docs/CODEX_FIX_AQUASENSE_FACTSAFE_TELEMETRY.md` | `documents/specifications/CODEX_FIX_AQUASENSE_FACTSAFE_TELEMETRY.md` | Source-of-truth specification; update references |
| `docs/DELIVERY.md` | `documents/development/DELIVERY.md` | Non-runtime development/history document |
| `docs/DEMO_FRONTEND_MASTER_PLAN.md` | `documents/specifications/DEMO_FRONTEND_MASTER_PLAN.md` | Source-of-truth specification; update references |
| `docs/FIGMA_DASHBOARD.md` | `documents/development/FIGMA_DASHBOARD.md` | Non-runtime development/history document |
| `docs/FIRESCOUT_UAV_DASHBOARD_CODEX_SPEC.md` | `documents/specifications/FIRESCOUT_UAV_DASHBOARD_CODEX_SPEC.md` | Source-of-truth specification; update references |
| `docs/FIRESCOUT_UAV_DELIVERY.md` | `documents/development/FIRESCOUT_UAV_DELIVERY.md` | Non-runtime development/history document |
| `docs/KEEP_THREE_PROJECTS.md` | `documents/development/KEEP_THREE_PROJECTS.md` | Non-runtime development/history document |
| `docs/MULTICHART_PROJECT_SPEC.md` | `documents/specifications/MULTICHART_PROJECT_SPEC.md` | Source-of-truth specification; update references |
| `docs/MULTIFRONTEND_SCENARIOS_CODEX_SPEC.md` | `documents/specifications/MULTIFRONTEND_SCENARIOS_CODEX_SPEC.md` | Source-of-truth specification; update references |
| `docs/MULTI_PROJECT_SCENARIOS_DELIVERY.md` | `documents/development/MULTI_PROJECT_SCENARIOS_DELIVERY.md` | Non-runtime development/history document |
| `docs/TROUBLESHOOTING.md` | `documents/development/TROUBLESHOOTING.md` | Non-runtime development/history document |
| `docs/screenshots/firescout-desktop.png` | `documents/references/screenshots/firescout-desktop.png` | Design reference; preserve original archive/image bytes |
| `docs/screenshots/firescout-mobile.png` | `documents/references/screenshots/firescout-mobile.png` | Design reference; preserve original archive/image bytes |
| `figma-react-patch (1).zip` | `documents/references/figma-react-patch.zip` | Design reference; preserve original archive/image bytes |
| `frontend/src/assets/dashboard-logo.png` | `assets/shared/logos/dashboard-logo.png` | Runtime shared logo; Vite publicDir serves one canonical copy |
| `bead-pattern(2).png` | `assets/shared/logos/dashboard-logo.png` | Byte-identical duplicate of the runtime logo (SHA-256 `094684458a0fdc25eda49e30e6543be0516d2b8a93530306556fc6c2c90d2709`); duplicate consolidated after production output byte comparison and successful browser logo/favicon verification for all three projects. |
| `docs/BUGBOOK.md` | unchanged | Authoritative agent workflow and existing log anchors. |
| `AGENTS.md`, `README.md`, `DEVELOPMENT_LOG.md` | unchanged | Required root instructions, entry point and append-only development log. |
| `frontend/README.md`, `simulator/README.md` | unchanged | Component-local setup guides; links updated. |
| `frontend/src/**` except the logo | unchanged | React/TypeScript/CSS source, generated SVG/inline icons, Leaflet external tiles; no media migration needed. |
| `frontend/index.html`, `frontend/vite.config.ts`, Docker files | unchanged locations | Runtime configuration; update canonical logo serving/build context only. |
| `frontend/package*.json`, `frontend/tsconfig*.json`, `frontend/nginx.conf`, `.gitignore`, `docker-compose.yml`, `quickstart.sh` | unchanged locations | Required configuration and launch scripts. No root package.json exists. |
| `simulator/**` | unchanged | Python runtime/tests/configuration; no local media discovered. |
| `.venv/`, `frontend/node_modules/`, `frontend/dist/`, caches, `.playwright-mcp/`, `.git/` | excluded | Dependencies, generated/local artifacts and Git metadata are not reusable repository resources. |

No PDF, DOCX, PPTX, local video, project research reports, CSS file URLs, dynamic media imports or Vite public directory existed at audit time. Project research/media directories are reserved for future resources. Screenshots are documentation-only references, not website media.

Old path mentions in the append-only DEVELOPMENT_LOG.md remain historical evidence; use this map for current locations. Historical directory-tree examples in earlier plans describe their original architecture.
