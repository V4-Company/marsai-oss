import "./helpers/lang.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { configureAutoUpdate } from "../src/auto-update.js";
import { loadCatalog, pluginsFor, resolvePlugins } from "../src/catalog.js";
import {
  checkoutKey,
  installationRoots,
  primaryRoot,
  readRoot,
} from "../src/roots.js";
import {
  ALL_TARGETS,
  addonPackage,
  claudeHome,
  tempDir,
  write,
  writeRoot,
} from "./helpers/fixtures.js";

// A second root brings its own plugins, groups and MCP providers. The invented one
// here has a plugin that joins a group of this repository and depends on its base,
// which is the shape of a package of extra plugins built on the public installer.

const bin = path.resolve("cli/bin/marsai.js");
const own = primaryRoot();
const ownSpec = `github:${own.repo}#main`;

function home(t) {
  const h = fs.mkdtempSync(path.join(os.tmpdir(), "marsai-roots-"));
  t.after(() => fs.rmSync(h, { recursive: true, force: true }));
  return h;
}
function run(from, args, h, env = {}) {
  const base = { ...process.env, PATH: "/nonexistent" };
  delete base.MARSAI_EXTRA_ROOTS;
  delete base.MARSAI_CHANNEL;
  return spawnSync(process.execPath, [from, ...args, "--home", h], {
    encoding: "utf8",
    env: { ...base, ...env },
  });
}
const statePath = (h) => path.join(h, ".marsai-installer.json");
const state = (h) => JSON.parse(fs.readFileSync(statePath(h), "utf8"));
const claudeEntry = (h) =>
  state(h).targets.find((entry) => entry.target === "claude");
const exists = (h, file) => fs.existsSync(path.join(h, file));
const merge = (...roots) => loadCatalog({ roots: [own, ...roots] });
const names = (plugins) => plugins.map((plugin) => plugin.name);
/** A second invented root, with its own marketplace name and repository. */
function betaRoot(t, plugins) {
  return writeRoot(tempDir(t, "marsai-beta-"), {
    marketplace: "beta",
    owner: "Beta",
    pkg: { name: "beta-kit", version: "0.4.0", repository: "github:beta/kit" },
    plugins,
  });
}
const scheduledTask = (h) =>
  fs.readFileSync(
    process.platform === "darwin"
      ? state(h).autoUpdate.path
      : path.join(h, ".config/systemd/user/marsai-update.service"),
    "utf8",
  );

test("roots are merged in order: the first one names a shared group and wins a repeated plugin", (t) => {
  const addon = addonPackage(t);
  const beta = readRoot(
    betaRoot(t, {
      "acme-addon": { skills: ["impostor"] },
      "beta-tool": {
        manifest: {
          schemaVersion: 1,
          targets: ALL_TARGETS,
          group: {
            id: "desenvolvimento",
            label: "Another name",
            description: "Another description",
          },
        },
      },
    }),
  );
  const alone = merge();
  const merged = merge(addon.root, beta);
  const before = alone.groups.get("desenvolvimento");
  const after = merged.groups.get("desenvolvimento");
  assert.deepEqual(after.label, before.label);
  assert.deepEqual(after.description, before.description);
  assert.deepEqual(after.plugins, [...before.plugins, "acme-addon", "beta-tool"]);
  assert.deepEqual(
    [...merged.groups.keys()],
    [...alone.groups.keys(), "analytics", "building"],
  );
  assert.deepEqual(
    [...merged.plugins.keys()],
    [...alone.plugins.keys(), "acme-addon", "acme-core", "acme-data", "acme-dev", "beta-tool"],
  );
  assert.equal(merged.plugins.get("acme-addon").root.dir, addon.dir);
  assert.equal(merged.plugins.get("marsai-core").root.dir, own.dir);
  assert.ok(merged.providers.has("acme-bi"));
  assert.equal(merged.problems.length, 1);
  assert.match(merged.problems[0], /^acme-addon: já existe em /);
  assert.deepEqual(alone.problems, []);
});

