# Simulator README

Python WebSocket server for generating deterministic IoT telemetry data.

## Installation

### Prerequisites

- Python 3.8+
- pip

### Setup

```bash
pip install websockets
```

## Usage

### Start Default Server

```bash
python vitalchain_simulator.py
```

Server starts on `ws://localhost:8765`

## Docker

From the repository root, start the VitalChain frontend and simulator together:

```bash
docker compose up --build vitalchain
```

The Compose service `vitalchain` depends on `vitalchain-simulator`.

### Start with Specific Scenario

```bash
python vitalchain_simulator.py --scenario door_open --speed 2
```

### Command-line Options

```
--host HOST          WebSocket server host (default: localhost)
--port PORT          WebSocket server port (default: 8765)
--project PROJECT    Project to simulate (default: vitalchain)
--scenario SCENARIO  Scenario to run (default: normal)
--speed SPEED        Simulation speed multiplier (default: 1.0)
```

### Examples

```bash
# VitalChain door open scenario at 2x speed
python vitalchain_simulator.py --scenario door_open --speed 2

# PulseGuard landslide scenario at 5x speed
python vitalchain_simulator.py --project pulseguard --scenario landslide --speed 5

# FactSafe gas leak scenario at 1x speed (normal)
python vitalchain_simulator.py --project factsafe --scenario gas_leak

# Custom port
python vitalchain_simulator.py --port 9000
```

## Architecture

### ScenarioSimulator Base Class

All simulators inherit from `ScenarioSimulator`:

```python
class MySimulator(ScenarioSimulator):
    def get_metrics(self) -> Dict[str, float]:
        """Generate metrics for current time"""
        pass

    def get_current_phase(self) -> str:
        """Return current scenario phase"""
        pass

    def get_status(self) -> str:
        """Return overall status (normal, warning, critical)"""
        pass

    def get_alerts(self) -> List[Alert]:
        """Generate alerts if thresholds exceeded"""
        pass
```

### VitalChainSimulator

Example implementation:

```python
class VitalChainSimulator(ScenarioSimulator):
    def __init__(self, scenario_id: str = 'normal', speed: float = 1.0):
        # Define scenarios with steps
        # Each step has:
        # - name: Step name
        # - phase: Scenario phase (normal, warning, critical, etc.)
        # - startAt: Start time in seconds
        # - endAt: End time in seconds
        # - metrics: Dict of metric interpolations
        pass

    def get_metrics(self) -> Dict[str, float]:
        # Find current step based on elapsed time
        # Interpolate between start and end values
        # Add small noise for realism
        return interpolated_metrics
```

## Creating a New Simulator

### 1. Define Scenarios

```python
config = {
    'my_scenario': {
        'duration': 120,  # Total duration in seconds
        'steps': [
            {
                'name': 'Normal Operation',
                'phase': 'normal',
                'startAt': 0,
                'endAt': 30,
                'metrics': {
                    'temperature': {'start': 20, 'end': 20},
                    'humidity': {'start': 50, 'end': 50},
                },
            },
            {
                'name': 'Heating',
                'phase': 'warning',
                'startAt': 30,
                'endAt': 60,
                'metrics': {
                    'temperature': {'start': 20, 'end': 25},
                    'humidity': {'start': 50, 'end': 60},
                },
            },
            # ... more steps
        ],
    },
}
```

### 2. Create Simulator Class

```python
class MyProjectSimulator(ScenarioSimulator):
    def __init__(self, scenario_id: str = 'normal', speed: float = 1.0):
        config = { /* scenarios */ }
        self.scenario_id = scenario_id
        super().__init__(config.get(scenario_id, config['normal']), speed)
        self.is_running = True

    def _get_step_for_time(self) -> Optional[Dict]:
        """Find step containing current elapsed time"""
        for step in self.config['steps']:
            if step['startAt'] <= self.elapsed < step['endAt']:
                return step
        return None

    def _interpolate(self, start: float, end: float, t: float) -> float:
        """Linear interpolation between values"""
        return start + (end - start) * t

    def get_metrics(self) -> Dict[str, float]:
        """Generate metrics for current time"""
        step = self._get_step_for_time()
        if not step:
            return {}

        duration = step['endAt'] - step['startAt']
        if duration <= 0:
            return step['metrics']

        # Calculate progress through step (0-1)
        t = (self.elapsed - step['startAt']) / duration
        t = max(0, min(1, t))  # Clamp to 0-1

        metrics = {}
        for key, value_range in step['metrics'].items():
            start = value_range['start']
            end = value_range['end']
            # Interpolate with small noise
            noise = (hash(f"{key}{int(self.elapsed)}") % 100 - 50) / 10000
            metrics[key] = self._interpolate(start, end, t) + noise

        return metrics

    def get_current_phase(self) -> str:
        """Get phase of current step"""
        step = self._get_step_for_time()
        return step['phase'] if step else 'normal'

    def get_status(self) -> str:
        """Determine status from metrics"""
        metrics = self.get_metrics()
        # Implement your status logic
        return 'normal'

    def get_alerts(self) -> List[Alert]:
        """Generate alerts based on thresholds"""
        alerts = []
        metrics = self.get_metrics()
        # Check thresholds and create alerts
        return alerts
```

