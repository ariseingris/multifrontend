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


TELEMETRY_INTERVAL_SECONDS = 1.0

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

    def __init__(self, scenario_id: str = 'normal', speed: float = 0.5):
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
        """Interpolate smoothly with zero slope at both ends of a step."""
        progress = max(0.0, min(1.0, t))
        smooth_progress = progress * progress * (3.0 - 2.0 * progress)
        return start + (end - start) * smooth_progress

    def _smooth_noise(self, key: str) -> float:
        """Return low-amplitude deterministic noise for a metric."""
        phase = sum((index + 1) * ord(char) for index, char in enumerate(key))
        return (
            math.sin(self.elapsed * 0.35 + phase) * 0.003
            + math.sin(self.elapsed * 0.11 + phase * 1.7) * 0.002
        )

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
            metrics[key] = self._interpolate(start, end, t) + self._smooth_noise(key)

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


class PulseGuardSimulator(ScenarioSimulator):
    """Deterministic rainfall, soil and tilt model for the PulseGuard demo."""

    def __init__(self, scenario_id: str = 'normal', speed: float = 1.0):
        durations = {'normal': 60, 'heavy_rain': 90, 'landslide': 100, 'communication_loss': 100}
        self.scenario_id = scenario_id if scenario_id in durations else 'normal'
        super().__init__({'duration': durations[self.scenario_id]}, speed)
        self.is_running = True
        self.last_alert_time = 0.0
        self.alert_cooldown = 5

    def _ramp(self, start: float, end: float, start_at: float, end_at: float) -> float:
        progress = max(0.0, min(1.0, (self.elapsed - start_at) / (end_at - start_at)))
        smooth = progress * progress * (3.0 - 2.0 * progress)
        return start + (end - start) * smooth

    def _noise(self, key: str, amplitude: float) -> float:
        phase = sum((index + 1) * ord(char) for index, char in enumerate(key))
        return math.sin(self.elapsed * 0.27 + phase) * amplitude

    def get_metrics(self) -> Dict[str, float]:
        rain, soil, tilt = 2.0, 45.0, 0.2
        if self.scenario_id == 'heavy_rain':
            rain = self._ramp(2, 70, 5, 45) if self.elapsed < 65 else self._ramp(70, 20, 65, 90)
            soil = self._ramp(45, 72, 20, 75)
            tilt = self._ramp(0.2, 1.4, 45, 90)
        elif self.scenario_id in ('landslide', 'communication_loss'):
            if self.elapsed < 85:
                rain = self._ramp(2, 78, 5, 48)
                soil = self._ramp(45, 90, 20, 72)
                tilt = self._ramp(0.2, 5.2, 42, 92)
            else:
                rain = self._ramp(78, 8, 85, 100)
                soil = self._ramp(90, 55, 85, 100)
                tilt = self._ramp(5.2, 0.3, 85, 100)

        rain += self._noise('rain', 0.6)
        soil += self._noise('soil', 0.35)
        tilt += self._noise('tilt', 0.025)
        rain = max(0.0, min(100.0, rain))
        soil = max(0.0, min(100.0, soil))
        tilt = max(0.0, min(8.0, tilt))
        warning_count = sum((rain >= 30, soil >= 70, tilt >= 2))
        critical_count = sum((rain >= 60, soil >= 85, tilt >= 4))
        risk_score = min(100.0, max(15.0, warning_count * 23 + critical_count * 18 + max(0.0, tilt - 2) * 3))
        network_online = not (self.scenario_id == 'communication_loss' and 15 <= self.elapsed < 85)
        local_alarm = warning_count >= 2 and critical_count >= 1
        return {
            'rain_mm_h': rain,
            'soil_moisture_percent': soil,
            'tilt_deg': tilt,
            'risk_score': risk_score,
            'rain_index': min(100.0, rain / 60 * 100),
            'soil_index': min(100.0, soil / 85 * 100),
            'tilt_index': min(100.0, tilt / 4 * 100),
            'network_online': 1.0 if network_online else 0.0,
            'local_alarm': 1.0 if local_alarm else 0.0,
        }

    def get_current_phase(self) -> str:
        metrics = self.get_metrics()
        if metrics['local_alarm']:
            return 'alert'
        if metrics['risk_score'] >= 55:
            return 'warning'
        if metrics['risk_score'] >= 30:
            return 'early_signal'
        return 'normal'

    def get_status(self) -> str:
        risk_score = self.get_metrics()['risk_score']
        return 'critical' if risk_score >= 75 else 'warning' if risk_score >= 55 else 'normal'

    def get_alerts(self) -> List[Alert]:
        metrics = self.get_metrics()
        now = time.time()
        if metrics['local_alarm'] and now - self.last_alert_time > self.alert_cooldown:
            self.last_alert_time = now
            offline = metrics['network_online'] == 0
            return [Alert(
                id=f'pulseguard-alert-{int(now * 1000)}',
                timestamp=datetime.now().isoformat(),
                type='threshold_exceeded',
                severity='critical',
                message='Network offline: local siren remains active!' if offline else 'Multi-sensor agreement: local siren active!',
                metric='risk_score',
                value=metrics['risk_score'],
                threshold=75,
                deviceId='pulseguard-node-01',
            )]
        return []


