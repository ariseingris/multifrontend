"""Synthetic demonstration scenarios. No real sensor input or vision inference.

AquaSense/FactSafe keyframes use minutes, converted to canonical seconds.
FireScout keyframes use seconds. Smoothstep interpolation has zero slope at knots;
small deterministic noise uses an explicit seed. Event rules run every simulated
second, independently of WebSocket sampling/speed, so fast playback cannot skip
persistence, thresholds or blackout transitions.
"""
import math
import time
import uuid
from datetime import datetime, timezone
try:
    from .scenario_engine import ScenarioSimulator
    from .pond_environment import PondEnvironment
except ImportError:
    from scenario_engine import ScenarioSimulator
    from pond_environment import PondEnvironment

SCENARIOS = {
    'aquasense': {'normal': 7200, 'low_oxygen': 7200, 'sensor_fouling': 7200},
    'factsafe': {'normal': 3600, 'gas_leak': 6000, 'dust_event': 6000},
    'firescout': {'routine_recon': 120, 'victim_hotspot': 120, 'smoke_link_loss': 120},
}
DEVICES = {'aquasense': 'aquasense-pond-a', 'factsafe': 'factsafe-zone-b', 'firescout': 'firescout-uav-01'}


def curve(t, points):
    if t <= points[0][0]:
        return float(points[0][1])
    for (a, va), (b, vb) in zip(points, points[1:]):
        if t <= b:
            p = (t - a) / (b - a)
            return va + (vb - va) * p * p * (3 - 2 * p)
    return float(points[-1][1])


def utc_now():
    return datetime.now(timezone.utc).isoformat()


class Latch:
    """Threshold with hysteresis and a duration measured in simulated seconds."""
    def __init__(self, enter, exit, low=False, persistence=1, inclusive=False):
        self.enter, self.exit, self.low, self.persistence = enter, exit, low, persistence
        self.inclusive = inclusive
        self.active = False
        self.pending_since = None

    def update(self, value, elapsed):
        condition = (value < self.exit if self.low else value > self.exit) if self.active else (value < self.enter if self.low else value >= self.enter if self.inclusive else value > self.enter)
        if condition == self.active:
            self.pending_since = None
        elif self.pending_since is None:
            self.pending_since = elapsed
        if self.pending_since is not None and elapsed - self.pending_since >= self.persistence - 1:
            self.active = condition
            self.pending_since = None
        return self.active


