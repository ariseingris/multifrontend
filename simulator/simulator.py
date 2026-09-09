#!/usr/bin/env python3
"""
IoT Demo Simulator - WebSocket Server for Frontend

Generates deterministic telemetry data for scenario playback.
Supports multiple projects and scenarios.
"""

import asyncio
import json
import math
import time
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Dict, Any, Optional, List
from abc import ABC, abstractmethod
import argparse

try:
    import websockets
    from websockets.server import WebSocketServerProtocol
except ImportError:
    print("Error: websockets not installed. Run: pip install websockets")
    exit(1)


@dataclass
class TelemetryPoint:
    timestamp: str
    deviceId: str
    metrics: Dict[str, float]
    status: str
    riskScore: float
    scenario: str


@dataclass
class Alert:
    id: str
    timestamp: str
    type: str
    severity: str
    message: str
    metric: Optional[str] = None
    value: Optional[float] = None
    threshold: Optional[float] = None
    deviceId: Optional[str] = None


@dataclass
class TimelineEvent:
    timestamp: str
    type: str
    message: str
    severity: str
    icon: str


class ScenarioSimulator(ABC):
    """Base class for scenario simulators"""

    def __init__(self, scenario_config: Dict[str, Any], speed: float = 1.0):
        self.config = scenario_config
        self.speed = speed
        self.start_time = time.time()
        self.elapsed = 0.0
        self.is_running = False
        self.is_paused = False
        self.pause_time = 0.0

    @abstractmethod
    def get_metrics(self) -> Dict[str, float]:
        """Generate metrics for current time"""
        pass

    @abstractmethod
    def get_current_phase(self) -> str:
        """Determine current scenario phase"""
        pass

    @abstractmethod
    def get_status(self) -> str:
        """Determine overall status"""
        pass

    @abstractmethod
    def get_alerts(self) -> List[Alert]:
        """Generate alerts if thresholds exceeded"""
        pass

    def update(self):
        """Update elapsed time"""
        if not self.is_running or self.is_paused:
            return

        elapsed_real = time.time() - self.start_time - self.pause_time
        self.elapsed = elapsed_real * self.speed

    def pause(self):
        self.is_paused = True
        self.pause_start = time.time()

    def resume(self):
        self.pause_time += time.time() - self.pause_start
        self.is_paused = False

    def reset(self):
        self.elapsed = 0.0
        self.start_time = time.time()
        self.is_running = False
        self.is_paused = False
        self.pause_time = 0.0