class FactSafeSimulator(ScenarioSimulator):
    """Deterministic factory gas, dust and zone-risk model."""

    def __init__(self, scenario_id: str = 'normal', speed: float = 1.0):
        durations = {'normal': 60, 'gas_leak': 100, 'dust_event': 100}
        self.scenario_id = scenario_id if scenario_id in durations else 'normal'
        super().__init__({'duration': durations[self.scenario_id]}, speed)
        self.is_running = True
        self.last_alert_time = 0.0
        self.alert_cooldown = 5

    def _ramp(self, start: float, end: float, start_at: float, end_at: float) -> float:
        progress = max(0.0, min(1.0, (self.elapsed - start_at) / (end_at - start_at)))
        smooth = progress * progress * (3.0 - 2.0 * progress)
        return start + (end - start) * smooth

    def _noise(self, key: str, amplitude: float) -> float:
        phase = sum((index + 1) * ord(char) for index, char in enumerate(key))
        return math.sin(self.elapsed * 0.23 + phase) * amplitude

    def get_metrics(self) -> Dict[str, float]:
        nh3, co, h2s, ch4 = 15.0, 12.0, 0.6, 1.0
        pm25, pm10 = 28.0, 62.0
        temperature, humidity = 25.0, 52.0
        zone_b_risk, zone_d_risk = 18.0, 18.0

        if self.scenario_id == 'gas_leak':
            nh3 = self._ramp(15, 68, 10, 62)
            co = self._ramp(12, 42, 28, 70)
            zone_b_risk = self._ramp(18, 96, 20, 78)
            temperature = self._ramp(25, 29, 45, 80)
        elif self.scenario_id == 'dust_event':
            pm25 = self._ramp(28, 155, 15, 65)
            pm10 = self._ramp(62, 220, 15, 65)
            humidity = self._ramp(52, 68, 42, 78)
            zone_d_risk = self._ramp(18, 88, 22, 75)

        nh3 += self._noise('nh3', 0.25)
        co += self._noise('co', 0.2)
        h2s += self._noise('h2s', 0.02)
        ch4 += self._noise('ch4', 0.01)
        pm25 += self._noise('pm25', 4.5)
        pm10 += self._noise('pm10', 8.0)
        humidity += self._noise('humidity', 0.2)

        gas_severity = max(nh3 / 50, co / 70, h2s / 10, ch4 / 8)
        dust_severity = max(pm25 / 100, pm10 / 160)
        microclimate_factor = max(0.0, min(1.0, (humidity - 35) / 65))
        risk_score = min(100.0, max(10.0, gas_severity * 55 + dust_severity * 25 + microclimate_factor * 20))
        zone_a_risk = min(100.0, 15 + risk_score * 0.2)
        zone_c_risk = min(100.0, 12 + risk_score * 0.15)
        return {
            'nh3_ppm': max(0.0, min(80.0, nh3)), 'co_ppm': max(0.0, min(120.0, co)),
            'h2s_ppm': max(0.0, min(20.0, h2s)), 'ch4_percent': max(0.0, min(10.0, ch4)),
            'pm25_ug_m3': max(0.0, min(180.0, pm25)), 'pm10_ug_m3': max(0.0, min(250.0, pm10)),
            'temperature_c': temperature, 'humidity_percent': max(0.0, min(100.0, humidity)),
            'nh3_severity': min(1.5, nh3 / 50), 'co_severity': min(1.5, co / 70),
            'h2s_severity': min(1.5, h2s / 10), 'ch4_severity': min(1.5, ch4 / 8),
            'zone_a_risk': zone_a_risk, 'zone_b_risk': zone_b_risk,
            'zone_c_risk': zone_c_risk, 'zone_d_risk': zone_d_risk,
            'risk_score': risk_score,
        }

    def get_current_phase(self) -> str:
        risk_score = self.get_metrics()['risk_score']
        return 'critical' if risk_score >= 75 else 'warning' if risk_score >= 55 else 'normal'

    def get_status(self) -> str:
        risk_score = self.get_metrics()['risk_score']
        return 'critical' if risk_score >= 75 else 'warning' if risk_score >= 55 else 'normal'

    def get_alerts(self) -> List[Alert]:
        metrics = self.get_metrics()
        now = time.time()
        if metrics['risk_score'] >= 75 and now - self.last_alert_time > self.alert_cooldown:
            self.last_alert_time = now
            hazard = 'NH3 gas' if metrics['nh3_severity'] >= 1 else 'dust' if metrics['pm25_ug_m3'] >= 100 else 'factory hazard'
            return [Alert(id=f'factsafe-alert-{int(now * 1000)}', timestamp=datetime.now().isoformat(), type='threshold_exceeded', severity='critical', message=f'{hazard} event: localized zone risk is critical', metric='risk_score', value=metrics['risk_score'], threshold=75, deviceId='factsafe-zone-b')]
        return []


