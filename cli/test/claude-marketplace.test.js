import "./helpers/lang.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { checkoutKey, primaryRoot } from "../src/roots.js";

const bin = path.resolve("cli/bin/marsai.js");
// The repository and the marketplace name are the ones of the root this suite
// runs on, read from its package.json and marketplace.json. Nothing here spells
// them out, so the suite holds when the root is published under another address.
const own = primaryRoot();
const REPO = own.repo;
const MARKET = own.marketplace;
const escaped = (text) => text.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const GITHUB = { name: MARKET, source: "github", repo: REPO };
const DIRECTORY = { name: MARKET, source: "directory", path: "/old/dir" };

// Fake `claude` keeps the marketplace list in <home>/market.json, mirrors it into
// ~/.claude/plugins/known_marketplaces.json like the real CLI, and logs every call.
const FAKE_CLAUDE = `
import fs from "node:fs";
import path from "node:path";
const REPO = ${JSON.stringify(REPO)};
const MARKET = ${JSON.stringify(MARKET)};
const h = process.env.HOME;
const market = path.join(h, "market.json");
const known = path.join(h, ".claude", "plugins", "known_marketplaces.json");
const args = process.argv.slice(2);
fs.appendFileSync(path.join(h, "calls.jsonl"), JSON.stringify(args) + "\\n");
const cmd = args.slice(0, 3).join(" ");
const writeKnown = (source) => {
  fs.mkdirSync(path.dirname(known), { recursive: true });
  fs.writeFileSync(known, JSON.stringify(source ? { [MARKET]: { source, installLocation: "/x", lastUpdated: "now" } } : {}));
};
if (cmd === "plugin marketplace list") {
  process.stdout.write(fs.existsSync(market) ? fs.readFileSync(market, "utf8") : "[]");
} else if (cmd === "plugin marketplace remove") {
  fs.writeFileSync(market, "[]");
  writeKnown(null);
} else if (cmd === "plugin install" || cmd.startsWith("plugin install ")) {
  const failing = path.join(h, "fail-installs");
  if (fs.existsSync(failing) && fs.readFileSync(failing, "utf8").split("\\n").includes(args[2])) {
    process.stderr.write("install failed " + args[2]);
    process.exit(1);
  }
} else if (cmd === "plugin marketplace add") {
  const src = args[3];
  const [repo, ref] = src.split("#");
  const failing = path.join(h, "fail-adds");
  if (fs.existsSync(failing) && fs.readFileSync(failing, "utf8").split("\\n").includes(src)) {
    process.stderr.write("fatal: could not read Username for " + src);
    process.exit(1);
  }
  if (repo === REPO) {
    const missing = path.join(h, "missing-tags");
    if (ref && fs.existsSync(missing) && fs.readFileSync(missing, "utf8").includes(ref)) {
      process.stderr.write("fatal: couldn't find remote ref " + ref);
      process.exit(1);
    }
    const source = { source: "github", repo, ...(ref ? { ref } : {}), sparsePaths: [".claude-plugin", "plugins"] };
    fs.writeFileSync(market, JSON.stringify([{ name: MARKET, source: "github", repo }]));
    writeKnown(source);
    const settings = path.join(h, ".claude", "settings.json");
    fs.mkdirSync(path.dirname(settings), { recursive: true });
    const data = fs.existsSync(settings) ? JSON.parse(fs.readFileSync(settings, "utf8")) : {};
    data.extraKnownMarketplaces = { ...(data.extraKnownMarketplaces || {}), [MARKET]: { source: { source: "github", repo, ...(ref ? { ref } : {}) } } };
    fs.writeFileSync(settings, JSON.stringify(data));
  } else {
    fs.writeFileSync(market, JSON.stringify([{ name: MARKET, source: "directory", path: src }]));
    writeKnown({ source: "directory", path: src });
  }
}
`;

