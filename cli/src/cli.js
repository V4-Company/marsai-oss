import fs from "node:fs";
import { createInterface } from "node:readline/promises";
import { askAccess, terminalQuestion, startMcpLogin } from "./mcp-login.js";
import path from "node:path";
import {
  APP_NAMES,
  isTestMode,
  contentSummary,
  integrationLines,
  autoUpdateSummary,
} from "./presentation.js";
import {
  TARGETS,
  groupPlugins,
  loadCatalog,
  pluginsFor,
  resolvePlugins,
} from "./catalog.js";
import { runWizard } from "./wizard.js";
import {
  configureAutoUpdate,
  autoUpdateRuns,
  autoUpdateStatus,
} from "./auto-update.js";
import { confirmed, planApp, planLines, reportLines } from "./migrate.js";
import { ownedFile } from "./ownership.js";
import {
  mcpDependencies,
  configureMcp,
  statusMcp,
  doctorMcp,
  removeMcp,
} from "./mcp.js";
import { LAUNCHER_DIR, PKG_VERSION, releaseRef } from "./constants.js";
import { resolveChannel } from "./channel.js";
import { commandExists, isDir, targetHome } from "./fs-utils.js";
import { checkoutKey, installationRoots, npxSpec } from "./roots.js";
import {
  checkoutPath,
  launcherCheckoutPath,
  readState,
  recordPlugins,
  recordTarget,
  removeTarget,
  statePath,
  writeState,
} from "./state.js";
import * as claude from "./claude.js";
import * as codex from "./codex.js";
import * as cursor from "./cursor.js";
import * as opencode from "./opencode.js";
// `t` names a target in the loops of this file, so the texts come through `tr` here.
import { LANGS, normalizeLang, setLang, t as tr } from "./i18n.js";

/** What the daily update has to run to see the same roots as this run. */
function scheduled(catalog) {
  return {
    spec: npxSpec(catalog.entry),
    extraRoots: catalog.scheduledRoots,
  };
}

/** Help text. Groups, plugins, MCP flags and the npx command all come from the catalog. */
function usage(catalog) {
  const root = catalog.entry;
  const { spec } = scheduled(catalog);
  const run = spec ? `npx ${spec}` : "marsai";
  const plugins = [...catalog.plugins.values()];
  const width = Math.max(14, ...plugins.map((plugin) => plugin.name.length));
  const mcpFlags = [...catalog.providers.values()].flatMap(
    ({ id, provider, access }) => [
      ...(access ? [tr("cli.usage.access", { id })] : []),
      tr("cli.usage.url", { id, url: provider.url }),
    ],
  );
  return tr("cli.usage", {
    run,
    owner: root.owner,
    groups: [...catalog.groups.keys()].join(" | "),
    mcpFlags,
    plugins: plugins.map((plugin) => plugin.name).join(" | "),
    targets: TARGETS.join(" | "),
    list: plugins
      .map((plugin) => `  ${plugin.name.padEnd(width)} ${plugin.description}`)
      .join("\n"),
  });
}

const VALUE_FLAGS = [
  "--group",
  "--mcp",
  "--mcp-url",
  "--mcp-access",
  "--plugin",
  "--target",
  "--home",
  "--channel",
  "--lang",
];

/** `--<id>-url` and `--<id>-access` exist for every MCP provider the catalog declares. */
function providerFlag(catalog, arg) {
  if (VALUE_FLAGS.includes(arg)) return null;
  const match = /^--([a-z0-9][a-z0-9-]*)-(url|access)$/.exec(arg);
  return match && catalog.providers.has(match[1])
    ? { id: match[1], kind: match[2] }
    : null;
}

/** `problem` says what was wrong, in the words of the flag that carried the value. */
function accessValue(value, problem) {
  if (!["yes", "no"].includes(value)) throw new Error(problem());
  return value === "yes";
}

/**
 * `--lang` has to be known before anything is said, so it is read ahead of the
 * other arguments. Without it the language comes from the environment.
 */
function chooseLang(argv) {
  const at = argv.indexOf("--lang");
  if (at < 0) return setLang(undefined);
  const value = argv[at + 1];
  if (!normalizeLang(value))
    throw new Error(
      tr("lang.invalid", { value: value ?? "", valid: LANGS.join(", ") }),
    );
  return setLang(value);
}

/** Split the `<id>=<value>` of the generic MCP flags. */
function providerPair(catalog, flag, value) {
  const at = value.indexOf("=");
  const id = value.slice(0, Math.max(at, 0));
  if (!catalog.providers.has(id))
    throw new Error(
      tr("cli.pair", { flag, known: [...catalog.providers.keys()].join(", ") }),
    );
  return [id, value.slice(at + 1)];
}

function parseArgs(argv, catalog) {
  const args = {
    plugins: [],
    groups: [],
    targets: [],
    mcpUrls: {},
    mcpAccess: {},
    _: [],
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const provider = providerFlag(catalog, a);
    if (
      (VALUE_FLAGS.includes(a) || provider) &&
      (!argv[i + 1] || argv[i + 1].startsWith("-"))
    )
      throw new Error(tr("cli.valueRequired", { flag: a }));
    if (provider) {
      const value = argv[++i];
      if (provider.kind === "url") args.mcpUrls[provider.id] = value;
      else
        args.mcpAccess[provider.id] = accessValue(value, () =>
          tr("cli.yesNo", { flag: a }),
        );
      continue;
    }
    switch (a) {
      case "--group": {
        const group = argv[++i];
        args.groups.push(
          // An alias the plugin declares resolves to the group's id, which is what the state records.
          catalog.groups.has(group) ? group : (catalog.groupAliases?.get(group) ?? group),
        );
        break;
      }
      case "--auto-update":
        args.autoUpdate = true;
        break;
      case "--no-auto-update":
        args.autoUpdate = false;
        break;
      case "--mcp":
        args.mcp = argv[++i];
        break;
      case "--mcp-access": {
        const [id, value] = providerPair(catalog, a, argv[++i]);
        args.mcpAccess[id] = accessValue(value, () =>
          tr("cli.pairAccess", { flag: a, id }),
        );
        break;
      }
      case "--mcp-url": {
        const [id, value] = providerPair(catalog, a, argv[++i]);
        args.mcpUrls[id] = value;
        break;
      }
      case "--plugin":
        args.plugins.push(argv[++i]);
        break;
      case "--target":
        args.targets.push(argv[++i]);
        break;
      case "--home":
        args.home = argv[++i];
        break;
      case "--channel":
        args.channel = argv[++i];
        break;
      case "--lang":
        args.lang = argv[++i];
        break;
      case "--scheduled":
        args.scheduled = true;
        break;
      case "--yes":
      case "-y":
        args.yes = true;
        break;
      case "--dry-run":
        args.dryRun = true;
        break;
      case "--version":
        args.version = true;
        break;
      case "--help":
      case "-h":
        args.help = true;
        break;
      default:
        if (a.startsWith("--"))
          throw new Error(
            `${tr("cli.unknownFlag", { flag: a })}\n\n${usage(catalog)}`,
          );
        args._.push(a);
    }
  }
  for (const g of args.groups) {
    if (!catalog.groups.has(g))
      throw new Error(
        tr("cli.unknownGroup", {
          group: g,
          valid: [...catalog.groups.keys()].join(", "),
        }),
      );
  }
  if (args.mcp && !["auto", "skip"].includes(args.mcp))
    throw new Error(tr("cli.mcpMode"));
  for (const p of args.plugins) {
    if (!catalog.plugins.has(p))
      throw new Error(
        tr("cli.unknownPlugin", {
          plugin: p,
          valid: [...catalog.plugins.keys()].join(", "),
        }),
      );
  }
  for (const t of args.targets) {
    if (!TARGETS.includes(t))
      throw new Error(
        tr("cli.unknownTarget", { target: t, valid: TARGETS.join(", ") }),
      );
  }
  if (args._.length > 1)
    throw new Error(tr("cli.oneCommand"));
  return args;
}