class AquaSenseSimulator(ScenarioSimulator):
    """Deterministic pond chemistry with day/night oxygen rhythm."""

    def __init__(self, scenario_id: str = 'normal', speed: float = 1.0):
        durations = {'normal': 120, 'low_oxygen': 120, 'sensor_fouling': 120}
        self.scenario_id = scenario_id if scenario_id in durations else 'normal'
        super().__init__({'duration': durations[self.scenario_id]}, speed)
        self.is_running = True
        self.last_alert_time = 0.0
        self.alert_cooldown = 5

    def _noise(self, key: str, amplitude: float) -> float:
        phase = sum((index + 1) * ord(char) for index, char in enumerate(key))
        return math.sin(self.elapsed * 0.19 + phase) * amplitude

    def get_metrics(self) -> Dict[str, float]:
        day_progress = (self.elapsed % 60) / 60
        biological_do = 6.2 + math.sin((day_progress - 0.25) * math.tau) * 0.8
        do_value = biological_do + self._noise('do', 0.08)
        sensor_quality = 98.0
        signal_stability = 96.0
        if self.scenario_id == 'low_oxygen':
            do_value -= self._smooth_drop(2.8, 30, 72)
        if self.scenario_id == 'sensor_fouling':
            sensor_quality = max(38.0, 98.0 - self._ramp(0, 60, 18, 90))
            signal_stability = max(25.0, 96.0 - self._ramp(0, 70, 18, 90))
            do_value = 5.8 + self._noise('fouled-do', 0.22) * (1 + self.elapsed / 120)
        ph = 7.8 + self._noise('ph', 0.04)
        orp = 220 + self._noise('orp', 3.0)
        salinity = 15 + self._noise('salinity', 0.15)
        temperature = 28 + math.sin(day_progress * math.tau) * 1.2 + self._noise('temp', 0.1)
        do_value = max(0.0, min(10.0, do_value))
        risk_score = min(100.0, max(5.0, (4.5 - do_value) * 24 + (100 - sensor_quality) * 0.45))
        return {
            'do_mg_l': do_value, 'ph': ph, 'orp_mv': orp, 'salinity_ppt': salinity,
            'water_temperature_c': temperature, 'sensor_quality': sensor_quality,
            'signal_stability': signal_stability, 'risk_score': risk_score,
            'biological_lower': biological_do - 0.45, 'biological_upper': biological_do + 0.45,
            'day_progress': day_progress,
        }

    def _ramp(self, start: float, end: float, start_at: float, end_at: float) -> float:
        progress = max(0.0, min(1.0, (self.elapsed - start_at) / (end_at - start_at)))
        smooth = progress * progress * (3.0 - 2.0 * progress)
        return start + (end - start) * smooth

    def _smooth_drop(self, amount: float, start_at: float, recovery_at: float) -> float:
        if self.elapsed < start_at:
            return 0.0
        if self.elapsed < recovery_at:
            return self._ramp(0, amount, start_at, start_at + 25)
        return self._ramp(amount, 0, recovery_at, 115)

    def get_current_phase(self) -> str:
        metrics = self.get_metrics()
        if metrics['sensor_quality'] < 70:
            return 'warning'
        return 'critical' if metrics['do_mg_l'] < 3.5 else 'warning' if metrics['do_mg_l'] < 4.5 else 'normal'

    def get_status(self) -> str:
        return 'critical' if self.get_metrics()['do_mg_l'] < 3.5 else 'warning' if self.get_metrics()['do_mg_l'] < 4.5 else 'normal'

    def get_alerts(self) -> List[Alert]:
        metrics = self.get_metrics()
        now = time.time()
        if (metrics['do_mg_l'] < 3.5 or metrics['sensor_quality'] < 60) and now - self.last_alert_time > self.alert_cooldown:
            self.last_alert_time = now
            message = 'Dissolved oxygen critical: aerator action required' if metrics['do_mg_l'] < 3.5 else 'Sensor fouling detected: maintenance required'
            return [Alert(id=f'aquasense-alert-{int(now * 1000)}', timestamp=datetime.now().isoformat(), type='threshold_exceeded', severity='critical' if metrics['do_mg_l'] < 3.5 else 'warning', message=message, metric='do_mg_l' if metrics['do_mg_l'] < 3.5 else 'sensor_quality', value=metrics['do_mg_l'] if metrics['do_mg_l'] < 3.5 else metrics['sensor_quality'], threshold=3.5 if metrics['do_mg_l'] < 3.5 else 60, deviceId='aquasense-pond-a')]
        return []


