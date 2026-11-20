import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { commandExists, launchCommand } from "./fs-utils.js";
import { t } from "./i18n.js";

function run(cmd, args, opts = {}) {
  const start = launchCommand(cmd, args, { env: opts.env });
  const r = spawnSync(start.command, start.args, {
    encoding: "utf8",
    timeout: 120000,
    ...opts,
    ...start.options,
  });
  return {
    ok: r.status === 0,
    stdout: (r.stdout || "").trim(),
    // A program that could not be started leaves no output: the reason is the error.
    stderr: [r.stderr, r.error?.message].filter(Boolean).join("\n").trim(),
  };
}

/** Wrap an already-captured output (from spawnSync inside callers). */
export function looksLikeAlready(out) {
  return /already/i.test(out);
}

export function claudeExists() {
  return commandExists("claude");
}

function claudeOpts(home) {
  if (!home) return {};
  const env = { ...process.env, HOME: home, USERPROFILE: home };
  delete env.CLAUDE_CONFIG_DIR;
  return { env };
}

function claudeConfigDir(home) {
  if (home) return path.join(home, ".claude");
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
}

function normalizeSource(source) {
  if (!source || typeof source !== "object") return null;
  return {
    source: source.source,
    repo: source.repo,
    path: source.path,
    url: source.url,
    ref: source.ref ?? null,
  };
}

function knownMarketplace(name, home) {
  const file = path.join(
    claudeConfigDir(home),
    "plugins",
    "known_marketplaces.json",
  );
  try {
    return normalizeSource(
      JSON.parse(fs.readFileSync(file, "utf8"))?.[name]?.source,
    );
  } catch {
    return null;
  }
}

function listedMarketplace(name, opts) {
  const r = run("claude", ["plugin", "marketplace", "list", "--json"], opts);
  try {
    const list = JSON.parse(r.stdout || "[]");
    const found = Array.isArray(list) && list.find((m) => m?.name === name);
    return found ? normalizeSource(found) : null;
  } catch {
    return null;
  }
}

function findMarketplace(name, home, opts) {
  return knownMarketplace(name, home) || listedMarketplace(name, opts);
}

/**
 * Where Claude Code has the marketplace `name` registered from, read from its
 * own file and without running it, or null when the file does not list it.
 * @returns {{ source?: string, repo?: string, path?: string, url?: string, ref: string|null }|null}
 */
export function claudeRegistered(name, home = null) {
  return knownMarketplace(name, home);
}

function lsRemote(repo, flags, patterns, opts) {
  const env = { ...(opts.env || process.env), GIT_TERMINAL_PROMPT: "0" };
  const query = (remote, extra = {}) =>
    run("git", ["ls-remote", ...flags, remote, ...patterns], {
      ...opts,
      env: { ...env, ...extra },
      timeout: 20000,
    });
  const https = query(`https://github.com/${repo}`);
  if (https.ok) return https;
  return query(`git@github.com:${repo}`, {
    GIT_SSH_COMMAND: "ssh -o BatchMode=yes",
  });
}

/** Probe with the same HOME claude will use, so the result predicts its own clone. */
function githubAccess(repo, opts) {
  return lsRemote(repo, [], ["HEAD"], opts).ok;
}

function tagPublished(repo, ref, opts) {
  const r = lsRemote(repo, ["--tags"], [`refs/tags/${ref}`], opts);
  return r.ok && r.stdout.length > 0;
}

/** The plugins a person installed, for every project, from the marketplace `name`. */
export function claudeInstalledFrom(name, home) {
  const registry = path.join(
    home,
    ".claude",
    "plugins",
    "installed_plugins.json",
  );
  try {
    const plugins = JSON.parse(fs.readFileSync(registry, "utf8")).plugins || {};
    return Object.entries(plugins)
      .filter(
        ([key, entries]) =>
          key.endsWith(`@${name}`) &&
          Array.isArray(entries) &&
          entries.some((e) => e?.scope === "user"),
      )
      .map(([key]) => key.slice(0, -name.length - 1));
  } catch {
    return [];
  }
}

/** Merge extraKnownMarketplaces.<name>.autoUpdate = enabled; never clobbers an unreadable file. */
export function ensureAutoUpdate(name, home, enabled = true) {
  const file = path.join(home || os.homedir(), ".claude", "settings.json");
  const warn = (why) => ({
    ok: false,
    message: t("claude.settings.warn", { why, file, name, enabled }),
  });
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return warn(t("claude.settings.unreadable"));
  }
  const entry = data?.extraKnownMarketplaces?.[name];
  if (!entry || typeof entry !== "object")
    return warn(t("claude.settings.noEntry", { name }));
  if (entry.autoUpdate === enabled) return { ok: true };
  entry.autoUpdate = enabled;
  try {
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
    return { ok: true };
  } catch {
    return warn(t("claude.settings.writeFailed"));
  }
}