### 3. Register in SimulatorServer

Update `handle_command` method:

```python
async def handle_command(self, command: Dict[str, Any]):
    if command.get('type') == 'start_scenario':
        project = command.get('project', 'vitalchain')
        scenario_id = command.get('scenario', 'normal')
        speed = command.get('speed', 1.0)

        if project == 'myproject':
            self.simulator = MyProjectSimulator(scenario_id, speed)
        elif project == 'vitalchain':
            self.simulator = VitalChainSimulator(scenario_id, speed)
```

## Data Models

### TelemetryPoint

Sent to frontend every 100ms:

```python
@dataclass
class TelemetryPoint:
    timestamp: str              # ISO 8601 timestamp
    deviceId: str              # Unique device ID
    metrics: Dict[str, float]  # Metric key -> value
    status: str                # "normal" | "warning" | "critical"
    riskScore: float           # 0-100 risk score
    scenario: str              # Current scenario ID

# Example:
{
    "timestamp": "2024-01-15T10:30:45.123Z",
    "deviceId": "sensor-01",
    "metrics": {
        "temperature": 4.5,
        "humidity": 52,
        "battery": 85,
        "signal": -65
    },
    "status": "normal",
    "riskScore": 12.5,
    "scenario": "door_open"
}
```

### Alert

Sent when threshold exceeded:

```python
@dataclass
class Alert:
    id: str                     # Unique alert ID
    timestamp: str              # When alert occurred
    type: str                   # "anomaly_detected" | "threshold_exceeded" | etc.
    severity: str               # "info" | "warning" | "critical"
    message: str                # Human-readable message
    metric: Optional[str]       # Metric that triggered alert
    value: Optional[float]      # Current metric value
    threshold: Optional[float]  # Threshold that was exceeded
    deviceId: Optional[str]     # Device ID

# Example:
{
    "id": "alert-1234567890",
    "timestamp": "2024-01-15T10:30:50.000Z",
    "type": "threshold_exceeded",
    "severity": "critical",
    "message": "Temperature exceeded threshold",
    "metric": "temperature",
    "value": 10.2,
    "threshold": 8,
    "deviceId": "sensor-01"
}
```

### TimelineEvent

Sent for significant events:

```python
@dataclass
class TimelineEvent:
    timestamp: str              # When event occurred
    type: str                   # Event type
    message: str                # Event message
    severity: str               # "info" | "warning" | "critical" | "success"
    icon: str                   # Emoji or text icon
```

## WebSocket Protocol

### Connection

```javascript
const ws = new WebSocket('ws://localhost:8765');

ws.onopen = () => console.log('Connected');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'telemetry') {
        console.log('Telemetry:', data.payload);
    } else if (data.type === 'alert') {
        console.log('Alert:', data.payload);
    } else if (data.type === 'event') {
        console.log('Event:', data.payload);
    }
};

ws.onerror = (error) => console.error('Error:', error);
ws.onclose = () => console.log('Disconnected');
```

### Commands from Frontend

#### Start Scenario

```javascript
ws.send(JSON.stringify({
    type: 'start_scenario',
    project: 'vitalchain',  // Optional, defaults to vitalchain
    scenario: 'door_open',
    speed: 2.0
}));
```

#### Pause

```javascript
ws.send(JSON.stringify({ type: 'pause' }));
```

#### Resume

```javascript
ws.send(JSON.stringify({ type: 'resume' }));
```

#### Reset

```javascript
ws.send(JSON.stringify({ type: 'reset' }));
```

#### Set Speed

```javascript
ws.send(JSON.stringify({
    type: 'set_speed',
    speed: 5.0
}));
```

## Scenario Types

All scenarios follow the same phase progression:

1. **NORMAL**: Baseline operation
2. **EARLY_SIGNAL**: Initial subtle changes
3. **WARNING**: Approached thresholds
4. **CRITICAL**: Exceeded critical thresholds
5. **ALERT**: System alert triggered
6. **ACTION**: Corrective action taken
7. **RECOVERY**: Returning to normal
8. **NORMAL**: Back to baseline

Scenarios don't need to include all phases, but should follow the progression.

