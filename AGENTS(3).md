# AGENTS.md — AI Agent Operating Protocol for Demo Frontend

## 0. Mission

This repository is a **demo-first frontend platform** for 9 projects:

1. VitalChain
2. PulseGuard
3. FactSafe
4. AquaSense
5. Hirdop Power
6. DataCool
7. STEMLab AI
8. FireScout AI
9. PAM

The primary objective is to produce **beautiful, credible, stable, judge-facing demo UIs** that can be recorded through OBS.

The agents must execute the project **step by step**, using these three documents as the primary specifications:

- `DEMO_FRONTEND_MASTER_PLAN.md` — global architecture, workflow, simulator/demo behavior, QA, performance, delivery.
- `MULTICHART_PROJECT_SPEC.md` — project-specific chart systems, simulator causality, ranges, thresholds, scenarios, validation and QA.
- `BUGBOOK.md` — the running log of real bugs already found in this codebase and the rules written to prevent them. It is not optional background reading; several of its rules are now hard requirements in this document (see Section 9.1 and Section 17.1).

Do not replace these specifications with personal assumptions.

---

# 1. Source-of-Truth Hierarchy

When making a decision, use this order:

1. `DEMO_FRONTEND_MASTER_PLAN.md`
2. `MULTICHART_PROJECT_SPEC.md`
3. `BUGBOOK.md` (for anything touching WebSocket, simulator integration, chart continuity, or long-running stability — these are already-diagnosed failure modes, not open questions)
4. Existing repository architecture and working code
5. Project-specific existing documentation
6. Explicit user instructions in the current task
7. General engineering/design knowledge

If two specifications appear to conflict:

- do **not** silently choose one;
- inspect the relevant sections;
- preserve the higher-level architecture;
- report the conflict before making a destructive change.

### Important

`SOURCE-VERIFIED`, `DEMO-DEFAULT`, and `PLACEHOLDER` are different categories.

Never present a `DEMO-DEFAULT` or `PLACEHOLDER` value as a verified real-world regulatory threshold.

---

# 2. Current Repository State

The repository currently contains:

```text
├── AGENTS.md
├── BUGBOOK.md
├── DELIVERY.md
├── DEMO_FRONTEND_MASTER_PLAN.md
├── EXECUTIVE_SUMMARY.md
├── frontend
│   ├── index.html
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   ├── App.tsx
│   │   ├── core
│   │   │   ├── components
│   │   │   ├── hooks
│   │   │   ├── store.ts
│   │   │   ├── types
│   │   │   └── utils
│   │   ├── main.tsx
│   │   ├── projects
│   │   │   └── vitalchain
│   │   └── special
│   ├── tsconfig.json
│   └── vite.config.ts
├── .gitignore
├── MULTICHART_PROJECT_SPEC.md
├── quickstart.sh
├── README.md
├── simulator
│   ├── README.md
│   ├── requirements.txt
│   └── vitalchain_simulator.py
└── TROUBLESHOOTING.md
```

Haiku 4.5 has completed the **first implementation stage**. Since then, a first round of integration bugs (WebSocket handler signature, fallback-random data masking a dead simulator, stale connection state, controls not actually commanding the simulator, jittery/discontinuous chart data, build/import errors, port conflicts, mismatched Python environments, unbounded timeline/alert growth) has been found and fixed, and the fixes and the rules to prevent recurrence are recorded in `BUGBOOK.md`.

Therefore, future agents must treat the current implementation as an existing, already-debugged baseline, not as an empty project — and must not reintroduce any of the failure modes already catalogued in `BUGBOOK.md`.

Before modifying code, inspect what is already implemented **and** check `BUGBOOK.md` for whether the area you're touching has known failure modes.

---

# 3. Core Agent Philosophy

## 3.1 Do not rebuild blindly

Never rewrite a working system merely because another implementation looks cleaner.

First determine:

- what exists;
- what works;
- what is incomplete;
- what is visually weak;
- what violates the specification;
- what is risky to change.