export function detectTargets(home = targetHome()) {
  const found = [];
  if (
    isDir(path.join(home, ".claude")) ||
    (home === targetHome() && claude.claudeExists())
  )
    found.push("claude");
  if (isDir(path.join(home, ".codex"))) found.push("codex");
  if (
    isDir(path.join(home, ".cursor")) ||
    (home === targetHome() && commandExists("cursor"))
  )
    found.push("cursor");
  if (isDir(path.join(home, ".config", "opencode"))) found.push("opencode");
  return found;
}

/** Names of the plugins the arguments select, each after the ones it depends on. */
function selectedPlugins(args, catalog) {
  return resolvePlugins(catalog, [
    ...new Set([...args.plugins, ...groupPlugins(catalog, args.groups)]),
  ]);
}

function resolveTargets(args, detected) {
  if (args.targets.length) return [...new Set(args.targets)];
  if (!detected.length)
    throw new Error(tr("cli.noTarget"));
  return detected;
}

function ensureCheckout(home, root, { dryRun }) {
  // The bundled marketplace matches this running installer version.
  const checkout = checkoutPath(home, checkoutKey(root));
  if (dryRun) return { checkout, bundled: true };
  fs.mkdirSync(path.dirname(checkout), { recursive: true });
  fs.rmSync(checkout, { recursive: true, force: true });
  fs.cpSync(root.pluginsDir, path.join(checkout, "plugins"), {
    recursive: true,
  });
  fs.cpSync(
    path.join(root.dir, ".claude-plugin"),
    path.join(checkout, ".claude-plugin"),
    { recursive: true },
  );
  return { checkout, bundled: true };
}

/** The tag a root's marketplace is pinned to on the stable channel: its own release. */
function stableRef(root, channel) {
  return channel === "stable" && root.version ? releaseRef(root.version) : null;
}

/** Plugin names per root, in root order. For Claude Code each root is one marketplace. */
function byRoot(plugins) {
  const selected = new Map();
  for (const plugin of plugins)
    selected.set(plugin.root, [
      ...(selected.get(plugin.root) ?? []),
      plugin.name,
    ]);
  return [...selected];
}

/** Register one root's marketplace and install that root's plugins from it. */
function syncMarketplace(root, names, home, channel, catalog) {
  const name = root.marketplace;
  const market = claude.claudeEnsureMarketplace({
    name,
    repo: root.repo,
    home,
    localCheckout: () => ensureCheckout(home, root, { dryRun: false }).checkout,
    ref: stableRef(root, channel),
    version: root.version,
  });
  // What was installed from this marketplace comes back after it is registered
  // again, except a plugin that another root carries now: that root installs it.
  // When the name was registered from another place until now, a plugin no root
  // carries does not exist in this marketplace: it is reported, not installed.
  const notCarried = market.replaced
    ? market.reinstall.filter((plugin) => !catalog.plugins.has(plugin))
    : [];
  const reinstall = market.reinstall.filter((plugin) => {
    const carrier = catalog.plugins.get(plugin)?.root;
    return carrier ? carrier === root : !market.replaced;
  });
  const wanted = [...new Set([...names, ...reinstall])];
  if (!market.ok && !market.recovery)
    return { root, ok: false, message: market.message, failedPlugins: names };
  if (!market.ok)
    return {
      root,
      ok: false,
      message: market.message,
      record: { ref: null, mode: null, autoUpdate: null },
      plugins: [],
      failedPlugins: wanted,
    };
  const results = wanted.map((plugin) => ({
    plugin,
    ...claude.claudeInstall(plugin, name, home),
  }));
  const failedPlugins = results.filter((r) => !r.ok).map((r) => r.plugin);
  return {
    root,
    ok: !failedPlugins.length,
    message: results.map((r) => r.message).join("\n"),
    note: [
      market.message,
      ...(notCarried.length
        ? [
            tr("cli.claude.notCarried", {
              plugins: notCarried.join(", "),
              name,
            }),
          ]
        : []),
    ].join("\n"),
    record: { ref: market.ref, mode: market.mode, autoUpdate: market.autoUpdate },
    plugins: wanted,
    failedPlugins,
  };
}

/**
 * The Claude Code marketplace a plugin was installed from, as the state recorded
 * it. A plugin no record names came from the installer's own marketplace, which
 * is where every plugin came from before there were other roots.
 */
function marketplaceOf(plugin, entry, catalog) {
  for (const [name, record] of Object.entries(entry?.marketplaces ?? {}))
    if (record.plugins?.includes(plugin)) return name;
  return catalog.roots[0].marketplace;
}

/**
 * A plugin that now comes from another root was just installed from that root's
 * marketplace; take away the copy the state says came from the old one.
 */