class DataCoolSimulator(ScenarioSimulator):
    """Deterministic rack thermal, efficiency and carbon model."""

    def __init__(self, scenario_id: str = 'normal', speed: float = 1.0):
        durations = {'normal': 120, 'hotspot': 120, 'cooling_imbalance': 120}
        self.scenario_id = scenario_id if scenario_id in durations else 'normal'
        super().__init__({'duration': durations[self.scenario_id]}, speed)
        self.is_running = True
        self.energy_kwh = 0.0
        self.last_alert_time = 0.0
        self.alert_cooldown = 5

    def _noise(self, key: str, amplitude: float) -> float:
        phase = sum((index + 1) * ord(char) for index, char in enumerate(key))
        return math.sin(self.elapsed * 0.17 + phase) * amplitude

    def _ramp(self, start: float, end: float, start_at: float, end_at: float) -> float:
        progress = max(0.0, min(1.0, (self.elapsed - start_at) / (end_at - start_at)))
        smooth = progress * progress * (3.0 - 2.0 * progress)
        return start + (end - start) * smooth

    def get_metrics(self) -> Dict[str, float]:
        it_power = 920 + self._noise('it-power', 18)
        temperatures = []
        loads = []
        for index in range(32):
            temperature = 23.0 + self._noise(f'rack-{index}', 0.3)
            load = 68.0 + self._noise(f'load-{index}', 4.0)
            if self.scenario_id == 'hotspot' and index in (16, 17, 24):
                temperature += self._ramp(0, 6.8, 12, 62)
                load += self._ramp(0, 18, 12, 62)
            elif self.scenario_id == 'cooling_imbalance' and index % 8 >= 4:
                temperature += self._ramp(0, 4.8, 10, 58)
            temperatures.append(max(18.0, min(35.0, temperature)))
            loads.append(max(0.0, min(100.0, load)))

        hotspot_temp = max(temperatures)
        cooling_penalty = max(0.0, hotspot_temp - 23) * 0.025
        pue = 1.55 + cooling_penalty + self._noise('pue', 0.004)
        if self.scenario_id == 'hotspot' and self.elapsed >= 80:
            pue -= self._ramp(0, 0.06, 80, 115)
        total_power = it_power * pue
        self.energy_kwh += total_power / 3600
        carbon = self.energy_kwh * 0.42
        metrics = {
            'pue': max(1.4, min(2.0, pue)), 'it_power_kw': it_power,
            'total_power_kw': total_power, 'energy_kwh': self.energy_kwh,
            'carbon_kg': carbon, 'rack_hotspot_temp': hotspot_temp,
        }
        for index, (temperature, load) in enumerate(zip(temperatures, loads), start=1):
            metrics[f'rack_{index}_temp'] = temperature
            metrics[f'rack_{index}_load'] = load
        return metrics

    def get_current_phase(self) -> str:
        return 'critical' if self.get_metrics()['rack_hotspot_temp'] >= 29 else 'warning' if self.get_metrics()['rack_hotspot_temp'] >= 27 else 'normal'

    def get_status(self) -> str:
        return 'critical' if self.get_metrics()['rack_hotspot_temp'] >= 29 else 'warning' if self.get_metrics()['rack_hotspot_temp'] >= 27 else 'normal'

    def get_alerts(self) -> List[Alert]:
        metrics = self.get_metrics()
        now = time.time()
        if metrics['rack_hotspot_temp'] >= 27 and now - self.last_alert_time > self.alert_cooldown:
            self.last_alert_time = now
            return [Alert(id=f'datacool-alert-{int(now * 1000)}', timestamp=datetime.now().isoformat(), type='threshold_exceeded', severity='critical' if metrics['rack_hotspot_temp'] >= 29 else 'warning', message='Localized rack hotspot detected in Zone B', metric='rack_hotspot_temp', value=metrics['rack_hotspot_temp'], threshold=27, deviceId='datacool-cluster')]
        return []


