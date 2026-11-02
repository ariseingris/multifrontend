import json
import math
import sys
import unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from scenario_models import FireScoutSimulator, SCENARIOS
from server import SimulatorServer
from telemetry_history import append_history


class MissionTests(unittest.TestCase):
    def test_seeded_continuous_scenarios_and_ranges(self):
        for scenario in SCENARIOS['firescout']:
            model=FireScoutSimulator(scenario); model.start()
            events=[]
            for t in range(0,7201,10):
                model.elapsed=t; model.evaluate(); packet=model.telemetry_packet()
                json.dumps(packet,allow_nan=False)
                metrics=packet['metrics']
                self.assertTrue(all(math.isfinite(v) for v in metrics.values()))
                for key,lo,hi in [('uav_latitude_deg',11.99,12.01),('uav_longitude_deg',109.99,110.01),
                                  ('wind_direction_deg',0,360),('wind_speed_m_s',0,10),('uav_link_quality_pct',0,100)]:
                    self.assertTrue(lo<=metrics[key]<=hi,(scenario,key,metrics[key]))
                self.assertEqual(metrics,FireScoutSimulator(scenario).metrics_at(t))
                self.assertEqual(packet['mission']['telemetry_source'],'simulated')
                events.extend(model.drain_events())
            self.assertEqual(model.playback_status,'running')
            self.assertEqual(model.mission_status,'monitoring')
            self.assertEqual(sum(e['type']=='monitoring_started' for e in events),1)
            self.assertNotIn('completed',[e['type'] for e in events])
            self.assertLess(len(events),20)
            if scenario=='routine_recon':
                self.assertNotIn('detection_confidence_pct',metrics)
                self.assertIsNone(packet['mission']['detection_track_id'])
                self.assertNotIn('candidate_detected',[e['type'] for e in events])
            elif scenario=='hotspot_detection':
                self.assertEqual(packet['mission']['detection_type'],'hotspot')
                self.assertEqual(packet['mission']['detection_track_id'],'FS-H1')
                self.assertAlmostEqual(model.highest_observed_hotspot_c,110,delta=.1)
                self.assertEqual(sum(e['type']=='candidate_detected' for e in events),1)
            self.assertNotEqual(metrics,FireScoutSimulator(scenario,seed=22).metrics_at(7200))

    def test_wind_temperature_and_path_are_continuous(self):
        for scenario in SCENARIOS['firescout']:
            m=FireScoutSimulator(scenario)
            rows=[m.metrics_at(t) for t in range(0,721)]
            for key,limit in [('uav_latitude_deg',.0001),('uav_longitude_deg',.0001),
                              ('wind_direction_deg',1),('wind_speed_m_s',.2),('hotspot_temp_c',2)]:
                jumps=[abs(b[key]-a[key]) for a,b in zip(rows,rows[1:]) if key in a and key in b]
                self.assertLess(max(jumps),limit,(scenario,key))
            self.assertNotEqual(rows[200]['wind_speed_m_s'],rows[570]['wind_speed_m_s'])

    def test_blackout_and_unusable_observations_remain_missing(self):
        model=FireScoutSimulator('smoke_link_degradation'); model.start()
        packets=[]; events=[]
        for t in range(151):
            model.elapsed=t; model.evaluate()
            if model.data_available(): packets.append(model.telemetry_packet())
            events.extend(model.drain_events())
        self.assertFalse(any(78<=p['elapsedSimSeconds']<90 for p in packets))
        for packet in packets:
            if 70<=packet['elapsedSimSeconds']<94:
                self.assertNotIn('hotspot_temp_c',packet['metrics'])
                self.assertNotIn('detection_confidence_pct',packet['metrics'])
                self.assertEqual(packet['quality']['detection_confidence_pct'],'missing')
        for code in ['link_degraded','link_lost','telemetry_stale','reconnecting','link_recovered']:
            self.assertEqual(sum(e['type']==code for e in events),2 if code=='link_degraded' else 1)

    def test_fast_clock_pause_resume_reset_and_aliases(self):
        for speed in [1,2,5,10,300,600]:
            with patch('scenario_engine.time.monotonic') as clock:
                clock.return_value=100
                m=FireScoutSimulator('hotspot_detection',speed=speed);m.start()
                clock.return_value+=360/speed;m.update();m.evaluate()
                self.assertAlmostEqual(m.elapsed,360)
                self.assertEqual(m.playback_status,'running')
                self.assertEqual(sum(e['type']=='candidate_detected' for e in m.drain_events()),1)
                m.pause();held=m.elapsed;clock.return_value+=100;m.update();self.assertEqual(m.elapsed,held)
                m.resume();clock.return_value+=1;m.update();self.assertAlmostEqual(m.elapsed,held+speed)
                old=m.session_id;m.reset();self.assertNotEqual(m.session_id,old)
                self.assertEqual(m.elapsed,0);self.assertEqual(m.playback_status,'stopped')
        self.assertEqual(FireScoutSimulator('victim_hotspot').scenario_id,'hotspot_detection')
        self.assertEqual(FireScoutSimulator('smoke_link_loss').scenario_id,'smoke_link_degradation')
        for interval in [0,float('nan')]:
            with self.assertRaises(ValueError):FireScoutSimulator(sample_interval=interval)


class MissionTransportTests(unittest.IsolatedAsyncioTestCase):
    async def test_archive_and_events_bounded_independently_and_acknowledgement(self):
        server=SimulatorServer();messages=[]
        async def capture(m):messages.append(m)
        server.broadcast=capture
        await server.handle_command({'type':'start_scenario','project':'firescout','scenario':'hotspot_detection','speed':10})
        for t in [60,120,150,300,3600]:
            server.simulator.elapsed=t
            await server.publish_demo(emit_telemetry=True)
        self.assertEqual(server.simulator.playback_status,'running')
        self.assertLessEqual(len(server._history),1000)
        self.assertGreater(server._history[0]['elapsedSimSeconds'],0)
        self.assertIn('candidate_detected',[e['type'] for e in server._history_events])
        await server.handle_command({'type':'acknowledge','project':'firescout'})
        await server.handle_command({'type':'acknowledge','project':'firescout'})
        self.assertEqual(sum(e['type']=='operator_acknowledged' for e in server._history_events),1)
        await server.handle_command({'type':'reset','project':'firescout'})
        self.assertEqual(server._history,[])
        points=[]
        for t in range(5000):
            points=append_history(points,{'elapsedSimSeconds':t,'historyBucketSeconds':1,'historyRetentionSeconds':1800,'historyMaxPoints':1000})
        self.assertEqual(len(points),1000)