function leaveOldMarketplaces(outcomes, previous, home, catalog) {
  const notes = [];
  for (const outcome of outcomes) {
    const now = outcome.root.marketplace;
    for (const plugin of outcome.plugins ?? []) {
      if (outcome.failedPlugins.includes(plugin)) continue;
      if (!previous?.plugins?.includes(plugin)) continue;
      const before = marketplaceOf(plugin, previous, catalog);
      if (before === now) continue;
      const removed = claude.claudeUninstall(plugin, before, home);
      notes.push(
        tr(removed.ok ? "cli.claude.moved" : "cli.claude.movedKept", {
          plugin,
          before,
          now,
        }),
      );
    }
  }
  return notes;
}

/**
 * Claude Code installs natively: every root that has a selected plugin becomes
 * its own marketplace, registered under that root's name and repository.
 * The installer's own marketplace is recorded in `marketplaceRef`,
 * `marketplaceMode` and `claudeAutoUpdate`, as it always was; the marketplace of
 * every other root is recorded under `marketplaces`, with the plugins it gave.
 * `previous` is the state entry of the last sync, if any.
 */
function syncClaude(plugins, home, { dryRun, channel, catalog, previous }) {
  const selected = byRoot(plugins);
  if (!claude.claudeExists()) {
    const manual = selected.flatMap(([root, names]) =>
      root.repo
        ? [
            `claude plugin marketplace add ${root.repo} --sparse .claude-plugin plugins`,
            ...names.map(
              (plugin) => `claude plugin install ${plugin}@${root.marketplace}`,
            ),
          ]
        : [],
    );
    return {
      ok: false,
      message: tr("cli.claude.missing", { manual: manual.join(" && ") }),
    };
  }
  if (dryRun)
    return {
      note: selected
        .map(([root, names]) => {
          const ref = stableRef(root, channel);
          const { checkout } = ensureCheckout(home, root, { dryRun });
          const local = tr("cli.claude.planLocal", {
            checkout,
            plugins: names.join(", "),
          });
          if (!root.repo) return local;
          const github = ref
            ? tr("cli.claude.planPinned", { repo: root.repo, ref })
            : tr("cli.claude.planFollowing", { repo: root.repo });
          return tr("cli.claude.planEither", { github, local });
        })
        .join("\n"),
    };
  const outcomes = selected.map(([root, names]) =>
    syncMarketplace(root, names, home, channel, catalog),
  );
  const moved = leaveOldMarketplaces(outcomes, previous, home, catalog);
  const recorded = outcomes.filter((outcome) => outcome.record);
  const own = recorded.find((outcome) => outcome.root === catalog.roots[0]);
  const others = recorded.filter((outcome) => outcome !== own);
  const join = (key) =>
    [...outcomes.map((outcome) => outcome[key]), ...(key === "note" ? moved : [])]
      .filter(Boolean)
      .join("\n");
  return {
    ok: outcomes.every((outcome) => outcome.ok),
    message: join("message"),
    ...(join("note") ? { note: join("note") } : {}),
    ...(recorded.length
      ? {
          record: {
            ...(own
              ? {
                  marketplaceRef: own.record.ref,
                  marketplaceMode: own.record.mode,
                  claudeAutoUpdate: own.record.autoUpdate,
                }
              : {}),
            ...(others.length
              ? {
                  marketplaces: Object.fromEntries(
                    others.map((outcome) => [
                      outcome.root.marketplace,
                      {
                        repo: outcome.root.repo,
                        version: outcome.root.version,
                        ...outcome.record,
                        plugins: outcome.plugins,
                      },
                    ]),
                  ),
                }
              : {}),
          },
        }
      : {}),
    failedPlugins: outcomes.flatMap((outcome) => outcome.failedPlugins),
  };
}

/** `plugins` are the catalog entries distributed to this target. */
function syncTarget(target, plugins, home, options) {
  const { dryRun, catalog } = options;
  const names = plugins.map((plugin) => plugin.name);
  switch (target) {
    case "claude":
      return syncClaude(plugins, home, options);
    case "codex": {
      if (dryRun)
        return {
          message: tr("cli.plan.codex", { plugins: names.join(", ") }),
        };
      const results = codex.codexInstall(home, plugins, catalog);
      return { message: summarize(results), names: results };
    }
    case "cursor": {
      if (dryRun)
        return {
          message: tr("cli.plan.cursor", { plugins: names.join(", ") }),
        };
      const results = cursor.cursorInstall(home, plugins);
      return { message: summarize(results), names: results };
    }
    case "opencode": {
      if (dryRun)
        return {
          message: tr("cli.plan.opencode", { plugins: names.join(", ") }),
        };
      const results = opencode.opencodeInstall(home, plugins);
      return { message: summarize(results), names: results };
    }
    default:
      throw new Error(tr("cli.unsupportedTarget", { target }));
  }
}

function summarize(results) {
  const lines = [];
  if (results.skills?.length)
    lines.push(
      `skills: ${results.skills.length} (${results.skills.join(", ")})`,
    );
  if (results.agents?.length)
    lines.push(
      `agents: ${results.agents.length} (${results.agents.join(", ")})`,
    );
  if (results.commands?.length)
    lines.push(
      `commands: ${results.commands.length} (${results.commands.join(", ")})`,
    );
  if (results.commandSkills?.length)
    lines.push(
      `commands-as-skills: ${results.commandSkills.length} (${results.commandSkills.join(", ")})`,
    );
  if (results.rules?.length)
    lines.push(tr("cli.summary.rules", { list: results.rules.join(", ") }));
  if (results.skipped?.length)
    lines.push(tr("cli.summary.skipped", { list: results.skipped.join(", ") }));
  return lines.join("\n") || tr("cli.summary.nothing");
}

/** Says which selected plugins a target does not receive, because their manifest leaves it out. */
function notDistributed(names, plugins, target) {
  const left = names.filter(
    (name) => !plugins.some((plugin) => plugin.name === name),
  );
  return left.length
    ? tr("cli.notDistributed", {
        plugins: left.join(", "),
        app: APP_NAMES[target],
      })
    : null;
}

function printProblems(catalog) {
  for (const problem of catalog.problems)
    console.error(tr("warning", { text: problem }));
}

