import { groupPlugins, pluginsFor, resolvePlugins } from "./catalog.js";
import { t } from "./i18n.js";
import { APP_NAMES } from "./presentation.js";

/**
 * `migrate` brings what an earlier installer left on a machine to the running
 * one. It reads the saved state and what is registered in each app, and names
 * no distribution: whatever the state lists that this catalog lacks is left out
 * and reported.
 */

const unique = (list) => [...new Set(list)];
const list = (value) => (Array.isArray(value) ? value : []);
const sameSet = (one, other) =>
  one.length === other.length && one.every((item) => other.includes(item));

/** The groups a person gets without asking: every group that has a plugin that is not optional. */
export function defaultGroups(catalog) {
  return [...catalog.groups.values()]
    .filter((group) =>
      group.plugins.some((name) => !catalog.plugins.get(name).optional),
    )
    .map((group) => group.id);
}

/**
 * A selection that a second run would not grow: the plugins, everything they
 * depend on and every plugin of the groups any of them belongs to, so a plugin
 * that is new in a group comes along.
 */
function closed(catalog, plugins, groups) {
  let names = resolvePlugins(catalog, plugins);
  let ids = groups;
  for (;;) {
    const allIds = unique([
      ...ids,
      ...names.map((name) => catalog.plugins.get(name).group).filter(Boolean),
    ]);
    const all = resolvePlugins(
      catalog,
      unique([...names, ...groupPlugins(catalog, allIds)]),
    );
    if (all.length === names.length && allIds.length === ids.length)
      return { names, groups: ids };
    names = all;
    ids = allIds;
  }
}

/**
 * What `migrate` does to one app.
 *
 * `entry` is the app's saved state, if it has one. `installed` are plugins found
 * in the app that the state does not explain: for Claude Code, the ones installed
 * from a marketplace that is registered from somewhere else. Both count as what
 * the app had. With nothing of that carried here and nothing asked for on the
 * command line, the app gets the default groups.
 *
 * `current` says the saved state already is this plan, at this version.
 * @returns {{ target: string, had: string[], names: string[], now: string[], groups: string[], added: string[], notCarried: string[], notDistributed: string[], mcpMode: string|undefined, current: boolean }}
 */
export function planApp({ target, entry, installed = [], args, catalog, version }) {
  const had = unique([...list(entry?.plugins), ...installed]);
  const carried = had.filter((name) => catalog.plugins.has(name));
  const kept = list(entry?.groups).filter((id) => catalog.groups.has(id));
  const asked = [...args.plugins, ...groupPlugins(catalog, args.groups)];
  const chosen = unique([...carried, ...groupPlugins(catalog, kept), ...asked]);
  const { names, groups } = chosen.length
    ? closed(catalog, chosen, unique([...kept, ...args.groups]))
    : closed(
        catalog,
        groupPlugins(catalog, defaultGroups(catalog)),
        defaultGroups(catalog),
      );
  const now = pluginsFor(catalog, names, target).map((plugin) => plugin.name);
  return {
    target,
    had,
    names,
    now,
    groups,
    added: had.length ? now.filter((name) => !had.includes(name)) : [],
    notCarried: had.filter((name) => !catalog.plugins.has(name)),
    notDistributed: names.filter((name) => !now.includes(name)),
    mcpMode: entry?.mcpMode,
    current:
      Boolean(entry) &&
      entry.version === version &&
      !list(entry.failedPlugins).length &&
      sameSet(list(entry.plugins), now) &&
      sameSet(list(entry.groups), groups),
  };
}

const line = (text) => `  ${text}`;
const joined = (plugins) => plugins.join(", ");

/** What the app had, and what is left out because this catalog does not carry it. */
function before(plan) {
  return [
    line(
      plan.had.length
        ? t("cli.migrate.had", { plugins: joined(plan.had) })
        : t("cli.migrate.hadNothing"),
    ),
  ];
}

/**
 * A plugin this catalog lacks leaves the selection. In an app the installer
 * copies into, its content goes with it; in Claude Code it goes with the
 * marketplace it came from, when that one is registered again from here.
 */
function leftOut(plan) {
  if (!plan.notCarried.length) return [];
  const plugins = joined(plan.notCarried);
  return [
    line(
      plan.target === "claude"
        ? t("cli.migrate.notCarriedClaude", { plugins })
        : t("cli.migrate.notCarried", { plugins }),
    ),
  ];
}

/**
 * The lines of one app in the plan. `moves` are the Claude Code marketplaces
 * that are registered from somewhere else today, and `notes` whatever else the
 * person has to know before agreeing.
 */
export function planLines(plan, { done = false, moves = [], notes = [] } = {}) {
  const title = `\n${APP_NAMES[plan.target]}`;
  if (done)
    return [title, line(t("cli.migrate.done", { plugins: joined(plan.now) }))];
  return [
    title,
    ...before(plan),
    line(t("cli.migrate.willHave", { plugins: joined(plan.now) })),
    ...(plan.added.length
      ? [line(t("cli.migrate.added", { plugins: joined(plan.added) }))]
      : []),
    ...leftOut(plan),
    ...(plan.notDistributed.length
      ? [
          line(
            t("cli.notDistributed", {
              plugins: joined(plan.notDistributed),
              app: APP_NAMES[plan.target],
            }),
          ),
        ]
      : []),
    ...moves.map((move) => line(t("cli.migrate.market", move))),
    ...notes.map(line),
  ];
}

/**
 * The lines of one app in the final report. `entry` is the app's state after the
 * run; without it, or with `failed`, the app was not migrated.
 */
export function reportLines(plan, { done = false, failed = false, entry } = {}) {
  const title = `\n${APP_NAMES[plan.target]}`;
  if (done)
    return [title, line(t("cli.migrate.done", { plugins: joined(plan.now) }))];
  if (failed || !entry)
    return [title, ...before(plan), line(t("cli.migrate.failedApp"))];
  const has = list(entry.plugins);
  const added = plan.had.length
    ? has.filter((name) => !plan.had.includes(name))
    : [];
  return [
    title,
    ...before(plan),
    line(t("cli.migrate.hasNow", { plugins: joined(has) })),
    ...(added.length
      ? [line(t("cli.migrate.added", { plugins: joined(added) }))]
      : []),
    ...leftOut(plan),
    ...(list(entry.skipped).length
      ? [t("cli.skippedItems", { n: entry.skipped.length })]
      : []),
  ];
}

/**
 * Ask once whether to apply the plan. Yes is accepted in English and in
 * Portuguese; anything else, and the end of the input, mean no.
 * @param {(text: string) => Promise<string>} question
 */
export async function confirmed(question) {
  try {
    const answer = await question(t("cli.migrate.confirm"));
    return /^(s|sim|y|yes)$/i.test(String(answer ?? "").trim());
  } catch {
    return false;
  }
}
