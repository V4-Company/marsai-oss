import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import { map as pt } from '../content/pt/map.mjs';
import { map as en } from '../content/en/map.mjs';

// Exercise the functions shipped to the browser, without a second implementation.
const app = fs.readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const engine = app.split('// BEGIN MAP PATH ENGINE')[1].split('// END MAP PATH ENGINE')[0].replace(/^ \(also exercised[^\n]*\n/, '');
const api = vm.runInNewContext(`${engine}\n({mapTrunk, mapChoices, mapRoute, mapSkipped, advanceMap, chooseMap, replayMap})`);
const list = (value) => Array.from(value);
const fresh = map => ({ path: list(api.mapTrunk(map)), step: 0, closed: false });
const id = state => state.path[state.step];
const scenario = (map, name) => map.scenarios.find(s => s.id === name);
const until = (map, state, target) => {
  for (let limit = 0; id(state) !== target && limit < 100; limit++) {
    assert.equal(api.advanceMap(map, state, 1), true, `Unexpected stop at ${id(state)}`);
  }
  assert.equal(id(state), target);
};
const choose = (map, state, target) => {
  const index = api.mapChoices(map, id(state)).findIndex(o => o.goto === target);
  assert.ok(index >= 0, `${id(state)} has no route to ${target}`);
  assert.equal(api.chooseMap(map, state, index), true);
};
const GATES = ['g0', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6'];
// What each shortcut leaves out of the complete path.
const SHORTCUTS = [
  ['bug', 'd-small', 'implement', ['g0', 'intent', 'g1', 'grill', 'd-how', 'g2', 'demo', 'g3', 'spec', 'g4', 'tickets', 'implement-spec']],
  ['how', 'd-how', 'spec', ['g2', 'demo', 'g3']],
  ['slices', 'comecar', 'implement-spec', ['problema', 'd-small', 'g0', 'intent', 'g1', 'grill', 'd-how', 'g2', 'demo', 'g3', 'spec', 'g4', 'tickets']],
  ['pr', 'comecar', 'babysit', ['problema', 'd-small', 'g0', 'intent', 'g1', 'grill', 'd-how', 'g2', 'demo', 'g3', 'spec', 'g4', 'tickets', 'implement-spec', 'implementador', 'checks', 'review', 'pr']],
];

for (const [lang, map] of [['pt', pt], ['en', en]]) {
  test(`${lang}: Next walks every step of the complete path with no answer`, () => {
    const state = fresh(map), visited = [id(state)];
    while (api.advanceMap(map, state, 1)) visited.push(id(state));
    assert.deepEqual(visited, list(scenario(map, 'feature').path));
    assert.equal(visited.at(-1), 'retro');
    assert.deepEqual(visited.filter(step => GATES.includes(step)), GATES);
    assert.deepEqual(visited.filter(step => step.startsWith('d-')), ['d-small', 'd-how']);
    assert.equal(api.mapRoute(state.path), 'feature');
    assert.deepEqual(list(api.mapSkipped(map, state.path)), []);
    // Every step drawn on the map is on the complete path or hangs from it as a detour.
    const detours = map.nodes.map(n => n.id).filter(step => !visited.includes(step));
    assert.deepEqual(detours.sort(), ['babysit', 'implement', 'wayfinder']);
  });

  test(`${lang}: each shortcut leaves its decision, skips its steps and reaches the end`, () => {
    for (const [route, from, to, skipped] of SHORTCUTS) {
      const state = fresh(map);
      until(map, state, from);
      choose(map, state, to);
      assert.equal(id(state), to);
      assert.equal(api.mapRoute(state.path), route);
      assert.deepEqual(list(state.path), list(scenario(map, route).path), `${route} differs from its named path`);
      assert.deepEqual(list(api.mapSkipped(map, state.path)), skipped);
      until(map, state, 'retro');
    }
  });

  test(`${lang}: the other answer puts the journey back on the complete path`, () => {
    for (const [, from, to] of SHORTCUTS) {
      const state = fresh(map);
      until(map, state, from);
      const onward = state.path[state.step + 1];
      choose(map, state, to);
      assert.equal(api.advanceMap(map, state, -1), true);
      assert.equal(id(state), from);
      // Next keeps the answer that was given; the other option replaces it.
      assert.equal(state.path[state.step + 1], to);
      choose(map, state, onward);
      assert.deepEqual(list(state.path), list(api.mapTrunk(map)));
      assert.equal(api.mapRoute(state.path), 'feature');
    }
  });

  test(`${lang}: a named path opens as written and a visited trail rebuilds it`, () => {
    for (const named of map.scenarios) {
      const state = api.replayMap(map, fresh(map), list(named.path));
      assert.deepEqual(list(state.path), list(named.path), named.id);
      assert.equal(state.step, named.path.length - 1);
      assert.equal(api.mapRoute(state.path), named.id);
    }
    const partial = api.replayMap(map, fresh(map), ['comecar', 'problema', 'd-small', 'implement']);
    assert.equal(id(partial), 'implement');
    // A trail with a step that is not a way out stops at the last legal step.
    const broken = api.replayMap(map, fresh(map), ['comecar', 'problema', 'retro']);
    assert.equal(id(broken), 'problema');
    assert.deepEqual(list(broken.path), list(api.mapTrunk(map)));
  });

  test(`${lang}: failures and feedback loop back without ending the journey`, () => {
    const state = fresh(map);
    until(map, state, 'checks');
    choose(map, state, 'implementador');
    until(map, state, 'checks');
    until(map, state, 'ci');
    choose(map, state, 'babysit');
    until(map, state, 'bot');
    choose(map, state, 'babysit');
    until(map, state, 'humano');
    choose(map, state, 'babysit');
    until(map, state, 'g5');
    choose(map, state, 'babysit');
    until(map, state, 'retro');
    const walked = state.path.slice(0, state.step + 1);
    assert.equal(walked.filter(step => step === 'checks').length, 2);
    assert.equal(walked.filter(step => step === 'babysit').length, 4);
  });

  test(`${lang}: Wayfinder and the gates send the work back and it goes on`, () => {
    const state = fresh(map);
    until(map, state, 'grill');
    choose(map, state, 'wayfinder');
    assert.equal(api.mapRoute(state.path), 'large');
    until(map, state, 'g2');
    choose(map, state, 'grill');
    until(map, state, 'g3');
    choose(map, state, 'demo');
    until(map, state, 'g3');
    choose(map, state, 'grill');
    until(map, state, 'retro');
    const walked = state.path.slice(0, state.step + 1);
    // The demo is built, adjusted, and built again after the grill is reopened. The intent stays as written.
    assert.equal(walked.filter(step => step === 'demo').length, 3);
    assert.equal(walked.filter(step => step === 'intent').length, 1);
    assert.equal(walked.filter(step => step === 'grill').length, 4);
  });

  test(`${lang}: archiving the problem stops the journey until the person goes back`, () => {
    const state = fresh(map);
    until(map, state, 'g0');
    const archive = api.mapChoices(map, 'g0').findIndex(o => !o.goto);
    assert.ok(archive >= 0);
    assert.equal(api.chooseMap(map, state, archive), true);
    assert.equal(state.closed, true);
    assert.equal(api.advanceMap(map, state, 1), false);
    assert.equal(api.advanceMap(map, state, -1), true);
    assert.equal(state.closed, false);
    assert.equal(id(state), 'g0');
    until(map, state, 'retro');
  });

  test(`${lang}: dropping the idea at the verdict on the demo stops the journey until the person goes back`, () => {
    const state = fresh(map);
    until(map, state, 'g3');
    // The verdict goes on to hardening, to another demo or back to the grill; one exit ends the idea.
    assert.deepEqual(api.mapChoices(map, 'g3').map(o => o.goto), ['spec', 'demo', 'grill', undefined]);
    const drop = api.mapChoices(map, 'g3').findIndex(o => !o.goto);
    assert.ok(drop >= 0);
    assert.equal(api.chooseMap(map, state, drop), true);
    assert.equal(state.closed, true);
    assert.equal(api.advanceMap(map, state, 1), false);
    assert.equal(api.advanceMap(map, state, -1), true);
    assert.equal(state.closed, false);
    assert.equal(id(state), 'g3');
    until(map, state, 'retro');
  });

  test(`${lang}: every step, answer and turn of the journey is drawn`, () => {
    const ids = new Set(map.nodes.map(n => n.id));
    const drawn = new Set(map.edges.map(e => `${e.from}>${e.to}`));
    for (const e of map.edges) assert.ok(ids.has(e.from) && ids.has(e.to), `edge ${e.from}>${e.to} names a missing step`);
    for (const node of map.nodes) {
      assert.ok(node.kind === 'gate' ? map.gates[node.id] : map.details[node.id], `${node.id} has no detail`);
      for (const option of api.mapChoices(map, node.id)) {
        if (!option.goto) continue;
        assert.ok(ids.has(option.goto), `${node.id} leads to a missing step: ${option.goto}`);
        assert.ok(drawn.has(`${node.id}>${option.goto}`), `no line from ${node.id} to ${option.goto}`);
      }
    }
    for (const named of map.scenarios) {
      named.path.slice(1).forEach((to, i) => assert.ok(drawn.has(`${named.path[i]}>${to}`), `${named.id}: no line from ${named.path[i]} to ${to}`));
    }
  });

  test(`${lang}: a routing decision stays on the complete path or takes one coloured shortcut`, () => {
    const routing = map.nodes.filter(n => n.kind === 'routing');
    assert.deepEqual(routing.map(n => n.id), ['d-small', 'd-how']);
    const trunk = list(api.mapTrunk(map));
    for (const node of routing) {
      const options = list(api.mapChoices(map, node.id));
      assert.equal(options.length, 2);
      const [stay, leave] = options;
      assert.equal(stay.goto, trunk[trunk.indexOf(node.id) + 1]);
      assert.equal(stay.path, undefined);
      const edge = map.edges.find(e => e.from === node.id && e.to === leave.goto);
      assert.equal(edge.shortcut, leave.path);
      assert.ok(edge.note && !edge.jump, `${node.id}: the shortcut is always drawn, with its name`);
    }
  });
}

test('both languages draw the same map', () => {
  const shape = map => ({
    nodes: map.nodes.map(({ label, tag, ...rest }) => rest),
    edges: map.edges.map(({ label, note, ...rest }) => rest),
    scenarios: map.scenarios.map(s => [s.id, s.path]),
    rows: map.rowY,
  });
  assert.deepEqual(shape(en), shape(pt));
});