async function cmdInstall(args, catalog) {
  const home = targetHome(args.home);
  const detected = detectTargets(home);
  const targets = resolveTargets(args, detected);
  const names = selectedPlugins(args, catalog);
  const explicit = [...args.plugins, ...groupPlugins(catalog, args.groups)];
  const addingOptional = !args.updateBatch && explicit.length > 0 &&
    explicit.every((name) => catalog.plugins.get(name)?.optional);
  // Adding an optional pack preserves each app's own existing selection.
  const selectionFor = (target) => addingOptional
    ? resolvePlugins(catalog, [...(readState(home).targets.find((entry) => entry.target === target)?.plugins || []), ...names])
    : names;
  const groupsFor = (previous) => addingOptional
    ? [...new Set([...(previous?.groups || []), ...args.groups])]
    : args.savedGroups || args.groups;

  const testMode = isTestMode(args);
  if (!args.updateBatch) {
    printProblems(catalog);
    console.log(tr("cli.install.title", { version: PKG_VERSION }));
    if (testMode) console.log(tr("cli.testMode"));
    console.log(tr("cli.baseIncluded"));
  }

  if (args.dryRun) {
    console.log(tr("cli.simulation"));
    for (const t of targets) {
      const names = selectionFor(t);
      console.log(`\n${APP_NAMES[t]}`);
      const plugins = pluginsFor(catalog, names, t);
      const left = notDistributed(names, plugins, t);
      if (left) console.log(indent(left));
      const plan = syncTarget(t, plugins, home, {
        dryRun: true,
        channel: args.channel,
        catalog,
      });
      if (plan.note) console.log(indent(plan.note));
      console.log(
        indent(
          plan.ok === false
            ? plan.message
            : tr("cli.wouldInstall", { n: plugins.length }),
        ),
      );
      const mcp = configureMcp({
        home,
        target: t,
        plugins,
        providers: catalog.providers,
        dryRun: true,
        urls: args.mcpUrls,
        skip: args.mcp === "skip",
      });
      if (mcp.message) console.log(indent(mcp.message));
      for (const item of mcp.results)
        console.log(
          integrationLines(item, { target: t, testMode, dryRun: true }).join(
            "\n",
          ),
        );
    }
    if (args.channel === "stable" && !args.updateBatch)
      for (const line of stableAutoUpdatePlan(home, args)) console.log(line);
    else if (args.channel !== "stable" && args.autoUpdate !== undefined)
      console.log(
        configureAutoUpdate(home, {
          ...scheduled(catalog),
          enabled: args.autoUpdate,
          dryRun: true,
        }).message,
      );
    return;
  }

  if (args.channel === "stable" && !args.updateBatch) {
    const autoUpdate = stableAutoUpdate(home, args);
    if (autoUpdate) console.log(`\n${autoUpdate.message}`);
  }
  const failures = [];
  for (const target of targets) {
    const names = selectionFor(target);
    console.log(`\n${APP_NAMES[target]}`);
    const plugins = pluginsFor(catalog, names, target);
    const installed = plugins.map((plugin) => plugin.name);
    const left = notDistributed(names, plugins, target);
    if (left) console.log(indent(left));
    const previous = readState(home).targets.find(
      (entry) => entry.target === target,
    );
    const groups = groupsFor(previous);
    const managed = previous?.mcpManaged || previous?.mcp || [];
    const result = syncTarget(target, plugins, home, {
      dryRun: false,
      channel: args.channel,
      catalog,
      previous,
    });
    if (result.note) console.log(indent(result.note));
    if (result.ok === false) {
      console.log(indent(result.message));
      if (result.record)
        recordTarget(home, target, {
          ...previous,
          plugins: installed,
          groups,
          version: PKG_VERSION,
          ...result.record,
          // A marketplace that failed before anything changed keeps its last record.
          ...(previous?.marketplaces || result.record.marketplaces
            ? {
                marketplaces: {
                  ...previous?.marketplaces,
                  ...result.record.marketplaces,
                },
              }
            : {}),
          failedPlugins: result.failedPlugins,
        });
      failures.push(target);
      continue;
    }
    console.log(
      indent(
        result.names
          ? contentSummary(result.names)
          : tr("cli.pluginsInstalled", { n: plugins.length }),
      ),
    );
    const mcpOptions = {
      home,
      target,
      plugins,
      providers: catalog.providers,
    };
    const mcp = configureMcp({
      ...mcpOptions,
      urls: args.mcpUrls,
      managed,
      skip: args.mcp === "skip",
    });
    const logins = startLogins(args, {
      home,
      target,
      testMode,
      results: mcp.results,
      dependencies: mcpDependencies(mcpOptions).dependencies || [],
    });
    const verification =
      args.mcp === "skip"
        ? mcp
        : await doctorMcp({ ...mcpOptions, managed: mcp.results });
    if (verification.message || mcp.message)
      console.log(indent(verification.message || mcp.message));
    const display = new Map(
      verification.results.map((item) => [item.id, item]),
    );
    for (const item of mcp.results)
      if (item.state === "error" || !display.has(item.id))
        display.set(item.id, item);
    for (const item of display.values())
      console.log(
        integrationLines(item, {
          target,
          testMode,
          login: logins.get(item.id),
        }).join("\n"),
      );
    if (result.names?.skipped?.length)
      console.log(tr("cli.skippedItems", { n: result.names.skipped.length }));
    recordTarget(home, target, {
      plugins: installed,
      groups,
      mcpMode: args.mcp || "auto",
      version: PKG_VERSION,
      ...result.names,
      ...result.record,
      expected: collectNames(target, plugins),
      mcp: verification.results,
      mcpManaged: [
        ...new Map(
          [...managed, ...mcp.results]
            .filter((item) => item.ownership)
            .map((item) => [
              item.id,
              { id: item.id, ownership: item.ownership },
            ]),
        ).values(),
      ],
    });
  }

  if (failures.length)
    throw new Error(tr("cli.installFailed", { targets: failures.join(", ") }));
  recordPlugins(home, names);
  recordChannel(home, args.channel);
  if (args.channel !== "stable" && args.autoUpdate !== undefined) {
    const autoUpdate = configureAutoUpdate(home, {
      ...scheduled(catalog),
      enabled: args.autoUpdate,
    });
    const state = readState(home);
    state.autoUpdate = autoUpdate;
    writeState(home, state);
    console.log(`\n${autoUpdateSummary(autoUpdate)}`);
    if (autoUpdate.status === "error") console.log(autoUpdate.message);
  }
  if (!args.updateBatch) {
    console.log(tr("cli.install.done"));
    console.log(
      tr(testMode ? "cli.install.untouched" : "cli.install.newSession"),
    );
    console.log(tr("cli.install.more"));
  }
}

/**
 * The login step of every MCP that asks about access, or that the person named
 * with `--<id>-access`. A provider with neither stays with the app's own login.
 * @returns {Map<string, { state: string, message: string }>} by provider id
 */