class DemoScenario(ScenarioSimulator):
    project = ''

    def __init__(self, scenario_id=None, speed=1.0, seed=1729):
        scenario_id = scenario_id or next(iter(SCENARIOS[self.project]))
        if scenario_id not in SCENARIOS[self.project]:
            raise ValueError(f'Unknown {self.project} scenario: {scenario_id}')
        super().__init__({'duration': SCENARIOS[self.project][scenario_id]}, speed)
        self.scenario_id = scenario_id
        self.seed = int(seed)
        self._initialize_session()

    def _initialize_session(self):
        self.session_id = uuid.uuid4().hex
        self.completed = False
        self._evaluated_second = -1
        self._events = []
        self._alerts = []
        self._latest_alert = None
        self._once = set()
        self._latches = {}
        self._status = 'normal'
        self.sensor_status = 'valid'
        self.mission_status = 'searching' if self.project == 'firescout' else None
        self.last_telemetry_elapsed = None
        self.last_packet = None
        self.candidate = False
        self.last_seen_sim_seconds = None
        self._candidate_frames = 0
        self._recovering = False

    def start(self):
        self.is_running = True
        self._last_tick = time.monotonic()
        self.event('started', 'Simulation started', once=True)
        self.evaluate()

    def reset(self):
        super().reset()
        self._initialize_session()
        self.event('reset', 'Simulation reset; awaiting a new start', once=True)

    @property
    def playback_status(self):
        return 'completed' if self.completed else 'stopped' if not self.is_running else 'paused' if self.is_paused else 'running'

    def noise(self, key, amplitude, seconds):
        phase = self.seed + sum((i + 1) * ord(c) for i, c in enumerate(key))
        return math.sin(seconds * 0.017 + phase) * amplitude

    def event(self, code, message, severity='info', once=False, elapsed=None):
        if once and code in self._once:
            return
        self._once.add(code)
        self._events.append({
            'timestamp': utc_now(), 'type': code, 'code': code,
            'message': f'SIMULATED · {message}', 'severity': severity, 'icon': '●',
            'project': self.project, 'scenario': self.scenario_id, 'sessionId': self.session_id,
            'elapsedSimSeconds': self.elapsed if elapsed is None else elapsed, 'source': 'simulator',
        })

    def alert(self, code, message, metric, value, threshold, severity, elapsed):
        alert = {
            'id': f'{self.session_id}-{code}-{elapsed}', 'timestamp': utc_now(),
            'type': 'threshold_exceeded', 'severity': severity, 'message': f'SIMULATED · {message}',
            'metric': metric, 'value': value, 'threshold': threshold, 'deviceId': self.device_id,
            'project': self.project, 'sessionId': self.session_id, 'source': 'simulator',
            'elapsedSimSeconds': elapsed,
        }
        self._latest_alert = alert
        self._alerts.append(alert)

    def latch(self, name, value, t, enter, exit, low=False, persistence=1, inclusive=False):
        rule = self._latches.setdefault(name, Latch(enter, exit, low, persistence, inclusive))
        return rule.update(value, t)

    def evaluate(self):
        for second in range(self._evaluated_second + 1, int(self.elapsed) + 1):
            self.evaluate_at(second, self.metrics_at(second))
        self._evaluated_second = int(self.elapsed)
        if self.elapsed >= self.config['duration'] and not self.config.get('continuous') and not self.completed:
            self.completed = True
            if self.project == 'firescout':
                self.mission_status = 'completed'
            self.event('completed', 'Simulation completed', once=True)

    def get_metrics(self):
        return self.metrics_at(self.elapsed)

    def get_status(self):
        return self._status

    def get_current_phase(self):
        return 'recovery' if self._recovering else self._status

    def get_alerts(self):
        alerts, self._alerts = self._alerts, []
        return alerts

    def drain_events(self):
        events, self._events = self._events, []
        return events

    def hazard(self, t, metrics, key, warning, critical, low=False, zone='', inclusive=False):
        old = self._status
        margin = 0.15 if low else 2
        warning_active = self.latch('warning', metrics[key], t, warning, warning + margin if low else warning - margin, low, inclusive=inclusive)
        critical_active = self.latch('critical', metrics[key], t, critical, critical + margin if low else critical - margin, low, inclusive=inclusive)
        self._status = 'critical' if critical_active else 'warning' if warning_active else 'normal'
        if self._status != old:
            code = 'normal_restored' if self._status == 'normal' else f'{self._status}_entered'
            self.event(code, f'{zone} {key}: {old} → {self._status} (demo thresholds)',
                       'info' if self._status == 'normal' else self._status, elapsed=t)
            if self._status != 'normal':
                self.alert(code, f'{zone} {key} {self._status} (demo threshold)', key, metrics[key],
                           critical if self._status == 'critical' else warning, self._status, t)

    def data_available(self, t=None):
        return True

    def quality(self):
        return {key: 'simulated' for key in self.get_metrics()}

    def state_packet(self):
        return {
            'project': self.project, 'scenario': self.scenario_id, 'sessionId': self.session_id,
            'status': self.playback_status, 'phase': self.get_current_phase(), 'speed': self.speed,
            'elapsedSimSeconds': self.elapsed, 'durationSeconds': self.config['duration'],
            'seed': self.seed, 'source': 'simulator_state', 'timestamp': utc_now(),
            'telemetryAvailable': self.data_available() and self.playback_status not in ('stopped',),
            'sensorStatus': self.sensor_status, 'missionStatus': self.mission_status,
            'candidateDetected': self.candidate,
            'hotspotDetected': bool(self._latches.get('hotspot') and self._latches['hotspot'].active),
            'rules': getattr(self, 'rules', None), 'lastSeenSimSeconds': self.last_seen_sim_seconds,
            'lastTelemetrySimSeconds': self.last_telemetry_elapsed,
        }

    @property
    def device_id(self):
        return DEVICES[self.project]

    def telemetry_packet(self):
        metrics = self.get_metrics()
        self.last_telemetry_elapsed = self.elapsed
        packet = {
            'timestamp': utc_now(), 'deviceId': self.device_id, 'metrics': metrics,
            'status': self.get_status(), 'riskScore': metrics.get('risk_score', 0),
            'scenario': self.scenario_id, 'project': self.project, 'sessionId': self.session_id,
            'elapsedSimSeconds': self.elapsed, 'elapsedSimMinutes': self.elapsed / 60,
            'source': 'simulator', 'quality': self.quality(), 'sensorStatus': self.sensor_status,
            'missionStatus': self.mission_status, 'metricStatus': self.metric_status(),
            'groundTruth': self.ground_truth(),
        }

        self.last_packet = packet
        return packet

    def ground_truth(self):
        return {}

    def metric_status(self):
        return {}


