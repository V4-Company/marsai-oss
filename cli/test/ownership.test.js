import './helpers/lang.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { codexInstall, codexRemove } from '../src/codex.js';
import { cursorInstall, cursorRemove } from '../src/cursor.js';
import { opencodeInstall, opencodeRemove } from '../src/opencode.js';
import { recordTarget, removeTarget } from '../src/state.js';
import { PORTUGUESE, acmeRoot, legacyRulesFixture, pick } from './helpers/fixtures.js';

// Invented plugins: `acme-data` ships the skill `reports`.
const names = ['acme-core', 'acme-data'];
function sandbox(t) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'marsai-owned-'));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  return home;
}
function fixture(t, selected = names) {
  const { catalog } = acmeRoot(t);
  return { catalog, plugins: pick(catalog, ...selected) };
}
function write(home, file, text) {
  const dest = path.join(home, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, text);
  return dest;
}
for (const [target, install, remove, base] of [
  ['codex', codexInstall, codexRemove, '.agents/skills'],
  ['cursor', cursorInstall, cursorRemove, '.agents/skills'],
  ['opencode', opencodeInstall, opencodeRemove, '.config/opencode/skills'],
]) {
  test(`${target} never adopts an unowned skill on install/update/remove even with stale state`, (t) => {
    const home = sandbox(t);
    const { catalog, plugins } = fixture(t);
    const foreign = write(home, `${base}/reports/SKILL.md`, 'third-party custom skill');
    for (let i = 0; i < 2; i++) {
      const result = install(home, plugins, catalog);
      assert.equal(result.skills.includes('reports'), false);
      assert.ok(result.skills.includes('guide'));
      assert.ok(result.skipped.some((message) => message.includes('reports')));
      assert.equal(fs.readFileSync(foreign, 'utf8'), 'third-party custom skill');
      assert.equal(fs.existsSync(path.join(path.dirname(foreign), '.marsai')), false);
    }
    recordTarget(home, target, { plugins: names, skills: ['reports'] });
    remove(home);
    assert.equal(fs.readFileSync(foreign, 'utf8'), 'third-party custom skill');
  });
  test(`${target} refreshes owned directories and removes obsolete files`, (t) => {
    const home = sandbox(t);
    const { catalog, plugins } = fixture(t);
    const result = install(home, plugins, catalog);
    recordTarget(home, target, { ...result, plugins: names });
    const stale = write(home, `${base}/reports/obsolete.md`, 'old packaged file');
    install(home, plugins, catalog);
    assert.equal(fs.existsSync(stale), false);
    assert.ok(fs.existsSync(path.join(home, base, 'reports/SKILL.md')));
  });
}
test('shared skill survives removal of Codex while Cursor still owns it', (t) => {
  const home = sandbox(t);
  const { catalog, plugins } = fixture(t);
  recordTarget(home, 'codex', { ...codexInstall(home, plugins, catalog), plugins: names });
  recordTarget(home, 'cursor', { ...cursorInstall(home, plugins), plugins: names });
  const skill = path.join(home, '.agents/skills/reports/SKILL.md');
  codexRemove(home);
  removeTarget(home, 'codex');
  assert.equal(fs.existsSync(skill), true);
  cursorRemove(home);
  assert.equal(fs.existsSync(skill), false);
});
test('updating selection releases only own unused skill and preserves other target union', (t) => {
  const home = sandbox(t);
  const { catalog, plugins } = fixture(t);
  recordTarget(home, 'codex', { ...codexInstall(home, plugins, catalog), plugins: names });
  recordTarget(home, 'cursor', { ...cursorInstall(home, plugins), plugins: names });
  recordTarget(home, 'codex', { ...codexInstall(home, pick(catalog, 'acme-core'), catalog), plugins: ['acme-core'] });
  const skill = path.join(home, '.agents/skills/reports/SKILL.md');
  assert.equal(fs.existsSync(skill), true);
  cursorRemove(home);
  assert.equal(fs.existsSync(skill), false);
});
test('Cursor updates its marked agents and preserves foreign agents through removal', (t) => {
  const home = sandbox(t);
  const selected = ['acme-core', 'acme-dev'];
  const { plugins } = fixture(t, selected);
  const foreign = write(home, '.cursor/agents/builder.md', 'foreign agent');
  const first = cursorInstall(home, plugins);
  recordTarget(home, 'cursor', { ...first, plugins: selected });
  assert.equal(first.agents.includes('builder'), false);
  const agent = path.join(home, '.cursor/agents/planner.md');
  fs.appendFileSync(agent, '\nSTALE-OWNED\n');
  const updated = cursorInstall(home, plugins);
  assert.ok(updated.agents.includes('planner'));
  assert.doesNotMatch(fs.readFileSync(agent, 'utf8'), /STALE-OWNED/);
  recordTarget(home, 'cursor', { ...updated, agents: [...updated.agents, 'builder'], plugins: selected });
  cursorRemove(home);
  assert.equal(fs.readFileSync(foreign, 'utf8'), 'foreign agent');
});
test('foreign rules and symlinked skill directories are not overwritten or deleted', (t) => {
  const home = sandbox(t);
  const { catalog, plugins } = fixture(t);
  const rule = write(home, '.codex/marsai-AGENTS.md', 'foreign rules');
  const elsewhere = path.join(home, 'external');
  write(home, 'external/SKILL.md', 'foreign linked skill');
  fs.mkdirSync(path.join(home, '.agents/skills'), { recursive: true });
  fs.symlinkSync(elsewhere, path.join(home, '.agents/skills/reports'));
  const result = codexInstall(home, plugins, catalog);
  assert.equal(result.skills.includes('reports'), false);
  assert.equal(result.rules.includes('marsai-AGENTS.md'), false);
  assert.equal(fs.readFileSync(rule, 'utf8'), 'foreign rules');
  recordTarget(home, 'codex', { ...result, plugins: names });
  codexRemove(home);
  assert.equal(fs.readFileSync(rule, 'utf8'), 'foreign rules');
  assert.equal(fs.readFileSync(path.join(elsewhere, 'SKILL.md'), 'utf8'), 'foreign linked skill');
});
test('legacy shared marker uses both recorded owners, while unrelated legacy skills survive removal', (t) => {
  const home = sandbox(t);
  write(home, '.agents/skills/reports/SKILL.md', 'legacy packaged skill');
  write(home, '.agents/skills/reports/.marsai', 'installed-by: marsai\n');
  write(home, '.agents/skills/unrelated/SKILL.md', 'unrelated installation');
  write(home, '.agents/skills/unrelated/.marsai', 'installed-by: marsai\n');
  recordTarget(home, 'codex', { plugins: names, skills: ['reports'] });
  recordTarget(home, 'cursor', { plugins: names, skills: ['reports'] });
  const result = codexRemove(home);
  assert.equal(fs.existsSync(path.join(home, '.agents/skills/reports/SKILL.md')), true);
  assert.equal(result.removedSkills.includes('reports'), false);
  assert.equal(fs.existsSync(path.join(home, '.agents/skills/unrelated/SKILL.md')), true);
});
test('the Codex rules file is written in English: the flow, each skill under its plugin, the base version and the root repository', (t) => {
  const home = sandbox(t);
  const { catalog, plugins } = fixture(t, ['acme-core', 'acme-data', 'acme-dev']);
  codexInstall(home, plugins, catalog);
  const rules = fs.readFileSync(path.join(home, '.codex/marsai-AGENTS.md'), 'utf8');
  assert.equal(rules, [
    '# MarsAI (Acme)',
    '',
    'Version 2.0.0 - installed by the MarsAI installer.',
    '',
    'How this flow works:',
    '',
    '1. Production code changes go through `marsai-dev:implement-spec` (a spec with slices) or `marsai-dev:implement` (a single slice): implementer first, then review.',
    '2. The map of the flow is the `using-marsai` skill. Read it when the person asks where to start, which skill to use or what the next step is.',
    '3. History stays linear: integrate with `git rebase <base>` and `git push --force-with-lease`, not with `git merge`.',
    '4. Talk to the person in their language. Write specs, tickets, pull requests and commits in the language the repository already uses.',
    '',
    'MarsAI skills installed in `~/.agents/skills/` (Codex USER scope):',
    '',
    '- `acme-core:guide`: see ~/.agents/skills/guide/SKILL.md',
    '- `acme-data:reports`: see ~/.agents/skills/reports/SKILL.md',
    '- `acme-data:reports-help`: see ~/.agents/skills/reports-help/SKILL.md',
    '- `acme-dev:craft`: see ~/.agents/skills/craft/SKILL.md',
    '',
    'Full docs: https://github.com/acme/kit',
    '',
    'installed-by: marsai',
    '',
  ].join('\n'));
  assert.doesNotMatch(rules, PORTUGUESE);
});
test('3.3 Codex rules migrate only with state ownership and exact legacy bytes', (t) => {
  const selected = ['acme-core', 'acme-dev'];
  const legacy = legacyRulesFixture();
  for (const modified of [false, true]) {
    const home = sandbox(t);
    const { catalog, plugins } = fixture(t, selected);
    const original = legacy + (modified ? '\nUser customization\n' : '');
    const rules = write(home, '.codex/marsai-AGENTS.md', original);
    recordTarget(home, 'codex', { plugins: selected, version: '3.3.0', rules: ['marsai-AGENTS.md'] });
    const result = codexInstall(home, plugins, catalog);
    assert.equal(result.rules.includes('marsai-AGENTS.md'), !modified);
    const after = fs.readFileSync(rules, 'utf8');
    if (modified) assert.equal(after, original);
    else {
      // The old Portuguese file gives way to the current English one.
      assert.match(after, /^# MarsAI \(Acme\)\n\nVersion 2\.0\.0 - installed by the MarsAI installer\.\n\nHow this flow works:\n/);
      assert.match(after, /\ninstalled-by: marsai\n$/);
      assert.doesNotMatch(after, PORTUGUESE);
    }
  }
  const home = sandbox(t);
  const { catalog, plugins } = fixture(t, selected);
  const rules = write(home, '.codex/marsai-AGENTS.md', legacy);
  const result = codexInstall(home, plugins, catalog);
  assert.equal(result.rules.includes('marsai-AGENTS.md'), false, 'same bytes without saved ownership must remain untouched');
  assert.equal(fs.readFileSync(rules, 'utf8'), legacy);
});
test('3.3 Codex rules are not claimed when a saved plugin declares no legacy skills or is unknown', (t) => {
  const legacy = legacyRulesFixture();
  for (const saved of [['acme-core', 'acme-dev', 'acme-data'], ['acme-core', 'acme-dev', 'acme-gone']]) {
    const home = sandbox(t);
    const { catalog, plugins } = fixture(t, ['acme-core', 'acme-dev']);
    const rules = write(home, '.codex/marsai-AGENTS.md', legacy);
    recordTarget(home, 'codex', { plugins: saved, version: '3.3.0', rules: ['marsai-AGENTS.md'] });
    const result = codexInstall(home, plugins, catalog);
    assert.equal(result.rules.includes('marsai-AGENTS.md'), false, saved.join(','));
    assert.equal(fs.readFileSync(rules, 'utf8'), legacy);
  }
});