test("the roots of a run: the installer's own, the caller's, then MARSAI_EXTRA_ROOTS", (t) => {
  const addon = addonPackage(t);
  const bare = writeRoot(tempDir(t), {
    marketplace: "bare",
    pkg: null,
    plugins: { "bare-tool": {} },
  });
  const dirs = (result) => result.roots.map((root) => root.dir);
  const none = installationRoots({ env: {} });
  assert.deepEqual(dirs(none), [own.dir]);
  assert.equal(none.entry, own);
  assert.deepEqual(none.scheduledRoots, []);

  // The package that called run() is the distribution: running it again brings
  // its own root back, so only the root from the environment has to be repeated.
  const both = installationRoots({
    extraRoots: [addon.dir],
    env: { MARSAI_EXTRA_ROOTS: [bare, addon.dir].join(path.delimiter) },
  });
  assert.deepEqual(dirs(both), [own.dir, addon.dir, bare]);
  assert.equal(both.entry.dir, addon.dir);
  assert.deepEqual(both.scheduledRoots, [bare]);

  // A caller with no repository cannot be fetched by the daily update.
  const local = installationRoots({ extraRoots: [bare], env: {} });
  assert.equal(local.entry, own);
  assert.deepEqual(local.scheduledRoots, [bare]);

  const fromEnv = installationRoots({ env: { MARSAI_EXTRA_ROOTS: addon.dir } });
  assert.equal(fromEnv.entry, own);
  assert.deepEqual(fromEnv.scheduledRoots, [addon.dir]);

  const repeated = installationRoots({
    extraRoots: [addon.dir, addon.dir, own.dir],
    env: { MARSAI_EXTRA_ROOTS: ` ${addon.dir} ${path.delimiter}` },
  });
  assert.deepEqual(dirs(repeated), [own.dir, addon.dir]);

  assert.throws(
    () => installationRoots({ extraRoots: [path.join(bare, "missing")], env: {} }),
    /raiz extra: .*não é uma raiz MarsAI/,
  );
  const clash = writeRoot(tempDir(t), { marketplace: own.marketplace });
  assert.throws(
    () => installationRoots({ env: { MARSAI_EXTRA_ROOTS: clash } }),
    new RegExp(
      `MARSAI_EXTRA_ROOTS: .* usa o nome de marketplace '${own.marketplace}'`,
    ),
  );
});