Prefer incremental changes.

## 3.2 Separate responsibilities

The system has three major concerns:

```text
UI / UX
   ↓
Frontend state + rendering
   ↓
Simulator / demo data
```

An agent working on UI must not casually modify simulator logic.

An agent working on simulator behavior must not redesign the entire UI.

A QA agent may inspect both, but should make the smallest possible fix.

## 3.3 Demo quality is a first-class requirement

The UI must look convincing at:

- normal speed;
- accelerated demo speed;
- 16:9 recording;
- judge-facing presentation;
- scenario transitions.

A technically correct UI that looks unfinished is not considered complete. Nor is a UI that looks polished but is silently disconnected from the simulator (see Section 9.1).

---

# 4. Mandatory Workflow

Every project must follow this sequence unless the user explicitly changes it.

```text
READ SPEC
   ↓
AUDIT CURRENT STATE
   ↓
DEFINE SCOPE
   ↓
IMPLEMENT FOUNDATION
   ↓
IMPLEMENT HERO VISUAL
   ↓
IMPLEMENT SUPPORTING VISUALS
   ↓
CONNECT SIMULATOR
   ↓
IMPLEMENT SCENARIOS
   ↓
ADD ALERT / ACTION FLOW
   ↓
VISUAL AUDIT
   ↓
FUNCTIONAL QA
   ↓
DEMO QA
   ↓
PERFORMANCE QA
   ↓
FIX
   ↓
FINAL ACCEPTANCE
```

Do not skip directly from "code exists" to "done".

---

# 5. Phase 0 — Read Before Coding

Before touching a project:

### Required files to inspect

At minimum:

```text
DEMO_FRONTEND_MASTER_PLAN.md
MULTICHART_PROJECT_SPEC.md
BUGBOOK.md
README.md
frontend/README.md
simulator/README.md
```

Then inspect the relevant implementation files.

For VitalChain, start with:

```text
frontend/src/projects/vitalchain/
frontend/src/core/
simulator/vitalchain_simulator.py
```

### First response/report from an agent

The agent should identify:

```text
CURRENT STATE
- implemented:
- incomplete:
- broken:
- visually weak:
- specification gaps:
- risky areas:
- relevant BUGBOOK entries:

NEXT PHASE
- exact files to modify:
- exact objective:
- acceptance criteria:
```

Do not start a broad refactor before this audit.

---

# 6. Scope Lock

Before implementation, define a small scope.

Example:

```text
PHASE:
VitalChain — Hero Chart

ALLOWED:
- frontend/src/projects/vitalchain/**
- frontend/src/core/components/**
- frontend/src/core/hooks/**

READ-ONLY:
- simulator/**

FORBIDDEN:
- changing simulator contracts
- changing ports
- changing unrelated projects
- replacing the whole architecture
```

If a task requires changing another area, explain why before doing it.

---

# 7. UI Implementation Rules

## 7.1 Design system first

All projects should share the same underlying visual language:

- spacing system;
- typography hierarchy;
- card behavior;
- chart containers;
- status badges;
- alert states;
- buttons;
- transitions;
- responsive behavior.

Projects may have different visual identities, but they must still feel like one platform.

## 7.2 Avoid dashboard clutter

A dashboard is not a collection of every possible widget.

Prioritize:

```text
HERO
↓
Supporting evidence
↓
Risk / status
↓
Action
```

For most IoT projects:

- 1 HERO visualization
- 2–4 supporting visualizations
- limited KPI cards
- one obvious action path

Avoid simultaneously animating excessive charts.

## 7.3 16:9 first

The main demo viewport should work naturally in 16:9.

Check:

- no important content below the fold;
- no accidental vertical scrolling;
- no clipped charts;
- no oversized header;
- no microscopic text;
- no excessive empty space.

---

# 8. Chart Rules

## 8.1 Every chart must have a purpose

For every chart, the agent must be able to answer:

