import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

function loadSource(path, parent = import.meta.url) {
  const url = new URL(path, parent);
  const source = readFileSync(url, 'utf8');
  const require = (specifier) => specifier.startsWith('.')
    ? loadSource(specifier + '.ts', url) : createRequire(url)(specifier);
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', outputText)(require, module, module.exports);
  return module.exports;
}
const { AlertMessage } = await loadSource('../src/core/components/AlertMessage.tsx');
const { selectActiveAlert } = await loadSource('../src/core/utils/activeAlert.ts');
const render = (props) => renderToStaticMarkup(React.createElement(AlertMessage, props));
const state = (project, extra = {}) => ({ project, sessionId: 'current', status: 'running', phase: 'warning', ...extra });
const alert = (project, extra = {}) => ({ project, sessionId: 'current', severity: 'warning', type: 'threshold_exceeded', message: 'Actual event message', ...extra });
const event = (type, extra = {}) => ({ project: 'firescout', sessionId: 'current', type, severity: 'warning', message: type, ...extra });

test('default error uses reference colors, centered text and urgent semantics', () => {
  const html = render({ message: 'Configurable event', className: 'custom-alert' });
  for (const value of ['Configurable event', 'class="custom-alert"', 'role="alert"', 'aria-atomic="true"',
    'background:#FFAB9E', 'border-color:#ED3028', 'border-width:2px', 'border-radius:6px',
    'text-align:center', 'width:100%', 'overflow-wrap:anywhere']) assert.ok(html.includes(value), value);
});

test('all non-error severities use non-interruptive status semantics and consistent structure', () => {
  for (const severity of ['warning', 'success', 'info']) {
    const html = render({ message: severity, severity });
    assert.match(html, /role="status"/);
    assert.match(html, /border-width:2px/);
    assert.match(html, /border-radius:6px/);
  }
});

test('hidden or empty messages render nothing; long messages and markup remain plain text', () => {
  assert.equal(render({ message: 'Hidden', visible: false }), '');
  assert.equal(render({ message: ' \n ' }), '');
  const message = '<script>event</script> ' + 'long message '.repeat(100);
  const html = render({ message });
  assert.ok(html.includes('&lt;script&gt;event&lt;/script&gt;'));
  assert.ok(html.includes('long message '.repeat(100)));
  assert.match(html, /white-space:pre-wrap/);
});

for (const project of ['aquasense', 'factsafe']) {
  test(`${project} follows actual event text and severity, then hides on recovery or reset`, () => {
    const warning = alert(project);
    assert.deepEqual(selectActiveAlert(project, warning, state(project), []), { message: warning.message, severity: 'warning' });
    const critical = alert(project, { severity: 'critical', message: 'New critical event' });
    assert.deepEqual(selectActiveAlert(project, critical, state(project, { phase: 'critical' }), []), { message: critical.message, severity: 'error' });
    assert.equal(selectActiveAlert(project, critical, state(project, { phase: 'normal' }), []), null);
    assert.equal(selectActiveAlert(project, critical, state(project, { status: 'stopped' }), []), null);
    assert.equal(selectActiveAlert(project, null, state(project), []), null);
    assert.equal(selectActiveAlert(project, critical, state(project, { sessionId: 'new' }), []), null);
    assert.equal(selectActiveAlert(project, alert('other-project'), state(project), []), null);
  });
}

test('FireScout prioritizes link faults and follows degraded, lost and recovered events', () => {
  const events = [event('candidate_detected'), event('link_degraded'), event('link_lost', { severity: 'critical', message: 'Actual UAV link failure' })];
  assert.deepEqual(selectActiveAlert('firescout', null, state('firescout'), events), { message: 'link_degraded', severity: 'warning' });
  assert.deepEqual(selectActiveAlert('firescout', null, state('firescout', { phase: 'critical', candidateDetected: true }), events), { message: 'Actual UAV link failure', severity: 'error' });
  assert.equal(selectActiveAlert('firescout', null, state('firescout', { phase: 'normal' }), events), null);
  assert.equal(selectActiveAlert('firescout', null, state('firescout', { sessionId: 'new' }), events), null);
  assert.equal(selectActiveAlert('firescout', null, state('firescout', { status: 'stopped' }), events), null);
});

test('FireScout detection messages require an active flag and current-session event', () => {
  const events = [event('candidate_detected'), event('hotspot_detected')];
  for (const [flag, type] of [['candidateDetected', 'candidate_detected'], ['hotspotDetected', 'hotspot_detected']]) {
    assert.deepEqual(selectActiveAlert('firescout', null, state('firescout', { phase: 'early_signal', [flag]: true }), events), { message: type, severity: 'warning' });
  }
  assert.equal(selectActiveAlert('firescout', null, state('firescout', { phase: 'normal' }), events), null);
  assert.equal(selectActiveAlert('firescout', null, null, events), null);
});

test('selection leaves event history untouched across repeated telemetry renders', () => {
  const events = Object.freeze([Object.freeze(event('link_lost', { severity: 'critical' }))]);
  const snapshot = JSON.stringify(events);
  for (let i = 0; i < 1000; i++) selectActiveAlert('firescout', null, state('firescout', { phase: 'critical' }), events);
  assert.equal(JSON.stringify(events), snapshot);
});

test('clearing the active alert preserves Logs; clearing a session also removes its banner', async () => {
  const { useAlertStore, useTimelineStore } = await loadSource('../src/core/store.ts');
  const warning = alert('aquasense', { id: 'event-1' });
  useAlertStore.getState().addAlert(warning);
  useTimelineStore.getState().addEvent(event('warning_entered', { project: 'aquasense' }));
  useAlertStore.getState().clearCurrentAlert();
  assert.equal(useAlertStore.getState().currentAlert, null);
  assert.equal(useAlertStore.getState().alerts.length, 1);
  assert.equal(useTimelineStore.getState().events.length, 1);
  useAlertStore.getState().setCurrentAlert(warning);
  useAlertStore.getState().clearAlerts();
  assert.equal(useAlertStore.getState().currentAlert, null);
  assert.equal(useAlertStore.getState().alerts.length, 0);
});