function setup(
  t,
  {
    market,
    known,
    git,
    settings,
    installed,
    missingTags,
    state,
    failAdds,
    failInstalls,
  } = {},
) {
  const h = fs.mkdtempSync(path.join(os.tmpdir(), "marsai-claude-"));
  t.after(() => fs.rmSync(h, { recursive: true, force: true }));
  const fake = path.join(h, "bin");
  fs.mkdirSync(fake);
  fs.writeFileSync(path.join(fake, "package.json"), '{"type":"module"}');
  fs.writeFileSync(
    path.join(fake, "claude"),
    `#!${process.execPath}\n${FAKE_CLAUDE}`,
  );
  fs.chmodSync(path.join(fake, "claude"), 0o755);
  if (git) {
    const deny = git === "ssh" ? 'case "$*" in *https*) exit 1;; esac\n' : "";
    const tags = `case "$*" in *--tags*) for last; do :; done; tag=\${last#refs/tags/}; if [ -f "${h}/missing-tags" ]; then while IFS= read -r t || [ -n "$t" ]; do [ "$t" = "$tag" ] && exit 0; done < "${h}/missing-tags"; fi; echo "abc123\t$last"; exit 0;; esac\n`;
    fs.writeFileSync(
      path.join(fake, "git"),
      `#!/bin/sh\necho "$GIT_TERMINAL_PROMPT $GIT_SSH_COMMAND $*" >> "${h}/git.log"\n${deny}${tags}exit 0\n`,
    );
    fs.chmodSync(path.join(fake, "git"), 0o755);
  }
  if (failAdds) fs.writeFileSync(path.join(h, "fail-adds"), failAdds.join("\n"));
  if (failInstalls)
    fs.writeFileSync(path.join(h, "fail-installs"), failInstalls.join("\n"));
  if (missingTags)
    fs.writeFileSync(path.join(h, "missing-tags"), missingTags.join("\n"));
  if (state)
    fs.writeFileSync(
      path.join(h, ".marsai-installer.json"),
      JSON.stringify({ schema: 1, targets: [], plugins: [], ...state }),
    );
  if (market)
    fs.writeFileSync(path.join(h, "market.json"), JSON.stringify(market));
  fs.mkdirSync(path.join(h, ".claude", "plugins"), { recursive: true });
  if (known)
    fs.writeFileSync(
      path.join(h, ".claude", "plugins", "known_marketplaces.json"),
      JSON.stringify({ [MARKET]: { source: known, installLocation: "/x" } }),
    );
  if (settings !== undefined)
    fs.writeFileSync(path.join(h, ".claude", "settings.json"), settings);
  if (installed)
    fs.writeFileSync(
      path.join(h, ".claude", "plugins", "installed_plugins.json"),
      JSON.stringify(installed),
    );
  return h;
}

function install(h, extra = [], env = {}) {
  return spawnSync(
    process.execPath,
    [
      bin,
      "--mcp",
      "skip",
      "install",
      "--target",
      "claude",
      "--plugin",
      "marsai-core",
      ...extra,
      "--home",
      h,
    ],
    {
      encoding: "utf8",
      env: { ...cleanEnv(), PATH: path.join(h, "bin"), ...env },
    },
  );
}

function cleanEnv() {
  const env = { ...process.env };
  delete env.MARSAI_CHANNEL;
  return env;
}

function cli(h, args, env = {}) {
  return spawnSync(process.execPath, [bin, ...args, "--home", h], {
    encoding: "utf8",
    env: { ...cleanEnv(), PATH: path.join(h, "bin"), ...env },
  });
}

