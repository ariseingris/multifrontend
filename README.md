# IoT Demo Frontend Framework

A reusable, modular demo framework for building impressive IoT dashboards for pitches and competitions.

## Quick Start

### 1. Start the Simulator

```bash
cd simulator
pip install websockets
python vitalchain_simulator.py --scenario door_open --speed 2
```

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## Run VitalChain with Docker

Build and start the VitalChain frontend together with its simulator:

```bash
docker compose up --build vitalchain
```

Open http://localhost:5173. The frontend connects to the simulator at
`ws://localhost:8765`.

Choose another demo scenario without changing the image:

```bash
VITALCHAIN_SCENARIO=compressor_failure VITALCHAIN_SPEED=2 docker compose up --build vitalchain
```

Stop the stack with:

```bash
docker compose down
```

## Architecture

### Core Shared Components

The framework provides reusable components for all IoT projects:

- **Dashboard**: Main layout component
- **Header**: System status indicator
- **EventTimeline**: Live event feed
- **AlertDisplay**: Critical alerts
- **ScenarioControl**: Scenario selection and playback
- **Charts**: LiveChart, ThresholdChart, Gauge

### State Management (Zustand)

- `useTelemetryStore`: Telemetry data points
- `useAlertStore`: Current alerts and alert history
- `useTimelineStore`: Event timeline
- `useScenarioStore`: Scenario state (running/paused, phase, elapsed time)
- `useSystemStore`: System status (online/offline, AI engine, sensors)
- `useDemoModeStore`: Demo mode indicator
- `useProjectStore`: Current project configuration

### Data Flow

```
Simulator (Python)
    ↓
WebSocket Server (ws://localhost:8765)
    ↓
Frontend (useDataBridge hook)
    ↓
Zustand Stores
    ↓
React Components (re-render)
```

## Project Structure

```
uih/
├── frontend/
│   ├── src/
│   │   ├── core/
│   │   │   ├── components/      # Shared components
│   │   │   ├── hooks/           # Shared hooks
│   │   │   ├── types/           # TypeScript types
│   │   │   ├── utils/           # Utilities
│   │   │   └── store.ts         # Zustand stores
│   │   ├── projects/
│   │   │   ├── vitalchain/
│   │   │   │   ├── config.ts    # Project config
│   │   │   │   └── Dashboard.tsx # Project-specific dashboard
│   │   │   ├── pulseguard/
│   │   │   ├── factsafe/
│   │   │   ├── aquasense/
│   │   │   ├── hirdop/
│   │   │   └── datacool/
│   │   ├── special/             # Non-dashboard projects
│   │   │   ├── stemlab/
│   │   │   ├── firescout/
│   │   │   └── pam/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── README.md
└── simulator/
    ├── vitalchain_simulator.py             # Python WebSocket server
    ├── requirements.txt
    └── README.md
```

## Key Features

### 1. Scenario Engine

Each IoT project defines deterministic scenarios that progress through phases:

```
NORMAL → EARLY_SIGNAL → WARNING → CRITICAL → ALERT → ACTION → RECOVERY → NORMAL
```

Scenarios are defined in project configurations with metric values for each phase.

**Example:**

```typescript
scenarios: [
  {
    id: 'door_open',
    name: 'Door Open Incident',
    duration: 90,
    steps: [
      {
        name: 'Normal',
        phase: 'normal',
        startAt: 0,
        endAt: 10,
        metrics: {
          temperature: { start: 4, end: 4 },
          humidity: { start: 50, end: 50 },
        },
      },
      // ... more steps
    ],
  },
]
```

### 2. Real-Time Charts

Charts automatically update as telemetry arrives:

- **LiveChart**: Generic line/area/bar chart with multiple metrics
- **ThresholdChart**: Line chart with visual threshold bands
- **Gauge**: Circular gauge for single metrics

### 3. Alert System

Alerts automatically trigger when thresholds are exceeded:

```typescript
const currentAlert = useAlertStore((s) => s.currentAlert);
```

Alerts show:
- Type, severity, and message
- Affected metric and current value
- Threshold that was exceeded

