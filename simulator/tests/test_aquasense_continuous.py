"""Clock-independent synthetic pond and continuous transport acceptance tests."""
import math
import sys
import unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scenario_models import AquaSenseSimulator
from telemetry_history import append_history
from server import SimulatorServer


class PondTests(unittest.TestCase):
    def test_deterministic_and_independent_of_sampling_order(self):
        times = [0, 1, 60, 369, 7200, 7201, 36000, 10, 7200, 86400]
        for scenario in ['normal', 'low_oxygen', 'sensor_fouling']:
            model = AquaSenseSimulator(scenario)
            for t in times:
                expected = AquaSenseSimulator(scenario).metrics_at(t)
                self.assertEqual(model.metrics_at(t), expected)
            self.assertNotEqual(model.metrics_at(43200), AquaSenseSimulator(scenario, seed=42).metrics_at(43200))
            self.assertLessEqual(len(model.environment._states), 128)

    def test_slow_non_periodic_variability_and_physical_ranges(self):
        for seed in [1, 42, 1729]:
            model = AquaSenseSimulator(seed=seed)
            rows = [model.metrics_at(t) for t in range(0, 3 * 86400, 60)]
            for key, low, high, max_step, min_range in [
                ('water_temperature_c', 24, 32, .03, .8),
                ('ph', 7, 8.8, .004, .1),
                ('do_mg_l', 4.5, 7.5, .04, .5),
            ]:
                values = [r[key] for r in rows]
                self.assertTrue(all(low < v < high for v in values))
                self.assertLess(max(abs(b-a) for a,b in zip(values,values[1:])), max_step)
                self.assertGreater(max(values)-min(values), min_range)
                # Former generator repeated exactly every ~370 seconds. New series does not.
                a = [model.metrics_at(t)[key] for t in range(0, 300, 10)]
                b = [model.metrics_at(t+370)[key] for t in range(0, 300, 10)]
                self.assertGreater(sum(abs(x-y) for x,y in zip(a,b)), .001)
            for key in ['water_temperature_c', 'ph']:
                values = [r[key] for r in rows[:120]]
                turns = sum((b-a)*(c-b)<0 for a,b,c in zip(values,values[1:],values[2:]))
                self.assertLess(turns, 8, 'No rapid recurring oscillations in a two-hour window')
            self.assertTrue(all(217 <= r['orp_mv'] <= 223 and 14.88 <= r['salinity_ppt'] <= 15.12 for r in rows))

    def test_continuous_event_recovery_and_persistent_fault(self):
        for scenario in ['normal', 'low_oxygen', 'sensor_fouling']:
            model = AquaSenseSimulator(scenario)
            model.start()
            # One large jump must still evaluate every warning/critical/recovery transition.
            model.elapsed = 86400
            model.evaluate()
            events = model.drain_events()
            codes = [e['code'] for e in events]
            alerts = model.get_alerts()
            self.assertEqual(model.playback_status, 'running')
            self.assertFalse(model.completed)
            self.assertEqual(codes.count('monitoring_started'), 1)
            self.assertEqual(codes.count('completed'), 0)
            self.assertTrue(model.state_packet()['continuous'])
            self.assertEqual(model.telemetry_packet()['elapsedSimSeconds'], 86400)
            if scenario == 'low_oxygen':
                self.assertEqual(codes.count('critical_entered'), 1)
                self.assertIn('warning_entered', codes)
                self.assertIn('normal_restored', codes)
                self.assertEqual(codes.count('simulated_intervention'), 1)
                self.assertEqual({a['severity'] for a in alerts}, {'warning','critical'})
                self.assertEqual(model.get_current_phase(), 'monitoring')
                self.assertIsNone(model.state_packet()['activeAlert'])
                self.assertGreater(model.get_metrics()['do_mg_l'], 4.5)
            elif scenario == 'sensor_fouling':
                self.assertEqual(model.get_current_phase(), 'maintenance_required')
                self.assertEqual(model.sensor_status, 'degraded')
                self.assertEqual(model.state_packet()['activeAlert']['metric'], 'sensor_quality')
                packet = model.telemetry_packet()
                self.assertLess(packet['metrics']['sensor_quality'], 40)
                self.assertGreater(abs(packet['groundTruth']['pond_do_mg_l'] - packet['metrics']['do_mg_l']), .5)
                self.assertNotIn('normal_restored', codes)
            else:
                self.assertFalse(alerts)
                self.assertEqual(model.get_current_phase(), 'monitoring')
            self.assertEqual(model.get_status(), 'normal')
            self.assertEqual([e['elapsedSimSeconds'] for e in events], sorted(e['elapsedSimSeconds'] for e in events))
            model.elapsed += 3600; model.evaluate()
            self.assertFalse(model.drain_events(), 'No repeated scripted events')
            self.assertLessEqual(len(model.environment._states), 128)

    def test_clocks_all_speeds_pause_resume_reset_and_finite_opt_out(self):
        for speed in [1,10,60,300,600]:
            with patch('scenario_engine.time.monotonic') as clock:
                clock.return_value=100
                m=AquaSenseSimulator('low_oxygen',speed=speed); m.start()
                clock.return_value=100+8000/speed; m.update(); m.evaluate()
                self.assertAlmostEqual(m.elapsed,8000)
                self.assertEqual(m.playback_status,'running')
                self.assertEqual(m.get_current_phase(),'monitoring')
                self.assertEqual(sum(e['code']=='critical_entered' for e in m.drain_events()),1)
                m.pause(); paused=m.elapsed; real=m.real_elapsed
                clock.return_value+=500; m.update()
                self.assertEqual(m.elapsed,paused); self.assertEqual(m.real_elapsed,real)
                m.resume(); clock.return_value+=1; m.update()
                self.assertAlmostEqual(m.elapsed,paused+speed)
                clock.return_value+=1; m.speed=10
                self.assertAlmostEqual(m.elapsed,paused+2*speed)
                clock.return_value+=1; m.update()
                self.assertAlmostEqual(m.elapsed,paused+2*speed+10)
                original=m.session_id; m.reset()
                self.assertEqual(m.elapsed,0); self.assertEqual(m.real_elapsed,0)
                self.assertEqual(m.playback_status,'stopped'); self.assertNotEqual(m.session_id,original)
                self.assertEqual(m.metrics_at(0),AquaSenseSimulator('low_oxygen').metrics_at(0))
        m=AquaSenseSimulator(continuous=False); m.start(); m.elapsed=7200; m.evaluate()
        self.assertEqual(m.playback_status,'completed')

    def test_configurable_bounded_retention(self):
        points=[]
        for second in range(0, 2*86400+1, 30):
            packet={'elapsedSimSeconds':second, 'historyBucketSeconds':30,
                    'historyRetentionSeconds':21600, 'historyMaxPoints':1000}
            points=append_history(points,packet)
        self.assertLessEqual(len(points),722)
        self.assertGreaterEqual(points[0]['elapsedSimSeconds'],2*86400-21600)
        self.assertEqual(points[-1]['elapsedSimSeconds'],2*86400)
        for second in range(0,1000):
            points=append_history(points,{'elapsedSimSeconds':2*86400+second,
                'historyBucketSeconds':1,'historyRetentionSeconds':21600,'historyMaxPoints':50})
        self.assertEqual(len(points),50)
        for kwargs in [{'retention_seconds':0},{'history_bucket_seconds':float('nan')},{'continuous':'yes'}]:
            with self.assertRaises(ValueError): AquaSenseSimulator(**kwargs)


