import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import TOML from '@iarna/toml';
import { parse, parseTree, modify, applyEdits } from 'jsonc-parser';
import { isLocalized, localized, t } from './i18n.js';

// Providers every root may depend on by id. Any other provider is declared by the
// plugin that needs it, in the `provider` key of its `.marsai-dependencies.json` entry.
// These are provider-owned transports, not similarly named third-party packages.
export const BUILTIN_PROVIDERS = Object.freeze({
  linear: Object.freeze({ name: 'Linear', docs: 'https://linear.app/docs/mcp', auth: 'oauth', url: 'https://mcp.linear.app/mcp' }),
});
const TARGETS = {
  codex: { file: '.codex/config.toml', key: 'mcp_servers', toml: true },
  claude: { file: '.claude.json', key: 'mcpServers' },
  cursor: { file: '.cursor/mcp.json', key: 'mcpServers' },
  opencode: { file: '.config/opencode/opencode.json', key: 'mcp' },
};
const SLUG = /^[a-z0-9][a-z0-9-]*$/;
const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const failure = (message) => ({ ok: false, message, results: [] });
const slug = (value) => typeof value === 'string' && SLUG.test(value);
const filled = (value) => typeof value === 'string' && value.trim().length > 0;
const optional = (value, check) => value === undefined || check(value);
const routePath = (value) => typeof value === 'string' && value.startsWith('/');

/** Where the server lives and how the client reaches it. `url` may be a base that `path` completes. */
function validProvider(provider) {
  return record(provider) && filled(provider.name) && optional(provider.docs, filled) && optional(provider.auth, filled) &&
    optional(provider.url, filled) && optional(provider.path, routePath) &&
    optional(provider.acceptedPaths, (paths) => Array.isArray(paths) && paths.every(routePath)) &&
    optional(provider.setupHint, isLocalized);
}
/** A gated provider: the installer asks the question and names who grants access. */
function validAccess(access) {
  return record(access) && isLocalized(access.question) && optional(access.notice, isLocalized) && optional(access.contact, filled);
}
function validDependency(dep) {
  return record(dep) && slug(dep.id) && optional(dep.required, (value) => typeof value === 'boolean') &&
    Array.isArray(dep.skills) && dep.skills.length > 0 && dep.skills.every(slug) &&
    optional(dep.provider, validProvider) && optional(dep.access, validAccess);
}
/** Entries of the plugin's manifests: its own and one per skill folder. */
function readManifests(plugin) {
  if (!slug(plugin?.name)) return failure(t('mcp.badPluginName'));
  const files = [path.join(plugin.dir, '.marsai-dependencies.json')];
  const skills = path.join(plugin.dir, 'skills');
  if (fs.existsSync(skills)) {
    for (const entry of fs.readdirSync(skills, { withFileTypes: true })) {
      if (entry.isDirectory()) files.push(path.join(skills, entry.name, '.marsai-dependencies.json'));
    }
  }
  const entries = [];
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.mcp)) return failure(t('mcp.badManifest'));
    for (const dep of manifest.mcp) {
      if (!validDependency(dep)) return failure(t('mcp.badDependency'));
      entries.push(dep);
    }
  }
  return { ok: true, entries };
}
/**
 * Every provider the given plugins declare, plus the built-in ones. The first
 * declaration of an id wins, so a second plugin can depend on it by id alone.
 * @returns {Map<string, { id: string, provider: object, access?: object }>}
 */
export function collectProviders(plugins = []) {
  const known = new Map(Object.entries(BUILTIN_PROVIDERS).map(([id, provider]) => [id, { id, provider }]));
  for (const plugin of plugins) {
    let loaded;
    try { loaded = readManifests(plugin); } catch { continue; }
    if (!loaded.ok) continue;
    for (const dep of loaded.entries) {
      const entry = known.get(dep.id) ?? { id: dep.id };
      entry.provider ??= dep.provider;
      entry.access ??= dep.access;
      known.set(dep.id, entry);
    }
  }
  for (const [id, entry] of known) {
    if (!entry.provider) known.delete(id);
    else if (!entry.access) delete entry.access;
  }
  return known;
}