### 4. Event Timeline

Events are recorded automatically and displayed chronologically:

```typescript
const addEvent = useTimelineStore((s) => s.addEvent);

addEvent({
  timestamp: new Date().toISOString(),
  type: 'anomaly_detected',
  message: 'Temperature out of range',
  severity: 'critical',
  icon: '⚠',
});
```

### 5. Demo Mode Indicator

When a simulation is active, a visible indicator shows:

```
● DEMO MODE
SIMULATION ACTIVE
Scenario: Door Open Incident
Elapsed: 00:01:23
```

## Adding a New IoT Project

### Step 1: Create Config

Create `frontend/src/projects/myproject/config.ts`:

```typescript
import { ProjectConfig } from '../../core/types';

export const myprojectConfig: ProjectConfig = {
  id: 'myproject',
  name: 'My Project',
  metrics: [...],
  scenarios: [...],
  devices: [...],
  // ... etc
};
```

### Step 2: Create Dashboard

Create `frontend/src/projects/myproject/Dashboard.tsx`:

```typescript
import { Dashboard, LiveChart } from '../../core/components';
import { myprojectConfig } from './config';

export const MyProjectDashboard: React.FC = () => {
  return (
    <Dashboard projectConfig={myprojectConfig}>
      <LiveChart
        metricKeys={['temperature', 'humidity']}
        title="Main Sensor Data"
      />
      {/* Add more custom components */}
    </Dashboard>
  );
};
```

### Step 3: Add to App.tsx

```typescript
import { MyProjectDashboard } from './projects/myproject/Dashboard';

export const App: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectId>('vitalchain');

  const renderProject = () => {
    switch (selectedProject) {
      case 'myproject':
        return <MyProjectDashboard />;
      // ...
    }
  };
};
```

### Step 4: Add to Simulator

Update `simulator/vitalchain_simulator.py` with your own simulator class:

```python
class MyProjectSimulator(ScenarioSimulator):
    def __init__(self, scenario_id: str = 'normal', speed: float = 1.0):
        # Define your scenarios
        pass

    def get_metrics(self) -> Dict[str, float]:
        # Generate metrics based on elapsed time
        pass
```

## Simulator Usage

### Start with default scenario

```bash
python vitalchain_simulator.py
```

### Start with specific scenario and speed

```bash
python vitalchain_simulator.py --project vitalchain --scenario door_open --speed 2
```

### Command-line options

- `--host`: WebSocket server host (default: localhost)
- `--port`: WebSocket server port (default: 8765)
- `--project`: Project to simulate (default: vitalchain)
- `--scenario`: Scenario to run (default: normal)
- `--speed`: Simulation speed multiplier (default: 1.0)

### WebSocket Commands

The frontend can send commands to control the simulator:

```javascript
const ws = new WebSocket('ws://localhost:8765');

// Start a scenario
ws.send(JSON.stringify({
  type: 'start_scenario',
  scenario: 'door_open',
  speed: 2,
}));

// Pause
ws.send(JSON.stringify({ type: 'pause' }));

// Resume
ws.send(JSON.stringify({ type: 'resume' }));

// Reset
ws.send(JSON.stringify({ type: 'reset' }));

// Set speed
ws.send(JSON.stringify({ type: 'set_speed', speed: 5 }));
```

## Frontend Development

### Install dependencies

```bash
cd frontend
npm install
```

### Run dev server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

## Data Models

### TelemetryPoint

```typescript
{
  timestamp: "2024-01-15T10:30:45.123Z",
  deviceId: "sensor-01",
  metrics: {
    temperature: 4.5,
    humidity: 52,
    battery: 85,
    signal: -65
  },
  status: "normal" | "warning" | "critical",
  riskScore: 12.5,
  scenario: "door_open"
}
```

### Alert

```typescript
{
  id: "alert-1234567890",
  timestamp: "2024-01-15T10:30:50.000Z",
  type: "threshold_exceeded" | "anomaly_detected" | "recovery",
  severity: "info" | "warning" | "critical",
  message: "Temperature exceeded threshold",
  metric: "temperature",
  value: 10.2,
  threshold: 8,
  deviceId: "sensor-01"
}
```