function addLocal(localCheckout, name, opts) {
  const add = run(
    "claude",
    ["plugin", "marketplace", "add", localCheckout],
    opts,
  );
  const addOut = `${add.stdout}\n${add.stderr}`;
  if (!add.ok && !looksLikeAlready(addOut))
    return { ok: false, message: t("claude.addFailed", { output: addOut }) };
  if (looksLikeAlready(addOut)) {
    const upd = run("claude", ["plugin", "marketplace", "update", name], opts);
    if (!upd.ok)
      return {
        ok: false,
        message: t("claude.updateAfterAddFailed", {
          name,
          output: `${upd.stdout}\n${upd.stderr}`,
        }),
      };
  }
  return { ok: true };
}

function addGithub(repo, ref, opts) {
  return run(
    "claude",
    [
      "plugin",
      "marketplace",
      "add",
      ref ? `${repo}#${ref}` : repo,
      "--sparse",
      ".claude-plugin",
      "plugins",
    ],
    opts,
  );
}

function describeRef(ref) {
  return ref ? t("claude.ref.tag", { ref }) : "main";
}

function githubResult({ name, repo, home, ref, reinstall, notes }) {
  const autoUpdate = ref === null;
  const au = ensureAutoUpdate(name, home, autoUpdate);
  notes.push(
    autoUpdate
      ? t("claude.github.following", { name, repo })
      : t("claude.github.pinned", { name, repo, ref: describeRef(ref) }),
  );
  if (!au.ok) notes.push(au.message);
  return {
    ok: true,
    mode: "github",
    ref,
    autoUpdate: au.ok ? autoUpdate : null,
    reinstall,
    message: notes.join("\n"),
  };
}

function recoveryFailure({ name, repo, ref, reinstall, why }) {
  const recovery = [
    `claude plugin marketplace add ${ref ? `${repo}#${ref}` : repo} --sparse .claude-plugin plugins`,
    ...reinstall.map((plugin) => `claude plugin install ${plugin}@${name}`),
  ];
  return {
    ok: false,
    reinstall,
    recovery,
    message: [
      why,
      t("claude.recovery.removed", { name, plugins: reinstall.join(", ") }),
      t("claude.recovery.how"),
      ...recovery.map((command) => `  ${command}`),
    ].join("\n"),
  };
}

/**
 * Register the marketplace once, before any plugin install.
 * `ref` null follows main; a tag pins the GitHub source. Claude's autoUpdate follows
 * the ref actually registered: on without a ref, off with one. Moving to another ref
 * is remove -> add -> reinstall, and it only starts once the tag is confirmed on the
 * remote. After a GitHub source is removed, a failed add restores it; if that also
 * fails the result is an error carrying the manual recovery, never the bundled
 * checkout, so GitHub is never downgraded to local.
 * `localCheckout` is a thunk so the copy happens only when used.
 * `name` and `repo` are the marketplace's own: its `marketplace.json` name and the
 * `Owner/name` of its GitHub repository. A marketplace with no repository can only
 * be registered from the bundled checkout.
 * `replaced` is true when the name was registered from another place (another
 * repository, a folder) and now comes from this one.
 * @returns {{ ok: boolean, mode?: "github"|"local", ref?: string|null, autoUpdate?: boolean|null, message: string, reinstall: string[], replaced?: boolean, recovery?: string[] }}
 */