function startLogins(args, { home, target, testMode, results, dependencies }) {
  const logins = new Map();
  for (const dependency of dependencies) {
    const item = results.find((result) => result.id === dependency.id);
    const access = args.mcpAccess[dependency.id];
    if (!item || item.state === "skipped") continue;
    if (!dependency.access && access === undefined) continue;
    const configured = ["configured", "auth-pending"].includes(item.state);
    if (access === true && !args.updateBatch && !testMode && configured)
      console.log(tr("cli.startingLogin", { name: dependency.provider.name }));
    logins.set(
      dependency.id,
      startMcpLogin({
        home,
        target,
        dependency,
        access,
        configured,
        updating: Boolean(args.updateBatch),
        dryRun: args.dryRun,
      }),
    );
  }
  return logins;
}

function recordChannel(home, channel) {
  const state = readState(home);
  state.channel = channel;
  writeState(home, state);
}

function activeTask(saved) {
  return Boolean(saved?.path && fs.existsSync(saved.path));
}

function stableAutoUpdatePlan(home, args) {
  const lines = [];
  if (activeTask(readState(home).autoUpdate))
    lines.push(tr("cli.stable.wouldDisable"));
  if (args.autoUpdate === true) lines.push(tr("cli.stableAutoUpdate"));
  return lines;
}

function stableAutoUpdate(home, args) {
  const state = readState(home);
  const active = activeTask(state.autoUpdate);
  if (!active && args.autoUpdate !== true) return undefined;
  if (!active) {
    state.autoUpdate = {
      ...state.autoUpdate,
      status: "unsupported",
      message: tr("cli.stableAutoUpdate"),
    };
    writeState(home, state);
    return state.autoUpdate;
  }
  const result = configureAutoUpdate(home, { enabled: false });
  state.autoUpdate = result;
  writeState(home, state);
  const why =
    result.status === "error"
      ? tr("cli.stable.disableFailed", { message: result.message })
      : tr("cli.stable.disabled");
  return { ...result, message: why };
}

function cmdScheduledStable(args) {
  const home = targetHome(args.home);
  console.log(tr("cli.stable.scheduledIgnored"));
  const state = readState(home);
  if (!activeTask(state.autoUpdate)) return;
  state.autoUpdate = configureAutoUpdate(home, {
    enabled: false,
    unload: false,
  });
  writeState(home, state);
  console.log(autoUpdateSummary(state.autoUpdate));
  if (state.autoUpdate.status === "error")
    console.log(state.autoUpdate.message);
}

function collectNames(target, plugins) {
  // Names recorded for removal; derived from the same logic the sync used.
  if (target === "codex") return { skills: codex.codexSkillNames(plugins) };
  if (target === "cursor") return cursor.cursorNames(plugins);
  if (target === "opencode") return opencode.opencodeNames(plugins);
  return {};
}

function indent(text) {
  return text
    .split("\n")
    .map((l) => `  ${l}`)
    .join("\n");
}

/** Saved plugin names this installer does not carry, for example after a plugin moved to another root. */
function unavailable(names, catalog) {
  return (names || []).filter((name) => !catalog.plugins.has(name));
}

async function cmdUpdate(args, catalog) {
  const home = targetHome(args.home);
  const state = readState(home);
  if (!state.targets.length) {
    console.log(tr("cli.update.nothing"));
    return;
  }
  const selected = args.targets.length
    ? args.targets
    : state.targets.map((t) => t.target);
  const override = args.plugins.length || args.groups.length;
  for (const target of selected) {
    const saved = state.targets.find((t) => t.target === target);
    if (!saved)
      throw new Error(tr("cli.update.unknownTarget", { target }));
    const missing = override ? [] : unavailable(saved.plugins, catalog);
    if (missing.length)
      throw new Error(
        tr("cli.update.unavailable", {
          app: APP_NAMES[target] || target,
          plugins: missing.join(", "),
        }),
      );
  }
  printProblems(catalog);
  console.log(tr("cli.update.title", { version: PKG_VERSION }));
  if (isTestMode(args)) console.log(tr("cli.testMode"));
  console.log(tr("cli.update.reapplying"));
  if (args.channel === "stable" && args.dryRun)
    for (const line of stableAutoUpdatePlan(home, args)) console.log(line);
  if (args.channel === "stable" && !args.dryRun) {
    const autoUpdate = stableAutoUpdate(home, args);
    if (autoUpdate) console.log(autoUpdate.message);
  }
  for (const target of selected) {
    const saved = state.targets.find((t) => t.target === target);
    await cmdInstall(
      {
        ...args,
        targets: [target],
        plugins: override ? args.plugins : saved.plugins,
        groups: override ? args.groups : [],
        savedGroups: override ? args.groups : saved.groups,
        mcp: args.mcp || saved.mcpMode,
        autoUpdate: undefined,
        updateBatch: true,
      },
      catalog,
    );
  }
  if (args.channel !== "stable" && args.autoUpdate !== undefined) {
    const next = readState(home);
    next.autoUpdate = configureAutoUpdate(home, {
      ...scheduled(catalog),
      enabled: args.autoUpdate,
      dryRun: args.dryRun,
    });
    if (!args.dryRun) writeState(home, next);
    console.log(autoUpdateSummary(next.autoUpdate));
    if (next.autoUpdate.status === "error")
      console.log(next.autoUpdate.message);
  }
  console.log(tr(args.dryRun ? "cli.update.simulated" : "cli.update.done"));
}

/**
 * How Claude Code has a root's marketplace registered today: from that root
 * (its repository, or the copy this installer keeps), from another place, or not
 * at all.
 */
function registration(root, home) {
  const existing = claude.claudeRegistered(root.marketplace, home);
  if (!existing) return { existing: null, own: false };
  const own =
    existing.source === "github"
      ? Boolean(root.repo) && existing.repo === root.repo
      : existing.source === "directory" &&
        path.resolve(existing.path || "") ===
          checkoutPath(home, checkoutKey(root));
  return { existing, own };
}

/**
 * The plan of `migrate` for each app. Claude Code adds two things the state
 * does not have: the plugins installed from a marketplace that is registered
 * from another place, which count as what the app had, and whether every
 * marketplace the selection needs already comes from its own root.
 * @returns {{ plan: ReturnType<typeof planApp>, done: boolean, moves: object[], notes: string[] }[]}
 */
