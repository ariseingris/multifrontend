# Troubleshooting Guide

## Common Issues and Solutions

### 1. WebSocket Connection Fails

**Symptom**: Frontend shows "Waiting for events..." and no data appears

**Causes and Solutions**:

```bash
# Check if simulator is running
ps aux | grep vitalchain_simulator.py

# If not running, start it:
cd simulator
pip install websockets
python vitalchain_simulator.py

# Check if port 8765 is in use:
ss -tlnp | grep 8765
lsof -i :8765

# If port is in use, use different port:
python vitalchain_simulator.py --port 9000
# Then update frontend: const { isConnected } = useDataBridge('ws://localhost:9000');
```

**Network Issues**:
```bash
# Test WebSocket connection:
python3 << 'EOF'
import websocket
try:
    ws = websocket.create_connection("ws://localhost:8765")
    print("✓ WebSocket connection successful")
    ws.close()
except Exception as e:
    print(f"✗ Connection failed: {e}")
EOF

# Verify firewall allows WebSocket:
# macOS: System Preferences > Security & Privacy > Firewall
# Linux: sudo ufw allow 8765
# Windows: Add firewall rule in Windows Defender
```

### 2. No Telemetry Updates

**Symptom**: Simulator runs but frontend shows no data

**Check Scenarios**:

```bash
# Verify scenario is valid:
python3 << 'EOF'
from simulator.simulator import VitalChainSimulator

# Test scenario loading
sim = VitalChainSimulator('door_open', speed=1.0)
print(f"Scenario: {sim.scenario_id}")
print(f"Duration: {sim.config['duration']}s")
print(f"Steps: {len(sim.config['steps'])}")

for step in sim.config['steps']:
    print(f"  - {step['name']}: {step['startAt']}s-{step['endAt']}s ({step['phase']})")
EOF

# Test metric generation:
python3 << 'EOF'
from simulator.simulator import VitalChainSimulator

sim = VitalChainSimulator('door_open', speed=1.0)
sim.is_running = True
sim.start_time = time.time()

for i in range(10):
    sim.update()
    metrics = sim.get_metrics()
    print(f"T={sim.elapsed:.1f}s: {metrics}")
    time.sleep(0.1)
EOF
```

**Check Frontend Subscription**:

```javascript
// In browser console, check if telemetry is arriving:
const store = window.useTelemetryStore;
console.log(store.getState().telemetry.length); // Should increase
```

### 3. Charts Not Rendering

**Symptom**: Charts area is blank or shows error

**Solutions**:

```typescript
// Check metric keys match config:
const config = {
  metrics: [
    { key: 'temperature', name: 'Temperature' },
    { key: 'humidity', name: 'Humidity' },
  ],
};

// Chart must use exact key:
<LiveChart metricKeys={['temperature', 'humidity']} />
// NOT:
<LiveChart metricKeys={['temp', 'humidity']} />  // ✗ Wrong key

// Check data exists:
const latest = useTelemetryStore((s) => s.getLatest());
console.log(latest?.metrics); // Should have the keys you're charting
```

**Browser Console Errors**:

```bash
# Open DevTools (F12) and check Console tab
# Look for React errors or Recharts warnings
# Common error: "Cannot read property 'temperature' of undefined"
#   → Means telemetry store is empty
```

### 4. Alerts Not Appearing

**Symptom**: Scenario runs but no alert pops up

**Check Threshold Logic**:

```typescript
// Verify thresholds are set in config:
const config = {
  metrics: [
    {
      key: 'temperature',
      criticalMax: 10,  // Should be set
      criticalMin: 0,   // Should be set
    },
  ],
};

// Check values exceed thresholds:
import { getMetricStatus } from '@/core/utils/formatting';
const status = getMetricStatus(12, temperatureConfig);
console.log(status); // Should be "critical"
```

**Check Alert Generation in Simulator**:

```python
# In simulator, verify get_alerts() is called:
class MySimulator(ScenarioSimulator):
    def get_alerts(self) -> List[Alert]:
        alerts = []
        metrics = self.get_metrics()
        temp = metrics.get('temperature', 0)
        
        # Debug: Print to see if threshold check works
        print(f"Temp: {temp}, Critical: {temp > 10}")
        
        if temp > 10:  # Critical threshold
            alert = Alert(
                id=f'alert-{int(time.time() * 1000)}',
                timestamp=datetime.now().isoformat(),
                type='threshold_exceeded',
                severity='critical',
                message=f'Temperature {temp}°C exceeded limit!',
                # ... other fields
            )
            alerts.append(alert)
        
        return alerts
```

### 5. Scenario Doesn't Progress

**Symptom**: Phase stays at "normal" or elapsed time doesn't increase

**Check Scenario State**:

```javascript
// In browser console:
const store = window.useScenarioStore;
const scenario = store.getState().scenario;
console.log(scenario);
// Should show: status='running', elapsedSeconds increasing

// If elapsed isn't increasing, scenario might not be running:
store.getState().startScenario();
```

**Check Simulator Time Updates**:

```python
# Verify elapsed time is updating:
while simulator.elapsed < 60:
    simulator.update()
    print(f"Elapsed: {simulator.elapsed:.1f}s, Phase: {simulator.get_current_phase()}")
    time.sleep(0.5)

# If elapsed is 0, check:
# 1. simulator.is_running = True
# 2. simulator.start_time is set
# 3. Time is actually passing (not mocked)
```

### 6. Memory Usage Growing

