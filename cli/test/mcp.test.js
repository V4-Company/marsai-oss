import './helpers/lang.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { BUILTIN_PROVIDERS, collectProviders, configureMcp, statusMcp, doctorMcp, mcpDependencies, removeMcp } from '../src/mcp.js';
import { ACME_BI, realCatalog } from './helpers/fixtures.js';

// An invented provider: everything the installer knows about it is in this entry.
const ID = ACME_BI.id;
const dependencies = [ACME_BI];
const at = (url) => ({ [ID]: url });
function sandbox(t) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'marsai-mcp-'));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  return home;
}
function write(home, file, text) {
  const dest = path.join(home, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, text);
  return dest;
}
const cases = [
  ['codex', '.codex/config.toml', '# keep me\nmodel = "keep"\n[mcp_servers.other]\ncommand = "safe"\n', /\[mcp_servers.acme-bi\]/],
  ['claude', '.claude.json', '{"theme":"dark","mcpServers":{"other":{"command":"safe","env":{"KEY":"secret"}}}}', /"acme-bi"/],
  ['cursor', '.cursor/mcp.json', '{// keep me\n"mcpServers":{"other":{"command":"safe"}},}', /"acme-bi"/],
  ['opencode', '.config/opencode/opencode.jsonc', '{// keep me\n"mcp":{"other":{"type":"local","command":["safe"]}},}', /"acme-bi"/],
];
for (const [target, file, original, marker] of cases) {
  test(`${target}: merge preserves settings, credentials, comments and is idempotent`, (t) => {
    const home = sandbox(t);
    const dest = write(home, file, original);
    const opts = { home, target, dependencies, urls: at('https://analytics.example.test') };
    const first = configureMcp(opts);
    assert.equal(first.ok, true);
    assert.equal(first.results[0].state, 'auth-pending');
    assert.equal(first.results[0].name, 'Acme BI');
    const actual = fs.readFileSync(dest, 'utf8');
    assert.match(actual, marker);
    assert.match(actual, /safe/);
    if (original.includes('secret')) assert.match(actual, /secret/);
    if (original.includes('keep me')) assert.match(actual, /keep me/);
    assert.equal(configureMcp(opts).results[0].state, 'configured');
    assert.equal(fs.readFileSync(dest, 'utf8'), actual);
    assert.equal(statusMcp(opts).results[0].state, 'configured');
  });
}
test('a result keeps what happened apart from how to log in', (t) => {
  const added = configureMcp({ home: sandbox(t), target: 'codex', dependencies }).results[0];
  assert.equal(added.detail, 'MCP oficial configurado; autenticação e conexão pendentes.');
  assert.equal(added.login, 'codex mcp login acme-bi');
  assert.equal(added.message, `${added.detail} Autentique no cliente: codex mcp login acme-bi.`);
  const opencode = configureMcp({ home: sandbox(t), target: 'opencode', dependencies }).results[0];
  assert.equal(opencode.login, 'opencode mcp auth acme-bi');
  // Claude Code and Cursor log in from inside the app: there is a sentence, not a command.
  for (const target of ['claude', 'cursor']) {
    const home = sandbox(t);
    const first = configureMcp({ home, target, dependencies }).results[0];
    assert.equal(Object.hasOwn(first, 'login'), false, target);
    assert.equal(first.message.startsWith(`${first.detail} Abra `), true, target);
    const kept = configureMcp({ home, target, dependencies }).results[0];
    assert.equal(kept.detail, 'Configuração existente preservada; conexão ainda não verificada.');
  }
});
test('status without a connection is missing and never creates configuration', (t) => {
  const home = sandbox(t);
  const result = statusMcp({ home, target: 'codex', dependencies });
  assert.equal(result.results[0].state, 'missing');
  assert.equal(fs.existsSync(path.join(home, '.codex/config.toml')), false);
  assert.deepEqual(configureMcp({ home, target: 'codex', dependencies: [] }).results, []);
});
test('malformed config and credentials in URL fail without mutation or secret output', (t) => {
  const home = sandbox(t);
  const dest = write(home, '.cursor/mcp.json', '{invalid');
  assert.equal(configureMcp({ home, target: 'cursor', dependencies, urls: at('https://example.test') }).ok, false);
  assert.equal(fs.readFileSync(dest, 'utf8'), '{invalid');
  fs.unlinkSync(dest);
  for (const url of ['https://user:SUPERSECRET@example.test', 'https://example.test?token=SUPERSECRET']) {
    const result = configureMcp({ home, target: 'cursor', dependencies, urls: at(url) });
    assert.equal(result.ok, false);
    assert.doesNotMatch(JSON.stringify(result), /SUPERSECRET/);
    assert.equal(fs.existsSync(dest), false);
  }
});
test('existing stdio entry is preserved byte for byte, including credentials', (t) => {
  const home = sandbox(t);
  const original = '{"mcpServers":{"acme-bi":{"command":"legacy","env":{"TOKEN":"SUPERSECRET"}}}}';
  const dest = write(home, '.claude.json', original);
  const result = configureMcp({ home, target: 'claude', dependencies, urls: at('https://new.example.test') });
  assert.equal(result.results[0].state, 'configured');
  assert.equal(fs.readFileSync(dest, 'utf8'), original);
  assert.doesNotMatch(JSON.stringify(result), /SUPERSECRET/);
});
test('dry run makes no changes', (t) => {
  const home = sandbox(t);
  const result = configureMcp({ home, target: 'codex', dependencies, urls: at('https://example.test'), dryRun: true });
  assert.equal(result.results[0].changed, false);
  assert.equal(fs.existsSync(path.join(home, '.codex/config.toml')), false);
});
test('dependencies are read only from explicit validated manifest', (t) => {
  const root = sandbox(t);
  const demo = { name: 'demo', dir: path.join(root, 'demo') };
  write(root, 'demo/skills/example/SKILL.md', 'mentions acme-bi and linear');
  assert.deepEqual(mcpDependencies({ plugins: [demo] }).dependencies, []);
  write(root, 'demo/.marsai-dependencies.json', JSON.stringify({ schemaVersion: 1, mcp: dependencies }));
  assert.deepEqual(mcpDependencies({ plugins: [demo] }).dependencies, [
    { id: ID, skills: ['reports'], required: true, provider: ACME_BI.provider, access: ACME_BI.access },
  ]);
});
test('a provider is declared once and other plugins depend on it by id', (t) => {
  const root = sandbox(t);
  const owner = { name: 'owner', dir: path.join(root, 'owner') };
  const user = { name: 'user', dir: path.join(root, 'user') };
  write(root, 'owner/.marsai-dependencies.json', JSON.stringify({ schemaVersion: 1, mcp: dependencies }));
  write(root, 'user/skills/charts/.marsai-dependencies.json', JSON.stringify({ schemaVersion: 1, mcp: [{ id: ID, skills: ['charts'], required: false }] }));
  const providers = collectProviders([owner, user]);
  assert.deepEqual([...providers.keys()].sort(), [ID, 'linear']);
  assert.deepEqual(providers.get('linear'), { id: 'linear', provider: BUILTIN_PROVIDERS.linear });
  assert.deepEqual(mcpDependencies({ plugins: [user], providers }).dependencies, [
    { id: ID, skills: ['charts'], required: false, provider: ACME_BI.provider, access: ACME_BI.access },
  ]);
  assert.deepEqual(mcpDependencies({ plugins: [owner, user], providers }).dependencies[0].skills, ['reports', 'charts']);
  // Alone, the second plugin names a provider nobody declared.
  assert.equal(mcpDependencies({ plugins: [user] }).ok, false);
});
test('an undeclared provider and a malformed provider block are rejected', (t) => {
  const root = sandbox(t);
  const demo = { name: 'demo', dir: path.join(root, 'demo') };
  for (const entry of [
    { id: 'ghost', skills: ['x'] },
    { id: 'ghost', skills: ['x'], provider: { docs: 'https://ghost.test' } },
    { id: 'ghost', skills: ['x'], provider: { name: 'Ghost', path: 'no-slash' } },
    { id: 'ghost', skills: ['x'], provider: { name: 'Ghost' }, access: { contact: 'someone@ghost.test' } },
    { id: 'Ghost', skills: ['x'], provider: { name: 'Ghost' } },
  ]) {
    write(root, 'demo/.marsai-dependencies.json', JSON.stringify({ schemaVersion: 1, mcp: [entry] }));
    assert.equal(mcpDependencies({ plugins: [demo] }).ok, false, JSON.stringify(entry));
  }
  assert.equal(configureMcp({ home: root, target: 'codex', dependencies: [{ id: 'ghost', skills: ['x'] }] }).ok, false);
});
test('the provider route completes a base address and an accepted route is kept', (t) => {
  for (const [given, expected] of [
    ['https://bi.example.test', 'https://bi.example.test/api/bi-mcp'],
    ['https://bi.example.test/base/', 'https://bi.example.test/base/api/bi-mcp'],
    ['https://bi.example.test/api/mcp', 'https://bi.example.test/api/mcp'],
    ['https://bi.example.test/api/bi-mcp/', 'https://bi.example.test/api/bi-mcp/'],
  ]) {
    const home = sandbox(t);
    configureMcp({ home, target: 'cursor', dependencies, urls: at(given) });
    assert.equal(JSON.parse(fs.readFileSync(path.join(home, '.cursor/mcp.json'), 'utf8')).mcpServers[ID].url, expected);
  }
});
test('a provider with one fixed endpoint is written as given and recognized by that endpoint', (t) => {
  const notes = [{ id: 'acme-notes', skills: ['notes'], provider: { name: 'Acme Notes', url: 'https://notes.acme.test/mcp' } }];
  const home = sandbox(t);
  configureMcp({ home, target: 'cursor', dependencies: notes });
  assert.equal(JSON.parse(fs.readFileSync(path.join(home, '.cursor/mcp.json'), 'utf8')).mcpServers['acme-notes'].url, 'https://notes.acme.test/mcp');
  const other = sandbox(t);
  const original = '{"mcpServers":{"my-notes":{"url":"https://notes.acme.test/mcp"}}}';
  const dest = write(other, '.cursor/mcp.json', original);
  assert.equal(configureMcp({ home: other, target: 'cursor', dependencies: notes }).results[0].state, 'configured');
  assert.equal(fs.readFileSync(dest, 'utf8'), original);
});
test('a provider without an address asks for its own flag', (t) => {
  const home = sandbox(t);
  const { url, ...provider } = ACME_BI.provider;
  const result = configureMcp({ home, target: 'codex', dependencies: [{ ...ACME_BI, provider }] });
  assert.equal(result.results[0].state, 'missing');
  assert.match(result.results[0].message, /--acme-bi-url/);
  assert.match(result.results[0].message, /Peça a um admin para ligar o MCP\./);
  assert.equal(fs.existsSync(path.join(home, '.codex/config.toml')), false);
});
async function server(t, responder) {
  const instance = http.createServer(responder);
  await new Promise((resolve) => instance.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => { instance.closeAllConnections(); instance.close(resolve); }));
  return `http://127.0.0.1:${instance.address().port}`;
}
test('doctor verifies initialize and tools/list protocol, never calls tools', async (t) => {
  const home = sandbox(t);
  const calls = [];
  const url = await server(t, (req, res) => {
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      const rpc = JSON.parse(body);
      calls.push(rpc.method);
      res.setHeader('content-type', 'application/json');
      if (rpc.method === 'notifications/initialized') { res.writeHead(202).end(); return; }
      const result = rpc.method === 'initialize'
        ? { protocolVersion: '2025-03-26', capabilities: { tools: {} }, serverInfo: { name: 'test', version: '1' } }
        : { tools: [{ name: 'search', inputSchema: { type: 'object' } }] };
      res.end(JSON.stringify({ jsonrpc: '2.0', id: rpc.id, result }));
    });
  });
  configureMcp({ home, target: 'codex', dependencies, urls: at(url) });
  const result = await doctorMcp({ home, target: 'codex', dependencies });
  assert.equal(result.results[0].state, 'verified');
  assert.equal(result.results[0].toolCount, 1);
  assert.deepEqual(calls, ['initialize', 'notifications/initialized', 'tools/list']);
});
test('doctor reports authentication required and rejects HTTP HTML false success', async (t) => {
  const home = sandbox(t);
  let mode = 'auth';
  const url = await server(t, (req, res) => mode === 'auth' ? res.writeHead(401).end() : res.end('<html>login</html>'));
  configureMcp({ home, target: 'cursor', dependencies, urls: at(url) });
  assert.equal((await doctorMcp({ home, target: 'cursor', dependencies })).results[0].state, 'auth-pending');
  mode = 'html';
  assert.equal((await doctorMcp({ home, target: 'cursor', dependencies })).results[0].state, 'error');
});
test('doctor adds the provider setup hint when the server has no tools capability', async (t) => {
  const home = sandbox(t);
  const url = await server(t, (req, res) => {
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ jsonrpc: '2.0', id: JSON.parse(body).id, result: { protocolVersion: '2025-03-26', capabilities: {}, serverInfo: { name: 'old', version: '1' } } }));
    });
  });
  configureMcp({ home, target: 'cursor', dependencies, urls: at(url) });
  const result = await doctorMcp({ home, target: 'cursor', dependencies });
  assert.equal(result.results[0].state, 'error');
  assert.match(result.results[0].message, /sem capability tools\. Peça a um admin para ligar o MCP\./);
});
test('Linear installs only through explicit optional marsai-dev metadata', (t) => {
  const home = sandbox(t);
  const plugins = [realCatalog().plugins.get('marsai-dev')];
  const loaded = mcpDependencies({ plugins });
  assert.equal(loaded.ok, true);
  assert.deepEqual(loaded.dependencies, [{ id: 'linear', skills: ['to-spec', 'to-tickets', 'implement-spec', 'implement', 'code-review'], required: false, provider: BUILTIN_PROVIDERS.linear }]);
  const installed = configureMcp({ home, target: 'codex', plugins });
  assert.equal(installed.results[0].required, false);
  assert.equal(installed.results[0].state, 'auth-pending');
  assert.match(fs.readFileSync(path.join(home, '.codex/config.toml'), 'utf8'), /https:\/\/mcp.linear.app\/mcp/);
});
test('doctor handles SSE with session ID and has bounded request lifetime', async (t) => {
  const home = sandbox(t);
  const headers = [];
  const url = await server(t, (req, res) => {
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      const rpc = JSON.parse(body);
      headers.push(req.headers);
      if (rpc.method === 'notifications/initialized') { res.writeHead(202).end(); return; }
      res.setHeader('content-type', 'text/event-stream');
      res.setHeader('mcp-session-id', 'test-session');
      const result = rpc.method === 'initialize'
        ? { protocolVersion: '2025-03-26', capabilities: { tools: {} }, serverInfo: { name: 'mock', version: '1' } }
        : { tools: [{ name: 'read', inputSchema: { type: 'object' } }] };
      res.write(`event: message\r\ndata: ${JSON.stringify({jsonrpc:'2.0',id:rpc.id,result})}\r\n\r\n`);
      // Intentionally keep the SSE response open. The client must stop after its RPC response.
    });
  });
  configureMcp({ home, target: 'claude', dependencies, urls: at(url) });
  const result = await doctorMcp({ home, target: 'claude', dependencies, timeoutMs: 1000 });
  assert.equal(result.results[0].state, 'verified');
  assert.equal(headers[1]['mcp-session-id'], 'test-session');
  assert.equal(headers[2]['mcp-protocol-version'], '2025-03-26');
});
test('doctor does not mistake empty tools, RPC errors, timeouts or redirect for readiness', async (t) => {
  const home = sandbox(t);
  let mode = 'empty';
  const url = await server(t, (req, res) => {
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      if (mode === 'timeout') return;
      if (mode === 'redirect') { res.writeHead(302, { location: 'https://example.test' }).end(); return; }
      const rpc = JSON.parse(body);
      res.setHeader('content-type', 'application/json');
      if (rpc.method === 'notifications/initialized') { res.writeHead(202).end(); return; }
      if (mode === 'rpc-error') { res.end(JSON.stringify({jsonrpc:'2.0',id:rpc.id,error:{code:-32603,message:'SUPERSECRET'}})); return; }
      const result = rpc.method === 'initialize' ? { protocolVersion: '2025-03-26', capabilities: { tools: {} }, serverInfo: { name: 'mock', version: '1' } } : { tools: [] };
      res.end(JSON.stringify({jsonrpc:'2.0',id:rpc.id,result}));
    });
  });
  configureMcp({ home, target: 'cursor', dependencies, urls: at(url) });
  for (mode of ['empty', 'rpc-error', 'timeout', 'redirect']) {
    const result = await doctorMcp({ home, target: 'cursor', dependencies, timeoutMs: 50 });
    assert.equal(result.results[0].state, 'error', mode);
    assert.doesNotMatch(JSON.stringify(result), /SUPERSECRET/);
  }
});
test('JSON duplicate keys and malformed TOML are preserved, not overwritten', (t) => {
  const home = sandbox(t);
  for (const [target, file, original] of [
    ['cursor', '.cursor/mcp.json', '{"mcpServers":{},"mcpServers":{"private":{}}}'],
    ['codex', '.codex/config.toml', '[mcp_servers.private\nurl="secret"'],
  ]) {
    const dest = write(home, file, original);
    assert.equal(configureMcp({ home, target, dependencies, urls: at('https://example.test') }).ok, false);
    assert.equal(fs.readFileSync(dest, 'utf8'), original);
  }
});
test('symlink configuration is preserved without replacement', (t) => {
  const home = sandbox(t);
  const original = '{"mcpServers":{}}';
  const real = write(home, 'private.json', original);
  fs.mkdirSync(path.join(home, '.cursor'));
  const link = path.join(home, '.cursor/mcp.json');
  fs.symlinkSync(real, link);
  const result = configureMcp({ home, target: 'cursor', dependencies, urls: at('https://example.test') });
  assert.equal(result.ok, false);
  assert.equal(fs.lstatSync(link).isSymbolicLink(), true);
  assert.equal(fs.readFileSync(real, 'utf8'), original);
});
test('target-invalid remote entries never count as configured', (t) => {
  const home = sandbox(t);
  for (const [target, file, original] of [
    ['claude', '.claude.json', '{"mcpServers":{"acme-bi":{"url":"https://example.test"}}}'],
    ['opencode', '.config/opencode/opencode.json', '{"mcp":{"acme-bi":{"url":"https://example.test"}}}'],
    ['codex', '.codex/config.toml', '[mcp_servers.acme-bi]\nurl=""\n'],
  ]) {
    const dest = write(home, file, original);
    const result = statusMcp({ home, target, dependencies });
    assert.equal(result.results[0].state, 'error');
    assert.equal(fs.readFileSync(dest, 'utf8'), original);
  }
});
for (const [target, file, original] of cases) {
  test(`${target}: remove cleans only created unchanged MCP entry and keeps unrelated config`, (t) => {
    const home = sandbox(t);
    const dest = write(home, file, original);
    const opts = { home, target, dependencies, urls: at('https://example.test') };
    const installed = configureMcp(opts);
    assert.ok(installed.results[0].ownership?.fingerprint);
    assert.doesNotMatch(JSON.stringify(installed.results[0].ownership), /example.test|secret/);
    const updated = configureMcp({ ...opts, managed: installed.results });
    assert.deepEqual(updated.results[0].ownership, installed.results[0].ownership);
    const result = removeMcp({home,target,managed: updated.results});
    assert.equal(result.ok, true);
    assert.equal(result.results[0].state, 'removed');
    const remaining = fs.readFileSync(dest, 'utf8');
    assert.doesNotMatch(remaining, /api\/bi-mcp/);
    assert.match(remaining, /safe/);
    if (original.includes('keep me')) assert.match(remaining, /keep me/);
    if (original.includes('secret')) assert.match(remaining, /secret/);
  });
}
test('remove preserves pre-existing and user-edited MCP entries, including credentials', (t) => {
  const home = sandbox(t);
  const opts = {home,target:'cursor',dependencies,urls:at('https://example.test')};
  const installed = configureMcp(opts);
  const file = path.join(home,'.cursor/mcp.json');
  const edited = JSON.parse(fs.readFileSync(file,'utf8'));
  edited.mcpServers[ID].headers = {Authorization:'Bearer SUPERSECRET'};
  fs.writeFileSync(file, JSON.stringify(edited));
  const raw = fs.readFileSync(file,'utf8');
  const removal = removeMcp({home,target:'cursor',managed:installed.results});
  assert.equal(removal.results[0].state,'preserved');
  assert.equal(fs.readFileSync(file,'utf8'),raw);
  assert.doesNotMatch(JSON.stringify(removal),/SUPERSECRET/);
  assert.equal(configureMcp(opts).results[0].ownership,undefined);
  assert.deepEqual(removeMcp({home,target:'cursor',managed:configureMcp(opts).results}).results.map(r=>r.state),['preserved']);
});
test('remove never deletes matching TOML text inside an unrelated multiline string', (t) => {
  const home = sandbox(t);
  const unrelated = `note = '''\n[mcp_servers.acme-bi]\nurl = "https://example.test/api/bi-mcp"\n'''\n`;
  const file = write(home,'.codex/config.toml',unrelated);
  const installed = configureMcp({home,target:'codex',dependencies,urls:at('https://example.test')});
  const removed = removeMcp({home,target:'codex',managed:installed.results});
  assert.equal(removed.results[0].state,'removed');
  assert.equal(fs.readFileSync(file,'utf8').trim(),unrelated.trim());
});
test('reformatted TOML ownership is conservatively preserved and malformed JSON blocks removal', (t) => {
  const home = sandbox(t);
  const installed = configureMcp({home,target:'codex',dependencies,urls:at('https://example.test')});
  const file = path.join(home,'.codex/config.toml');
  fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace('url = ', 'url='));
  const changed = fs.readFileSync(file,'utf8');
  assert.equal(removeMcp({home,target:'codex',managed:installed.results}).results[0].state,'preserved');
  assert.equal(fs.readFileSync(file,'utf8'),changed);
  const cursor = configureMcp({home,target:'cursor',dependencies,urls:at('https://example.test')});
  const json = write(home,'.cursor/mcp.json','{broken');
  assert.equal(removeMcp({home,target:'cursor',managed:cursor.results}).ok,false);
  assert.equal(fs.readFileSync(json,'utf8'),'{broken');
});
for (const [target, file, original] of cases) {
  test(`${target}: the provider's own instance is configured without a URL flag`, t => {
    const home = sandbox(t);
    const dest = write(home, file, original);
    const result = configureMcp({home,target,dependencies});
    assert.equal(result.ok,true);
    assert.equal(result.results[0].state,'auth-pending');
    assert.match(fs.readFileSync(dest,'utf8'), /https:\/\/bi\.acme\.test\/api\/bi-mcp/);
    const before = fs.readFileSync(dest,'utf8');
    configureMcp({home,target,dependencies,urls:at('https://override.example.test/')});
    assert.equal(fs.readFileSync(dest,'utf8'),before);
  });
}
test('explicit address wins over the provider default for a new connection', t => {
  const home=sandbox(t);
  configureMcp({home,target:'cursor',dependencies,urls:at('https://override.example.test/')});
  const saved=JSON.parse(fs.readFileSync(path.join(home,'.cursor/mcp.json'),'utf8'));
  assert.equal(saved.mcpServers[ID].url,'https://override.example.test/api/bi-mcp');
});
