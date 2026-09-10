# Frontend README

Modern React + TypeScript + Vite dashboard framework for IoT demos.

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser at http://localhost:5173
```

## Development

### File Structure

```
src/
├── core/                          # Shared components and utilities
│   ├── components/
│   │   ├── Header.tsx            # Top header with system status
│   │   ├── AlertDisplay.tsx       # Alert popup
│   │   ├── EventTimeline.tsx      # Event feed
│   │   ├── ScenarioControl.tsx    # Scenario selector and controls
│   │   ├── Dashboard.tsx          # Main layout wrapper
│   │   ├── Charts.tsx             # Chart components
│   │   └── index.ts               # Component exports
│   ├── hooks/
│   │   └── useDataBridge.ts       # WebSocket connection
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   ├── utils/
│   │   └── formatting.ts          # Utility functions
│   └── store.ts                   # Zustand stores
├── projects/
│   └── vitalchain/
│       ├── config.ts              # Project configuration
│       └── Dashboard.tsx          # Project dashboard
├── special/                       # Non-dashboard projects
├── App.tsx                        # Main app component
└── main.tsx                       # Entry point
```

### Key Hooks to Use

#### useDataBridge

Connects to WebSocket simulator:

```typescript
import { useDataBridge } from '@/core/hooks/useDataBridge';

function MyComponent() {
  const { isConnected, send } = useDataBridge('ws://localhost:8765');

  return <div>{isConnected ? 'Connected' : 'Disconnected'}</div>;
}
```

#### useLocalTelemetrySimulation

Generate fake data for testing without simulator:

```typescript
import { useLocalTelemetrySimulation } from '@/core/hooks/useDataBridge';

function MyComponent() {
  useLocalTelemetrySimulation(true, projectConfig);
  // ...
}
```

### Using Stores

All state is managed with Zustand:

```typescript
import { useTelemetryStore, useAlertStore } from '@/core/store';

function MyComponent() {
  // Read state
  const telemetry = useTelemetryStore((s) => s.telemetry);
  const latest = useTelemetryStore((s) => s.getLatest());

  // Update state
  const addTelemetry = useTelemetryStore((s) => s.addTelemetry);
  
  return <div>{latest?.metrics.temperature}</div>;
}
```

### Utility Functions

Formatting and conversion helpers:

```typescript
import { 
  formatMetric,
  getMetricStatus,
  formatElapsedTime,
  formatTime,
  getStatusColor,
  easing
} from '@/core/utils/formatting';

// Format a number with unit
const temp = formatMetric(4.5, temperatureConfig);  // "4.5 °C"

// Get status based on thresholds
const status = getMetricStatus(4.5, temperatureConfig);  // "normal"

// Format elapsed time
formatElapsedTime(125);  // "00:02:05"

// Format ISO timestamp
formatTime("2024-01-15T10:30:45.123Z");  // "10:30:45"

// Get color for status
const color = getStatusColor('critical');  // "#ef4444"
```

## Components

### Header

Shows project name, system status, and demo mode indicator.

```typescript
import { Header } from '@/core/components';

<Header />
```

**Displays:**
- Project name
- System online/offline status
- AI engine status
- Active sensor count
- Data stream status
- Demo mode indicator (if active)

### AlertDisplay

Shows critical alerts with animations.

```typescript
import { AlertDisplay } from '@/core/components';

<AlertDisplay />
```

**Features:**
- Auto-dismiss after 5 seconds (unless critical)
- Animated entrance
- Color-coded severity
- Metric details

### EventTimeline

Live event feed showing scenario progression.

```typescript
import { EventTimeline } from '@/core/components';

<div style={{ maxHeight: '400px', overflowY: 'auto' }}>
  <EventTimeline />
</div>
```

**Shows:**
- Timestamp
- Event type and message
- Severity badge
- Icon

### ScenarioControl

Control panel for scenario selection and playback.

```typescript
import { ScenarioControl } from '@/core/components';

<ScenarioControl
  scenarios={[
    { id: 'normal', name: 'Normal' },
    { id: 'fault', name: 'Fault' },
  ]}
  onScenarioStart={(scenarioId, speed) => {
    console.log(`Started ${scenarioId} at ${speed}x`);
  }}
  onScenarioPause={() => {
    console.log('Paused');
  }}
  onScenarioReset={() => {
    console.log('Reset');
  }}
/>
```

**Features:**
- Scenario dropdown
- Speed selector (1x, 2x, 5x, 10x)
- Status display (phase, elapsed time)
- Run/Pause/Resume buttons
- Reset button

### Dashboard

Main layout wrapper that combines all components.

```typescript
import { Dashboard } from '@/core/components';
import { myProjectConfig } from './config';

<Dashboard
  projectConfig={myProjectConfig}
  onScenarioStart={(scenarioId) => { /* ... */ }}
>
  {/* Custom content goes here */}
</Dashboard>
```

### Charts

#### LiveChart

Generic chart for multiple metrics:

```typescript
import { LiveChart } from '@/core/components';

<LiveChart
  metricKeys={['temperature', 'humidity']}
  title="Environmental Data"
  height={300}
  chartType="line"
  colors={['#3b82f6', '#8b5cf6']}
/>
```

#### ThresholdChart

Line chart with threshold bands:

```typescript
import { ThresholdChart } from '@/core/components';

<ThresholdChart
  metricKey="temperature"
  title="Temperature with Safety Bands"
  height={300}
  normalMin={2}
  normalMax={8}
  warningMin={0}
  warningMax={10}
  criticalMin={-5}
  criticalMax={15}
  unit="°C"
/>
```

#### Gauge

Circular gauge for single metrics:

```typescript
import { Gauge } from '@/core/components';