**Symptom**: Browser gets slower over time, memory usage increases

**Check Telemetry Store Size**:

```javascript
const store = window.useTelemetryStore;
const points = store.getState().telemetry;
console.log(points.length); // Should max out at 1000

// If > 1000, telemetry history isn't being limited
// Fix in store.ts:
addTelemetry: (point) =>
  set((state) => ({
    telemetry: [...state.telemetry.slice(-999), point],  // Keep last 1000
  }))
```

**Check for Memory Leaks**:

```javascript
// Open DevTools > Memory tab
// Take heap snapshot at start
// Run scenario for 1 minute
// Take heap snapshot at end
// Compare: should be similar size

// If memory only grows:
// 1. Charts might be creating new objects
// 2. Event listeners might not be cleaned up
// 3. Timers might not be cleared
```

### 7. Frontend Crashes or Freezes

**Symptom**: Browser tab becomes unresponsive

**Check for Infinite Rendering**:

```typescript
// Make sure store selectors are specific:
// ✗ Bad - re-renders every store change:
const state = useTelemetryStore();

// ✓ Good - only re-renders if this specific value changes:
const latest = useTelemetryStore((s) => s.getLatest());
```

**Check for Infinite Loops**:

```typescript
// Verify dependencies in useEffect:
useEffect(() => {
  // This effect will run after every render!
  // Infinite loop if dependencies are missing
  setPhase('normal');
}, []); // ← Need proper dependencies

// ✓ Correct:
useEffect(() => {
  if (scenario.status !== 'running') return;
  // ...
}, [scenario.status]);  // ← Explicit dependency
```

### 8. Simulator Crashes

**Symptom**: Server stops unexpectedly, no error message

**Enable Debug Logging**:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# Or add prints:
def handle_command(self, command):
    print(f"Received command: {command}")
    try:
        # ...
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
```

**Check for Blocking Operations**:

```python
# Don't use time.sleep() in async code:
# ✗ Bad:
async def update_loop(self):
    time.sleep(1)  # BLOCKS entire server!

# ✓ Good:
async def update_loop(self):
    await asyncio.sleep(1)  # Async, doesn't block
```

### 9. Video Recording Issues

**Symptom**: Recording looks stuttery or incomplete

**Optimize for Recording**:

```javascript
// Disable animations during recording:
const isRecording = true;
if (isRecording) {
  document.body.style.animation = 'none';
}

// Increase update frequency:
// In simulator: await asyncio.sleep(0.033)  # 30 Hz for video

// Use screen recording software:
// - Chrome DevTools > Rendering > Record
// - OBS Studio (recommended)
// - QuickTime (macOS)
```

**Common Recording Problems**:

| Problem | Solution |
|---------|----------|
| Stuttering | Increase simulator speed, reduce other programs |
| Blurry text | Use 1920x1080 or higher resolution |
| Slow playback | Record at 60 FPS, not slower |
| Missing events | Scroll up in timeline, events may be above viewport |

### 10. Port Already in Use

**Symptom**: "Address already in use" or "Port 5173 is busy"

**Find and Kill Process**:

```bash
# Find process using port:
lsof -i :5173          # Frontend
lsof -i :8765          # Simulator

# Kill process:
kill -9 <PID>

# Or use different ports:
npm run dev -- --port 5174
python vitalchain_simulator.py --port 8766
```

**macOS Specific**:

```bash
# Check all listening ports:
netstat -an | grep LISTEN

# More powerful tool:
brew install lsof
lsof -i -P -n | grep LISTEN
```

---

## Performance Optimization

### For Smooth Real-Time Display

```typescript
// 1. Disable chart animations:
<LiveChart
  metricKeys={['temp']}
  // Add to Charts.tsx:
  // isAnimationActive={false}
/>

// 2. Limit telemetry history:
// Store already does this, but can reduce to 500 if needed:
slice(-499)

// 3. Reduce WebSocket message frequency:
# In simulator: await asyncio.sleep(0.2)  # 5 Hz instead of 10 Hz

// 4. Memoize components:
const DashboardMemo = React.memo(Dashboard);
```

### For Large Scenarios (>10 minutes)

```python
# In simulator, don't keep all metrics in memory:
async def update_loop(self):
    # Process, broadcast, but don't store
    # Only broadcast to connected clients
    await self.broadcast({...})
    # Don't save to disk (yet)
```

---

## Debugging Commands

```bash
# Quick WebSocket test:
python3 << 'EOF'
import asyncio, websockets, json
async def test():
    async with websockets.connect('ws://localhost:8765') as ws:
        await ws.send(json.dumps({'type': 'start_scenario', 'scenario': 'door_open'}))
        for i in range(5):
            msg = await ws.recv()
            data = json.loads(msg)
            print(f"{data['type']}: {data.get('payload', {}).get('metrics', {})}")
asyncio.run(test())
EOF

# Check React components:
# In browser console, with React DevTools installed:
inspect($r.props);  # Inspect component props
```

---

## When to Report Bugs

Document these details:

1. **Exact steps to reproduce**
   - Which scenario?
   - What speed?
   - How long did you wait?

2. **Expected vs. actual behavior**
   - "Expected alert at 30s, appeared at 45s"

3. **Environment**
   - OS, browser, Node version, Python version
   - Frontend and simulator on same machine or different?

4. **Logs**
   - Browser console output (F12)
   - Simulator stdout/stderr
   - Any error messages

5. **Screen recording or screenshot**
   - What exactly is broken?