test("a package that runs the installer with itself as an extra root adds its plugins, groups and MCPs", (t) => {
  const addon = addonPackage(t);
  const merged = merge(addon.root);
  const h = home(t);

  const help = run(addon.bin, ["--help"], h).stdout;
  assert.match(help, /marketplace de plugins da Acme para Claude Code/);
  assert.match(help, /^  npx github:acme\/kit#main install \[opções\]/m);
  const groupLine = help.split("\n").find((line) => line.startsWith("  --group"));
  for (const id of merged.groups.keys()) assert.ok(groupLine.includes(id), id);
  for (const id of ["desenvolvimento", "analytics", "building"])
    assert.ok(groupLine.includes(id), id);
  for (const name of merged.plugins.keys())
    assert.match(help, new RegExp(`^  ${name}\\s`, "m"));
  assert.match(help, /--acme-bi-url <url> /);

  const r = run(
    addon.bin,
    ["--mcp", "skip", "install", "--target", "codex", "--target", "cursor", "--target", "opencode", "--group", "desenvolvimento", "--yes"],
    h,
  );
  assert.equal(r.status, 0, r.stderr);
  const selected = resolvePlugins(
    merged,
    merged.groups.get("desenvolvimento").plugins,
  );
  assert.ok(selected.includes("acme-addon"));
  assert.ok(selected.indexOf("marsai-core") < selected.indexOf("acme-addon"));
  for (const entry of state(h).targets)
    assert.deepEqual(
      entry.plugins,
      names(pluginsFor(merged, selected, entry.target)),
      entry.target,
    );
  // The extra root's content reaches every app, next to this repository's base.
  for (const file of [
    ".agents/skills/addon-skill/SKILL.md",
    ".agents/skills/using-marsai/SKILL.md",
    ".config/opencode/skills/addon-skill/SKILL.md",
    ".config/opencode/agent/addon-agent.md",
    ".config/opencode/command/addon-command.md",
    ".cursor/agents/addon-agent.md",
    ".cursor/skills/marsai-addon-command/SKILL.md",
  ])
    assert.ok(exists(h, file), file);
  assert.equal(exists(h, ".agents/skills/reports"), false);
  const rules = fs.readFileSync(path.join(h, ".codex/marsai-AGENTS.md"), "utf8");
  assert.match(rules, /\n- `acme-addon:addon-skill`: see ~\/\.agents\/skills\/addon-skill\/SKILL\.md\n/);
  assert.match(rules, /\n- `marsai-core:using-marsai`: see /);
  // The rules file is the installer's: it keeps this repository's name and address.
  assert.ok(rules.startsWith(`# MarsAI (${own.owner})\n`));
  assert.ok(rules.includes(`\nFull docs: https://github.com/${own.repo}\n`));

  assert.equal(run(addon.bin, ["--mcp", "skip", "update"], h).status, 0);
  assert.ok(exists(h, ".agents/skills/addon-skill/SKILL.md"));
  assert.equal(run(addon.bin, ["remove"], h).status, 0);
  assert.equal(exists(h, ".agents/skills/addon-skill"), false);
  assert.equal(exists(h, ".cursor/agents/addon-agent.md"), false);
});

test("MARSAI_EXTRA_ROOTS adds roots to the installer's own bin", (t) => {
  const acme = writeRoot(tempDir(t, "marsai-acme-"));
  const beta = betaRoot(t, {
    "beta-tool": {
      dependencies: ["acme-core"],
      manifest: {
        schemaVersion: 1,
        targets: ALL_TARGETS,
        group: { id: "building", label: "Another name" },
      },
      skills: ["beta-skill"],
    },
  });
  const env = { MARSAI_EXTRA_ROOTS: [acme, beta].join(path.delimiter) };
  const h = home(t);

  const help = run(bin, ["--help"], h, env).stdout;
  assert.ok(help.includes(`\n  npx ${ownSpec} install [opções]`), help);
  assert.match(help, /^  beta-tool\s/m);
  const catalog = loadCatalog(installationRoots({ env }));
  assert.deepEqual(catalog.groups.get("building").label, {
    en: "Building",
    "pt-BR": "Construção",
  });

  const r = run(
    bin,
    ["--mcp", "skip", "install", "--target", "codex", "--group", "building", "--yes"],
    h,
    env,
  );
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(state(h).targets[0].plugins, ["acme-core", "acme-dev", "beta-tool"]);
  for (const skill of ["guide", "craft", "beta-skill"])
    assert.ok(exists(h, `.agents/skills/${skill}/SKILL.md`), skill);

  const gated = run(
    bin,
    ["install", "--target", "codex", "--group", "analytics", "--yes", "--acme-bi-url", "http://127.0.0.1:9", "--acme-bi-access", "no"],
    home(t),
    env,
  );
  assert.equal(gated.status, 0, gated.stderr);
  assert.match(gated.stdout, /Peça acesso para data@acme\.test\./);

  // Without the variable the installer knows none of it, and says so before changing anything.
  const without = run(bin, ["install", "--group", "analytics", "--yes"], h);
  assert.match(without.stderr, /grupo desconhecido: analytics\./);
  const update = run(bin, ["--mcp", "skip", "update"], h);
  assert.notEqual(update.status, 0);
  assert.match(update.stderr, /não distribui: acme-core, acme-dev, beta-tool\. Nada foi alterado\./);
  assert.ok(exists(h, ".agents/skills/beta-skill/SKILL.md"));
  assert.equal(run(bin, ["--mcp", "skip", "update"], h, env).status, 0);
});

test("a bad extra root stops the command, and a repeated plugin name is reported once", (t) => {
  const h = home(t);
  const twin = writeRoot(tempDir(t), {
    plugins: {
      "marsai-core": { skills: ["impostor"] },
      "acme-solo": { skills: ["solo"] },
    },
  });
  const r = run(
    bin,
    ["--mcp", "skip", "install", "--target", "codex", "--plugin", "marsai-core", "--plugin", "acme-solo", "--yes"],
    h,
    { MARSAI_EXTRA_ROOTS: [twin, twin].join(path.delimiter) },
  );
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stderr.match(/aviso: marsai-core: já existe em /g)?.length, 1);
  assert.ok(exists(h, ".agents/skills/using-marsai/SKILL.md"));
  assert.ok(exists(h, ".agents/skills/solo/SKILL.md"));
  assert.equal(exists(h, ".agents/skills/impostor"), false);

  const empty = home(t);
  const clash = writeRoot(tempDir(t), { marketplace: own.marketplace });
  const sameName = run(bin, ["status"], empty, { MARSAI_EXTRA_ROOTS: clash });
  assert.notEqual(sameName.status, 0);
  assert.match(sameName.stderr, /MARSAI_EXTRA_ROOTS: .* usa o nome de marketplace/);
  const missing = run(bin, ["status"], empty, {
    MARSAI_EXTRA_ROOTS: path.join(clash, "nowhere"),
  });
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /MARSAI_EXTRA_ROOTS: .* não é uma raiz MarsAI/);
  assert.deepEqual(fs.readdirSync(empty), []);
});

