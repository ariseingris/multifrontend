# Troubleshooting the three-project setup

Current projects: AquaSense, FactSafe, FireScout AI. Current simulator entrypoint:
`simulator/server.py`. Earlier plans and delivery reports may contain historical
paths and removed-project examples; use the root README for current commands.

## No dashboard or wrong project

Run `npm --prefix frontend run dev`, then open
`http://localhost:5173/?project=aquasense`, `?project=factsafe`, or
`?project=firescout`. A supported query overrides `VITE_PROJECT`; invalid settings
fall back to a supported environment value or AquaSense. The settings dialog
contains the same three options.

## No telemetry

Run `.venv/bin/python simulator/server.py` in another terminal. Open Scenarios and
Run a scenario. New sessions do not autoplay unless `--autostart` is passed.
Unavailable cards and empty charts are expected before the first packet. The
frontend does not generate fallback readings for the active dashboards.

For a remote browser, `VITE_WS_URL` must address a reachable simulator hostname.
Use `--host 0.0.0.0` if the simulator should accept remote connections. Check the
browser Network/WebSocket panel for packets and console for connection failures.

## Port already in use

Inspect listeners with `ss -ltnp` and stop the earlier process you started before
launching another on 5173 or 8765. Do not run quickstart alongside an already
running local stack. `./quickstart.sh` stops its own simulator on exit.

## Scenario takes too long

AquaSense/FactSafe durations are simulated minutes; use 600x for a 6–12 second
review. FireScout durations are simulated seconds; use 10x for a 12 second mission.
Choose next-run speed while stopped; active speed is acknowledged by the server.
Pause must freeze both sample emission and simulation time. Resume continues;
Reset clears the session and awaits Start.

## Wrong or stale data after project changes

Project selection navigates to a new document, disposing prior page stores/socket.
Packets are filtered by project and session. A server only serves one project at
a time: start the newly selected project's scenario to switch its backend session.
Reconnect can restore a paused/completed cached sample; its timestamp stays old.

FireScout's smoke/link-loss scenario deliberately suppresses telemetry at 78–90s.
The synthetic state channel reports STALE / NO SIGNAL. Frames unavailable at
70–94s cause missing thermal/confidence values, not zero readings or live estimates.

## Build or checks fail

```bash
npm --prefix frontend ci
npm --prefix frontend test
.venv/bin/python -m unittest discover -s simulator/tests -v
cd frontend
./node_modules/.bin/tsc --noEmit
npm run build
```

Use the same Python interpreter for dependency installation and simulator/tests.
`npm run lint` remains unconfigured in the baseline; the missing ESLint setup is
separate from TypeScript/build validation. Vite's >500kB bundle warning is non-fatal.