## Best Practices

### Realistic Data

- Use smooth interpolation, not random jumps
- Add small noise to avoid perfectly linear progression
- Use appropriate step durations (not too fast/slow)
- Keep metric values within physical bounds

### Scenario Design

```python
# ✓ Good: All phases required, realistic durations
{
    'normal': {
        'duration': 60,
        'steps': [
            {'phase': 'normal', 'startAt': 0, 'endAt': 60, ...},
        ],
    },
    'fault': {
        'duration': 120,
        'steps': [
            {'phase': 'normal', 'startAt': 0, 'endAt': 15, ...},
            {'phase': 'early_signal', 'startAt': 15, 'endAt': 30, ...},
            {'phase': 'warning', 'startAt': 30, 'endAt': 50, ...},
            {'phase': 'critical', 'startAt': 50, 'endAt': 70, ...},
            {'phase': 'alert', 'startAt': 70, 'endAt': 85, ...},
            {'phase': 'recovery', 'startAt': 85, 'endAt': 120, ...},
        ],
    },
}

# ✗ Bad: Random jumps, unrealistic durations
{
    'fault': {
        'duration': 5,  # Too fast
        'steps': [
            {'metrics': {'temp': {'start': 10, 'end': 50}}},  # Huge jump
        ],
    },
}
```

### Performance

- Keep metrics updates at 10 Hz (100ms intervals)
- Limit alert generation with cooldown periods
- Use efficient interpolation

### Debugging

```python
# Enable logging
simulator = VitalChainSimulator('door_open', speed=2)
simulator.is_running = True

while simulator.elapsed < 60:
    time.sleep(0.1)
    simulator.update()
    metrics = simulator.get_metrics()
    print(f"T={simulator.elapsed:.1f}s: {metrics}")
```

## Adding Event Generation

Generate events based on scenario progression:

```python
def get_events(self) -> List[TimelineEvent]:
    events = []
    phase = self.get_current_phase()
    
    # Trigger events based on phase transitions
    if phase != self.last_phase:
        events.append(TimelineEvent(
            timestamp=datetime.now().isoformat(),
            type='phase_change',
            message=f'Phase changed to {phase}',
            severity='info',
            icon='→'
        ))
        self.last_phase = phase
    
    return events
```

## Testing Scenarios

```bash
# Test door_open scenario, record output
python vitalchain_simulator.py --scenario door_open --speed 1 > output.log

# Manually verify behavior:
# - Metrics interpolate smoothly
# - Alerts trigger at correct thresholds
# - Phase changes at correct times
# - Status matches current conditions
```

## Troubleshooting

### "ModuleNotFoundError: No module named 'websockets'"

```bash
pip install websockets
```

### Server starts but frontend doesn't connect

1. Check port: `ss -tlnp | grep 8765`
2. Check firewall allows WebSocket
3. Verify browser URL: `ws://localhost:8765` (not `http://`)
4. Check browser console for connection errors

### Telemetry not updating

1. Ensure simulator is running
2. Check that scenario was started
3. Verify elapsed time is increasing
4. Check that metrics are in correct range

### Alerts not triggering

1. Verify threshold logic in `get_alerts()`
2. Check that metric values exceed thresholds
3. Allow cooldown period between alerts
4. Ensure alert generation doesn't throw errors

## Extending the Simulator

### Add Custom Metrics

```python
def get_metrics(self) -> Dict[str, float]:
    metrics = super_get_metrics()
    
    # Add derived metrics
    metrics['risk_score'] = self._calculate_risk(metrics)
    metrics['ai_confidence'] = self._get_model_confidence()
    
    return metrics
```

### Add Machine Learning

```python
import numpy as np
from sklearn.ensemble import IsolationForest

class MLSimulator(VitalChainSimulator):
    def __init__(self, scenario_id: str, speed: float):
        super().__init__(scenario_id, speed)
        self.model = IsolationForest()

    def detect_anomaly(self, metrics: Dict) -> bool:
        values = np.array(list(metrics.values())).reshape(1, -1)
        return self.model.predict(values)[0] == -1
```

## Performance Tuning

### Update Frequency

```python
# Less frequent updates (fewer messages)
await asyncio.sleep(0.2)  # 5 Hz instead of 10 Hz

# More frequent updates
await asyncio.sleep(0.05)  # 20 Hz
```

### Metric Precision

```python
# Reduce precision to avoid floating point noise
metrics[key] = round(value, 2)
```

### Telemetry Batching

```python
# Send multiple points at once
points = [self.get_metrics() for _ in range(10)]
await self.broadcast({
    'type': 'telemetry_batch',
    'payload': [asdict(p) for p in points]
})
```