test("the daily update runs the distribution that installed, with the roots it would not load alone", (t) => {
  const addon = addonPackage(t);
  const install = ["--mcp", "skip", "install", "--target", "codex", "--plugin", "acme-addon", "--auto-update"];

  const packaged = home(t);
  assert.equal(run(addon.bin, install, packaged).status, 0);
  const fromPackage = scheduledTask(packaged);
  assert.ok(fromPackage.includes("github:acme/kit#main"), fromPackage);
  assert.ok(!fromPackage.includes(ownSpec));
  assert.ok(!fromPackage.includes("MARSAI_EXTRA_ROOTS"));

  const local = home(t);
  const env = { MARSAI_EXTRA_ROOTS: addon.dir };
  assert.equal(run(bin, install, local, env).status, 0);
  const fromEnv = scheduledTask(local);
  assert.ok(fromEnv.includes(ownSpec), fromEnv);
  assert.ok(fromEnv.includes(`MARSAI_EXTRA_ROOTS=${addon.dir}`) || fromEnv.includes(`<key>MARSAI_EXTRA_ROOTS</key><string>${addon.dir}</string>`), fromEnv);

  for (const platform of ["darwin", "linux"]) {
    const h = home(t);
    const result = configureAutoUpdate(h, {
      enabled: true,
      platform,
      spec: "github:acme/kit#main",
      extraRoots: ["/opt/roots/a", "/opt/roots/b & c"],
    });
    const text = fs.readFileSync(
      platform === "darwin"
        ? result.path
        : path.join(h, ".config/systemd/user/marsai-update.service"),
      "utf8",
    );
    const joined = ["/opt/roots/a", "/opt/roots/b & c"].join(path.delimiter);
    assert.ok(
      text.includes(
        platform === "darwin"
          ? `<key>MARSAI_EXTRA_ROOTS</key><string>${joined.replace("&", "&amp;")}</string>`
          : `Environment="MARSAI_EXTRA_ROOTS=${joined}"\n`,
      ),
      text,
    );
    assert.ok(text.includes("github:acme/kit#main"));
  }
});