class HirdopSimulator(ScenarioSimulator):
    """Small hydro generation and local flood/turbine health model."""

    def __init__(self, scenario_id: str = 'normal', speed: float = 1.0):
        durations = {'normal': 120, 'flood_warning': 120, 'turbine_anomaly': 120}
        self.scenario_id = scenario_id if scenario_id in durations else 'normal'
        super().__init__({'duration': durations[self.scenario_id]}, speed)
        self.is_running = True
        self.energy_kwh = 0.0
        self.last_alert_time = 0.0
        self.alert_cooldown = 5

    def _noise(self, key: str, amplitude: float) -> float:
        phase = sum((index + 1) * ord(char) for index, char in enumerate(key))
        return math.sin(self.elapsed * 0.18 + phase) * amplitude

    def _ramp(self, start: float, end: float, start_at: float, end_at: float) -> float:
        progress = max(0.0, min(1.0, (self.elapsed - start_at) / (end_at - start_at)))
        smooth = progress * progress * (3.0 - 2.0 * progress)
        return start + (end - start) * smooth

    def get_metrics(self) -> Dict[str, float]:
        power = 8.5 + self._noise('power', 0.25)
        voltage = 230 + self._noise('voltage', 1.5)
        water_level = 0.8 + self._noise('water', 0.02)
        vibration = 1.2 + self._noise('vibration', 0.06)
        if self.scenario_id == 'flood_warning':
            water_level += self._ramp(0, 0.95, 15, 70)
            vibration += self._ramp(0, 2.6, 48, 92)
        elif self.scenario_id == 'turbine_anomaly':
            vibration += self._ramp(0, 4.8, 20, 75)
            power -= self._ramp(0, 1.6, 45, 90)

        power = max(0.0, min(15.0, power))
        water_level = max(0.0, min(3.0, water_level))
        vibration = max(0.0, min(8.0, vibration))
        self.energy_kwh += power / 3600
        diesel_cost = self.energy_kwh * 0.43
        hydro_cost = self.energy_kwh * 0.06
        return {
            'power_kw': power, 'voltage_v': voltage, 'energy_kwh': self.energy_kwh,
            'water_level_m': water_level, 'vibration_mm_s': vibration,
            'diesel_saving_usd': diesel_cost - hydro_cost,
            'flood_risk': max(0.0, min(100.0, (water_level - 0.8) * 110)),
        }

    def get_current_phase(self) -> str:
        metrics = self.get_metrics()
        return 'critical' if metrics['water_level_m'] >= 1.5 or metrics['vibration_mm_s'] >= 5 else 'warning' if metrics['water_level_m'] >= 1.2 or metrics['vibration_mm_s'] >= 3 else 'normal'

    def get_status(self) -> str:
        return 'critical' if self.get_current_phase() == 'critical' else 'warning' if self.get_current_phase() == 'warning' else 'normal'

    def get_alerts(self) -> List[Alert]:
        metrics = self.get_metrics()
        now = time.time()
        if (metrics['water_level_m'] >= 1.5 or metrics['vibration_mm_s'] >= 5) and now - self.last_alert_time > self.alert_cooldown:
            self.last_alert_time = now
            flood = metrics['water_level_m'] >= 1.5
            return [Alert(id=f'hirdop-alert-{int(now * 1000)}', timestamp=datetime.now().isoformat(), type='threshold_exceeded', severity='critical', message='Local flood warning: edge alarm active' if flood else 'Turbine vibration anomaly: maintenance required', metric='water_level_m' if flood else 'vibration_mm_s', value=metrics['water_level_m'] if flood else metrics['vibration_mm_s'], threshold=1.5 if flood else 5, deviceId='hirdop-main-unit')]
        return []