function migrationPlans(targets, state, home, args, catalog) {
  return targets.map((target) => {
    const entry = state.targets.find((saved) => saved.target === target);
    const base = { target, entry, args, catalog, version: PKG_VERSION };
    if (target !== "claude") {
      const plan = planApp(base);
      return { plan, done: plan.current, moves: [], notes: [] };
    }
    const registered = new Map(
      catalog.roots.map((root) => [root, registration(root, home)]),
    );
    const elsewhere = catalog.roots.filter(
      (root) => registered.get(root).existing && !registered.get(root).own,
    );
    const plan = planApp({
      ...base,
      installed: elsewhere.flatMap((root) =>
        claude.claudeInstalledFrom(root.marketplace, home),
      ),
    });
    const used = byRoot(pluginsFor(catalog, plan.names, target)).map(
      ([root]) => root,
    );
    return {
      plan,
      done: plan.current && used.every((root) => registered.get(root).own),
      moves: used
        .filter((root) => elsewhere.includes(root))
        .map((root) => {
          const { existing } = registered.get(root);
          return {
            name: root.marketplace,
            from: existing.repo
              ? `GitHub ${existing.repo}`
              : existing.path || existing.url || existing.source,
            to: root.repo
              ? `GitHub ${root.repo}`
              : checkoutPath(home, checkoutKey(root)),
          };
        }),
      notes: claude.claudeExists()
        ? []
        : [tr("cli.claude.missing", { manual: "" })],
    };
  });
}

/**
 * What `migrate` does with the daily task. It comes along only when it was on,
 * and then it has to run this installer: `register` writes it again, `same`
 * finds it already does, `off` takes it away and `none` leaves things as they are.
 */
function taskPlan(state, args, catalog) {
  const saved = state.autoUpdate;
  if (args.channel === "stable") return activeTask(saved) ? "stable" : "none";
  const on = ["enabled", "prepared"].includes(saved?.status);
  if (args.autoUpdate === false)
    return on || activeTask(saved) ? "off" : "none";
  if (!on && args.autoUpdate !== true) return "none";
  return autoUpdateRuns(saved, scheduled(catalog).spec) ? "same" : "register";
}

/**
 * Bring what an earlier installer left on this machine to this one: every app in
 * the saved state and every app found, each with the selection it had that this
 * catalog carries. Nothing here names the earlier distribution; it is whatever
 * wrote the state and registered the marketplaces.
 */
async function cmdMigrate(args, catalog) {
  const home = targetHome(args.home);
  const state = readState(home);
  const detected = detectTargets(home);
  const targets = args.targets.length
    ? [...new Set(args.targets)]
    : TARGETS.filter(
        (target) =>
          detected.includes(target) ||
          state.targets.some((entry) => entry.target === target),
      );
  if (!targets.length) throw new Error(tr("cli.noTarget"));
  const apps = migrationPlans(targets, state, home, args, catalog);
  const task = taskPlan(state, args, catalog);
  const taskLines =
    args.channel === "stable"
      ? stableAutoUpdatePlan(home, args)
      : [tr(`cli.migrate.task.${task}`)];
  const testMode = isTestMode(args);

  printProblems(catalog);
  console.log(tr("cli.migrate.title", { version: PKG_VERSION }));
  if (testMode) console.log(tr("cli.testMode"));
  console.log(
    tr("cli.migrate.intro", {
      source: catalog.entry.repo ? `GitHub ${catalog.entry.repo}` : "",
    }),
  );
  console.log(tr("cli.migrate.plan"));
  for (const app of apps)
    for (const line of planLines(app.plan, app)) console.log(line);
  if (taskLines.length) console.log(`\n${taskLines.join("\n")}`);

  const pending = apps.filter((app) => !app.done);
  if (!pending.length && !["register", "off", "stable"].includes(task)) {
    console.log(tr("cli.migrate.nothing"));
    return;
  }
  if (args.dryRun) {
    console.log(tr("cli.update.simulated"));
    return;
  }
  if (!args.yes) {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      console.log(tr("cli.migrate.needsYes"));
      return;
    }
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const agreed = await confirmed((text) => terminalQuestion(rl, text));
    rl.close();
    if (!agreed) {
      console.log(tr("cli.migrate.cancelled"));
      return;
    }
  }

  console.log(tr("cli.migrate.applying"));
  if (args.channel === "stable") {
    const autoUpdate = stableAutoUpdate(home, args);
    if (autoUpdate) console.log(autoUpdate.message);
  }
  // One app failing does not stop the others: each is reported at the end.
  const failed = [];
  for (const { plan } of pending) {
    try {
      await cmdInstall(
        {
          ...args,
          targets: [plan.target],
          plugins: plan.names,
          groups: [],
          savedGroups: plan.groups,
          mcp: args.mcp || plan.mcpMode,
          autoUpdate: undefined,
          updateBatch: true,
        },
        catalog,
      );
    } catch (error) {
      failed.push(plan.target);
      console.log(indent(`✗ ${error.message}`));
    }
  }
  let autoUpdate;
  if (task === "register" || task === "off") {
    autoUpdate = configureAutoUpdate(home, {
      ...scheduled(catalog),
      enabled: task === "register",
    });
    const next = readState(home);
    next.autoUpdate = autoUpdate;
    writeState(home, next);
  }

  const after = readState(home);
  console.log(tr("cli.migrate.report"));
  for (const app of apps) {
    const lines = reportLines(app.plan, {
      done: app.done,
      failed: failed.includes(app.plan.target),
      entry: after.targets.find((entry) => entry.target === app.plan.target),
    });
    for (const line of lines) console.log(line);
  }
  if (autoUpdate) {
    console.log(`\n${autoUpdateSummary(autoUpdate)}`);
    if (autoUpdate.status === "error") console.log(autoUpdate.message);
  } else if (args.channel !== "stable") console.log(`\n${taskLines.join("\n")}`);
  if (failed.length)
    throw new Error(tr("cli.migrate.failed", { targets: failed.join(", ") }));
  console.log(tr("cli.migrate.finished"));
  console.log(tr(testMode ? "cli.install.untouched" : "cli.install.newSession"));
  console.log(tr("cli.install.more"));
}

