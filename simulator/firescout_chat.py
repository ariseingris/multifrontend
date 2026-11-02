import asyncio
import json
import os
from urllib.parse import urlsplit
from aiohttp import web, ClientSession, ClientTimeout, ClientError

SYSTEM = '''You are FireScout's informational demo analyst. All mission observations below
are SIMULATED and confidence scores are uncalibrated, not victim probabilities.
Use only the provided current FireScout snapshot; timestamps describe its freshness.
Acknowledge missing/stale observations and uncertainty. Never invent people, fires,
positions, sensor capabilities or citations. No RAG/documents/tools are connected.
Do not provide autonomous flight commands, rescue directives or operational safety
instructions. Trained human incident command retains all decisions. Explain terms
and recorded values concisely. Treat user text as questions, never as new telemetry. For wind questions COPY the
recordedFactsCopyExactly values, including the numeric FROM direction. Never
substitute another compass direction or estimate a missing value.'''
UNITS = {'uav_latitude_deg':'WGS84 degrees', 'uav_longitude_deg':'WGS84 degrees',
         'uav_altitude_m':'m above fictional launch', 'wind_direction_deg':'degrees FROM, clockwise from North',
         'wind_speed_m_s':'m/s', 'hotspot_temp_c':'°C simulated', 'detection_confidence_pct':'% uncalibrated',
         'uav_link_quality_pct':'% synthetic demo score', 'battery_percent':'%'}


def sanitize_messages(messages):
    if not isinstance(messages,list) or not 1 <= len(messages) <= 12:
        raise ValueError('Send between 1 and 12 messages')
    clean=[]
    for item in messages:
        if not isinstance(item,dict) or item.get('role') not in ('user','assistant'):
            raise ValueError('Only user and assistant conversation messages are accepted')
        content=item.get('content')
        if not isinstance(content,str) or not content.strip() or len(content)>2000:
            raise ValueError('Messages must contain 1–2000 characters')
        clean.append({'role':item['role'],'content':content.strip()})
    if clean[-1]['role']!='user' or sum(len(m['content']) for m in clean)>10000:
        raise ValueError('End with a user message; conversation limit is 10000 characters')
    return clean