test("Claude Code: each root is its own marketplace, with its own name and repository", (t) => {
  const addon = addonPackage(t);
  const merged = merge(addon.root);
  const c = claudeHome(t, {
    repos: { [own.repo]: own.marketplace, "acme/kit": "acme" },
  });
  const env = { PATH: c.path };
  const r = run(
    addon.bin,
    ["--mcp", "skip", "install", "--target", "claude", "--group", "desenvolvimento", "--yes"],
    c.home,
    env,
  );
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const log = c.calls();
  const ownAdd = log.indexOf(
    `plugin marketplace add ${own.repo} --sparse .claude-plugin plugins`,
  );
  const acmeAdd = log.indexOf(
    "plugin marketplace add acme/kit --sparse .claude-plugin plugins",
  );
  assert.ok(ownAdd >= 0 && acmeAdd > ownAdd, log.join("\n"));
  const selected = pluginsFor(
    merged,
    resolvePlugins(merged, merged.groups.get("desenvolvimento").plugins),
    "claude",
  );
  for (const plugin of selected)
    assert.ok(
      log.includes(`plugin install ${plugin.name}@${plugin.root.marketplace}`),
      plugin.name,
    );
  assert.ok(log.includes("plugin install acme-addon@acme"));
  assert.ok(log.includes(`plugin install marsai-core@${own.marketplace}`));
  assert.ok(!log.includes(`plugin install acme-addon@${own.marketplace}`));
  assert.ok(!log.includes("plugin install marsai-core@acme"));
  assert.deepEqual(
    c.installed(),
    selected.map((plugin) => `${plugin.name}@${plugin.root.marketplace}`).sort(),
  );

  // The installer's own marketplace stays in the keys older states use; the
  // other root is recorded by name, with the plugins it gave.
  const entry = claudeEntry(c.home);
  assert.equal(entry.marketplaceMode, "github");
  assert.equal(entry.marketplaceRef, null);
  assert.equal(entry.claudeAutoUpdate, true);
  assert.deepEqual(entry.marketplaces, {
    acme: {
      repo: "acme/kit",
      version: "1.2.3",
      ref: null,
      mode: "github",
      autoUpdate: true,
      plugins: ["acme-addon"],
    },
  });
  const settings = JSON.parse(
    fs.readFileSync(path.join(c.home, ".claude/settings.json"), "utf8"),
  ).extraKnownMarketplaces;
  assert.equal(settings.acme.autoUpdate, true);
  assert.equal(settings[own.marketplace].autoUpdate, true);
  assert.match(r.stdout, /marketplace 'acme' via GitHub acme\/kit; o Claude atualiza ao iniciar/);

  const status = run(addon.bin, ["status"], c.home, env).stdout;
  assert.match(
    status,
    /\n  marketplace: github @ main \| auto-update do Claude: ligado\n  marketplace acme: github @ main \| auto-update do Claude: ligado\n/,
  );
  assert.match(status, /arquivos: registro nativo presente/);

  assert.equal(run(addon.bin, ["remove"], c.home, env).status, 0);
  const after = c.calls();
  assert.ok(after.includes("plugin uninstall acme-addon@acme"));
  assert.ok(after.includes(`plugin uninstall marsai-core@${own.marketplace}`));
  assert.deepEqual(c.installed(), []);
});

test("Claude Code on the stable channel: each marketplace is pinned to its own root's release", (t) => {
  const addon = addonPackage(t);
  const c = claudeHome(t, {
    repos: { [own.repo]: own.marketplace, "acme/kit": "acme" },
  });
  const env = { PATH: c.path };
  const r = run(
    addon.bin,
    ["--mcp", "skip", "install", "--target", "claude", "--plugin", "acme-addon", "--yes", "--channel", "stable"],
    c.home,
    env,
  );
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const log = c.calls();
  assert.ok(
    log.includes(
      `plugin marketplace add ${own.repo}#v${own.version} --sparse .claude-plugin plugins`,
    ),
    log.join("\n"),
  );
  assert.ok(
    log.includes(
      "plugin marketplace add acme/kit#v1.2.3 --sparse .claude-plugin plugins",
    ),
  );
  const entry = claudeEntry(c.home);
  assert.equal(entry.marketplaceRef, `v${own.version}`);
  assert.equal(entry.marketplaces.acme.ref, "v1.2.3");
  assert.equal(entry.marketplaces.acme.autoUpdate, false);
  const clean = run(addon.bin, ["status"], c.home, env).stdout;
  assert.match(clean, /marketplace acme: github @ v1\.2\.3 \| auto-update do Claude: desligado/);
  assert.doesNotMatch(clean, /fora do canal stable/);

  const saved = state(c.home);
  saved.targets[0].marketplaces.acme.ref = "v0.0.1";
  fs.writeFileSync(statePath(c.home), JSON.stringify(saved));
  assert.match(
    run(addon.bin, ["status"], c.home, env).stdout,
    /marketplace acme: github @ v0\.0\.1 [^\n]+\n  ! fora do canal stable \(v1\.2\.3\): rode `marsai update`/,
  );
});