function missingArtifacts(home, entry, catalog) {
  const names = entry.expected || entry;
  const collisions = (entry.skipped || []).map(
    (item) => tr("cli.missing.collision", { item }),
  );
  if (entry.target === "claude") {
    const registry = path.join(home, ".claude/plugins/installed_plugins.json");
    if (!fs.existsSync(registry)) return [tr("cli.missing.registry")];
    try {
      const installed = JSON.parse(fs.readFileSync(registry, "utf8"));
      return (entry.plugins || []).filter(
        (plugin) =>
          !installed.plugins?.[
            `${plugin}@${marketplaceOf(plugin, entry, catalog)}`
          ],
      );
    } catch {
      return [tr("cli.missing.badRegistry")];
    }
  }
  const base =
    entry.target === "opencode"
      ? path.join(home, ".config/opencode")
      : path.join(home, `.${entry.target}`);
  const skills =
    entry.target === "opencode"
      ? path.join(base, "skills")
      : path.join(home, ".agents/skills");
  const files = [
    ...(names.skills || []).map((name) => path.join(skills, name, "SKILL.md")),
    ...(names.agents || []).map((name) =>
      path.join(
        base,
        entry.target === "opencode" ? "agent" : "agents",
        entry.target === "opencode" ? name : `${name}.md`,
      ),
    ),
    ...(names.commands || []).map((name) => path.join(base, "command", name)),
    ...(names.commandSkills || []).map((name) =>
      path.join(base, "skills", name, "SKILL.md"),
    ),
    ...(entry.target === "codex" ? [path.join(base, "marsai-AGENTS.md")] : []),
  ];
  return [
    ...collisions,
    ...files.flatMap((file) => {
      if (!fs.existsSync(file)) return [path.relative(home, file)];
      const marker =
        path.basename(file) === "SKILL.md"
          ? path.join(path.dirname(file), ".marsai")
          : file;
      return ownedFile(home, marker)
        ? []
        : [tr("cli.missing.noMarker", { file: path.relative(home, file) })];
    }),
  ];
}

/** MCP options for the saved plugins this installer still carries. */
function savedMcp(home, entry, catalog) {
  return {
    home,
    target: entry.target,
    plugins: (entry.plugins || [])
      .map((name) => catalog.plugins.get(name))
      .filter(Boolean),
    providers: catalog.providers,
  };
}

function cmdStatus(args, catalog) {
  const home = targetHome(args.home);
  const state = readState(home);
  console.log(`home: ${home}`);
  if (!state.targets.length) {
    console.log(tr("cli.status.nothing"));
    return;
  }
  console.log(tr("cli.status.installedAt", { when: state.updatedAt || "?" }));
  const channel = state.channel || "main";
  console.log(tr("cli.status.channel", { channel }));
  console.log(
    tr("cli.status.autoUpdate", {
      status: autoUpdateStatus(state.autoUpdate)?.status || "disabled",
    }),
  );
  for (const t of state.targets) {
    console.log(`\n[${t.target}] v${t.version || "?"} @ ${t.syncedAt || "?"}`);
    console.log(`  plugins: ${(t.plugins || []).join(", ")}`);
    const missingPlugins = unavailable(t.plugins, catalog);
    if (missingPlugins.length)
      console.log(
        tr("cli.status.unavailable", { plugins: missingPlugins.join(", ") }),
      );
    if (t.target === "claude")
      for (const line of claudeChannelLines(t, channel, catalog))
        console.log(line);
    if (t.failedPlugins?.length)
      console.log(
        tr("cli.status.failed", { plugins: t.failedPlugins.join(", ") }),
      );
    const missing = missingArtifacts(home, t, catalog);
    console.log(
      tr("cli.status.files", {
        state: missing.length
          ? tr("cli.status.filesMissing", { list: missing.join(", ") })
          : tr(
              t.target === "claude"
                ? "cli.status.filesClaude"
                : "cli.status.filesPresent",
            ),
      }),
    );
    const mcp = statusMcp(savedMcp(home, t, catalog));
    for (const item of mcp.results)
      console.log(`  MCP ${item.id}: ${item.state}`);
    for (const [k, v] of Object.entries(t).slice(3)) {
      if (
        !["mcp", "mcpManaged", "failedPlugins"].includes(k) &&
        Array.isArray(v) &&
        v.length
      )
        console.log(`  ${k}: ${v.join(", ")}`);
    }
  }
  if (state.targets.some((t) => t.target === "claude")) {
    const [own, ...extra] = catalog.roots;
    const p = launcherCheckoutPath(home, checkoutKey(own));
    console.log(tr("cli.status.checkout", { path: p }));
    for (const root of extra) {
      const copy = launcherCheckoutPath(home, checkoutKey(root));
      if (copy)
        console.log(
          tr("cli.status.checkoutOf", { name: root.marketplace, path: copy }),
        );
    }
  }
}

/**
 * One status line per Claude Code marketplace. The installer's own marketplace
 * keeps the unnamed line; a marketplace of another root is named.
 */
function claudeChannelLines(entry, channel, catalog) {
  const own = catalog.roots[0];
  const saved = {
    ...(entry.marketplaceMode === undefined
      ? {}
      : {
          [own.marketplace]: {
            ref: entry.marketplaceRef,
            mode: entry.marketplaceMode,
            autoUpdate: entry.claudeAutoUpdate,
            // The installer's own marketplace carries the installer version.
            version: entry.version,
          },
        }),
    ...entry.marketplaces,
  };
  return Object.entries(saved).flatMap(([name, record]) => {
    const root = catalog.roots.find((known) => known.marketplace === name);
    const label = name === own.marketplace ? "marketplace" : `marketplace ${name}`;
    if (record.mode === null) return [tr("cli.market.gone", { label })];
    const autoUpdate = tr(
      { true: "cli.market.on", false: "cli.market.off" }[
        String(record.autoUpdate)
      ] || "cli.market.unknown",
    );
    const { version } = record;
    const where =
      record.mode === "github"
        ? `github @ ${record.ref || "main"}`
        : tr("cli.market.local", { version });
    const lines = [tr("cli.market.line", { label, where, autoUpdate })];
    if (channel !== "stable" || !root?.version) return lines;
    const expected = releaseRef(root.version);
    const drift =
      record.mode === "github"
        ? record.ref !== expected
        : version !== root.version;
    if (drift)
      lines.push(tr("cli.market.drift", { expected }));
    return lines;
  });
}