export function claudeEnsureMarketplace({
  name,
  repo,
  home = null,
  localCheckout,
  ref = null,
  version,
}) {
  const opts = claudeOpts(home);
  const existing = findMarketplace(name, home, opts);
  const isGithub =
    Boolean(repo) && existing?.source === "github" && existing?.repo === repo;
  const access = Boolean(repo) && githubAccess(repo, opts);
  const fallback = (why, reinstall = []) => {
    const r = addLocal(localCheckout(), name, opts);
    if (!r.ok) return { ...r, reinstall };
    return {
      ok: true,
      mode: "local",
      ref: null,
      autoUpdate: false,
      reinstall,
      message: t("claude.local", { why, name, version, pinned: Boolean(ref) }),
    };
  };

  if (!repo) return fallback(t("claude.noRepository"));
  if (!access && !isGithub) return fallback(t("claude.noAccess", { repo }));

  const notes = [];
  if (!access) {
    notes.push(
      t("claude.noAccessKept", { repo }),
    );
    if (existing.ref !== ref)
      notes.push(
        t("claude.staysAt", {
          current: describeRef(existing.ref),
          wanted: describeRef(ref),
        }),
      );
    return githubResult({
      name,
      repo,
      home,
      ref: existing.ref,
      reinstall: [],
      notes,
    });
  }

  if (isGithub && existing.ref === ref) {
    const upd = run("claude", ["plugin", "marketplace", "update", name], opts);
    if (!upd.ok)
      return {
        ok: false,
        reinstall: [],
        message: t("claude.updateFailed", {
          name,
          output: `${upd.stdout}\n${upd.stderr}`,
        }),
      };
    return githubResult({ name, repo, home, ref, reinstall: [], notes });
  }

  if (ref && !tagPublished(repo, ref, opts)) {
    const why = t("claude.tagMissing", { ref });
    if (!isGithub) return fallback(why);
    notes.push(
      t("claude.pinStays", { why, current: describeRef(existing.ref) }),
    );
    return githubResult({
      name,
      repo,
      home,
      ref: existing.ref,
      reinstall: [],
      notes,
    });
  }

  const reinstall = existing && home ? claudeInstalledFrom(name, home) : [];
  // Registered from somewhere else until now: what was installed from there
  // comes back only when this marketplace has it, which the caller knows.
  const replaced = Boolean(existing) && !isGithub;
  if (existing) {
    const rm = run("claude", ["plugin", "marketplace", "remove", name], opts);
    if (!rm.ok)
      return {
        ok: false,
        reinstall: [],
        message: t("claude.removeFailed", {
          name,
          source: existing.source,
          wanted: describeRef(ref),
          output: `${rm.stdout}\n${rm.stderr}`,
        }),
      };
  }
  const add = addGithub(repo, ref, opts);
  if (add.ok)
    return {
      ...githubResult({ name, repo, home, ref, reinstall, notes }),
      replaced,
    };
  const why = t("claude.githubAddFailed", {
    wanted: describeRef(ref),
    output: add.stderr || add.stdout,
  });
  if (isGithub) {
    if (!addGithub(repo, existing.ref, opts).ok)
      return recoveryFailure({ name, repo, ref, reinstall, why });
    notes.push(t("claude.restored", { why }));
    return githubResult({
      name,
      repo,
      home,
      ref: existing.ref,
      reinstall,
      notes,
    });
  }
  const local = fallback(why, reinstall);
  if (!local.ok && existing)
    return recoveryFailure({
      name,
      repo,
      ref,
      reinstall,
      why: `${why}\n${local.message}`,
    });
  return { ...local, replaced };
}

/** Install or update one plugin; the marketplace must already be registered. */
export function claudeInstall(plugin, marketplaceName, home = null) {
  const opts = claudeOpts(home);
  const install = run(
    "claude",
    ["plugin", "install", `${plugin}@${marketplaceName}`],
    opts,
  );
  const installOut = `${install.stdout}\n${install.stderr}`;
  if (!install.ok && !looksLikeAlready(installOut)) {
    return {
      ok: false,
      message: t("claude.installFailed", { output: installOut }),
    };
  }

  if (looksLikeAlready(installOut)) {
    const upd = run(
      "claude",
      ["plugin", "update", `${plugin}@${marketplaceName}`],
      opts,
    );
    if (upd.ok)
      return {
        ok: true,
        message: t("claude.updated", { plugin }),
      };
    return {
      ok: false,
      message: t("claude.pluginUpdateFailed", {
        plugin,
        output: `${upd.stdout}\n${upd.stderr}`,
      }),
    };
  }

  return { ok: true, message: t("claude.installed", { plugin }) };
}

export function claudeUninstall(plugin, marketplaceName, home = null) {
  const opts = claudeOpts(home);
  const r = run(
    "claude",
    ["plugin", "uninstall", `${plugin}@${marketplaceName}`],
    opts,
  );
  if (r.ok) return { ok: true, message: t("claude.uninstalled", { plugin }) };
  const out = `${r.stdout}\n${r.stderr}`;
  if (looksLikeAlready(out) || /not installed|no plugin/i.test(out)) {
    return { ok: true, message: t("claude.notInstalled", { plugin }) };
  }
  return { ok: false, message: t("claude.uninstallFailed", { output: out }) };
}