test("Claude Code without GitHub access: each root gets its own bundled copy", (t) => {
  const addon = addonPackage(t);
  const c = claudeHome(t, { git: false });
  const env = { PATH: c.path };
  const r = run(
    addon.bin,
    ["--mcp", "skip", "install", "--target", "claude", "--plugin", "acme-addon", "--yes"],
    c.home,
    env,
  );
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const copies = path.join(c.home, ".marsai", "marketplace");
  const ownCopy = path.join(copies, checkoutKey(own));
  const acmeCopy = path.join(copies, "acme--kit");
  const log = c.calls();
  assert.ok(log.includes(`plugin marketplace add ${ownCopy}`), log.join("\n"));
  assert.ok(log.includes(`plugin marketplace add ${acmeCopy}`));
  // Each copy holds one root: its marketplace.json and only its plugins.
  assert.ok(fs.existsSync(path.join(acmeCopy, "plugins/acme-addon/.claude-plugin/plugin.json")));
  assert.equal(fs.existsSync(path.join(acmeCopy, "plugins/marsai-core")), false);
  assert.ok(fs.existsSync(path.join(ownCopy, "plugins/marsai-core/.claude-plugin/plugin.json")));
  assert.equal(fs.existsSync(path.join(ownCopy, "plugins/acme-addon")), false);
  assert.equal(
    JSON.parse(fs.readFileSync(path.join(acmeCopy, ".claude-plugin/marketplace.json"), "utf8")).name,
    "acme",
  );
  const entry = claudeEntry(c.home);
  assert.equal(entry.marketplaceMode, "local");
  assert.equal(entry.marketplaces.acme.mode, "local");
  assert.equal(entry.marketplaces.acme.autoUpdate, false);
  const status = run(addon.bin, ["status"], c.home, env).stdout;
  assert.match(status, /marketplace acme: checkout local v1\.2\.3 \| auto-update do Claude: desligado/);
  assert.ok(status.includes(`checkout do marketplace acme (claude): ${acmeCopy}`), status);
  assert.equal(run(addon.bin, ["remove"], c.home, env).status, 0);
  assert.equal(fs.existsSync(copies), false);
});

test("Claude Code: a root with no repository is always registered from its bundled copy", (t) => {
  const bare = writeRoot(tempDir(t, "marsai-bare-"), {
    pkg: null,
    plugins: {
      "acme-addon": { dependencies: ["marsai-core"], skills: ["addon-skill"] },
    },
  });
  const c = claudeHome(t, { repos: { [own.repo]: own.marketplace } });
  const env = { PATH: c.path, MARSAI_EXTRA_ROOTS: bare };
  const args = ["--mcp", "skip", "install", "--target", "claude", "--plugin", "acme-addon"];
  const copy = path.join(c.home, ".marsai", "marketplace", "acme");

  const dry = run(bin, [...args, "--dry-run"], c.home, env).stdout;
  assert.ok(
    dry.includes(`\n  checkout local ${copy} + install acme-addon\n`),
    dry,
  );
  assert.ok(dry.includes(`marketplace GitHub ${own.repo} (auto-update`));
  assert.equal(fs.existsSync(path.join(c.home, "calls.jsonl")), false);

  const r = run(bin, [...args, "--yes"], c.home, env);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const log = c.calls();
  assert.ok(log.includes(`plugin marketplace add ${copy}`), log.join("\n"));
  assert.ok(
    log.includes(`plugin marketplace add ${own.repo} --sparse .claude-plugin plugins`),
  );
  assert.deepEqual(claudeEntry(c.home).marketplaces, {
    acme: {
      repo: null,
      version: null,
      ref: null,
      mode: "local",
      autoUpdate: false,
      plugins: ["acme-addon"],
    },
  });
  assert.match(r.stdout, /sem repositório GitHub declarado: marketplace 'acme' via checkout local/);
});

