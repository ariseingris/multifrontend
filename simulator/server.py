#!/usr/bin/env python3
"""Shared WebSocket simulator for AquaSense, FactSafe and FireScout AI."""
import argparse
import asyncio
import json
import math
import time
from typing import Any, Dict, Optional

import websockets

try:
    from .telemetry_history import append_history, HISTORY_PROJECTS, HISTORY_BUCKET_SECONDS
    from .scenario_models import DemoScenario, AquaSenseSimulator, FactSafeSimulator, FireScoutSimulator
except ImportError:
    from telemetry_history import append_history, HISTORY_PROJECTS, HISTORY_BUCKET_SECONDS
    from scenario_models import DemoScenario, AquaSenseSimulator, FactSafeSimulator, FireScoutSimulator

TELEMETRY_INTERVAL_SECONDS = 1.0
SIMULATORS = {
    'aquasense': AquaSenseSimulator,
    'factsafe': FactSafeSimulator,
    'firescout': FireScoutSimulator,
}


class SimulatorServer:
    """WebSocket server for broadcasting simulated telemetry"""

    def __init__(self, host: str = 'localhost', port: int = 8765):
        self.host = host
        self.port = port
        self.clients: set[Any] = set()
        self.simulator: Optional[DemoScenario] = None
        self.update_task: Optional[asyncio.Task] = None
        self.current_project = 'aquasense'
        self.current_scenario = 'normal'
        self._simulation_lock = asyncio.Lock()
        self._completion_emitted = False
        self._history_session = None
        self._history = []
        self._history_events = []
        self._last_emission_wall = 0.0
        self._last_state_wall = 0.0

    async def register(self, websocket: Any):
        """Register a new client"""
        self.clients.add(websocket)
        print(f'Client connected. Total: {len(self.clients)}')
        async with self._simulation_lock:
            simulator = self.simulator
            if isinstance(simulator, DemoScenario):
                await websocket.send(json.dumps({'type': 'simulation_state', 'payload': simulator.state_packet()}))
                if simulator.project in HISTORY_PROJECTS:
                    await websocket.send(json.dumps({'type': 'session_history', 'payload': {
                        'project': simulator.project, 'sessionId': simulator.session_id,
                        'telemetry': self._history, 'events': self._history_events,
                    }}))
                if simulator.last_packet:
                    # Cached sample keeps its original timestamp; never synthesize a new reading.
                    await websocket.send(json.dumps({'type': 'telemetry', 'payload': simulator.last_packet}))

    async def unregister(self, websocket: Any):
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

    async def handle_client(
        self,
        websocket: Any,
        path: Optional[str] = None,
    ):
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
        async with self._simulation_lock:
            try:
                await self._handle_command(command)
            except (ValueError, TypeError, OverflowError) as error:
                await self.broadcast({'type': 'command_error', 'payload': {
                    'project': command.get('project', self.current_project), 'message': str(error)}})

    @staticmethod
    def validate_speed(value):
        speed = float(value)
        if not math.isfinite(speed) or not 0 < speed <= 600:
            raise ValueError('Speed must be finite and between 0 and 600x')
        return speed

    async def _handle_command(self, command):
        cmd_type = command.get('type')
        if cmd_type == 'get_state':
            if isinstance(self.simulator, DemoScenario):
                await self.publish_demo()
            return
        if cmd_type == 'start_scenario':
            project = command.get('project', self.current_project)
            scenario_id = command.get('scenario', 'routine_recon' if project == 'firescout' else 'normal')
            speed = self.validate_speed(command.get('speed', 1.0))
            simulator = self._create_simulator(project, scenario_id, speed, command.get('seed', 1729), command.get('continuous', getattr(self, 'aqua_continuous', True)))
            self.current_project, self.current_scenario = project, scenario_id
            self.simulator = simulator
            self._completion_emitted = False
            if isinstance(simulator, DemoScenario):
                simulator.start()
                await self.publish_demo(emit_telemetry=True)
            print(f'Started {project} scenario: {scenario_id} at {speed}x speed')
            return
        if command.get('project', self.current_project) != self.current_project:
            raise ValueError('This command belongs to another project; start its scenario first')
        simulator = self.simulator
        if not simulator:
            return
        if cmd_type == 'pause':
            simulator.pause()
        elif cmd_type == 'resume':
            if isinstance(simulator, DemoScenario) and simulator.playback_status != 'paused':
                raise ValueError('Only a paused scenario can resume')
            simulator.resume()
        elif cmd_type == 'reset':
            simulator.reset()
            self._completion_emitted = False
        elif cmd_type == 'set_speed':
            simulator.speed = self.validate_speed(command.get('speed', 1.0))
        else:
            return
        if isinstance(simulator, DemoScenario):
            if cmd_type in ('pause', 'resume', 'set_speed'):
                simulator.evaluate()
                simulator.event(cmd_type, f'Playback {cmd_type}; effective speed {simulator.speed:g}x')
            await self.publish_demo()

    async def publish_demo(self, emit_telemetry=False):
        simulator = self.simulator
        if not isinstance(simulator, DemoScenario):
            return
        if simulator.project in HISTORY_PROJECTS and self._history_session != simulator.session_id:
            self._history_session = simulator.session_id
            self._history = []
            self._history_events = []
        self._last_state_wall = time.monotonic()
        if simulator.is_running:
            simulator.evaluate()
        packet = None
        if emit_telemetry and simulator.data_available() and not self._completion_emitted:
            packet = simulator.telemetry_packet()
            self._last_emission_wall = time.monotonic()
            if simulator.project in HISTORY_PROJECTS:
                packet['historyBucketSeconds'] = simulator.config.get('history_bucket_seconds', HISTORY_BUCKET_SECONDS)
                if simulator.project == 'aquasense':
                    packet['historyRetentionSeconds'] = simulator.config['retention_seconds']
                    packet['historyMaxPoints'] = simulator.config['history_max_points']
                self._history = append_history(self._history, packet)
        await self.broadcast({'type': 'simulation_state', 'payload': simulator.state_packet()})
        for event in simulator.drain_events():
            if simulator.project in HISTORY_PROJECTS:
                self._history_events = (self._history_events + [event])[-200:]
            await self.broadcast({'type': 'event', 'payload': event})
        for alert in simulator.get_alerts():
            await self.broadcast({'type': 'alert', 'payload': alert})
        if packet:
            await self.broadcast({'type': 'telemetry', 'payload': packet})
        if simulator.completed:
            self._completion_emitted = True

    async def tick_demo(self):
        async with self._simulation_lock:
            simulator = self.simulator
            simulator.update()
            # Keep FireScout's existing cadence. Minute-based projects get denser
            # samples at accelerated speeds, without oversampling a 1x stream.
            due = (simulator.project not in HISTORY_PROJECTS or simulator.last_telemetry_elapsed is None
                   or simulator.elapsed - simulator.last_telemetry_elapsed >= 1
                   or time.monotonic() - self._last_emission_wall >= 1)
            if simulator.project == 'aquasense':
                due = due and time.monotonic() - self._last_emission_wall >= .2
            emitting = simulator.is_running and not simulator.is_paused and due
            if (simulator.project not in HISTORY_PROJECTS or emitting
                    or time.monotonic() - self._last_state_wall >= 1):
                await self.publish_demo(emit_telemetry=emitting)

    async def update_loop(self):
        """Main update loop"""
        while True:
            try:
                if isinstance(self.simulator, DemoScenario):
                    await self.tick_demo()
                await asyncio.sleep(.2 if self.current_project == 'aquasense' else .1 if self.current_project in HISTORY_PROJECTS else TELEMETRY_INTERVAL_SECONDS)

            except Exception as e:
                print(f'Update loop error: {e}')
                await asyncio.sleep(0.1)

    def _create_simulator(self, project: str, scenario: str, speed: float, seed: int = 1729, continuous: bool = True) -> DemoScenario:
        model = SIMULATORS.get(project)
        if model is None:
            raise ValueError(f'Unsupported project: {project}')
        if project == 'aquasense':
            return model(scenario, speed, seed, continuous=continuous, **getattr(self, 'aqua_history_policy', {}))
        return model(scenario, speed, seed)

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
    parser.add_argument('--project', choices=tuple(SIMULATORS), default='aquasense', help='Project to simulate')
    parser.add_argument('--scenario', default=None, help='Scenario to run (project default when omitted)')
    parser.add_argument('--seed', type=int, default=1729, help='Deterministic demo seed')
    parser.add_argument('--autostart', action='store_true', help='Explicitly start new demo scenarios without frontend controls')
    parser.add_argument('--finite', action='store_true', help='Opt AquaSense out of continuous mode for a finite script')
    parser.add_argument('--history-hours', type=float, default=6, help='AquaSense diagnostic retention in simulated hours')
    parser.add_argument('--history-bucket-seconds', type=float, default=30, help='AquaSense archive sample bucket')
    parser.add_argument('--history-max-points', type=int, default=1000, help='AquaSense archive memory cap')
    parser.add_argument('--speed', type=float, default=1.0, help='Simulation speed')

    args = parser.parse_args()

    server = SimulatorServer(args.host, args.port)
    server.aqua_continuous = not args.finite
    server.aqua_history_policy = {'retention_seconds': args.history_hours * 3600,
                                 'history_bucket_seconds': args.history_bucket_seconds,
                                 'history_max_points': args.history_max_points}

    # Select a project without generating readings until Start or --autostart.
    server.current_project = args.project
    scenario = args.scenario or ('routine_recon' if args.project == 'firescout' else 'normal')
    server.current_scenario = scenario
    server.simulator = server._create_simulator(args.project, scenario, server.validate_speed(args.speed), args.seed, not args.finite)
    if isinstance(server.simulator, DemoScenario) and args.autostart:
        server.simulator.start()
    if isinstance(server.simulator, DemoScenario):
        print(f'SIMULATION · {args.project}/{scenario} · {server.simulator.playback_status} · seed {args.seed}')

    try:
        asyncio.run(server.start())
    except KeyboardInterrupt:
        print('\nShutdown complete')


if __name__ == '__main__':
    main()