class VitalChainSimulator(ScenarioSimulator):
    """Simulator for VitalChain cold chain monitoring"""

    def __init__(self, scenario_id: str = 'normal', speed: float = 1.0):
        config = {
            'normal': {
                'duration': 60,
                'steps': [
                    {
                        'name': 'Steady State',
                        'phase': 'normal',
                        'startAt': 0,
                        'endAt': 60,
                        'metrics': {
                            'temperature': {'start': 4, 'end': 4.5},
                            'humidity': {'start': 50, 'end': 52},
                            'battery': {'start': 85, 'end': 84},
                            'signal': {'start': -65, 'end': -66},
                        },
                    }
                ],
            },
            'door_open': {
                'duration': 90,
                'steps': [
                    {
                        'name': 'Normal',
                        'phase': 'normal',
                        'startAt': 0,
                        'endAt': 10,
                        'metrics': {
                            'temperature': {'start': 4, 'end': 4},
                            'humidity': {'start': 50, 'end': 50},
                            'battery': {'start': 80, 'end': 80},
                            'signal': {'start': -65, 'end': -65},
                        },
                    },
                    {
                        'name': 'Early Signal',
                        'phase': 'early_signal',
                        'startAt': 10,
                        'endAt': 20,
                        'metrics': {
                            'temperature': {'start': 4, 'end': 6},
                            'humidity': {'start': 50, 'end': 60},
                            'battery': {'start': 80, 'end': 80},
                            'signal': {'start': -65, 'end': -65},
                        },
                    },
                    {
                        'name': 'Warning',
                        'phase': 'warning',
                        'startAt': 20,
                        'endAt': 40,
                        'metrics': {
                            'temperature': {'start': 6, 'end': 10},
                            'humidity': {'start': 60, 'end': 75},
                            'battery': {'start': 80, 'end': 79},
                            'signal': {'start': -65, 'end': -70},
                        },
                    },
                    {
                        'name': 'Critical',
                        'phase': 'critical',
                        'startAt': 40,
                        'endAt': 50,
                        'metrics': {
                            'temperature': {'start': 10, 'end': 12},
                            'humidity': {'start': 75, 'end': 80},
                            'battery': {'start': 79, 'end': 78},
                            'signal': {'start': -70, 'end': -75},
                        },
                    },
                    {
                        'name': 'Alert',
                        'phase': 'alert',
                        'startAt': 50,
                        'endAt': 60,
                        'metrics': {
                            'temperature': {'start': 12, 'end': 11},
                            'humidity': {'start': 80, 'end': 78},
                            'battery': {'start': 78, 'end': 77},
                            'signal': {'start': -75, 'end': -70},
                        },
                    },
                    {
                        'name': 'Recovery',
                        'phase': 'recovery',
                        'startAt': 60,
                        'endAt': 90,
                        'metrics': {
                            'temperature': {'start': 11, 'end': 4},
                            'humidity': {'start': 78, 'end': 50},
                            'battery': {'start': 77, 'end': 76},
                            'signal': {'start': -70, 'end': -65},
                        },
                    },
                ],
            },
        }

        self.scenario_id = scenario_id
        super().__init__(config.get(scenario_id, config['normal']), speed)
        self.is_running = True
        self.current_step_idx = 0
        self.last_alert_time = 0
        self.alert_cooldown = 5  # seconds between identical alerts

    def _get_step_for_time(self) -> Optional[Dict[str, Any]]:
        """Get the step that contains current elapsed time"""
        for step in self.config['steps']:
            if step['startAt'] <= self.elapsed < step['endAt']:
                return step
        return None

    def _interpolate(self, start: float, end: float, t: float) -> float:
        """Linear interpolation"""
        return start + (end - start) * t

    def get_metrics(self) -> Dict[str, float]:
        """Generate metrics based on current step"""
        step = self._get_step_for_time()
        if not step:
            return {}

        duration = step['endAt'] - step['startAt']
        if duration <= 0:
            return step['metrics']

        t = (self.elapsed - step['startAt']) / duration
        t = max(0, min(1, t))

        metrics = {}
        for key, value_range in step['metrics'].items():
            start = value_range['start']
            end = value_range['end']
            # Add small noise
            noise = (hash(f"{key}{int(self.elapsed)}") % 100 - 50) / 10000
            metrics[key] = self._interpolate(start, end, t) + noise

        return metrics

    def get_current_phase(self) -> str:
        """Get current scenario phase"""
        step = self._get_step_for_time()
        return step['phase'] if step else 'normal'

    def get_status(self) -> str:
        """Determine status from metrics"""
        metrics = self.get_metrics()
        temp = metrics.get('temperature', 4)

        if temp > 10 or temp < 0:
            return 'critical'
        elif temp > 6 or temp < 2:
            return 'warning'
        return 'normal'

    def get_alerts(self) -> List[Alert]:
        """Generate alerts based on thresholds"""
        alerts = []
        metrics = self.get_metrics()
        current_time = time.time()

        # Temperature alert
        temp = metrics.get('temperature', 4)
        if (temp > 10 or temp < 0) and (current_time - self.last_alert_time) > self.alert_cooldown:
            alerts.append(
                Alert(
                    id=f'alert-{int(current_time * 1000)}',
                    timestamp=datetime.now().isoformat(),
                    type='threshold_exceeded',
                    severity='critical',
                    message=f'Temperature {temp:.1f}°C out of safe range!',
                    metric='temperature',
                    value=temp,
                    threshold=2.0 if temp > 10 else 0.0,
                    deviceId='sensor-01',
                )
            )
            self.last_alert_time = current_time

        return alerts