class PamSimulator(ScenarioSimulator):
    """Minimal physical alarm state model."""

    def __init__(self, scenario_id: str = 'normal', speed: float = 1.0):
        durations = {'normal': 90, 'gas_leak': 120}
        self.scenario_id = scenario_id if scenario_id in durations else 'normal'
        super().__init__({'duration': durations[self.scenario_id]}, speed)
        self.is_running = True
        self.acknowledged = False
        self.last_alert_time = 0.0

    def _noise(self, key: str, amplitude: float) -> float:
        phase = sum((index + 1) * ord(char) for index, char in enumerate(key))
        return math.sin(self.elapsed * 0.2 + phase) * amplitude

    def _ramp(self, start: float, end: float, start_at: float, end_at: float) -> float:
        progress = max(0.0, min(1.0, (self.elapsed - start_at) / (end_at - start_at)))
        smooth = progress * progress * (3.0 - 2.0 * progress)
        return start + (end - start) * smooth

    def get_metrics(self) -> Dict[str, float]:
        pm25 = 12 + self._noise('pm25', 1.2)
        gas = 15 + self._noise('gas', 1.5)
        if self.scenario_id == 'gas_leak':
            pm25 += self._ramp(0, 82, 10, 48)
            gas += self._ramp(0, 92, 8, 42)
        pm25 = max(0.0, min(150.0, pm25))
        gas = max(0.0, min(120.0, gas))
        state = 'red' if pm25 >= 75 or gas >= 80 else 'yellow' if pm25 >= 35 or gas >= 50 else 'green'
        return {'pm25_ug_m3': pm25, 'gas_index': gas, 'led_state': {'green': 0.0, 'yellow': 1.0, 'red': 2.0}[state], 'buzzer_active': 1.0 if state == 'red' and not self.acknowledged else 0.0, 'acknowledged': 1.0 if self.acknowledged else 0.0}

    def get_current_phase(self) -> str:
        state = self.get_metrics()['led_state']
        return 'critical' if state == 2 else 'warning' if state == 1 else 'normal'

    def get_status(self) -> str:
        return 'critical' if self.get_current_phase() == 'critical' else 'warning' if self.get_current_phase() == 'warning' else 'normal'

    def get_alerts(self) -> List[Alert]:
        metrics = self.get_metrics()
        now = time.time()
        if metrics['led_state'] == 2 and not self.acknowledged and now - self.last_alert_time > 5:
            self.last_alert_time = now
            return [Alert(id=f'pam-alert-{int(now * 1000)}', timestamp=datetime.now().isoformat(), type='threshold_exceeded', severity='critical', message='PAM physical alarm active: gas or particulate threshold exceeded', metric='gas_index', value=metrics['gas_index'], threshold=80, deviceId='pam-unit-01')]
        return []


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

    async def handle_client(
        self,
        websocket: WebSocketServerProtocol,
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
        """Handle commands from clients"""
        cmd_type = command.get('type')

        if cmd_type == 'start_scenario':
            scenario_id = command.get('scenario', 'normal')
            speed = command.get('speed', 1.0)
            self.current_project = command.get('project', self.current_project)
            self.current_scenario = scenario_id
            self.simulator = self._create_simulator(self.current_project, scenario_id, speed)
            print(f'Started {self.current_project} scenario: {scenario_id} at {speed}x speed')

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

        elif cmd_type == 'acknowledge_alarm':
            if isinstance(self.simulator, PamSimulator):
                self.simulator.acknowledged = True

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
                        risk_score = metrics.get('risk_score') if isinstance(self.simulator, (PulseGuardSimulator, FactSafeSimulator, AquaSenseSimulator)) else float(
                            (1.0 - min(metrics.get('temperature', 4), 8) / 8) * 100
                        )
                        if isinstance(self.simulator, DataCoolSimulator):
                            risk_score = max(0.0, min(100.0, (metrics['rack_hotspot_temp'] - 23) * 16))
                        if isinstance(self.simulator, HirdopSimulator):
                            risk_score = max(metrics['flood_risk'], (metrics['vibration_mm_s'] - 1.2) * 18)
                        telemetry = TelemetryPoint(
                            timestamp=datetime.now().isoformat(),
                            deviceId='pulseguard-node-01' if isinstance(self.simulator, PulseGuardSimulator) else 'factsafe-zone-b' if isinstance(self.simulator, FactSafeSimulator) else 'aquasense-pond-a' if isinstance(self.simulator, AquaSenseSimulator) else 'datacool-cluster' if isinstance(self.simulator, DataCoolSimulator) else 'hirdop-main-unit' if isinstance(self.simulator, HirdopSimulator) else 'sensor-01',
                            metrics=metrics,
                            status=self.simulator.get_status(),
                            riskScore=float(risk_score),
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

                await asyncio.sleep(TELEMETRY_INTERVAL_SECONDS)

            except Exception as e:
                print(f'Update loop error: {e}')
                await asyncio.sleep(0.1)

    def _create_simulator(self, project: str, scenario: str, speed: float) -> ScenarioSimulator:
        if project == 'pulseguard':
            return PulseGuardSimulator(scenario, speed)
        if project == 'factsafe':
            return FactSafeSimulator(scenario, speed)
        if project == 'aquasense':
            return AquaSenseSimulator(scenario, speed)
        if project == 'datacool':
            return DataCoolSimulator(scenario, speed)
        if project == 'hirdop':
            return HirdopSimulator(scenario, speed)
        if project == 'pam':
            return PamSimulator(scenario, speed)
        return VitalChainSimulator(scenario, speed)

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

    # Start a baseline stream immediately so dashboards are populated before
    # the operator chooses a scenario. A start_scenario command replaces it.
    server.current_project = args.project
    server.simulator = server._create_simulator(args.project, args.scenario, args.speed)
    if args.scenario != 'normal' or args.speed != 1.0:
        print(f'Auto-starting: {args.scenario} at {args.speed}x speed')

    try:
        asyncio.run(server.start())
    except KeyboardInterrupt:
        print('\nShutdown complete')


if __name__ == '__main__':
    main()
