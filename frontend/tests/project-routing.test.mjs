import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Exercise the actual routing module without introducing a test framework.
const source = await readFile(new URL('../src/core/projects.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { projects, isProjectId, selectProject } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('only the three retained projects are selectable', () => {
  assert.deepEqual(projects.map(({ id }) => id), ['aquasense', 'factsafe', 'firescout']);
  for (const id of ['vitalchain', 'pulseguard', 'datacool', 'hirdop', 'pam', 'unknown', null, undefined]) {
    assert.equal(isProjectId(id), false);
  }
});

for (const id of ['aquasense', 'factsafe', 'firescout']) {
  test(`query selects ${id} and takes precedence over the environment`, () => {
    assert.equal(selectProject(`?other=1&project=${id}`, 'factsafe'), id);
  });
}

test('default is AquaSense with no supported selection', () => {
  assert.equal(selectProject(''), 'aquasense');
  assert.equal(selectProject('?project=unknown', 'removed'), 'aquasense');
  assert.equal(selectProject('?project=vitalchain'), 'aquasense');
});

test('supported environment project is the fallback for absent or invalid query', () => {
  for (const id of ['aquasense', 'factsafe', 'firescout']) {
    assert.equal(selectProject('', id), id);
    assert.equal(selectProject('?project=', id), id);
    assert.equal(selectProject('?project=unknown', id), id);
  }
});