<Gauge
  value={4.5}
  min={-20}
  max={10}
  label="Temperature"
  unit="°C"
  thresholdWarning={6}
  thresholdCritical={10}
  size={120}
/>
```

## Creating a New Project

### 1. Create Config File

`src/projects/myproject/config.ts`:

```typescript
import { ProjectConfig } from '@/core/types';

export const myprojectConfig: ProjectConfig = {
  id: 'myproject',
  name: 'My Project',
  description: 'Project description',
  
  metrics: [
    {
      key: 'temperature',
      name: 'Temperature',
      unit: '°C',
      min: -20,
      max: 20,
      normalMin: 18,
      normalMax: 22,
      warningMin: 15,
      warningMax: 25,
      criticalMin: 10,
      criticalMax: 30,
      precision: 1,
    },
    // ... more metrics
  ],

  scenarios: [
    {
      id: 'normal',
      name: 'Normal Operation',
      duration: 60,
      steps: [
        {
          name: 'Stable',
          phase: 'normal',
          startAt: 0,
          endAt: 60,
          metrics: {
            temperature: { start: 20, end: 20 },
          },
        },
      ],
    },
  ],

  devices: [
    {
      id: 'device-1',
      name: 'Main Sensor',
      type: 'temperature',
      status: 'online',
      location: 'Room A',
      battery: 90,
      signal: -55,
    },
  ],

  aiEngine: true,
  defaultScenario: 'normal',
  defaultSpeed: 1,
};
```

### 2. Create Dashboard Component

`src/projects/myproject/Dashboard.tsx`:

```typescript
import React from 'react';
import { Dashboard, LiveChart, ThresholdChart } from '@/core/components';
import { myprojectConfig } from './config';

export const MyProjectDashboard: React.FC = () => {
  return (
    <Dashboard projectConfig={myprojectConfig}>
      <LiveChart
        metricKeys={['temperature']}
        title="Main Data"
        chartType="line"
      />
    </Dashboard>
  );
};
```

### 3. Add to App.tsx

```typescript
import { MyProjectDashboard } from './projects/myproject/Dashboard';

export const App: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState('myproject');

  return selectedProject === 'myproject' ? <MyProjectDashboard /> : null;
};
```

## Styling Guide

### Colors

Use the status color system:

```typescript
import { getStatusColor } from '@/core/utils/formatting';

const normal = getStatusColor('normal');        // #4ade80 (green)
const warning = getStatusColor('warning');      // #f59e0b (amber)
const critical = getStatusColor('critical');    // #ef4444 (red)
const recovered = getStatusColor('recovered');  // #3b82f6 (blue)
const info = getStatusColor('info');            // #6b7280 (gray)
```

### Typography Hierarchy

```typescript
// Page title
<h1 style={{ fontSize: '24px', fontWeight: '600' }}>Title</h1>

// Section header
<h3 style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Section</h3>

// Large values
<div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
  12.5
</div>

// Labels
<label style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af' }}>
  Label
</label>
```

### Card Layout

```typescript
<div
  style={{
    background: '#1a1a1a',
    border: '1px solid #2d2d2d',
    borderRadius: '8px',
    padding: '16px',
  }}
>
  {/* content */}
</div>
```

## Build & Deploy

### For Production

```bash
npm run build
```

Outputs to `dist/` directory.

### Environment Variables

Create `.env`:

```
VITE_WS_URL=ws://your-simulator-host:8765
```

Access in code:

```typescript
const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8765';
```

## Performance Optimization

### Chart Rendering

For real-time updates, disable animations:

```typescript
<Line
  type="monotone"
  dataKey="value"
  isAnimationActive={false}
  strokeWidth={2}
/>
```

### Store Subscriptions

Use selector functions to limit re-renders:

```typescript
// Good - only re-renders if these specific values change
const latest = useTelemetryStore((s) => s.getLatest());

// Avoid - re-renders on every store change
const telemetry = useTelemetryStore((s) => s.telemetry);
```

### Telemetry History Limit

Keep only last 1000 points to avoid memory issues:

```typescript
addTelemetry: (point) => set((state) => ({
  telemetry: [...state.telemetry.slice(-999), point],
}))
```

## Debugging

### Chrome DevTools

1. Open DevTools (F12)
2. Check Console for errors
3. Network tab shows WebSocket connections
4. React DevTools extension for component inspection

### Console Logs

```typescript
import { useTelemetryStore } from '@/core/store';

function Debug() {
  const state = useTelemetryStore();
  console.log('Telemetry:', state.telemetry);
  return null;
}
```

### Local Storage

Store keeps telemetry in memory only. To persist, add:

```typescript
addTelemetry: (point) => set((state) => {
  const telemetry = [...state.telemetry.slice(-999), point];
  localStorage.setItem('telemetry', JSON.stringify(telemetry));
  return { telemetry };
})
```

## Common Issues

### "Cannot find module" errors

- Ensure paths start with `@/`
- Check that file extensions `.ts` or `.tsx` are correct
- Verify files exist in correct directories

### Charts not rendering

- Check that metric keys exist in telemetry data
- Verify telemetry store has data
- Ensure chart component is not hidden by CSS
- Check browser console for React errors

### WebSocket connection fails

- Ensure simulator is running: `python vitalchain_simulator.py`
- Check host/port: `ws://localhost:8765`
- Check browser Network tab for WebSocket connection
- Verify firewall allows WebSocket connections

### Styles not applying

- Check that inline styles are using camelCase: `backgroundColor`
- Verify CSS-in-JS is loaded
- Use browser DevTools to inspect computed styles

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Recharts Documentation](https://recharts.org)
- [Vite Documentation](https://vitejs.dev)