/** Explicit, versioned metadata only. Skill prose is never executable dependency input. */
export function mcpDependencies({ plugins = [], providers } = {}) {
  try {
    const known = providers ?? collectProviders(plugins);
    const unique = new Map();
    for (const plugin of plugins) {
      const loaded = readManifests(plugin);
      if (!loaded.ok) return loaded;
      for (const dep of loaded.entries) {
        const declared = known.get(dep.id);
        if (!declared) return failure(t('mcp.badDependency'));
        const prior = unique.get(dep.id);
        unique.set(dep.id, {
          id: dep.id,
          skills: [...new Set([...(prior?.skills || []), ...dep.skills])],
          required: Boolean(prior?.required || dep.required !== false),
          provider: declared.provider,
          ...(declared.access ? { access: declared.access } : {}),
        });
      }
    }
    return { ok: true, dependencies: [...unique.values()] };
  } catch {
    return failure(t('mcp.unreadableManifest'));
  }
}
function duplicateKeys(node) {
  if (!node) return false;
  if (node.type === 'object') {
    const keys = node.children.map((prop) => prop.children[0].value);
    if (new Set(keys).size !== keys.length) return true;
  }
  return (node.children || []).some(duplicateKeys);
}
function readConfig(home, target) {
  const spec = TARGETS[target];
  if (!spec) return failure(t('mcp.badTarget'));
  let file = path.join(home, spec.file);
  // OpenCode gives JSONC precedence. Do not create a shadow config beside it.
  if (target === 'opencode' && fs.existsSync(`${file}c`)) file += 'c';
  try {
    const raw = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    const errors = [];
    const data = spec.toml ? TOML.parse(raw) : (raw ? parse(raw, errors, { allowTrailingComma: true }) : {});
    if (errors.length || (!spec.toml && raw && duplicateKeys(parseTree(raw))) || !record(data) ||
        (data[spec.key] !== undefined && !record(data[spec.key]))) {
      return failure(t('mcp.badConfig'));
    }
    return { ok: true, file, raw, data, spec, servers: data[spec.key] || {} };
  } catch {
    return failure(t('mcp.unreadableConfig'));
  }
}
/** The provider's own address, or the one the person gave. A provider `path` completes a base URL. */
function endpoint(provider, override) {
  try {
    const value = override ?? provider.url;
    if (!value) return { ok: false, missing: true };
    const url = new URL(value);
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if (url.username || url.password || url.search || url.hash || (url.protocol !== 'https:' && !(local && url.protocol === 'http:'))) {
      return failure(t('mcp.badUrlRules'));
    }
    const base = url.pathname.replace(/\/$/, '');
    if (provider.path && !(provider.acceptedPaths ?? [provider.path]).some((accepted) => base.endsWith(accepted))) {
      url.pathname = `${base}${provider.path}`;
    }
    return { ok: true, url: url.href };
  } catch {
    return failure(t('mcp.badUrl'));
  }
}
function existingServer(servers, { id, provider }) {
  if (Object.hasOwn(servers, id)) return [id, servers[id]];
  // Aliases are names in the target configuration, never skill prose. A provider
  // with one fixed endpoint is also recognized by that endpoint.
  return Object.entries(servers).find(([name, config]) =>
    name.toLowerCase().replace(/[-_]server$/, '') === id ||
    (provider.url && !provider.path && record(config) && config.url === provider.url));
}
function setupHint(provider) {
  const hint = localized(provider.setupHint);
  return hint ? ` ${hint}` : '';
}
/** How the person logs in through the client: the sentence and, when the client has one, the command. */
function authInstruction(target, name) {
  if (target === 'codex' || target === 'opencode') {
    const command = `${target} mcp ${target === 'opencode' ? 'auth' : 'login'} ${name}`;
    return { text: t('mcp.auth.command', { command }), command };
  }
  return { text: t(target === 'claude' ? 'mcp.auth.claude' : 'mcp.auth.cursor') };
}
/**
 * A result that ends with how to log in. `detail` is what happened and `login` the
 * client command, kept apart so the summary does not have to read them out of `message`.
 */
