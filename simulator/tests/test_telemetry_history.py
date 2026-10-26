import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from telemetry_history import append_history
from server import SimulatorServer


class HistoryTests(unittest.TestCase):
    def test_two_hour_archive_retains_origin_latest_and_all_phases(self):
        points=[]
        for second in range(7201):
            packet={'elapsedSimSeconds':second,'timestamp':f'original-{second}','metrics':{'do_mg_l':6}}
            points=append_history(points,packet)
        self.assertLessEqual(len(points),1000)
        self.assertEqual(points[0]['elapsedSimSeconds'],0)
        self.assertEqual(points[-1]['elapsedSimSeconds'],7200)
        for phase_time in [1200,2400,3600,4800,6000]:
            self.assertTrue(any(abs(p['elapsedSimSeconds']-phase_time)<10 for p in points))
        self.assertEqual(points[-1]['timestamp'],'original-7200')


class BootstrapTests(unittest.IsolatedAsyncioTestCase):
    async def test_bootstrap_replays_real_samples_and_events_reset_clears_them(self):
        server=SimulatorServer()
        async def broadcast(_): pass
        server.broadcast=broadcast
        await server.handle_command({'type':'start_scenario','project':'factsafe','scenario':'gas_leak'})
        for t in [60,120,180]:
            server.simulator.elapsed=t
            await server.publish_demo(emit_telemetry=True)
        class Client:
            def __init__(self):self.messages=[]
            async def send(self,message):
                import json
                self.messages.append(json.loads(message))
        client=Client();await server.register(client)
        history=next(p['payload'] for p in client.messages if p['type']=='session_history')
        self.assertEqual([p['elapsedSimSeconds'] for p in history['telemetry']],[0,60,120,180])
        self.assertEqual(history['events'][0]['type'],'started')
        self.assertEqual(history['telemetry'][-1]['timestamp'],server.simulator.last_packet['timestamp'])
        await server.handle_command({'type':'reset','project':'factsafe'})
        client2=Client();await server.register(client2)
        history2=next(p['payload'] for p in client2.messages if p['type']=='session_history')
        self.assertEqual(history2['telemetry'],[])
        self.assertEqual([e['type'] for e in history2['events']],['reset'])
        self.assertNotEqual(history['sessionId'],history2['sessionId'])

    async def test_fire_keeps_cached_packet_protocol_without_history_messages(self):
        server=SimulatorServer()
        async def broadcast(_):pass
        server.broadcast=broadcast
        await server.handle_command({'type':'start_scenario','project':'firescout','scenario':'routine_recon'})
        class Client:
            def __init__(self):self.messages=[]
            async def send(self,text):
                import json
                self.messages.append(json.loads(text))
        client=Client();await server.register(client)
        self.assertEqual([p['type'] for p in client.messages],['simulation_state','telemetry'])
        self.assertNotIn('historyBucketSeconds',client.messages[-1]['payload'])