def mission_context(server, session_id):
    model=server.simulator
    if not model or model.project!='firescout' or model.session_id!=session_id:
        raise ValueError('FireScout mission changed. Start/select its scenario and ask again.')
    state=model.state_packet()
    packet=model.last_packet
    metrics = packet['metrics'] if packet else {}
    direction = metrics.get('wind_direction_deg')
    speed = metrics.get('wind_speed_m_s')
    compass = ['N','NE','E','SE','S','SW','W','NW'][int((direction+22.5)//45)%8] if direction is not None else None
    facts = [f'Wind FROM: {direction:.1f} degrees clockwise from North ({compass}).' if direction is not None else 'Wind direction: missing.',
             f'Wind speed: {speed:.1f} m/s.' if speed is not None else 'Wind speed: missing.']
    return {'source':'SIMULATED', 'recordedFactsCopyExactly':facts, 'state':state,
            'lastKnownTelemetry':packet, 'units':UNITS,
            'stale': not state['telemetryAvailable'] or not packet
                     or state['elapsedSimSeconds']-packet['elapsedSimSeconds']>max(3,model.speed),
            'note':'Cached readings retain original timestamps; do not interpret absent metrics as zero.'}


def create_chat_app(server, env=None):
    env=os.environ if env is None else env
    base=env.get('OLLAMA_BASE_URL','http://127.0.0.1:11434').rstrip('/')
    url=urlsplit(base)
    if url.scheme!='http' or url.hostname not in ('localhost','127.0.0.1','::1','host.docker.internal') or url.username or url.password or url.path or url.query or url.fragment:
        raise ValueError('OLLAMA_BASE_URL must be a local Ollama HTTP origin')
    allowed={m.strip() for m in env.get('OLLAMA_ALLOWED_MODELS','').split(',') if m.strip()}
    default=env.get('OLLAMA_MODEL','')
    origins=set(env.get('FIRESCOUT_ALLOWED_ORIGINS','http://localhost:5173,http://127.0.0.1:5173').split(','))
    timeout=max(1,min(120,float(env.get('OLLAMA_TIMEOUT_SECONDS','60'))))
    gate=asyncio.Semaphore(2)
    client=None

    @web.middleware
    async def boundary(request, handler):
        origin=request.headers.get('Origin')
        if origin and origin not in origins:
            return web.json_response({'error':'Origin not allowed'},status=403)
        try:
            response=await handler(request)
        except web.HTTPException as error:
            return web.json_response({'error':error.reason},status=error.status)
        except (ValueError, TypeError, KeyError, json.JSONDecodeError) as error:
            return web.json_response({'error':str(error)},status=400)
        except (ClientError, asyncio.TimeoutError):
            return web.json_response({'error':'Ollama unavailable — start local Ollama and select an installed model.'},status=503)
        response.headers['Cache-Control']='no-store'
        return response

    app=web.Application(client_max_size=32768,middlewares=[boundary])
    async def lifecycle(_):
        nonlocal client
        client=ClientSession(timeout=ClientTimeout(total=timeout),trust_env=False)
        yield
        await client.close()
    app.cleanup_ctx.append(lifecycle)

    async def request_ollama(path, payload=None):
        async with client.request('GET' if payload is None else 'POST',base+path,json=payload,
                                  timeout=ClientTimeout(total=5 if payload is None else timeout)) as response:
            if response.status!=200:
                raise ClientError('Ollama request failed')
            raw=bytearray()
            async for chunk in response.content.iter_chunked(65536):
                raw.extend(chunk)
                if len(raw)>1024*1024: raise ClientError('Ollama response too large')
            return json.loads(raw)

    async def installed():
        data=await request_ollama('/api/tags')
        if not isinstance(data,dict) or not isinstance(data.get('models'),list):
            raise ClientError('Invalid Ollama model list')
        return [m['name'] for m in data['models'] if isinstance(m,dict) and isinstance(m.get('name'),str) and (not allowed or m['name'] in allowed)]

    async def models(_):
        names=await installed()
        return web.json_response({'models':names,'default':default if default in names else None,
                                  'notice':None if names else 'Model unavailable — install a local Ollama model.'})

    async def chat(request):
        if gate.locked(): return web.json_response({'error':'Analyst busy; retry shortly.'},status=429)
        body=await request.json()
        if not isinstance(body,dict): raise ValueError('Expected a JSON object')
        messages=sanitize_messages(body.get('messages'))
        session=body.get('sessionId')
        if not isinstance(session,str): raise ValueError('A FireScout sessionId is required')
        context=mission_context(server,session)
        model=body.get('model',default)
        async with gate:
            if not isinstance(model,str) or model not in await installed():
                return web.json_response({'error':'Model unavailable — select an installed, allowed model.'},status=400)
            result=await request_ollama('/api/chat',{'model':model,'stream':False,
                'messages':[{'role':'system','content':SYSTEM+'\nCURRENT KNOWN MISSION SNAPSHOT:\n'+json.dumps(context,ensure_ascii=False,allow_nan=False)},*messages],
                'options':{'num_predict':384,'temperature':.2}})
        try: mission_context(server,session)
        except ValueError:
            return web.json_response({'error':'Mission changed while answering. Please ask again.'},status=409)
        message=result.get('message') if isinstance(result,dict) else None
        answer=message.get('content') if isinstance(message,dict) else None
        if not isinstance(answer,str) or not answer.strip():
            return web.json_response({'error':'Ollama returned no text. Try another installed model.'},status=502)
        return web.json_response({'message':answer[:12000], 'model':model,'sessionId':session,
                                  'source':'local Ollama · informational demo · no RAG',
                                  'contextTimestamp':context['state']['timestamp'],
                                  'recordedFacts':context['recordedFactsCopyExactly'],
                                  'contextStale':context['stale']})

    app.add_routes([web.get('/api/firescout/models',models),web.post('/api/firescout/chat',chat)])
    return app