> "What decision does the viewer make from this chart?"

If there is no clear answer, remove or simplify it.

## 8.2 Never fake causality with independent random values

Do not use:

```text
random(min, max)
```

for every sensor independently.

Use the simulator's causal model:

```text
baseline
+ smooth noise
+ scenario component
+ correlated component
+ recovery component
```

Examples:

```text
rain → soil moisture → risk
```

```text
temperature → cold-chain risk → alert
```

```text
power → energy
```

Energy must be derived from power and time, not independently randomized.

## 8.3 Units must remain understandable

Do not put unrelated physical units onto the same Y-axis without a clear normalization strategy.

Use:

- separate charts;
- toggles;
- normalized severity;
- small multiples;
- secondary axis only when justified.

## 8.4 Charts must remain stable

Every animated chart must have:

- bounded point count;
- monotonic timestamps;
- bounded values;
- sensible update interval;
- no memory leak;
- no uncontrolled DOM growth.

## 8.5 Chart continuity (from BUGBOOK #5)

Known root causes of visible jumps/trend reversals in this codebase:

- linear interpolation changing slope at a step boundary;
- `hash(... int(elapsed))`-style noise that steps once per second instead of flowing continuously;
- broadcasting telemetry too fast (e.g. every `0.1s`), which floods the chart with points and makes normal noise look erratic.

Rules:

- use smooth transitions between simulation steps, never a hard slope change;
- noise must be deterministic, continuous, and small in amplitude;
- default telemetry broadcast interval is `1.0s` unless a spec explicitly requires otherwise;
- when changing simulator timing/interpolation, explicitly check continuity at `endAt - 0.1`, `endAt`, and `endAt + 0.1`.

---

# 9. Simulator Rules

The simulator exists to make the UI behave like a live system.

It is not merely a random number generator.

## 9.1 The frontend must actually be driven by the simulator (from BUGBOOK #2, #3, #4)

This is a hard requirement, not a style preference, because it has already caused a false "it's working" impression in this repo:

- `npm run dev` only starts Vite. It does **not** start the simulator. Always run the simulator (`simulator/vitalchain_simulator.py` or equivalent) as a separate process and confirm the frontend is actually connected to it before treating any chart behavior as verified.
- The UI's local fallback (`useLocalTelemetrySimulation()` or equivalent) exists only for when the WebSocket is not connected. It must **stop immediately** once a real WebSocket connection opens, and it must never be used as evidence that "the simulator is working" — it isn't the simulator.
- Connection state shown in the UI must reflect real socket state via React state (`useState`) updated in `onopen`/`onclose`, not a stale read of `wsRef.current?.readyState`. Reconnect timers must be cleaned up on unmount.
- Every UI control must send the real command over the WebSocket, not just update local Zustand state:

```text
Run    -> start_scenario
Pause  -> pause
Resume -> resume
Reset  -> reset
Speed  -> set_speed
```

  `Resume` must send `resume`, never re-send `start_scenario` (that resets the scenario instead of continuing it).

## Required properties

### Deterministic

Use seeded simulation whenever possible.

The same scenario should produce a reproducible demo.

### Smooth

Avoid:

```text
20
73
12
88
31
```

unless the scenario intentionally creates a sudden event.

Prefer:

```text
20
21
22
24
27
31
36
```

### Bounded

Every physical quantity must have hard limits.

### Scenario-driven

The simulator should produce recognizable stories:

```text
NORMAL
→ EARLY SIGNAL
→ WARNING
→ CRITICAL
→ ALERT
→ ACTION
→ RECOVERY
→ NORMAL
```

### Hysteresis

Do not allow a value hovering around a threshold to produce:

```text
WARNING
NORMAL
WARNING
NORMAL
WARNING
```

every tick.

Use hysteresis/debounce.

## 9.2 WebSocket handler signature (from BUGBOOK #1)

Different versions of the `websockets` library call the connection handler with a different number of arguments (`websocket` only, vs `websocket, path`). Write handlers defensively:

```python
async def handle_client(websocket, path=None):
    ...
```

Check the actual installed `websockets` version in the running environment, not just what `requirements.txt` says, and confirm with a real test client that receives at least one telemetry message after any change to the WebSocket handler.

## 9.3 Environment consistency (from BUGBOOK #8)

Package installation and script execution must use the **same** Python executable, or a working `pip install` can coexist with a `ModuleNotFoundError` at runtime:

```bash
.venv/bin/python -m pip install -r simulator/requirements.txt
.venv/bin/python simulator/vitalchain_simulator.py
```

## 9.4 Port discipline (from BUGBOOK #7)

- Only one simulator instance runs on port `8765` at a time.
- Stop the old process (`Ctrl+C`) before starting a new one.
- If diagnosing "simulator seems broken," check for `OSError: address already in use` / an existing listener (`ss -ltnp | grep ':8765'`) before assuming the code is at fault.
- If a different port is genuinely needed, update the frontend's WebSocket URL to match — do not do this silently (see Section 19).

---

# 10. Scenario Rules

Each major scenario should answer:

1. What changed?
2. Which sensor changes first?
3. Which correlated values follow?
4. When does risk increase?
5. When does the alert trigger?
6. What action is available?
7. What happens during recovery?
8. How does the system return to normal?

A scenario is incomplete if it only changes a number.

---

# 11. Alert Lifecycle

Where applicable, use:

```text
OPEN
↓
ACKNOWLEDGED
↓
RECOVERING
↓
RESOLVED
```

The UI must make state transitions visually obvious.

Avoid fake alerts that appear and disappear instantly.

---

# 12. AI Feature Rules

AI UI must not look like a generic chatbot unless the specification explicitly requires a chatbot.

For recommendation systems, show:

```text
DETECTED PROBLEM
↓
AI RECOMMENDATION
↓
EXPECTED EFFECT
↓
HUMAN DECISION
```

For example:

```text
Hotspot detected: Rack R17

Recommendation:
Increase cooling allocation to Zone B.

Expected effect:
- Temperature: -1.8°C
- Estimated energy impact: +3.2%

[ APPROVE ] [ REJECT ]
```

The purpose is to demonstrate intelligent decision support, not merely generate text.

---

# 13. Multi-Agent Role Separation

Agents should behave according to role.

## UI Designer / Builder

Responsible for:

- layout;
- visual hierarchy;
- typography;
- spacing;
- component composition;
- charts;
- animations;
- visual polish.

Must not redesign simulator architecture.

## Frontend Engineer

Responsible for:

- React/TypeScript correctness;
- state management;
- component architecture;
- simulator integration;
- performance;
- type safety.

## Simulator Engineer

Responsible for:

- deterministic data;
- scenario transitions;
- causality;
- thresholds;
- hysteresis;
- recovery.

## UI Critic

Responsible for finding:

- weak hierarchy;
- clutter;
- poor spacing;
- bad contrast;
- inconsistent components;
- misleading charts;
- awkward animation;
- unfinished states.

The UI Critic should not redesign everything automatically.

## QA Agent

Responsible for:

- build;
- runtime;
- console errors;
- broken interactions;
- scenario behavior;
- responsive/16:9 behavior;
- performance;
- regression;
- confirming the BUGBOOK checklist (Section 17.1) still passes.

---

# 14. Antigravity Execution Protocol

When an agent receives a task, it should internally follow:

```text
1. READ
2. PLAN
3. INSPECT
4. IMPLEMENT
5. RUN
6. VERIFY
7. AUDIT
8. REPORT
```

Do not claim success before verification.

### Before editing

State:

```text
I will inspect:
- ...
I will modify:
- ...
I will not modify:
- ...
```

### After editing

Run the most relevant checks.

At minimum where applicable:

```bash
npm run build
```

and/or:

```bash
npm run dev
```

