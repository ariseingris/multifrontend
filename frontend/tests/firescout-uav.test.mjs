import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
async function load(path,jsx=false){
  let source=await readFile(new URL(path,import.meta.url),'utf8');
  source=source.replaceAll("from 'react'",`from '${import.meta.resolve('react')}'`);
  const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.React}}).outputText;
  const prefix=jsx?`import React from '${import.meta.resolve('react')}';\n`:'';
  return import(`data:text/javascript;base64,${Buffer.from(prefix+js).toString('base64')}`);
}
const { coordinate, uavPosition, flightSegments }=await load('../src/projects/firescout/services/missionTelemetryAdapter.ts');
const { firescoutConfig }=await load('../src/projects/firescout/config.ts');
const { FireScoutMessage }=await load('../src/projects/firescout/components/FireScoutChatPanel.tsx',true);
const { FigmaDashboardContent }=await (async()=>{
  let source=await readFile(new URL('../src/core/components/FigmaDashboard/index.tsx',import.meta.url),'utf8');
  source=source.replace("import './figma-dashboard.css';",'');
  const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.React}}).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(`import React from '${import.meta.resolve('react')}';\n`+js).toString('base64')}`);
})();

test('coordinates use WGS84 bounds and missing data never becomes a zero position',()=>{
  for(const pair of [[undefined,110],[12,undefined],[NaN,110],[91,110],[12,181],[Infinity,110],[null,null]])assert.equal(coordinate(...pair),null);
  assert.deepEqual(coordinate(0,0),[0,0]);assert.deepEqual(coordinate(12,110),[12,110]);
  assert.equal(uavPosition(null),null);
});
test('flight trail breaks at telemetry blackouts, missing coordinates and session changes',()=>{
  const p=(t,sessionId='a')=>({sessionId,elapsedSimSeconds:t,metrics:{uav_latitude_deg:12+t/100000,uav_longitude_deg:110},mission:{samplingIntervalSeconds:1}});
  const segments=flightSegments([p(75),p(76),p(77),p(90),p(91),p(0,'b'),p(1,'b')]);
  assert.deepEqual(segments.map(s=>s.length),[3,2,2]);
  assert.deepEqual(flightSegments([p(0),{...p(1),metrics:{}},p(2)]).map(s=>s.length),[1,1]);
});
test('FireScout has three canonical scenarios, correct units and rolling time',()=>{
  assert.deepEqual(firescoutConfig.scenarios.map(s=>s.id),['routine_recon','hotspot_detection','smoke_link_degradation']);
  for(const [key,unit] of [['wind_speed_m_s','m/s'],['wind_direction_deg','°'],['hotspot_temp_c','°C'],['detection_confidence_pct','%']])assert.equal(firescoutConfig.metrics.find(m=>m.key===key).unit,unit);
  assert.equal(firescoutConfig.chartWindowSeconds,120);
  assert.equal(firescoutConfig.metrics.find(m=>m.key==='detection_confidence_pct').max,100);
});
test('chat renders model and user content as escaped text, including script markup',()=>{
  for(const role of ['user','assistant']){
    const html=renderToStaticMarkup(React.createElement(FireScoutMessage,{message:{role,content:'<script>alert(1)</script><img onerror="bad()">'}}));
    assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<img'));
    assert.ok(html.includes('&lt;script&gt;'));
  }
});
test('shared Figma shell keeps legacy three panels and supports four mission panels plus Description',()=>{
  const charts=['map','wind','thermal'].map(id=>({id,title:id,children:id}));
  const normal=renderToStaticMarkup(React.createElement(FigmaDashboardContent,{metrics:[],charts,insight:'mission'}));
  assert.equal((normal.match(/class="fdb-chart"/g)||[]).length,3);
  assert.ok(!normal.includes('grid-column:1 / -1'));
  const fire=renderToStaticMarkup(React.createElement(FigmaDashboardContent,{metrics:[],charts,extraCharts:[{id:'confidence',title:'confidence',children:'%'}],insight:'Ask FireScout AI'}));
  assert.equal((fire.match(/class="fdb-chart"/g)||[]).length,4);
  assert.ok(fire.includes('Ask FireScout AI'));assert.ok(fire.includes('grid-column:1 / -1'));
});