class ContinuousTransportTests(unittest.IsolatedAsyncioTestCase):
    async def test_bounded_emissions_past_script_and_events_survive_pruning(self):
        server=SimulatorServer(); messages=[]
        async def capture(message): messages.append(message)
        server.broadcast=capture
        with patch('server.time.monotonic') as clock:
            clock.return_value=100
            await server.handle_command({'type':'start_scenario','project':'aquasense','scenario':'low_oxygen','speed':600})
            m=server.simulator
            for i in range(1,301):
                clock.return_value=100+i/10
                await server.tick_demo()
            samples=[p['payload'] for p in messages if p['type']=='telemetry']
            self.assertLessEqual(len(samples),151)  # At most five emissions per real second.
            times=[p['elapsedSimSeconds'] for p in samples]
            self.assertEqual(times,sorted(set(times)))
            self.assertGreater(times[-1],7200)
            self.assertTrue(all(p['historyRetentionSeconds']==21600 for p in samples))
            self.assertEqual(m.playback_status,'running')
            # Advance beyond the retention cutoff; events/alerts have their own lifetime.
            clock.return_value=200; await server.tick_demo()
            self.assertGreater(server._history[0]['elapsedSimSeconds'],0)
            self.assertIn('critical_entered',[e['code'] for e in server._history_events])
            self.assertTrue(any(p['type']=='alert' and p['payload']['severity']=='critical' for p in messages))
            await server.handle_command({'type':'reset','project':'aquasense'})
            self.assertEqual(server._history,[])
            await server.handle_command({'type':'start_scenario','project':'aquasense','scenario':'normal','speed':300})
            self.assertEqual(server._history[0]['elapsedSimSeconds'],0)
            self.assertNotIn('critical_entered',[e['code'] for e in server._history_events])

    async def test_reconnect_restores_active_fault_from_actual_simulator_alert(self):
        import json
        server=SimulatorServer()
        async def capture(_): pass
        server.broadcast=capture
        await server.handle_command({'type':'start_scenario','project':'aquasense','scenario':'sensor_fouling'})
        server.simulator.elapsed=7500
        await server.publish_demo(emit_telemetry=True)
        self.assertFalse(server.simulator._alerts, 'Alert delivery queue was drained')
        class Client:
            def __init__(self): self.messages=[]
            async def send(self,message): self.messages.append(json.loads(message))
        client=Client(); await server.register(client)
        state=client.messages[0]['payload']
        self.assertEqual(state['activeAlert']['id'],server.simulator._latest_alert['id'])
        self.assertEqual(state['phase'],'maintenance_required')
        await server.handle_command({'type':'reset','project':'aquasense'})
        self.assertIsNone(server.simulator.state_packet()['activeAlert'])