class AquaSenseSimulator(DemoScenario):
    project = 'aquasense'
    LOW = [(0,6.4),(20,5.8),(40,4.8),(60,4.1),(80,3.2),(90,3),(100,4.1),(110,5.2),(120,6)]
    FOULED = [(0,6.1),(20,6.1),(30,6.1),(40,5.3),(60,7.7),(80,3.5),(100,8.1),(120,5.1)]

    def __init__(self, scenario_id=None, speed=1.0, seed=1729, continuous=True,
                 retention_seconds=21600, history_bucket_seconds=30, history_max_points=1000):
        super().__init__(scenario_id, speed, seed)
        if not isinstance(continuous, bool):
            raise ValueError('continuous must be a boolean')
        if not all(isinstance(v, (int, float)) and math.isfinite(v) and v > 0
                   for v in (retention_seconds, history_bucket_seconds, history_max_points)):
            raise ValueError('History policy must contain positive finite numbers')
        self.config.update(continuous=continuous, retention_seconds=retention_seconds,
                           history_bucket_seconds=history_bucket_seconds,
                           history_max_points=max(2, int(history_max_points)))

    def _initialize_session(self):
        super()._initialize_session()
        self.environment = PondEnvironment(self.seed)
        self._post_event_offset = None

    def metrics_at(self, seconds):
        t = seconds / 60
        environment = self.environment.at(seconds)
        fouled = self.scenario_id == 'sensor_fouling'
        noise = .025 * self.environment.variation(5, seconds, 180)
        if self.scenario_id == 'normal':
            do = environment['do_mg_l']
        elif self.scenario_id == 'low_oxygen':
            if seconds <= 7200:
                do = curve(t, self.LOW) + noise
            else:
                if self._post_event_offset is None:
                    self._post_event_offset = 6 - self.environment.at(7200)['do_mg_l']
                do = environment['do_mg_l'] + self._post_event_offset * math.exp(-(seconds - 7200) / 3600) + noise
        else:
            # Persistent bias/irregular drift is a sensor fault, not pond oxygen.
            instability = curve(t, [(30, 0), (60, 1)])
            do = curve(t, self.FOULED) + noise + .24 * instability * self.environment.variation(6, seconds, 240)
        do = max(0, min(10, do))
        quality = curve(t, [(0,98),(30,97),(60,60),(90,40),(120,38)]) if fouled else 98
        return {
            'do_mg_l': do, 'water_temperature_c': environment['water_temperature_c'],
            'ph': environment['ph'],
            'orp_mv': 220 + self.noise('orp', 3, seconds), 'salinity_ppt': 15 + self.noise('salt', .12, seconds),
            'sensor_quality': quality, 'signal_stability': quality - 2,
            'risk_score': 0 if fouled else max(0, min(100, (4.5 - do) * 50)),
            'biological_lower': environment['do_mg_l'] - .45, 'biological_upper': environment['do_mg_l'] + .45,
            'day_progress': (seconds % 86400) / 86400,
        }

    def ground_truth(self):
        return {'pond_do_mg_l': self.environment.at(self.elapsed)['do_mg_l']} if self.scenario_id == 'sensor_fouling' else {}

    def get_current_phase(self):
        if self.scenario_id == 'sensor_fouling' and self.sensor_status == 'degraded':
            return 'maintenance_required'
        if self.elapsed >= self.config['duration'] and self.config.get('continuous'):
            return 'monitoring'
        if self.scenario_id == 'low_oxygen' and 20 * 60 <= self.elapsed < 60 * 60 and self._status == 'normal':
            return 'oxygen_decline'
        return super().get_current_phase()

    def state_packet(self):
        return {**super().state_packet(), 'continuous': self.config['continuous'],
                'realElapsedSeconds': self.real_elapsed,
                'activeAlert': self._latest_alert if self._status != 'normal' or self.sensor_status == 'degraded' else None,
                'model': 'plausible synthetic pond demo; not scientifically validated'}

    def evaluate_at(self, t, metrics):
        if t >= self.config['duration'] and self.config.get('continuous'):
            self.event('monitoring_started', 'Scripted phase finished; continuous monitoring. Probe faults persist until maintenance/reset.', once=True, elapsed=t)
        if self.scenario_id == 'sensor_fouling':
            self.sensor_status = 'degraded' if metrics['sensor_quality'] < 70 else 'valid'
            if self.sensor_status == 'degraded' and 'sensor_quality_warning' not in self._once:
                self.alert('sensor_quality_warning', 'Probe fouling: maintenance required; raw DO unverified',
                           'sensor_quality', metrics['sensor_quality'], 70, 'warning', t)
                self.event('sensor_quality_warning', 'Probe quality degraded; clean/calibrate. Raw DO is unverified; no confirmed pond emergency.', 'warning', True, t)
            self._status = 'normal'
        else:
            self.hazard(t, metrics, 'do_mg_l', 4.5, 3.5, low=True, zone='Pond A')
        if self.scenario_id == 'low_oxygen' and t >= 90 * 60:
            self.event('simulated_intervention', 'Demo aerator intervention (no hardware command)', once=True, elapsed=t)
            if self._status != 'normal':
                self._recovering = True
                self.event('recovery', 'Oxygen trend recovering after simulated intervention', once=True, elapsed=t)
            else:
                self._recovering = False

    def quality(self):
        return {**super().quality(), 'do_mg_l': 'degraded' if self.sensor_status == 'degraded' else 'simulated'}

    def metric_status(self):
        return {'do_mg_l': 'warning' if self.sensor_status == 'degraded' else self._status}


