import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

async function loadSource(relative, jsx = false) {
  let source = await readFile(new URL(relative, import.meta.url), 'utf8');
  source = source.replace(/import '\.\/figma-dashboard.css';/, '');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.React } });
  const prefix = jsx ? `import React from '${import.meta.resolve('react')}';\n` : '';
  return import(`data:text/javascript;base64,${Buffer.from(prefix + outputText).toString('base64')}`);
}
const { appendTelemetry, elapsedAxis, displayValue } = await loadSource('../src/core/utils/telemetryPresentation.ts');
const { MetricCard } = await loadSource('../src/core/components/FigmaDashboard/index.tsx', true);
const { aquasenseConfig: aqua } = await loadSource('../src/projects/aquasense/config.ts');
const { factsafeConfig: factory } = await loadSource('../src/projects/factsafe/config.ts');
const sample = (seconds, project = 'aquasense', sessionId = 's1') => ({ project, sessionId, elapsedSimSeconds: seconds, historyBucketSeconds: 10, metrics: { do_mg_l: 6 }, timestamp: String(seconds) });

test('session history keeps full two-hour coverage from real samples and latest value', () => {
  let points=[];
  for(let t=0;t<=7200;t++)points=appendTelemetry(points,sample(t));
  assert.ok(points.length<=1000);
  assert.equal(points[0].elapsedSimSeconds,0);
  assert.equal(points.at(-1).elapsedSimSeconds,7200);
  assert.equal(points.at(-1).timestamp,'7200');
  for(const t of [1200,2400,3600,4800,6000])assert.ok(points.some(p=>Math.abs(p.elapsedSimSeconds-t)<10));
  assert.equal(appendTelemetry(points,sample(0,'factsafe','s2')).length,1);
});

test('short and long minute axes start at zero and never repeat rounded tick labels', () => {
  for(const end of [.0001,.1,1,30,450,3600,7200]){
    const axis=elapsedAxis([sample(end)],'minutes');
    assert.equal(axis.domain[0],0);
    assert.equal(new Set(axis.ticks.map(axis.format)).size,axis.ticks.length);
    assert.ok(axis.domain[1]>=end/60);
  }
});

test('actual metric card renders missing as dash and preserves a genuine zero', () => {
  for(const value of [undefined,NaN,Infinity]){
    const html=renderToStaticMarkup(React.createElement(MetricCard,{id:'do_mg_l',label:'Dissolved oxygen',value:displayValue(value,2),unit:'mg/L',status:'No telemetry'}));
    assert.ok(html.includes('—'));assert.ok(html.includes('mg/L'));assert.ok(!html.includes('0.00'));
  }
  assert.equal(displayValue(0,2),'0.00');
});

test('project metrics keep physical units separate and risk has integer display precision', () => {
  for(const [config,key,unit] of [[aqua,'do_mg_l','mg/L'],[aqua,'water_temperature_c','°C'],[aqua,'ph',''],[factory,'nh3_ppm','ppm'],[factory,'pm25_ug_m3','µg/m³'],[factory,'risk_score','demo score']]){
    const metric=config.metrics.find(m=>m.key===key);assert.ok(metric);assert.equal(metric.unit,unit);
  }
  assert.equal(factory.metrics.find(m=>m.key==='risk_score').precision,0);
});

test('AquaSense continuous retention and viewport advance independently beyond 120 minutes', async () => {
  const { visibleTelemetry } = await loadSource('../src/core/utils/telemetryPresentation.ts');
  let points=[];
  for(let t=0;t<=172800;t+=30)points=appendTelemetry(points,{
    ...sample(t),historyBucketSeconds:30,historyRetentionSeconds:21600,historyMaxPoints:1000});
  assert.ok(points.length<=722);
  assert.ok(points[0].elapsedSimSeconds>=172800-21600);
  assert.equal(points.at(-1).elapsedSimSeconds,172800);
  const axis=elapsedAxis(points,'minutes',3600);
  assert.deepEqual(axis.domain,[2820,2880]);
  assert.equal(new Set(axis.ticks.map(axis.format)).size,6);
  const visible=visibleTelemetry(points,3600);
  assert.ok(visible.length<=122);
  assert.ok(visible[0].elapsedSimSeconds>=172800-3630);
  assert.equal(visible.at(-1),points.at(-1));
  assert.equal(aqua.chartWindowSeconds,3600);
  assert.equal(factory.chartWindowSeconds,undefined);
  for(let t=172801;t<=174000;t++)points=appendTelemetry(points,{
    ...sample(t),historyBucketSeconds:1,historyRetentionSeconds:21600,historyMaxPoints:50});
  assert.equal(points.length,50);
  assert.deepEqual(appendTelemetry(points,{...sample(0),sessionId:'reset'}).map(p=>p.elapsedSimSeconds),[0]);
});

test('pruning the actual telemetry store preserves event and alert stores', async () => {
  const helper=await readFile(new URL('../src/core/utils/telemetryPresentation.ts',import.meta.url),'utf8');
  const helperJS=ts.transpileModule(helper,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
  const helperURL=`data:text/javascript;base64,${Buffer.from(helperJS).toString('base64')}`;
  let source=await readFile(new URL('../src/core/store.ts',import.meta.url),'utf8');
  source=source.replace("'./utils/telemetryPresentation'",JSON.stringify(helperURL)).replace("'zustand'",JSON.stringify(import.meta.resolve('zustand')));
  const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
  const stores=await import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`);
  const event={type:'critical_entered',elapsedSimSeconds:4800,project:'aquasense',sessionId:'s1'};
  stores.useTimelineStore.getState().addEvent(event);
  const alert={id:'critical',severity:'critical',project:'aquasense',sessionId:'s1'};
  stores.useAlertStore.getState().addAlert(alert);
  for(let t=0;t<=86400;t+=30)stores.useTelemetryStore.getState().addTelemetry({
    ...sample(t),historyBucketSeconds:30,historyRetentionSeconds:21600,historyMaxPoints:1000});
  assert.ok(stores.useTelemetryStore.getState().telemetry[0].elapsedSimSeconds>4800);
  assert.deepEqual(stores.useTimelineStore.getState().events,[event]);
  assert.deepEqual(stores.useAlertStore.getState().alerts,[alert]);
});