plus targeted tests or lint/type checks if configured. If the change touches the simulator or WebSocket integration, also run the simulator as its own process and confirm with a real client that telemetry is received (Section 9.1, 9.2).

### Never report

> "Looks good."

Instead report concrete evidence:

```text
BUILD: PASS
TYPECHECK: PASS
RUNTIME: PASS
CONSOLE: CLEAN
SCENARIO: PASS
16:9: PASS
REGRESSION: PASS
```

If something cannot be verified, explicitly say:

```text
NOT VERIFIED
Reason: ...
```

---

# 15. Visual QA Protocol

Visual QA must be treated as engineering work.

Inspect the actual rendered page.

Check:

### Hierarchy

- Is the main story obvious within 2–3 seconds?
- Is the HERO actually dominant?
- Are supporting charts subordinate?

### Layout

- aligned edges;
- consistent spacing;
- no accidental overflow;
- no awkward empty areas;
- no overlapping cards.

### Typography

- readable at recording distance;
- clear hierarchy;
- no tiny labels;
- no excessive font variation.

### Charts

- readable axes;
- readable legends;
- threshold lines obvious;
- current state obvious;
- animation smooth;
- no jitter.

### Status

- normal/warning/critical states are unmistakable;
- alert state has sufficient visual emphasis;
- recovery is visible.

### Demo

The page must look intentional at the moment OBS captures it.

---

# 16. Functional QA Protocol

Test:

```text
Initial load
Scenario selection
Scenario transition
Chart updates
Alert creation
Alert acknowledgement
Recovery
Reset
Navigation
Buttons
Toggles
Selectors
```

Also check:

- browser console;
- failed network requests;
- React warnings;
- unhandled exceptions;
- stale state;
- race conditions.

---

# 17. Performance Rules

Do not sacrifice performance for visual effects.

Watch for:

- excessive React re-renders;
- expensive chart redraws;
- large history arrays;
- timers that are never cleaned up;
- duplicated event listeners;
- unnecessary animation loops.

Keep the visible history bounded.

The target is a smooth recording, not maximum data density.

## 17.1 Long-run stability checklist (from BUGBOOK #9, #10 — mandatory before marking a phase done)

Confirmed root causes of freeze-after-long-run in this codebase were unbounded `timeline.events`/`alerts` arrays (each growing forever via spread) and an elapsed-time interval that depended on its own output (`elapsedSeconds`), causing it to be destroyed and recreated every `100ms`.

Before declaring any phase complete, confirm:

- [ ] Timeline history is capped (≤ 200 most recent events).
- [ ] Alert history is capped (≤ 100 most recent alerts).
- [ ] Elapsed-time tracking uses a single fixed interval (e.g. an `advanceElapsed()` action) rather than an interval that depends on the value it updates.
- [ ] Every store that accumulates time-series data has a bound on its history length.
- [ ] No interval/timer is created inside a dependency that the same interval mutates.
- [ ] A stress test (extended run) was actually performed and telemetry/event/alert counts and memory were observed, not assumed.

---

# 18. Regression Rules

Before declaring a phase complete:

1. Build the application.
2. Start the relevant frontend.
3. Verify the changed feature.
4. Verify the main existing flow.
5. Verify that unrelated projects are not broken.
6. Check the console.
7. Confirm no accidental architecture changes.
8. Run the pre-flight checklist in Section 22.1 (`BUGBOOK.md` §10) for any project that adds or changes simulator/WebSocket integration.

If a shared component changes, test every project that uses it.

---

# 19. Do Not Do These Things

Never:

- rewrite the entire project without authorization;
- delete working components because they are imperfect;
- invent backend APIs;
- invent regulatory thresholds;
- independently randomize correlated sensors;
- modify simulator contracts during a visual-only task;
- add libraries without necessity;
- introduce huge dependencies for small visual effects;
- create a generic template that makes every project look identical;
- make every card animated;
- add charts simply to fill empty space;
- claim QA without actually running it;
- hide errors instead of fixing them;
- silently change ports;
- silently change file structure;
- silently change project scope;
- rely on the local-fallback random simulator as proof the real simulator works (BUGBOOK #2);
- reintroduce a bug already catalogued in `BUGBOOK.md` without first reading the relevant entry.

---

# 20. Prompt Discipline for Antigravity

When giving work to an AI agent, use this structure:

```text
ROLE
CONTEXT
SOURCE OF TRUTH
CURRENT STATE
TASK
ALLOWED FILES
FORBIDDEN FILES
ACCEPTANCE CRITERIA
VERIFICATION
REPORT FORMAT
```

Example:

```text
ROLE:
Frontend Engineer

CONTEXT:
VitalChain demo frontend.

SOURCE OF TRUTH:
DEMO_FRONTEND_MASTER_PLAN.md
MULTICHART_PROJECT_SPEC.md
BUGBOOK.md

CURRENT STATE:
Haiku 4.5 completed the initial implementation; first round of integration bugs fixed and logged in BUGBOOK.md.

TASK:
Improve the VitalChain HERO temperature chart.

ALLOWED:
frontend/src/projects/vitalchain/**
frontend/src/core/components/**

FORBIDDEN:
simulator/**
unrelated projects

ACCEPTANCE:
- HERO remains dominant
- threshold lines visible
- smooth live updates
- warning/critical states work
- 16:9 layout works
- no console errors

VERIFY:
npm run build
runtime test
scenario test

REPORT:
changed files
tests
results
remaining issues
```

---

# 21. Definition of Done

A phase is DONE only when all applicable conditions are satisfied.

## Code

- [ ] implementation matches specification;
- [ ] TypeScript/Python errors resolved;
- [ ] no unnecessary architecture changes;
- [ ] no obvious dead code introduced.

## UI

- [ ] visual hierarchy is clear;
- [ ] spacing is consistent;
- [ ] charts are readable;
- [ ] states are obvious;
- [ ] 16:9 layout works.

## Simulator

- [ ] deterministic where required;
- [ ] smooth;
- [ ] bounded;
- [ ] causal;
- [ ] scenario-driven;
- [ ] recovery works;
- [ ] hysteresis/debounce works where required;
- [ ] WebSocket handler signature verified against the installed `websockets` version (§9.2);
- [ ] frontend connection status reflects real socket state, no stale fallback (§9.1).

## QA

- [ ] build passes;
- [ ] runtime verified;
- [ ] console checked;
- [ ] interactions verified;
- [ ] scenario verified;
- [ ] regression checked;
- [ ] long-run stability checklist passed (§17.1);
- [ ] BUGBOOK pre-flight checklist passed for any new simulator/WebSocket work (§22.1).

## Demo

- [ ] normal state looks polished;
- [ ] alert state looks convincing;
- [ ] recovery is visible;
- [ ] no debug artifacts appear in recording mode;
- [ ] demo can be understood without explaining every widget.

---

# 22. Agent Report Template

Every completed phase should end with:

```text
## PHASE REPORT

### Phase
<name>

### Objective
<one sentence>

### Files Changed
- ...
- ...

### Files Not Changed
- ...

### Implementation
- ...
- ...

### Verification
- Build: PASS/FAIL
- Typecheck: PASS/FAIL/NOT RUN
- Runtime: PASS/FAIL
- Console: CLEAN/ISSUES
- Scenario: PASS/FAIL
- 16:9: PASS/FAIL
- Regression: PASS/FAIL
- BUGBOOK checklist (if applicable): PASS/FAIL/N/A

### Specification Compliance
- DEMO_FRONTEND_MASTER_PLAN: PASS/PARTIAL/FAIL
- MULTICHART_PROJECT_SPEC: PASS/PARTIAL/FAIL

### Known Issues
- ...

### New BUGBOOK Entries (if any bug was found and fixed this phase)
- ...

### Next Phase
<exact next phase>
```

## 22.1 BUGBOOK pre-flight checklist (from BUGBOOK §10)

Run this checklist before adding a new project's simulator/frontend pair, and re-run it as regression whenever shared simulator/WebSocket code changes:

- [ ] Simulator runs under the correct Python environment (same interpreter for install and run).
- [ ] WebSocket handler signature is compatible with the installed `websockets` version.
- [ ] Frontend displays real connection state, not a stale or assumed one.
- [ ] No random-fallback simulation runs while the WebSocket is open.
- [ ] Run/Pause/Resume/Reset/Speed controls send the correct corresponding command.
- [ ] Simulator broadcasts telemetry at the defined sampling rate.
- [ ] Metrics are deterministic, causally related, and do not jump at phase boundaries.
- [ ] A real test client has received telemetry over the WebSocket.
- [ ] `npm run build` passes.
- [ ] `python -m py_compile <simulator_file>.py` passes.
- [ ] Port availability was checked before concluding the simulator is broken.

## 22.2 Updating BUGBOOK.md (from BUGBOOK §11)

Whenever a new bug is found, add an entry to `BUGBOOK.md` before closing out the phase, recording:

1. Symptom and the original log/error text.
2. Reproduction conditions.
3. Root cause (not just the workaround).
4. File/code paths changed to fix it.
5. The command(s) used to confirm the fix.
6. The prevention rule for future projects.

If the new rule is general enough to apply beyond the current project, also add it to the relevant section of this file (`AGENTS.md`) so it becomes part of the standing protocol rather than staying buried in the log.

---

# 23. Recommended Execution Order for This Repository

Since the initial VitalChain implementation has already been completed, continue from the current state rather than restarting.

Recommended order:

```text
PHASE 1
Audit existing VitalChain implementation
        ↓
PHASE 2
VitalChain visual polish
        ↓
PHASE 3
VitalChain simulator integration
        ↓
PHASE 4
VitalChain scenario + alert lifecycle
        ↓
PHASE 5
VitalChain visual/functional/demo QA
        ↓
PHASE 6
Extract stable shared components
        ↓
PHASE 7
PulseGuard
        ↓
PHASE 8
FactSafe
        ↓
PHASE 9
AquaSense
        ↓
PHASE 10
Hirdop Power
        ↓
PHASE 11
DataCool
        ↓
PHASE 12
STEMLab AI
        ↓
PHASE 13
FireScout AI
        ↓
PHASE 14
PAM
        ↓
PHASE 15
Global integration + Demo Controller
        ↓
PHASE 16
Full regression
        ↓
PHASE 17
OBS recording validation
```

Do not parallelize multiple projects until the shared architecture is stable enough to avoid conflicting changes.

---

# 24. Special Rule for Existing Haiku Work

Haiku 4.5 has already completed the first coding prompt, and a first round of bugs found in that work has already been fixed and logged in `BUGBOOK.md`.

Therefore:

**Do not assume its work is wrong — and do not re-fix bugs already fixed.**

First:

```text
inspect → check BUGBOOK.md → run → evaluate → identify gaps → improve
```

Only rewrite code when there is a demonstrated reason.

The goal is to **continue the implementation**, not restart it.

---

# 25. Final Principle

The agent's job is not:

> "Write as much code as possible."

The agent's job is:

> **Make the next verified improvement without breaking the system.**

The correct loop is:

```text
SPEC
 ↓
SMALL CHANGE
 ↓
RUN
 ↓
VISUAL CHECK
 ↓
FUNCTIONAL CHECK
 ↓
REGRESSION CHECK
 ↓
REPORT
 ↓
NEXT SMALL CHANGE
```

If an agent cannot verify a claim, it must say so.

If an agent discovers a specification conflict, it must surface it.

If an agent wants to make a large architectural change, it must stop and justify it.

If an agent finds a new bug, it must log it in `BUGBOOK.md` (§22.2) before moving on.

**Quality > speed.**
**Verified progress > code volume.**
**Demo credibility > decorative complexity.**