class SimulatorServer:
    """WebSocket server for broadcasting simulated telemetry"""

    def __init__(self, host: str = 'localhost', port: int = 8765):
        self.host = host
        self.port = port
        self.clients: set[WebSocketServerProtocol] = set()
        self.simulator: Optional[ScenarioSimulator] = None
        self.update_task: Optional[asyncio.Task] = None
        self.current_project = 'vitalchain'
        self.current_scenario = 'normal'

    async def register(self, websocket: WebSocketServerProtocol):
        """Register a new client"""
        self.clients.add(websocket)
        print(f'Client connected. Total: {len(self.clients)}')

    async def unregister(self, websocket: WebSocketServerProtocol):
        """Unregister a client"""
        self.clients.discard(websocket)
        print(f'Client disconnected. Total: {len(self.clients)}')

    async def broadcast(self, message: Dict[str, Any]):
        """Send message to all clients"""
        if not self.clients:
            return

        msg_json = json.dumps(message)
        # Use a list to avoid "set changed during iteration" error
        disconnected = set()

        for client in list(self.clients):
            try:
                await client.send(msg_json)
            except websockets.exceptions.ConnectionClosed:
                disconnected.add(client)

        for client in disconnected:
            await self.unregister(client)

    async def handle_client(self, websocket: WebSocketServerProtocol, path: str):
        """Handle a single client connection"""
        await self.register(websocket)

        try:
            async for message in websocket:
                data = json.loads(message)
                await self.handle_command(data)
        except Exception as e:
            print(f'Error: {e}')
        finally:
            await self.unregister(websocket)

    async def handle_command(self, command: Dict[str, Any]):
        """Handle commands from clients"""
        cmd_type = command.get('type')

        if cmd_type == 'start_scenario':
            scenario_id = command.get('scenario', 'normal')
            speed = command.get('speed', 1.0)
            self.current_scenario = scenario_id
            self.simulator = VitalChainSimulator(scenario_id, speed)
            print(f'Started scenario: {scenario_id} at {speed}x speed')

        elif cmd_type == 'pause':
            if self.simulator:
                self.simulator.pause()

        elif cmd_type == 'resume':
            if self.simulator:
                self.simulator.resume()

        elif cmd_type == 'reset':
            if self.simulator:
                self.simulator.reset()

        elif cmd_type == 'set_speed':
            if self.simulator:
                self.simulator.speed = command.get('speed', 1.0)

    async def update_loop(self):
        """Main update loop"""
        while True:
            try:
                if self.simulator:
                    self.simulator.update()

                    if (
                        self.simulator.is_running
                        and not self.simulator.is_paused
                        and self.simulator.elapsed
                        < self.simulator.config['duration']
                    ):
                        metrics = self.simulator.get_metrics()
                        telemetry = TelemetryPoint(
                            timestamp=datetime.now().isoformat(),
                            deviceId='sensor-01',
                            metrics=metrics,
                            status=self.simulator.get_status(),
                            riskScore=float(
                                (1.0 - min(metrics.get('temperature', 4), 8) / 8)
                                * 100
                            ),
                            scenario=self.simulator.scenario_id,
                        )

                        await self.broadcast(
                            {
                                'type': 'telemetry',
                                'payload': asdict(telemetry),
                            }
                        )

                        # Check for alerts
                        for alert in self.simulator.get_alerts():
                            await self.broadcast(
                                {
                                    'type': 'alert',
                                    'payload': asdict(alert),
                                }
                            )

                await asyncio.sleep(0.1)

            except Exception as e:
                print(f'Update loop error: {e}')
                await asyncio.sleep(0.1)

    async def start(self):
        """Start the server"""
        self.update_task = asyncio.create_task(self.update_loop())

        async with websockets.serve(self.handle_client, self.host, self.port):
            print(f'Simulator server running on ws://{self.host}:{self.port}')
            await asyncio.Future()  # Run forever


def main():
    parser = argparse.ArgumentParser(description='IoT Demo Simulator')
    parser.add_argument('--host', default='localhost', help='WebSocket server host')
    parser.add_argument('--port', type=int, default=8765, help='WebSocket server port')
    parser.add_argument('--project', default='vitalchain', help='Project to simulate')
    parser.add_argument('--scenario', default='normal', help='Scenario to run')
    parser.add_argument('--speed', type=float, default=1.0, help='Simulation speed')

    args = parser.parse_args()

    server = SimulatorServer(args.host, args.port)

    # Auto-start scenario if provided
    if args.scenario != 'normal' or args.speed != 1.0:
        print(f'Auto-starting: {args.scenario} at {args.speed}x speed')
        server.simulator = VitalChainSimulator(args.scenario, args.speed)

    try:
        asyncio.run(server.start())
    except KeyboardInterrupt:
        print('\nShutdown complete')


if __name__ == '__main__':
    main()