class FactSafeSimulator(DemoScenario):
    project = 'factsafe'
    NORMAL_NH3 = [(0,6),(15,9),(30,7),(45,10),(60,8)]
    NORMAL_PM25 = [(0,18),(15,22),(30,20),(45,25),(60,19)]
    GAS = [(0,8),(20,12),(35,26),(50,37),(65,57),(75,68),(85,40),(100,12)]
    DUST = [(0,20),(20,35),(35,61),(50,92),(65,122),(75,145),(85,75),(100,25)]

    # DEMO-DEFAULT normalization. Configurable, monotonic, not an EHS index.
    RISK_DEFAULTS = {'nh3Critical': 50.0, 'pm25Critical': 100.0, 'gain': 80.0,
                     'baselineNh3': 6.0, 'baselinePm25': 18.0}

    def __init__(self, scenario_id=None, speed=1.0, seed=1729, risk_defaults=None):
        super().__init__(scenario_id, speed, seed)
        self.risk_config = {**self.RISK_DEFAULTS, **(risk_defaults or {})}
        if any(not isinstance(v, (float, int)) or not math.isfinite(v) or v <= 0 for v in self.risk_config.values()):
            raise ValueError('Demo risk defaults must be positive finite numbers')

    def state_packet(self):
        return {**super().state_packet(), 'riskModel': self.risk_config}

    @property
    def device_id(self):
        return 'factsafe-zone-d' if self.scenario_id == 'dust_event' else 'factsafe-zone-b'

    @staticmethod
    def risk(nh3, pm25, defaults=None):
        # Demonstration normalization only: not a calibrated safety/dose score.
        defaults = defaults or FactSafeSimulator.RISK_DEFAULTS
        return max(0, min(100, max(nh3 / defaults['nh3Critical'], pm25 / defaults['pm25Critical']) * defaults['gain']))

    def metrics_at(self, seconds):
        t = seconds / 60
        nh3 = curve(t, self.GAS) if self.scenario_id == 'gas_leak' else curve(t, self.NORMAL_NH3)
        pm25 = curve(t, self.DUST) if self.scenario_id == 'dust_event' else curve(t, self.NORMAL_PM25)
        nh3 = max(0, min(80, nh3))
        pm25 = max(0, min(180, pm25))
        baseline = self.risk(self.risk_config['baselineNh3'], self.risk_config['baselinePm25'], self.risk_config)
        affected = self.risk(nh3, pm25, self.risk_config)
        zone_b = affected if self.scenario_id != 'dust_event' else baseline
        zone_d = affected if self.scenario_id == 'dust_event' else baseline
        co, h2s, ch4 = 6 + self.noise('co', 1.5, seconds), .6 + self.noise('h2s', .2, seconds), .3 + self.noise('ch4', .1, seconds)
        return {
            'nh3_ppm': nh3, 'co_ppm': co, 'h2s_ppm': h2s, 'ch4_percent': ch4,
            'pm25_ug_m3': pm25, 'pm10_ug_m3': min(250, pm25 * (1.5 if self.scenario_id == 'dust_event' else 1.7)),
            'temperature_c': 27 + self.noise('temp', 1, seconds), 'humidity_percent': 55 + self.noise('humidity', 5, seconds),
            'nh3_severity': nh3 / 50, 'co_severity': co / 70, 'h2s_severity': h2s / 10, 'ch4_severity': ch4 / 8,
            'zone_a_risk': baseline * .85, 'zone_b_risk': zone_b, 'zone_c_risk': baseline * .8, 'zone_d_risk': zone_d,
            'risk_score': max(zone_b, zone_d),
        }

    def evaluate_at(self, t, metrics):
        dust = self.scenario_id == 'dust_event'
        key, warning, critical, zone = ('pm25_ug_m3',55,100,'Zone D dust') if dust else ('nh3_ppm',30,50,'Zone B NH3')
        self.hazard(t, metrics, key, warning, critical, zone=zone, inclusive=True)
        if self.scenario_id != 'normal' and t >= 75 * 60:
            self.event('simulated_containment', f'{zone}: simulated isolation/ventilation; no hardware feedback', once=True, elapsed=t)
            self._recovering = self._status != 'normal'
            if self._recovering:
                self.event('recovery', f'{zone}: recovery monitoring', once=True, elapsed=t)
        if t == 0:
            self.event('normal_telemetry', 'Factory baseline telemetry (synthetic)', once=True, elapsed=t)
        if self._status != 'normal':
            self.event('dust_detected' if dust else 'suspected_leak', f'{zone}: suspected event; inspect demo telemetry', once=True, elapsed=t)

    def metric_status(self):
        key = 'pm25_ug_m3' if self.scenario_id == 'dust_event' else 'nh3_ppm'
        score = self.get_metrics()['risk_score']
        return {key: self._status, 'risk_score': 'critical' if score > 75 else 'warning' if score > 55 else 'normal'}