function cmdRemove(args, catalog) {
  const home = targetHome(args.home);
  const state = readState(home);
  if (!state.targets.length && !fs.existsSync(statePath(home))) {
    console.log(tr("cli.remove.nothing"));
    return;
  }
  if (args.dryRun) {
    console.log("== dry-run ==");
    console.log(
      tr("cli.remove.wouldRemove", {
        targets: state.targets.map((t) => t.target).join(", "),
      }),
    );
    return;
  }
  const auto = configureAutoUpdate(home, {
    enabled: false,
  });
  if (auto.status === "error") throw new Error(auto.message);
  for (const t of state.targets) {
    console.log(tr("cli.remove.target", { target: t.target }));
    const mcp = removeMcp({
      home,
      target: t.target,
      managed: t.mcpManaged || t.mcp || [],
    });
    for (const item of mcp.results)
      console.log(`  MCP ${item.id}: ${item.state} - ${item.message}`);
    if (!mcp.ok)
      throw new Error(tr("cli.remove.mcpFailed"));
    switch (t.target) {
      case "claude": {
        for (const plugin of t.plugins || []) {
          const r = claude.claudeUninstall(
            plugin,
            marketplaceOf(plugin, t, catalog),
            home,
          );
          console.log(`  ${r.ok ? "✓" : "✗"} ${r.message}`);
          if (!r.ok)
            throw new Error(tr("cli.remove.claudeFailed"));
        }
        break;
      }
      case "codex": {
        const r = codex.codexRemove(home);
        console.log(
          tr("cli.remove.codexSkills", { list: r.removedSkills.join(", ") }),
        );
        console.log(
          tr("cli.remove.codexRules", { list: r.removedRules.join(", ") }),
        );
        break;
      }
      case "cursor": {
        const r = cursor.cursorRemove(home);
        console.log(
          `  ✓ skills: ${listed(r.skills)} | agents: ${listed(r.agents)} | commands-as-skills: ${listed(r.commandSkills)}`,
        );
        break;
      }
      case "opencode": {
        const r = opencode.opencodeRemove(home);
        console.log(
          `  ✓ skills: ${listed(r.skills)} | agents: ${listed(r.agents)} | commands: ${listed(r.commands)}`,
        );
        break;
      }
    }
    removeTarget(home, t.target);
  }
  fs.rmSync(path.join(home, LAUNCHER_DIR), { recursive: true, force: true });
  fs.rmSync(statePath(home), { force: true });
  console.log(tr("cli.remove.done"));
}

/** Names removed from one place, or the word for none. */
function listed(names) {
  return names.join(", ") || tr("cli.remove.none");
}

function applyChannel(args) {
  const resolved = resolveChannel({
    flag: args.channel,
    env: process.env.MARSAI_CHANNEL,
    state: readState(targetHome(args.home)).channel,
  });
  if (!resolved.ok) throw new Error(resolved.message);
  if (
    resolved.channel === "stable" &&
    resolved.origin === "state" &&
    !args.scheduled
  )
    console.log(
      tr("cli.stable.fromState", {
        file: statePath(targetHome(args.home)),
        ref: releaseRef(PKG_VERSION),
      }),
    );
  return { ...args, channel: resolved.channel };
}

/** Ask, in a terminal, the access question of every gated MCP the selection brings and no flag answered. */
async function askPendingAccess(args, catalog) {
  const loaded = mcpDependencies({
    plugins: selectedPlugins(args, catalog).map((name) =>
      catalog.plugins.get(name),
    ),
    providers: catalog.providers,
  });
  const pending = (loaded.dependencies || []).filter(
    (dependency) =>
      dependency.access && args.mcpAccess[dependency.id] === undefined,
  );
  if (!pending.length) return;
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    for (const dependency of pending) {
      const answer = await askAccess({
        access: dependency.access,
        question: (text) => terminalQuestion(rl, text),
      });
      if (!answer.ok) throw new Error(answer.message);
      args.mcpAccess[dependency.id] = answer.access;
    }
  } finally {
    rl.close();
  }
}

/**
 * Run the installer. Everything it knows about plugins, groups and MCP providers
 * is read from its roots: the one it ships in, the ones in `extraRoots` and the
 * ones named in `MARSAI_EXTRA_ROOTS`.
 *
 * A package that ships more plugins calls this with itself as an extra root:
 *
 *     run(process.argv.slice(2), { extraRoots: [packageDir] })
 *
 * @param {string[]} argv arguments after the program name
 * @param {{ extraRoots?: string[], env?: NodeJS.ProcessEnv }} [options]
 */
export async function run(argv, { extraRoots = [], env = process.env } = {}) {
  chooseLang(argv);
  const catalog = loadCatalog(installationRoots({ extraRoots, env }));
  let args = parseArgs(argv, catalog);
  if (args.version) {
    console.log(PKG_VERSION);
    return;
  }
  if (args.help) {
    console.log(usage(catalog));
    return;
  }
  const [cmd = "install"] = args._;
  if (["install", "update", "migrate"].includes(cmd)) args = applyChannel(args);
  if (args.scheduled && args.channel === "stable")
    return cmdScheduledStable(args);
  if (
    cmd === "install" &&
    !args.yes &&
    (!args._.length ||
      (!args.plugins.length && !args.groups.length && !args.dryRun))
  ) {
    const wizard = await runWizard(
      args,
      detectTargets(targetHome(args.home)),
      catalog,
    );
    if (!wizard.ok) throw new Error(wizard.message);
    args = wizard.args;
  }
  if (
    cmd === "install" &&
    !args.yes &&
    !args.dryRun &&
    args.mcp !== "skip" &&
    process.stdin.isTTY &&
    process.stdout.isTTY
  )
    await askPendingAccess(args, catalog);
  switch (cmd) {
    case "install":
      return cmdInstall(args, catalog);
    case "update":
      return cmdUpdate(args, catalog);
    case "migrate":
      return cmdMigrate(args, catalog);
    case "status":
      return cmdStatus(args, catalog);
    case "doctor": {
      const home = targetHome(args.home);
      const state = readState(home);
      console.log(tr("cli.doctor.title"));
      if (isTestMode(args)) console.log(tr("cli.doctor.testMode"));
      if (!state.targets.length) console.log(tr("cli.doctor.nothing"));
      const failed = [];
      for (const t of state.targets) {
        const result = await doctorMcp(savedMcp(home, t, catalog));
        console.log(`\n${APP_NAMES[t.target]}`);
        const missing = missingArtifacts(home, t, catalog);
        console.log(
          missing.length
            ? tr("cli.doctor.filesPending", { n: missing.length })
            : tr("cli.doctor.filesOk"),
        );
        if (result.message) console.log(indent(result.message));
        for (const item of result.results)
          console.log(
            integrationLines(item, {
              target: t.target,
              testMode: isTestMode(args),
            }).join("\n"),
          );
        if (!result.ok || missingArtifacts(home, t, catalog).length)
          failed.push(t.target);
      }
      if (failed.length)
        throw new Error(tr("cli.doctor.failed", { targets: failed.join(", ") }));
      return;
    }
    case "remove":
    case "uninstall":
      return cmdRemove(args, catalog);
    default:
      throw new Error(tr("cli.unknownCommand", { command: cmd }));
  }
}

/** Kept for callers that import the old name. */
export const main = run;