### TimelineEvent

```typescript
{
  timestamp: "2024-01-15T10:30:50.000Z",
  type: "sensor_connected" | "system_normal" | "anomaly_detected" | ...,
  message: "Anomaly detected",
  severity: "info" | "warning" | "critical" | "success",
  icon: "⚠"
}
```

## Visual Design

### Color System

- **Normal**: Green (#4ade80)
- **Warning**: Amber (#f59e0b)
- **Critical**: Red (#ef4444)
- **Recovered**: Blue (#3b82f6)
- **Info**: Gray (#6b7280)

### Typography

- **Headers**: 600 weight, uppercase, letter-spaced
- **Values**: 700 weight, larger sizes
- **Labels**: 400 weight, smaller, dimmed

### Layout

- Dark theme (dark gray background #0f0f0f, #1a1a1a for cards)
- High contrast text (#e0e0e0 on dark)
- Subtle borders (#2d2d2d)
- Smooth animations (0.2-0.4s transitions)

## Performance Tips

1. **Limit telemetry history**: Stores keep last 1000 points
2. **Chart updates**: Use `isAnimationActive={false}` for real-time charts
3. **Event timeline**: Show last 10 events only
4. **Pause on scroll**: Charts pause updates while scrolling
5. **WebSocket batching**: Server can batch multiple telemetry points

## Troubleshooting

### WebSocket connection fails

1. Ensure simulator is running on the correct host/port
2. Check browser console for CORS/connection errors
3. Verify firewall allows WebSocket connections

### No telemetry appears

1. Check that simulator is actually running and logging data
2. Verify WebSocket connection in browser DevTools
3. Check that `useDataBridge` hook is initialized
4. Fallback to local simulation is enabled by default

### Charts not updating

1. Verify telemetry is being added to store
2. Check that chart component is receiving correct metric keys
3. Ensure metric values are numbers (not strings)
4. Check browser console for React errors

### Scenario doesn't progress

1. Ensure `useScenarioStore` state is being updated
2. Verify scenario steps in config are correctly defined
3. Check that elapsed time is being calculated correctly
4. May need to manually start scenario if auto-start is disabled

## Next Steps (P1 Features)

- [ ] KPI cards with real-time updates
- [ ] Device status component
- [ ] More chart types (heatmap, waterfall)
- [ ] AI recommendation cards
- [ ] Mock notification system (SMS/Zalo)
- [ ] Compliance report mockup
- [ ] Multi-device/fleet view

## Files Reference

### Shared Components

| Component | Path | Purpose |
|-----------|------|---------|
| Header | `core/components/Header.tsx` | System status, demo mode indicator |
| AlertDisplay | `core/components/AlertDisplay.tsx` | Critical alert popup |
| EventTimeline | `core/components/EventTimeline.tsx` | Live event feed |
| ScenarioControl | `core/components/ScenarioControl.tsx` | Scenario selection and playback |
| Dashboard | `core/components/Dashboard.tsx` | Main layout wrapper |
| Charts | `core/components/Charts.tsx` | LiveChart, ThresholdChart, Gauge |

### Shared Hooks

| Hook | Path | Purpose |
|------|------|---------|
| useDataBridge | `core/hooks/useDataBridge.ts` | WebSocket connection |
| useLocalTelemetrySimulation | `core/hooks/useDataBridge.ts` | Local demo data generator |

### Shared Stores

| Store | File | Purpose |
|-------|------|---------|
| useTelemetryStore | `core/store.ts` | Telemetry points |
| useAlertStore | `core/store.ts` | Current and past alerts |
| useTimelineStore | `core/store.ts` | Event timeline |
| useScenarioStore | `core/store.ts` | Scenario state |
| useSystemStore | `core/store.ts` | System status |
| useDemoModeStore | `core/store.ts` | Demo mode state |
| useProjectStore | `core/store.ts` | Current project config |

## License

Demo framework for internal use.