class FireScoutSimulator(DemoScenario):
    project = 'firescout'
    LINK = [(0,97),(25,93),(45,55),(60,28),(75,10),(90,30),(105,75),(120,94)]

    DEFAULT_RULES = {'candidateConfidence': 80, 'candidateFrames': 3, 'hotspotDeltaC': 30,
                     'hotspotPersistenceSeconds': 3, 'linkWarning': 40, 'linkCritical': 15,
                     'linkWarningExit': 50, 'linkCriticalExit': 25, 'linkPersistenceSeconds': 5}

    def __init__(self, scenario_id=None, speed=1.0, seed=1729, rules=None):
        super().__init__(scenario_id, speed, seed)
        self.rules = {**self.DEFAULT_RULES, **(rules or {})}
        if any(not isinstance(v, (int, float)) or not math.isfinite(v) or v <= 0 for v in self.rules.values()):
            raise ValueError('FireScout demo rules must be positive finite numbers')

    def metrics_at(self, seconds):
        t = seconds
        conf, temp, link = 20 + self.noise('confidence', 13, t), 34 + self.noise('thermal', 5, t), 95 + self.noise('link', 3, t)
        if self.scenario_id == 'victim_hotspot':
            conf = curve(t, [(0,15),(30,25),(55,76),(65,88),(90,94),(105,85),(120,30)])
            temp = curve(t, [(0,36),(30,40),(55,85),(90,82),(120,60)])
        elif self.scenario_id == 'smoke_link_loss':
            conf = curve(t, [(0,30),(25,75),(35,75),(70,25),(95,35),(120,30)])
            temp = curve(t, [(0,40),(35,55),(70,65),(120,44)])
            link = curve(t, self.LINK)
        video = not (self.scenario_id == 'smoke_link_loss' and 70 <= t < 94)
        metrics = {
            'link_quality_percent': link, 'battery_percent': max(0, 100 - t * .18),
            'flight_elapsed_s': t, 'video_available': 1 if video else 0,
        }
        if video:
            metrics.update(detection_confidence=conf, hotspot_temp_c=temp, background_temp_c=33.0, detected_person_count=1 if self.candidate else 0)
        return metrics

    def data_available(self, t=None):
        t = self.elapsed if t is None else t
        return not (self.scenario_id == 'smoke_link_loss' and 78 <= t < 90)

    def evaluate_at(self, t, metrics):
        link = metrics['link_quality_percent']
        degraded = self.latch('link_degraded', link, t, self.rules['linkWarning'], self.rules['linkWarningExit'], low=True, persistence=self.rules['linkPersistenceSeconds'])
        lost = self.latch('link_lost', link, t, self.rules['linkCritical'], self.rules['linkCriticalExit'], low=True, persistence=self.rules['linkPersistenceSeconds'])
        old = self._status
        self._status = 'critical' if lost else 'warning' if degraded else 'normal'
        self.sensor_status = 'missing' if not self.data_available(t) else 'degraded' if degraded else 'valid'
        if old != self._status:
            self.event('link_lost' if lost else 'link_degraded' if degraded else 'link_recovered',
                       f'UAV link {self._status}; synthetic diagnostic', 'info' if self._status == 'normal' else self._status, elapsed=t)
        if not self.data_available(t):
            self.event('telemetry_stale', 'STALE / NO SIGNAL: simulated telemetry blackout; state channel remains synthetic', 'warning', True, t)
        if t == 90 and self.scenario_id == 'smoke_link_loss':
            self.event('reconnecting', 'Synthetic telemetry resumes; waiting for link recovery', once=True, elapsed=t)
        conf = metrics.get('detection_confidence')
        self._candidate_frames = self._candidate_frames + 1 if conf is not None and conf >= self.rules['candidateConfidence'] and self.data_available(t) else 0
        if self._candidate_frames >= self.rules['candidateFrames']:
            self.candidate = True
            self.last_seen_sim_seconds = t
            self.event('candidate_detected', 'SIMULATED CANDIDATE; needs operator confirmation. No real vision inference.', 'warning', True, t)
        elif self.candidate and (conf is None or conf < 50):
            self.candidate = False
            self.event('track_lost', 'Simulated candidate out of view; retain last-seen timestamp', once=True, elapsed=t)
        delta = metrics['hotspot_temp_c'] - metrics['background_temp_c'] if 'hotspot_temp_c' in metrics else 0
        hot = self.latch('hotspot', delta, t, self.rules['hotspotDeltaC'], self.rules['hotspotDeltaC'] - 5, persistence=self.rules['hotspotPersistenceSeconds'])
        if hot:
            self.event('hotspot_detected', 'Persistent simulated hotspot ΔT > 30°C; no fire/victim confirmation', 'warning', True, t)
        self.mission_status = 'link_degraded' if degraded else 'candidate_found' if self.candidate else 'searching'
        if t == 0:
            self.event('telemetry_healthy', 'Synthetic UAV telemetry healthy; no confirmed targets', once=True, elapsed=t)

    def quality(self):
        quality = super().quality()
        for key in ['detection_confidence', 'hotspot_temp_c', 'detected_person_count', 'background_temp_c']:
            quality[key] = 'missing' if key not in self.get_metrics() else 'degraded' if self.scenario_id == 'smoke_link_loss' else 'simulated'
        return quality

    def metric_status(self):
        return {'link_quality_percent': self._status, 'detection_confidence': 'warning' if self.candidate else 'normal',
                'hotspot_temp_c': 'warning' if self._latches.get('hotspot') and self._latches['hotspot'].active else 'normal'}

    def get_current_phase(self):
        if self._status != 'normal':
            return self._status
        attention = self.candidate or (self._latches.get('hotspot') and self._latches['hotspot'].active)
        return 'early_signal' if attention else 'normal'
