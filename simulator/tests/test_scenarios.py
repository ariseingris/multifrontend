"""Deterministic model, clock and transport regression checks; no hardware/model AI."""
import asyncio
import json
import math
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scenario_models import AquaSenseSimulator, FactSafeSimulator, FireScoutSimulator, SCENARIOS, Latch
from server import SimulatorServer, SIMULATORS

MODELS = {'aquasense': AquaSenseSimulator, 'factsafe': FactSafeSimulator, 'firescout': FireScoutSimulator}
PRIMARY = {'aquasense': ['do_mg_l','water_temperature_c','ph'], 'factsafe': ['nh3_ppm','pm25_ug_m3','risk_score'], 'firescout': ['detection_confidence','hotspot_temp_c','link_quality_percent']}


def run_trace(model):
    model.start()
    frames, events = [], []
    for t in range(model.config['duration'] + 1):
        model.elapsed = t
        model.evaluate()
        if model.data_available():
            frames.append(model.telemetry_packet())
        events.extend(model.drain_events())
        model.get_alerts()
    return frames, events


class ScenarioTests(unittest.TestCase):
    def test_all_nine_scenarios(self):
        count = 0
        for project, scenarios in SCENARIOS.items():
            for scenario, duration in scenarios.items():
                with self.subTest(project=project, scenario=scenario):
                    model = MODELS[project](scenario, seed=1729)
                    self.assertFalse(model.is_running, 'New demos must not auto-play')
                    frames, events = run_trace(model)
                    count += 1
                    self.assertTrue(frames)
                    self.assertEqual(frames[-1]['elapsedSimSeconds'], duration)
                    self.assertEqual(model.playback_status, 'running' if project == 'aquasense' else 'completed')
                    self.assertEqual(sum(e['code'] == 'completed' for e in events), 0 if project == 'aquasense' else 1)
                    if project == 'aquasense':
                        self.assertEqual(sum(e['code'] == 'monitoring_started' for e in events), 1)
                    self.assertLess(len(events), 20, 'Transition logs must not spam per packet')
                    self.assertEqual([e['elapsedSimSeconds'] for e in events], sorted(e['elapsedSimSeconds'] for e in events))
                    self.assertEqual([f['elapsedSimSeconds'] for f in frames], sorted(set(f['elapsedSimSeconds'] for f in frames)))
                    self.assertEqual([f['timestamp'] for f in frames],sorted(f['timestamp'] for f in frames))
                    self.assertTrue(all(f['project'] == project and f['source'] == 'simulator' and f['scenario'] == scenario for f in frames))
                    self.assertTrue(all(math.isfinite(v) for f in frames for v in f['metrics'].values()))
                    self.assertTrue(all(key in frames[0]['metrics'] for key in PRIMARY[project]))
                    # Repeat the same trajectory; compare every primary series (no UUID/wall timestamps).
                    other_frames, other_events = run_trace(MODELS[project](scenario, seed=1729))
                    self.assertEqual([f['metrics'] for f in frames], [f['metrics'] for f in other_frames])
                    self.assertEqual([e['code'] for e in events], [e['code'] for e in other_events])
                    if scenario in ('normal', 'routine_recon'):
                        self.assertTrue(all(f['status'] == 'normal' for f in frames))
                        self.assertFalse(any(e['severity'] in ('warning','critical') for e in events))
        self.assertEqual(count, 9)

    def test_keyframes_units_and_recovery(self):
        for cls, scenario, key, points, scale, tolerance in [
            (AquaSenseSimulator,'low_oxygen','do_mg_l',[(0,6.4),(20,5.8),(40,4.8),(60,4.1),(80,3.2),(90,3),(100,4.1),(110,5.2),(120,6)],60,.03),
            (AquaSenseSimulator,'sensor_fouling','do_mg_l',[(0,6.1),(20,6.1),(30,6.1),(40,5.3),(60,7.7),(80,3.5),(100,8.1),(120,5.1)],60,.3),
            (FactSafeSimulator,'gas_leak','nh3_ppm',[(0,8),(20,12),(35,26),(50,37),(65,57),(75,68),(85,40),(100,12)],60,.001),
            (FactSafeSimulator,'dust_event','pm25_ug_m3',[(0,20),(20,35),(35,61),(50,92),(65,122),(75,145),(85,75),(100,25)],60,.001),
            (FireScoutSimulator,'smoke_link_loss','link_quality_percent',[(0,97),(25,93),(45,55),(60,28),(75,10),(90,30),(105,75),(120,94)],1,.001),
        ]:
            model = cls(scenario)
            for t, value in points:
                with self.subTest(scenario=scenario,t=t):
                    self.assertAlmostEqual(model.metrics_at(t*scale)[key], value, delta=tolerance)
                    # Both sides of a keyframe remain continuous.
                    before=model.metrics_at(max(0,t*scale-.01))[key]
                    after=model.metrics_at(min(model.config['duration'],t*scale+.01))[key]
                    self.assertLess(abs(after-before), .02)
        frames, events = run_trace(AquaSenseSimulator('low_oxygen'))
        self.assertIn('critical', [f['status'] for f in frames])
        self.assertEqual(frames[-1]['status'], 'normal')
        self.assertIn('simulated_intervention', [e['code'] for e in events])
        self.assertIn('normal_restored', [e['code'] for e in events])

    def test_latest_spec_normal_keyframes_and_factory_baselines(self):
        profiles = [
            (FactSafeSimulator('normal'),'nh3_ppm',[(0,6),(15,9),(30,7),(45,10),(60,8)]),
            (FactSafeSimulator('normal'),'pm25_ug_m3',[(0,18),(15,22),(30,20),(45,25),(60,19)]),
        ]
        for model,key,points in profiles:
            for minute, expected in points:
                self.assertAlmostEqual(model.metrics_at(minute*60)[key],expected,places=6)
        normal = FactSafeSimulator('normal')
        for t in range(0,3601,10):
            metrics=normal.metrics_at(t)
            for key, low, high in [('co_ppm',4,9),('h2s_ppm',.2,1),('ch4_percent',.1,.5),
                                   ('pm10_ug_m3',30,45),('temperature_c',25,29),('humidity_percent',45,65)]:
                self.assertGreaterEqual(metrics[key],low); self.assertLessEqual(metrics[key],high)

    def test_factory_thresholds_are_inclusive_and_risk_is_centralized(self):
        model=FactSafeSimulator('gas_leak')
        metrics=model.metrics_at(0)
        metrics['nh3_ppm']=30; model.evaluate_at(0,metrics)
        self.assertEqual(model.get_status(),'warning')
        metrics['nh3_ppm']=50; model.evaluate_at(1,metrics)
        self.assertEqual(model.get_status(),'critical')
        previous=-1
        for nh3 in range(81):
            risk=model.risk(nh3,18)
            self.assertGreaterEqual(risk,previous); self.assertLessEqual(risk,100)
            previous=risk
        custom=FactSafeSimulator('gas_leak',risk_defaults={'gain':40})
        self.assertLess(custom.metrics_at(75*60)['risk_score'],model.metrics_at(75*60)['risk_score'])
        for scenario in ['normal','gas_leak','dust_event']:
            m=FactSafeSimulator(scenario);m.start()
            for t in range(0,m.config['duration']+1,60):
                m.elapsed=t;m.evaluate();packet=m.telemetry_packet()
                self.assertEqual(packet['riskScore'],packet['metrics']['risk_score'])
                self.assertEqual(packet['riskScore'],max(packet['metrics'][f'zone_{z}_risk'] for z in 'abcd'))

    def test_sensor_fault_is_not_water_emergency(self):
        frames, events = run_trace(AquaSenseSimulator('sensor_fouling'))
        self.assertTrue(any(f['metrics']['do_mg_l'] < 3.5 for f in frames))
        self.assertTrue(all(f['status'] == 'normal' for f in frames))
        self.assertIn('sensor_quality_warning', [e['code'] for e in events])
        self.assertNotIn('critical_entered', [e['code'] for e in events])
        self.assertTrue(all(5.5 < f['groundTruth']['pond_do_mg_l'] < 7.5 for f in frames))
        self.assertTrue(any(f['quality']['do_mg_l'] == 'degraded' for f in frames))

    def test_factory_localized_hazards(self):
        for scenario, zone, metric, expected in [('gas_leak','b','nh3_ppm','suspected_leak'),('dust_event','d','pm25_ug_m3','dust_detected')]:
            frames, events = run_trace(FactSafeSimulator(scenario))
            peak=max(frames,key=lambda f:f['metrics'][metric])['metrics']
            self.assertEqual(peak[f'zone_{zone}_risk'],max(peak[f'zone_{z}_risk'] for z in 'abcd'))
            self.assertEqual(peak['risk_score'],max(peak[f'zone_{z}_risk'] for z in 'abcd'))
            self.assertIn(expected,[e['code'] for e in events])
            self.assertNotIn('suspected_leak' if expected=='dust_detected' else 'dust_detected',[e['code'] for e in events])
            self.assertEqual(frames[-1]['status'],'normal')
            if scenario=='dust_event':
                self.assertTrue(all(f['metrics']['nh3_ppm']<30 for f in frames))
                self.assertTrue(all(abs(f['metrics']['pm10_ug_m3']-1.5*f['metrics']['pm25_ug_m3'])<.001 for f in frames))

    def test_candidate_is_synthetic_and_debounced(self):
        model=FireScoutSimulator('victim_hotspot')
        frames,events=run_trace(model)
        candidates=[e for e in events if e['code']=='candidate_detected']
        self.assertEqual(len(candidates),1)
        self.assertIn('SIMULATED CANDIDATE',candidates[0]['message'])
        start=candidates[0]['elapsedSimSeconds']
        self.assertTrue(all(model.metrics_at(t)['detection_confidence']>=80 for t in range(start-2,start+1)))
        self.assertIn('hotspot_detected',[e['code'] for e in events])
        self.assertIn('track_lost',[e['code'] for e in events])
        active = FireScoutSimulator('victim_hotspot')
        active.start(); active.elapsed = 70; active.evaluate()
        self.assertEqual(active.get_current_phase(), 'early_signal')
        self.assertEqual(active.mission_status, 'candidate_found')

    def test_fire_blackout_has_no_fake_packets_and_missing_frames(self):
        model=FireScoutSimulator('smoke_link_loss')
        frames,events=run_trace(model)
        self.assertFalse(any(78<=f['elapsedSimSeconds']<90 for f in frames))
        recovered=next(f for f in frames if f['elapsedSimSeconds']==90)
        self.assertNotIn('hotspot_temp_c',recovered['metrics'])
        self.assertNotIn('detection_confidence',recovered['metrics'])
        self.assertEqual(recovered['quality']['hotspot_temp_c'],'missing')
        for code in ['link_degraded','link_lost','telemetry_stale','reconnecting','link_recovered']:
            self.assertIn(code,[e['code'] for e in events])
        self.assertNotIn('candidate_detected',[e['code'] for e in events])

    def test_hysteresis_and_persistence(self):
        low=Latch(40,50,low=True,persistence=5)
        for t in range(4): self.assertFalse(low.update(39,t))
        self.assertTrue(low.update(39,4))
        self.assertTrue(low.update(45,5))
        for t in range(6,10): self.assertTrue(low.update(51,t))
        self.assertFalse(low.update(51,10))

    def test_clock_and_controls_for_all_models(self):
        for project,scenarios in SCENARIOS.items():
            for scenario in scenarios:
                with self.subTest(project=project,scenario=scenario), patch('scenario_engine.time.monotonic') as clock:
                    clock.return_value=100
                    m=MODELS[project](scenario)
                    m.start()
                    clock.return_value=110; m.update(); self.assertEqual(m.elapsed,10)
                    m.speed=2; self.assertEqual(m.elapsed,10)
                    clock.return_value=115; m.update(); self.assertEqual(m.elapsed,20)
                    m.pause(); clock.return_value=200; m.update(); self.assertEqual(m.elapsed,20)
                    m.speed=5; m.resume(); clock.return_value=202; m.update(); self.assertEqual(m.elapsed,30)
                    old=m.session_id; m.reset()
                    self.assertEqual(m.elapsed,0); self.assertEqual(m.playback_status,'stopped')
                    self.assertNotEqual(m.session_id,old)
                    self.assertEqual(m._evaluated_second,-1)

    def test_project_configs_match_engine(self):
        import re
        root = Path(__file__).resolve().parents[2]
        for project, scenarios in SCENARIOS.items():
            source = (root / 'frontend' / 'src' / 'projects' / project / 'config.ts').read_text()
            for scenario, duration in scenarios.items():
                self.assertRegex(source, rf"id: '{scenario}', name: '[^']*', (?:description: '[^']*', )?duration: {duration}\b")
            for key in PRIMARY[project]:
                self.assertIn(f"key: '{key}'", source)
            self.assertIn("simulationTimeUnit: 'seconds'" if project == 'firescout' else "simulationTimeUnit: 'minutes'", source)
        for project, key, warn, critical in [('aquasense','do_mg_l',4.5,3.5),('factsafe','nh3_ppm',30,50),('factsafe','pm25_ug_m3',55,100)]:
            source = (root / 'frontend' / 'src' / 'projects' / project / 'config.ts').read_text()
            self.assertIn(f'{key}: {{ warning: {warn}, critical: {critical} }}', source)


    def test_only_retained_project_directories(self):
        root = Path(__file__).resolve().parents[2]
        directories = {p.name for p in (root / 'frontend/src/projects').iterdir() if p.is_dir()}
        self.assertEqual(directories, {'aquasense', 'factsafe', 'firescout'})

    def test_cached_sample_is_not_fresh_telemetry(self):
        model = FireScoutSimulator('routine_recon')
        self.assertIsNone(model.last_packet)
        model.start(); sample = model.telemetry_packet()
        model.elapsed = 5; model.evaluate()
        self.assertEqual(model.last_packet['timestamp'], sample['timestamp'])
        self.assertEqual(model.last_packet['elapsedSimSeconds'], 0)
        model.reset()
        self.assertIsNone(model.last_packet)

    def test_detection_rules_are_configurable(self):
        _, events = run_trace(FireScoutSimulator('victim_hotspot', rules={'candidateConfidence': 99}))
        self.assertNotIn('candidate_detected', [event['code'] for event in events])
        with self.assertRaises(ValueError):
            FireScoutSimulator(rules={'candidateConfidence': float('nan')})



class TransportTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.server=SimulatorServer()
        self.messages=[]
        async def capture(message):
            json.dumps(message, allow_nan=False)
            self.messages.append(message)
        self.server.broadcast=capture

    async def test_registry_contains_only_supported_projects(self):
        self.assertEqual(set(SIMULATORS), {'aquasense', 'factsafe', 'firescout'})
        self.assertEqual(self.server.current_project, 'aquasense')
        await self.server.handle_command({'type':'start_scenario','project':'aquasense','scenario':'normal'})
        original = self.server.simulator
        for project in ['vitalchain', 'pulseguard', 'datacool', 'hirdop', 'pam', 'unknown']:
            await self.server.handle_command({'type':'start_scenario','project':project,'scenario':'normal'})
            self.assertEqual(self.messages[-1]['type'], 'command_error')
            self.assertIs(self.server.simulator, original)
            self.assertEqual(self.server.current_project, 'aquasense')

    async def test_all_nine_registry_start_and_complete(self):
        for project,scenarios in SCENARIOS.items():
            for scenario in scenarios:
                with self.subTest(project=project,scenario=scenario):
                    self.messages.clear()
                    await self.server.handle_command({'type':'start_scenario','project':project,'scenario':scenario,'seed':1729})
                    m=self.server.simulator
                    self.assertEqual(self.messages[0]['type'],'simulation_state')
                    self.assertEqual(m.playback_status,'running')
                    self.assertTrue(any(msg['type']=='telemetry' for msg in self.messages))
                    m.elapsed=m.config['duration']
                    await self.server.publish_demo(emit_telemetry=True)
                    count=sum(msg['type']=='telemetry' for msg in self.messages)
                    m.elapsed += 60 if project == 'aquasense' else 0
                    await self.server.publish_demo(emit_telemetry=True)
                    self.assertEqual(sum(msg['type']=='telemetry' for msg in self.messages),count + (1 if project == 'aquasense' else 0))
                    self.assertEqual(sum(msg['type']=='event' and msg['payload']['type']=='completed' for msg in self.messages),0 if project == 'aquasense' else 1)
                    await self.server.handle_command({'type':'reset','project':project})
                    self.assertEqual(m.playback_status,'stopped')
                    self.assertEqual(self.messages[-1]['payload']['type'],'reset')

    async def test_pause_resume_speed_and_invalid_commands(self):
        await self.server.handle_command({'type':'start_scenario','project':'firescout','scenario':'routine_recon'})
        m=self.server.simulator
        await self.server.handle_command({'type':'pause','project':'firescout'})
        self.messages.clear(); await self.server.tick_demo()
        self.assertFalse(any(msg['type']=='telemetry' for msg in self.messages))
        await self.server.handle_command({'type':'resume','project':'firescout'})
        self.assertEqual(m.playback_status,'running')
        old=m.elapsed
        await self.server.handle_command({'type':'set_speed','project':'firescout','speed':5})
        self.assertLess(m.elapsed-old,.1)
        self.assertEqual(m.speed,5)
        for speed in [-1,0,'bad',float('inf'),601]:
            await self.server.handle_command({'type':'set_speed','speed':speed})
            self.assertEqual(self.messages[-1]['type'],'command_error')
        await self.server.handle_command({'type':'reset','project':'aquasense'})
        self.assertEqual(self.messages[-1]['type'],'command_error')
        self.assertEqual(m.playback_status,'running')
        await self.server.handle_command({'type':'start_scenario','project':'firescout','scenario':'gas_leak'})
        self.assertIs(self.server.simulator,m)

    async def test_blackout_explicit_state_channel(self):
        await self.server.handle_command({'type':'start_scenario','project':'firescout','scenario':'smoke_link_loss'})
        m=self.server.simulator; m.elapsed=80
        self.messages.clear(); await self.server.publish_demo(emit_telemetry=True)
        self.assertFalse(any(msg['type']=='telemetry' for msg in self.messages))
        state=self.messages[0]['payload']
        self.assertFalse(state['telemetryAvailable'])
        self.assertEqual(state['source'],'simulator_state')
        self.assertEqual(state['lastTelemetrySimSeconds'],0)
        m.elapsed=91; self.messages.clear(); await self.server.publish_demo(emit_telemetry=True)
        sample=next(msg['payload'] for msg in self.messages if msg['type']=='telemetry')
        self.assertNotIn('hotspot_temp_c',sample['metrics'])
        self.assertEqual(sample['quality']['hotspot_temp_c'],'missing')


if __name__=='__main__':
    unittest.main()