function calls(h) {
  return fs
    .readFileSync(path.join(h, "calls.jsonl"), "utf8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line).join(" "));
}

const checkoutDir = (h) =>
  path.join(h, ".marsai", "marketplace", checkoutKey(own));
const ADD = `plugin marketplace add ${REPO} --sparse .claude-plugin plugins`;
const pinnedAdd = (ref) =>
  `plugin marketplace add ${REPO}#${ref} --sparse .claude-plugin plugins`;
/** `name@marketplace`, the way Claude Code names an installed plugin. */
const from = (plugin) => `${plugin}@${MARKET}`;
const userScope = (...plugins) =>
  Object.fromEntries(plugins.map((plugin) => [plugin, [{ scope: "user" }]]));
const readSettings = (h) =>
  JSON.parse(fs.readFileSync(path.join(h, ".claude", "settings.json"), "utf8"));

test("fresh install with GitHub access adds the GitHub marketplace and enables autoUpdate", (t) => {
  const h = setup(t, { git: true });
  const r = install(h);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const log = calls(h);
  assert.ok(
    log.includes(
      ADD,
    ),
    log.join("\n"),
  );
  assert.ok(!log.some((c) => c.startsWith("plugin marketplace remove")));
  assert.ok(log.includes(`plugin install ${from("marsai-core")}`));
  assert.equal(readSettings(h).extraKnownMarketplaces[MARKET].autoUpdate, true);
  assert.equal(fs.existsSync(checkoutDir(h)), false);
  assert.match(
    fs.readFileSync(path.join(h, "git.log"), "utf8"),
    new RegExp(`^0  ls-remote ${escaped(`https://github.com/${REPO}`)} HEAD`),
  );
  assert.match(r.stdout, /GitHub/);
});

test("migration from directory removes before adding GitHub and reinstalls every marsai plugin", (t) => {
  const h = setup(t, {
    git: true,
    market: [DIRECTORY],
    installed: {
      version: 2,
      plugins: {
        ...userScope(from("marsai-core"), from("marsai-dev")),
        "other@elsewhere": [{ scope: "user" }],
      },
    },
  });
  const r = install(h);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const log = calls(h);
  const remove = log.indexOf(`plugin marketplace remove ${MARKET}`);
  const add = log.findIndex((c) =>
    c.startsWith(`plugin marketplace add ${REPO}`),
  );
  assert.ok(remove >= 0 && add > remove, log.join("\n"));
  assert.ok(log.includes(`plugin install ${from("marsai-core")}`));
  assert.ok(log.includes(`plugin install ${from("marsai-dev")}`));
  assert.ok(!log.includes("plugin install other@elsewhere"));
});

test("existing GitHub marketplace is kept and updated", (t) => {
  const h = setup(t, { git: true, market: [GITHUB], settings: "{}" });
  const r = install(h);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const log = calls(h);
  assert.ok(log.includes(`plugin marketplace update ${MARKET}`));
  assert.ok(!log.some((c) => c.startsWith("plugin marketplace remove")));
  assert.ok(!log.some((c) => c.startsWith("plugin marketplace add")));
});

test("no GitHub access and no marketplace falls back to the bundled checkout", (t) => {
  const h = setup(t, { git: false });
  const r = install(h);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const log = calls(h);
  assert.ok(
    log.includes(`plugin marketplace add ${checkoutDir(h)}`),
    log.join("\n"),
  );
  assert.ok(fs.existsSync(checkoutDir(h)));
  assert.match(r.stdout, /atualização agendada/);
});

test("no GitHub access never downgrades an existing GitHub marketplace", (t) => {
  const h = setup(t, { git: false, market: [GITHUB] });
  const r = install(h);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const log = calls(h);
  assert.ok(!log.some((c) => c.startsWith("plugin marketplace remove")));
  assert.ok(!log.some((c) => c.startsWith("plugin marketplace add")));
  assert.ok(log.includes(`plugin install ${from("marsai-core")}`));
  assert.equal(fs.existsSync(checkoutDir(h)), false);
  assert.match(r.stdout, /sem acesso ao GitHub/);
});

test("no GitHub access with a directory marketplace does not remove it", (t) => {
  const h = setup(t, { git: false, market: [DIRECTORY] });
  const r = install(h);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.ok(!calls(h).some((c) => c.startsWith("plugin marketplace remove")));
});

test("autoUpdate merge preserves other settings keys", (t) => {
  const h = setup(t, {
    git: true,
    settings: JSON.stringify({
      theme: "dark",
      enabledPlugins: { "x@y": true },
      extraKnownMarketplaces: {
        other: { source: { source: "github", repo: "a/b" } },
      },
    }),
  });
  const r = install(h);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const s = readSettings(h);
  assert.equal(s.theme, "dark");
  assert.deepEqual(s.enabledPlugins, { "x@y": true });
  assert.deepEqual(s.extraKnownMarketplaces.other, {
    source: { source: "github", repo: "a/b" },
  });
  assert.deepEqual(s.extraKnownMarketplaces[MARKET], {
    source: { source: "github", repo: REPO },
    autoUpdate: true,
  });
});

test("unparseable settings.json is left untouched with a warning", (t) => {
  const h = setup(t, { git: true, market: [GITHUB], settings: "{not json" });
  const r = install(h);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.equal(
    fs.readFileSync(path.join(h, ".claude", "settings.json"), "utf8"),
    "{not json",
  );
  assert.match(r.stdout, /autoUpdate/);
});

test("dry-run describes the GitHub path with local fallback and runs nothing", (t) => {
  const h = setup(t, { git: true });
  const r = install(h, ["--dry-run"]);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.match(r.stdout, new RegExp(`GitHub ${escaped(REPO)}`));
  assert.match(r.stdout, /checkout local/);
  assert.equal(fs.existsSync(path.join(h, "calls.jsonl")), false);
  assert.equal(fs.existsSync(path.join(h, "git.log")), false);
});

const pkgVersion = JSON.parse(
  fs.readFileSync(path.resolve("package.json"), "utf8"),
).version;
const STABLE_REF = `v${pkgVersion}`;
const STABLE = { MARSAI_CHANNEL: "stable" };
const knownSource = (h) =>
  JSON.parse(
    fs.readFileSync(
      path.join(h, ".claude", "plugins", "known_marketplaces.json"),
      "utf8",
    ),
  )[MARKET].source;
const readState = (h) =>
  JSON.parse(fs.readFileSync(path.join(h, ".marsai-installer.json"), "utf8"));
const claudeEntry = (h) =>
  readState(h).targets.find((entry) => entry.target === "claude");

test("stable fresh install pins the release tag and disables Claude autoUpdate", (t) => {
  const h = setup(t, { git: true });
  const r = install(h, [], STABLE);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const log = calls(h);
  assert.ok(
    log.includes(
      pinnedAdd(STABLE_REF),
    ),
    log.join("\n"),
  );
  assert.ok(!log.some((c) => c.startsWith("plugin marketplace remove")));
  assert.equal(readSettings(h).extraKnownMarketplaces[MARKET].autoUpdate, false);
  assert.equal(knownSource(h).ref, STABLE_REF);
  assert.match(r.stdout, new RegExp(STABLE_REF));
});

test("stable over a GitHub marketplace without ref moves the pin and reinstalls", (t) => {
  const h = setup(t, {
    git: true,
    market: [GITHUB],
    known: { source: "github", repo: REPO },
    settings: JSON.stringify({
      extraKnownMarketplaces: {
        [MARKET]: {
          source: { source: "github", repo: REPO },
          autoUpdate: true,
        },
      },
    }),
    installed: {
      version: 2,
      plugins: {
        ...userScope(from("marsai-core"), from("marsai-dev")),
      },
    },
  });
  const r = install(h, [], STABLE);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const log = calls(h);
  const remove = log.indexOf(`plugin marketplace remove ${MARKET}`);
  const add = log.indexOf(
    pinnedAdd(STABLE_REF),
  );
  assert.ok(remove >= 0 && add > remove, log.join("\n"));
  assert.ok(log.includes(`plugin install ${from("marsai-dev")}`));
  assert.equal(readSettings(h).extraKnownMarketplaces[MARKET].autoUpdate, false);
});

test("stable over an older pinned tag moves the pin", (t) => {
  const h = setup(t, {
    git: true,
    market: [GITHUB],
    known: { source: "github", repo: REPO, ref: "v0.0.1" },
  });
  const r = install(h, [], STABLE);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const log = calls(h);
  assert.ok(log.includes(`plugin marketplace remove ${MARKET}`), log.join("\n"));
  assert.ok(
    log.some((c) =>
      c.startsWith(`plugin marketplace add ${REPO}#${STABLE_REF}`),
    ),
  );
  assert.equal(knownSource(h).ref, STABLE_REF);
});

test("stable with the right tag only updates the marketplace", (t) => {
  const h = setup(t, {
    git: true,
    market: [GITHUB],
    known: { source: "github", repo: REPO, ref: STABLE_REF },
    settings: "{}",
  });
  const r = install(h, [], STABLE);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const log = calls(h);
  assert.ok(log.includes(`plugin marketplace update ${MARKET}`));
  assert.ok(!log.some((c) => c.startsWith("plugin marketplace remove")));
  assert.ok(!log.some((c) => c.startsWith("plugin marketplace add")));
});

test("--channel main overrides MARSAI_CHANNEL=stable and unpins", (t) => {
  const h = setup(t, {
    git: true,
    market: [GITHUB],
    known: { source: "github", repo: REPO, ref: STABLE_REF },
  });
  const r = install(h, ["--channel", "main"], STABLE);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const log = calls(h);
  assert.ok(log.includes(`plugin marketplace remove ${MARKET}`), log.join("\n"));
  assert.ok(
    log.includes(
      ADD,
    ),
  );
  assert.equal(readSettings(h).extraKnownMarketplaces[MARKET].autoUpdate, true);
  assert.equal(readState(h).channel, "main");
  assert.equal(claudeEntry(h).marketplaceRef, null);
  assert.equal(claudeEntry(h).claudeAutoUpdate, true);
});

test("invalid channel is rejected before touching anything", (t) => {
  const h = setup(t, { git: true });
  const flag = install(h, ["--channel", "beta"]);
  assert.notEqual(flag.status, 0);
  assert.match(flag.stderr, /stable, main/);
  const env = install(h, [], { MARSAI_CHANNEL: "beta" });
  assert.notEqual(env.status, 0);
  assert.match(env.stderr, /MARSAI_CHANNEL/);
  assert.equal(fs.existsSync(path.join(h, "calls.jsonl")), false);
});

test("stable without GitHub access falls back to the bundled checkout of this version", (t) => {
  const h = setup(t, { git: false });
  const r = install(h, [], STABLE);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.ok(calls(h).includes(`plugin marketplace add ${checkoutDir(h)}`));
  assert.match(r.stdout, new RegExp(pkgVersion.replaceAll(".", "\\.")));
  assert.equal(claudeEntry(h).marketplaceMode, "local");
});

test("stable with a missing tag falls back to local when nothing was registered", (t) => {
  const h = setup(t, { git: true, missingTags: [STABLE_REF] });
  const r = install(h, [], STABLE);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.ok(calls(h).includes(`plugin marketplace add ${checkoutDir(h)}`));
  assert.equal(claudeEntry(h).marketplaceMode, "local");
});

test("stable with an unpublished tag keeps the current marketplace without removing it", (t) => {
  const h = setup(t, {
    git: true,
    market: [GITHUB],
    known: { source: "github", repo: REPO, ref: "v0.0.1" },
    settings: JSON.stringify({
      extraKnownMarketplaces: {
        [MARKET]: {
          source: { source: "github", repo: REPO, ref: "v0.0.1" },
        },
      },
    }),
    missingTags: [STABLE_REF],
  });
  const r = install(h, [], STABLE);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const log = calls(h);
  assert.ok(!log.some((c) => c.startsWith("plugin marketplace remove")), log.join("\n"));
  assert.ok(!log.some((c) => c.startsWith("plugin marketplace add")));
  assert.match(
    r.stdout,
    new RegExp(`tag ${STABLE_REF} ainda não publicada; o pin continua em tag v0\\.0\\.1`),
  );
  assert.match(
    fs.readFileSync(path.join(h, "git.log"), "utf8"),
    new RegExp(
      `ls-remote --tags ${escaped(`https://github.com/${REPO}`)} refs/tags/${escaped(STABLE_REF)}`,
    ),
  );
  assert.equal(claudeEntry(h).marketplaceRef, "v0.0.1");
  assert.equal(claudeEntry(h).claudeAutoUpdate, false);
});

test("stable with an unpublished tag over main keeps main with autoUpdate on", (t) => {
  const h = setup(t, {
    git: true,
    market: [GITHUB],
    known: { source: "github", repo: REPO },
    settings: JSON.stringify({
      extraKnownMarketplaces: {
        [MARKET]: { source: { source: "github", repo: REPO } },
      },
    }),
    missingTags: [STABLE_REF],
  });
  const r = install(h, [], STABLE);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.ok(!calls(h).some((c) => c.startsWith("plugin marketplace remove")));
  assert.equal(readSettings(h).extraKnownMarketplaces[MARKET].autoUpdate, true);
  assert.equal(claudeEntry(h).marketplaceRef, null);
  assert.equal(claudeEntry(h).claudeAutoUpdate, true);
});

test("failed add after remove restores the previous GitHub ref with matching autoUpdate", (t) => {
  const h = setup(t, {
    git: true,
    market: [GITHUB],
    known: { source: "github", repo: REPO },
    settings: "{}",
    failAdds: [`${REPO}#${STABLE_REF}`],
  });
  const r = install(h, [], STABLE);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const log = calls(h);
  assert.ok(
    log.includes(
      ADD,
    ),
    log.join("\n"),
  );
  assert.ok(!log.includes(`plugin marketplace add ${checkoutDir(h)}`));
  assert.equal(claudeEntry(h).marketplaceMode, "github");
  assert.equal(claudeEntry(h).marketplaceRef, null);
  assert.equal(readSettings(h).extraKnownMarketplaces[MARKET].autoUpdate, true);
});

test("failed add and failed restore never fall back to local and print the recovery", (t) => {
  const h = setup(t, {
    git: true,
    market: [GITHUB],
    known: { source: "github", repo: REPO, ref: "v0.0.1" },
    installed: {
      version: 2,
      plugins: {
        ...userScope(from("marsai-core"), from("marsai-dev")),
      },
    },
    failAdds: [`${REPO}#${STABLE_REF}`, `${REPO}#v0.0.1`],
  });
  const r = install(h, [], STABLE);
  assert.notEqual(r.status, 0);
  const log = calls(h);
  assert.ok(!log.includes(`plugin marketplace add ${checkoutDir(h)}`), log.join("\n"));
  assert.match(r.stdout, /marsai-core, marsai-dev/);
  assert.match(
    r.stdout,
    new RegExp(escaped(`claude ${pinnedAdd(STABLE_REF)}`)),
  );
  assert.match(r.stdout, new RegExp(escaped(`claude plugin install ${from("marsai-dev")}`)));
  const entry = claudeEntry(h);
  assert.equal(entry.marketplaceMode, null);
  assert.deepEqual(entry.failedPlugins, ["marsai-core", "marsai-dev"]);
});

test("failed local fallback after removing a directory marketplace prints the recovery", (t) => {
  const h = setup(t, {
    git: true,
    market: [DIRECTORY],
    installed: {
      version: 2,
      plugins: userScope(from("marsai-dev")),
    },
    failAdds: [REPO],
  });
  fs.appendFileSync(path.join(h, "fail-adds"), `\n${checkoutDir(h)}`);
  const r = install(h);
  assert.notEqual(r.status, 0);
  assert.ok(calls(h).includes(`plugin marketplace remove ${MARKET}`));
  assert.match(r.stdout, /marsai-dev/);
  assert.match(r.stdout, new RegExp(escaped(`claude plugin install ${from("marsai-dev")}`)));
  assert.match(r.stdout, new RegExp(escaped(`claude plugin marketplace add ${REPO} --sparse`)));
});

test("partial reinstall records the marketplace block and the failed plugins", (t) => {
  const h = setup(t, {
    git: true,
    market: [GITHUB],
    known: { source: "github", repo: REPO },
    installed: {
      version: 2,
      plugins: {
        ...userScope(from("marsai-core"), from("marsai-dev")),
      },
    },
    failInstalls: [from("marsai-dev")],
  });
  const r = install(h, [], STABLE);
  assert.notEqual(r.status, 0);
  const entry = claudeEntry(h);
  assert.equal(entry.marketplaceRef, STABLE_REF);
  assert.equal(entry.marketplaceMode, "github");
  assert.equal(entry.claudeAutoUpdate, false);
  assert.deepEqual(entry.failedPlugins, ["marsai-dev"]);
  assert.match(cli(h, ["status"]).stdout, /plugins com falha: marsai-dev/);
});

test("access probe falls back to SSH when HTTPS fails", (t) => {
  const h = setup(t, { git: "ssh" });
  const r = install(h);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const gitLog = fs.readFileSync(path.join(h, "git.log"), "utf8");
  assert.match(
    gitLog,
    new RegExp(
      `ssh -o BatchMode=yes ls-remote ${escaped(`git@github.com:${REPO}`)} HEAD`,
    ),
  );
  assert.ok(
    calls(h).some((c) => c.startsWith(`plugin marketplace add ${REPO}`)),
  );
});

test("--auto-update on stable is unsupported, creates no task and exits 0", (t) => {
  const h = setup(t, { git: true });
  const r = install(h, ["--auto-update"], STABLE);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.match(r.stdout, /não se aplica ao canal stable/);
  assert.equal(readState(h).autoUpdate.status, "unsupported");
  assert.equal(
    fs.existsSync(path.join(h, "Library", "LaunchAgents")) ||
      fs.existsSync(path.join(h, ".config", "systemd")),
    false,
  );
});

function plantTask(h, status = "prepared") {
  const task =
    process.platform === "darwin"
      ? path.join(h, "Library", "LaunchAgents", "com.v4company.marsai.update.plist")
      : path.join(h, ".config", "systemd", "user", "marsai-update.timer");
  fs.mkdirSync(path.dirname(task), { recursive: true });
  fs.writeFileSync(task, "<plist/>");
  const saved = readState(h);
  saved.autoUpdate = { status, path: task, message: "x" };
  fs.writeFileSync(path.join(h, ".marsai-installer.json"), JSON.stringify(saved));
  return task;
}

test("stable turns off an existing daily task before syncing targets", (t) => {
  const h = setup(t, { git: true });
  assert.equal(install(h).status, 0);
  const task = plantTask(h);
  const r = cli(h, ["--mcp", "skip", "update"], STABLE);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.equal(fs.existsSync(task), false);
  assert.equal(readState(h).autoUpdate.status, "disabled");
  const warning = r.stdout.indexOf("canal stable");
  assert.ok(warning >= 0 && warning < r.stdout.indexOf("Claude Code"), r.stdout);
});

test("stable treats a task in error state as active when its file exists", (t) => {
  const h = setup(t, { git: true });
  assert.equal(install(h).status, 0);
  const task = plantTask(h, "error");
  const r = cli(h, ["--mcp", "skip", "update"], STABLE);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.equal(fs.existsSync(task), false);
});

test("--auto-update on stable keeps the recorded task path", (t) => {
  const h = setup(t, { git: true });
  assert.equal(install(h).status, 0);
  const saved = readState(h);
  saved.autoUpdate = { status: "disabled", path: path.join(h, "gone.plist") };
  fs.writeFileSync(path.join(h, ".marsai-installer.json"), JSON.stringify(saved));
  const r = install(h, ["--auto-update"], STABLE);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.equal(readState(h).autoUpdate.status, "unsupported");
  assert.equal(readState(h).autoUpdate.path, path.join(h, "gone.plist"));
});

test("dry-run update on stable says an active daily task would be turned off", (t) => {
  const h = setup(t, { git: true });
  assert.equal(install(h).status, 0);
  const task = plantTask(h);
  const r = cli(h, ["--mcp", "skip", "update", "--dry-run"], STABLE);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.match(r.stdout, /atualização diária ativa seria desligada/);
  assert.ok(fs.existsSync(task));
});

test("scheduled run on stable exits 0 without syncing and turns its own task off", (t) => {
  const h = setup(t, { git: true });
  assert.equal(install(h, [], STABLE).status, 0);
  const task = plantTask(h);
  fs.rmSync(path.join(h, "calls.jsonl"));
  const r = cli(h, ["update", "--scheduled"]);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.match(r.stdout, /no canal stable a atualização vem do brew/);
  assert.equal(fs.existsSync(path.join(h, "calls.jsonl")), false);
  assert.equal(fs.existsSync(task), false);
});

test("state records the channel and status reports Claude pin and drift", (t) => {
  const h = setup(t, { git: true });
  assert.equal(install(h, [], STABLE).status, 0);
  const entry = claudeEntry(h);
  assert.equal(readState(h).channel, "stable");
  assert.equal(entry.marketplaceRef, STABLE_REF);
  assert.equal(entry.marketplaceMode, "github");
  assert.equal(entry.claudeAutoUpdate, false);
  const clean = cli(h, ["status"], STABLE);
  assert.equal(clean.status, 0, clean.stderr);
  assert.match(clean.stdout, /canal: stable/);
  assert.match(clean.stdout, new RegExp(`github @ ${STABLE_REF}`));
  assert.doesNotMatch(clean.stdout, /rode `marsai update`/);
  const saved = readState(h);
  saved.targets.find((x) => x.target === "claude").marketplaceRef = "v0.0.1";
  fs.writeFileSync(
    path.join(h, ".marsai-installer.json"),
    JSON.stringify(saved),
  );
  assert.match(cli(h, ["status"], STABLE).stdout, /rode `marsai update`/);
});

test("persisted stable channel survives an install without env or flag and warns", (t) => {
  const h = setup(t, { git: true });
  assert.equal(install(h, [], STABLE).status, 0);
  const r = install(h);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.match(r.stdout, /canal stable gravado no estado/);
  assert.match(r.stdout, /brew upgrade marsai && marsai update/);
  assert.match(r.stdout, /--channel main/);
  assert.match(r.stdout, new RegExp(`fixa o Claude Code na ${STABLE_REF}`));
  assert.equal(readState(h).channel, "stable");
  assert.ok(calls(h).includes(`plugin marketplace update ${MARKET}`));
});