test("Claude Code: a plugin that changed roots is installed from the new marketplace and leaves the old one", (t) => {
  const addon = addonPackage(t);
  const c = claudeHome(t, {
    repos: { [own.repo]: own.marketplace, "acme/kit": "acme" },
  });
  const env = { PATH: c.path };
  const source = { source: "github", repo: own.repo };
  // What an older installer left: every plugin came from its one marketplace.
  write(statePath(c.home), {
    schema: 1,
    plugins: ["marsai-core", "acme-addon"],
    targets: [
      {
        target: "claude",
        plugins: ["marsai-core", "acme-addon"],
        groups: [],
        version: own.version,
        marketplaceRef: null,
        marketplaceMode: "github",
        claudeAutoUpdate: true,
      },
    ],
  });
  write(path.join(c.home, "market.json"), [{ name: own.marketplace, ...source }]);
  write(path.join(c.home, ".claude/plugins/known_marketplaces.json"), {
    [own.marketplace]: { source },
  });
  write(path.join(c.home, ".claude/settings.json"), {
    extraKnownMarketplaces: { [own.marketplace]: { source } },
  });
  write(path.join(c.home, ".claude/plugins/installed_plugins.json"), {
    version: 2,
    plugins: {
      [`marsai-core@${own.marketplace}`]: [{ scope: "user" }],
      [`acme-addon@${own.marketplace}`]: [{ scope: "user" }],
    },
  });

  const r = run(addon.bin, ["--mcp", "skip", "update"], c.home, env);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const log = c.calls();
  const installed = log.indexOf("plugin install acme-addon@acme");
  const left = log.indexOf(`plugin uninstall acme-addon@${own.marketplace}`);
  assert.ok(installed >= 0 && left > installed, log.join("\n"));
  assert.ok(!log.includes(`plugin install acme-addon@${own.marketplace}`));
  assert.deepEqual(c.installed(), [
    "acme-addon@acme",
    `marsai-core@${own.marketplace}`,
  ]);
  assert.ok(
    r.stdout.includes(
      `acme-addon passou do marketplace '${own.marketplace}' para 'acme'`,
    ),
    r.stdout,
  );
  assert.deepEqual(claudeEntry(c.home).marketplaces.acme.plugins, ["acme-addon"]);

  // Moving the pin registers the old marketplace again and reinstalls what came
  // from it, but not the plugin another root carries now.
  fs.rmSync(path.join(c.home, "calls.jsonl"));
  write(path.join(c.home, ".claude/plugins/installed_plugins.json"), {
    version: 2,
    plugins: {
      [`marsai-core@${own.marketplace}`]: [{ scope: "user" }],
      [`acme-addon@${own.marketplace}`]: [{ scope: "user" }],
      "acme-addon@acme": [{ scope: "user" }],
    },
  });
  const pinned = run(
    addon.bin,
    ["--mcp", "skip", "update", "--channel", "stable"],
    c.home,
    env,
  );
  assert.equal(pinned.status, 0, pinned.stderr + pinned.stdout);
  const again = c.calls();
  assert.ok(again.includes(`plugin marketplace remove ${own.marketplace}`), again.join("\n"));
  assert.ok(again.includes(`plugin install marsai-core@${own.marketplace}`));
  assert.ok(!again.includes(`plugin install acme-addon@${own.marketplace}`));
  assert.ok(!again.some((call) => call.startsWith("plugin uninstall")));
});

test("Claude Code: one marketplace failing is reported with its plugins and the other is still recorded", (t) => {
  const addon = addonPackage(t);
  const c = claudeHome(t, {
    repos: { [own.repo]: own.marketplace, "acme/kit": "acme" },
  });
  const env = { PATH: c.path };
  const copy = path.join(c.home, ".marsai", "marketplace", "acme--kit");
  fs.writeFileSync(path.join(c.home, "fail-adds"), ["acme/kit", copy].join("\n"));
  const r = run(
    addon.bin,
    ["--mcp", "skip", "install", "--target", "claude", "--plugin", "acme-addon", "--yes"],
    c.home,
    env,
  );
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /Falha ao instalar: claude/);
  assert.match(r.stdout, /marketplace add falhou/);
  assert.deepEqual(c.installed(), [`marsai-core@${own.marketplace}`]);
  const entry = claudeEntry(c.home);
  assert.equal(entry.marketplaceMode, "github");
  assert.deepEqual(entry.failedPlugins, ["acme-addon"]);
  assert.equal(entry.marketplaces, undefined);
  assert.match(
    run(addon.bin, ["status"], c.home, env).stdout,
    /plugins com falha: acme-addon/,
  );
});