function withLogin(item, detail, auth) {
  return { ...item, detail, message: `${detail} ${auth.text}`, ...(auth.command ? { login: auth.command } : {}) };
}
function validEntry(target, server) {
  if (!record(server)) return false;
  const text = (value) => typeof value === 'string' && value.trim().length > 0;
  if (text(server.url)) {
    if (target === 'claude') return ['http', 'streamable-http', 'sse', 'ws'].includes(server.type);
    if (target === 'opencode') return server.type === 'remote';
    return true;
  }
  if (target === 'opencode') return server.type === 'local' && Array.isArray(server.command) && server.command.length > 0 && server.command.every(text);
  return text(server.command);
}
function makeEntry(target, url) {
  if (target === 'codex') return { url };
  if (target === 'opencode') return { type: 'remote', url, enabled: true };
  if (target === 'claude') return { type: 'http', url };
  return { url };
}
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (!record(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
}
function fingerprint(entry) {
  return crypto.createHash('sha256').update(JSON.stringify(canonical(entry))).digest('hex');
}
function ownershipFor(home, config, name, entry) {
  return { schemaVersion: 1, file: path.relative(home, config.file), name, fingerprint: fingerprint(entry) };
}
function matchingOwnership(home, config, name, entry, ownership) {
  return ownership?.schemaVersion === 1 && ownership.name === name &&
    ownership.file === path.relative(home, config.file) && ownership.fingerprint === fingerprint(entry);
}
function saveConfig(config, id, entry) {
  if (fs.existsSync(config.file) && fs.lstatSync(config.file).isSymbolicLink()) {
    return failure(t('mcp.symlinkAdd'));
  }
  let next;
  if (config.spec.toml) {
    // Parse before AND after appending. Preserve all pre-existing bytes/comments.
    next = `${config.raw}${config.raw.endsWith('\n') || !config.raw ? '' : '\n'}\n${TOML.stringify({ mcp_servers: { [id]: entry } })}`;
    TOML.parse(next);
  } else {
    const source = config.raw || '{}\n';
    next = applyEdits(source, modify(source, [config.spec.key, id], entry, { formattingOptions: { insertSpaces: true, tabSize: 2 } }));
  }
  return writeConfig(config, next);
}
function writeConfig(config, next) {
  if (fs.existsSync(config.file) && fs.lstatSync(config.file).isSymbolicLink()) {
    return failure(t('mcp.symlink'));
  }
  fs.mkdirSync(path.dirname(config.file), { recursive: true });
  const tmp = `${config.file}.marsai-${crypto.randomUUID()}.tmp`;
  try {
    const mode = fs.existsSync(config.file) ? fs.statSync(config.file).mode & 0o777 : 0o600;
    fs.writeFileSync(tmp, next, { mode, flag: 'wx' });
    // Refuse stale writes if a client edited configuration while we were preparing.
    if ((fs.existsSync(config.file) ? fs.readFileSync(config.file, 'utf8') : '') !== config.raw) return failure(t('mcp.changed'));
    fs.renameSync(tmp, config.file);
    return { ok: true };
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}
/** Dependencies come resolved (with their provider) or are read from the plugins' manifests. */
function dependenciesFor(options) {
  const result = options.dependencies ? { ok: true, dependencies: options.dependencies } : mcpDependencies(options);
  if (!result.ok) return result;
  if (!Array.isArray(result.dependencies)) return failure(t('mcp.unsupported'));
  const dependencies = result.dependencies.map((dep) =>
    record(dep) && !dep.provider && Object.hasOwn(BUILTIN_PROVIDERS, dep.id) ? { ...dep, provider: BUILTIN_PROVIDERS[dep.id] } : dep);
  if (dependencies.some((dep) => !record(dep) || !slug(dep.id) || !validProvider(dep.provider) || !optional(dep.access, validAccess))) {
    return failure(t('mcp.unsupported'));
  }
  return { ok: true, dependencies };
}
function resultFor(id, state, configPath, message, changed = false) {
  return { id, state, configPath, message, changed };
}
/**
 * Configure only missing provider entries. Existing entries/credentials are never replaced.
 * `urls` maps a provider id to the address the person chose for a new connection.
 */
export function configureMcp(options) {
  const { home, target, urls = {}, dryRun = false, skip = false } = options;
  const dependencies = dependenciesFor(options);
  if (!dependencies.ok) return dependencies;
  const results = [];
  for (const dependency of dependencies.dependencies) {
    const { id, provider } = dependency;
    if (skip) { results.push(resultFor(id, 'skipped', undefined, t('mcp.skipped'))); continue; }
    const config = readConfig(home, target);
    if (!config.ok) return { ...config, results };
    const existing = existingServer(config.servers, dependency);
    if (existing) {
      const [name, server] = existing;
      const valid = validEntry(target, server);
      const disabled = server?.enabled === false || server?.disabled === true;
      const item = valid && !disabled
        ? withLogin(resultFor(id, 'configured', config.file), t('mcp.existingKept'), authInstruction(target, name))
        : resultFor(id, 'error', config.file, t('mcp.existingInvalid'));
      const previous = options.managed?.find((item) => item.id === id)?.ownership;
      if (previous && matchingOwnership(home, config, name, server, previous)) item.ownership = previous;
      results.push(item);
      continue;
    }
    const resolved = endpoint(provider, urls[id]);
    if (!resolved.ok) {
      results.push(resultFor(id, resolved.missing ? 'missing' : 'error', config.file,
        resolved.missing ? `${t('mcp.giveUrl', { id })}${setupHint(provider)}` : resolved.message));
      continue;
    }
    if (dryRun) {
      results.push(withLogin(resultFor(id, 'missing', config.file), t('mcp.dryRunAdd'), authInstruction(target, id)));
      continue;
    }
    try {
      const entry = makeEntry(target, resolved.url);
      const saved = saveConfig(config, id, entry);
      if (!saved.ok) { results.push(resultFor(id, 'error', config.file, saved.message)); continue; }
      results.push({ ...withLogin(resultFor(id, 'auth-pending', config.file, undefined, true), t('mcp.added'), authInstruction(target, id)), ownership: ownershipFor(home, config, id, entry) });
    } catch {
      results.push(resultFor(id, 'error', config.file, t('mcp.addFailed')));
    }
  }
  for (const item of results) {
    const dependency = dependencies.dependencies.find((dep) => dep.id === item.id);
    item.required = dependency?.required !== false;
    item.name = dependency?.provider.name;
  }
  return { ok: results.every((item) => !item.required || item.state !== 'error'), results };
}
/** Status is disk evidence only; it never infers authentication or tool readiness. */
export function statusMcp(options) {
  return configureMcp({ ...options, urls: undefined, dryRun: true });
}
function resolveHeader(value, env) {
  if (typeof value !== 'string') return undefined;
  return value.replace(/\$\{(?:env:)?([A-Za-z_][A-Za-z0-9_]*)\}|\{env:([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, first, second) => env[first || second] || '');
}
async function readRpc(response, id) {
  const reader = response.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let body = '';
  const sse = response.headers.get('content-type')?.includes('text/event-stream');
  try {
    while (true) {
      const { value, done } = await reader.read();
      body += decoder.decode(value, { stream: !done });
      if (body.length > 1024 * 1024) return null;
      if (sse) {
        const events = body.split(/\r?\n\r?\n/);
        body = events.pop();
        for (const event of events) {
          const data = event.split(/\r?\n/).filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trimStart()).join('\n');
          if (!data) continue;
          const parsed = JSON.parse(data);
          if (parsed.id === id) return parsed;
        }
      }
      if (done) return sse ? null : JSON.parse(body);
    }
  } finally {
    await reader.cancel();
  }
}
/** Read-only MCP protocol probe; never executes tools/SQL or reads native OAuth credential stores. */
async function probe(server, { fetchImpl = fetch, timeoutMs = 8000, env = process.env, provider = {} } = {}) {
  if (typeof server.url !== 'string') return { state: 'configured', message: t('mcp.probe.stdio') };
  try {
    const url = new URL(server.url);
    if (url.username || url.password || !['http:', 'https:'].includes(url.protocol)) return { state: 'error', message: t('mcp.probe.insecure') };
    if (url.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) return { state: 'error', message: t('mcp.probe.needsHttps') };
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' };
    for (const [key, value] of Object.entries(server.http_headers || server.headers || {})) headers[key] = resolveHeader(value, env);
    for (const [key, name] of Object.entries(server.env_http_headers || {})) if (env[name]) headers[key] = env[name];
    if (server.bearer_token_env_var && env[server.bearer_token_env_var]) headers.Authorization = `Bearer ${env[server.bearer_token_env_var]}`;
    const signal = AbortSignal.timeout(timeoutMs);
    async function request(method, id, params) {
      const response = await fetchImpl(url, { method: 'POST', headers, body: JSON.stringify({ jsonrpc: '2.0', method, ...(id === undefined ? {} : { id }), ...(params ? { params } : {}) }), signal, redirect: 'error' });
      if ([401, 403].includes(response.status)) { await response.body?.cancel(); return { auth: true }; }
      if (!response.ok) { await response.body?.cancel(); return { invalid: true }; }
      const session = response.headers.get('mcp-session-id');
      if (session) headers['Mcp-Session-Id'] = session;
      if (id === undefined) { await response.body?.cancel(); return { ok: true }; }
      return { rpc: await readRpc(response, id) };
    }
    const initialized = await request('initialize', 1, { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'marsai-doctor', version: '1.0.0' } });
    if (initialized.auth) return { state: 'auth-pending', message: t('mcp.probe.auth') };
    const init = initialized.rpc;
    if (init?.jsonrpc !== '2.0' || init.id !== 1 || init.error || !init.result?.protocolVersion || !record(init.result?.capabilities?.tools) || !record(init.result?.serverInfo)) return { state: 'error', message: `${t('mcp.probe.badInitialize')}${setupHint(provider)}` };
    headers['MCP-Protocol-Version'] = init.result.protocolVersion;
    const notification = await request('notifications/initialized');
    if (notification.auth) return { state: 'auth-pending', message: t('mcp.probe.sessionAuth') };
    if (!notification.ok) return { state: 'error', message: t('mcp.probe.notification') };
    const listed = await request('tools/list', 2, {});
    if (listed.auth) return { state: 'auth-pending', message: t('mcp.probe.listAuth') };
    const rpc = listed.rpc;
    if (rpc?.jsonrpc !== '2.0' || rpc.id !== 2 || rpc.error || !Array.isArray(rpc.result?.tools) || !rpc.result.tools.length || rpc.result.tools.some((tool) => typeof tool.name !== 'string' || !record(tool.inputSchema))) return { state: 'error', message: t('mcp.probe.badList') };
    return { state: 'verified', toolCount: rpc.result.tools.length, message: t('mcp.probe.verified') };
  } catch {
    return { state: 'error', message: t('mcp.probe.network') };
  }
}
export async function doctorMcp(options) {
  const dependencies = dependenciesFor(options);
  if (!dependencies.ok) return dependencies;
  const status = statusMcp({ ...options, dependencies: dependencies.dependencies });
  if (!status.ok || status.results.length === 0) return status;
  const config = readConfig(options.home, options.target);
  if (!config.ok) return config;
  const results = [];
  for (const item of status.results) {
    if (item.state !== 'configured') { results.push(item); continue; }
    const dependency = dependencies.dependencies.find((dep) => dep.id === item.id);
    const [name, server] = existingServer(config.servers, dependency);
    const checked = await probe(server, { ...options, provider: dependency.provider });
    // The probe replaces what the configuration step said; only a pending login keeps a command.
    const { login: _earlier, ...kept } = item;
    const next = { ...kept, ...checked, detail: checked.message };
    results.push(checked.state === 'auth-pending' ? withLogin(next, checked.message, authInstruction(options.target, name)) : next);
  }
  return { ok: results.every((item) => !item.required || item.state === 'verified' || item.state === 'skipped'), results };
}

/** Remove only entries this installer created, still equal to their recorded fingerprint. */
export function removeMcp({ home, target, managed = [] }) {
  const results = [];
  for (const item of managed) {
    const { id, ownership } = item;
    if (!ownership) {
      results.push({ id, state: 'preserved', message: t('mcp.remove.preexisting') });
      continue;
    }
    const config = readConfig(home, target);
    if (!config.ok) return { ...config, results };
    const entry = config.servers[ownership.name];
    if (entry === undefined) {
      results.push({ id, state: 'removed', message: t('mcp.remove.gone') });
      continue;
    }
    if (!matchingOwnership(home, config, ownership.name, entry, ownership)) {
      results.push({ id, state: 'preserved', message: t('mcp.remove.edited') });
      continue;
    }
    try {
      let next;
      if (config.spec.toml) {
        // Only our exact emitted block can be removed. Parse each candidate and
        // compare the complete document to ensure no unrelated value is changed.
        const block = TOML.stringify({ mcp_servers: { [ownership.name]: entry } });
        const expected = { ...config.data, [config.spec.key]: { ...config.servers } };
        delete expected[config.spec.key][ownership.name];
        let offset = config.raw.indexOf(block);
        while (offset >= 0) {
          const candidate = config.raw.slice(0, offset) + config.raw.slice(offset + block.length);
          try {
            const parsed = TOML.parse(candidate);
            const expectedCandidate = { ...expected };
            if (!Object.keys(expected[config.spec.key]).length && parsed[config.spec.key] === undefined) delete expectedCandidate[config.spec.key];
            if (isDeepStrictEqual(parsed, expectedCandidate)) { next = candidate; break; }
          } catch { /* A similar block inside a string is not an owned table. */ }
          offset = config.raw.indexOf(block, offset + block.length);
        }
        if (next === undefined) {
          results.push({ id, state: 'preserved', message: t('mcp.remove.reformatted') });
          continue;
        }
      } else {
        next = applyEdits(config.raw, modify(config.raw, [config.spec.key, ownership.name], undefined, {}));
      }
      const saved = writeConfig(config, next);
      if (!saved.ok) { results.push({ id, state: 'error', message: saved.message }); continue; }
      results.push({ id, state: 'removed', message: t('mcp.remove.removed') });
    } catch {
      results.push({ id, state: 'error', message: t('mcp.remove.failed') });
    }
  }
  return { ok: results.every((item) => item.state !== 'error'), results };
}

/** Resolve a validated config entry name without exposing its credentials. */
export function mcpConnectionName({ home, target, dependency }) {
  const config = readConfig(home, target);
  if (!config.ok) return failure(config.message);
  const found = existingServer(config.servers, dependency);
  if (!found || !validEntry(target, found[1]) || found[1].enabled === false || found[1].disabled === true) return failure(t('mcp.loginUnavailable'));
  return { ok: true, name: found[0] };
}
