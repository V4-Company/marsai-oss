import fs from "node:fs";
import path from "node:path";
import { isFile } from "./fs-utils.js";
import { isLocalized, t } from "./i18n.js";
import { collectProviders } from "./mcp.js";
import { readJson } from "./roots.js";

/** Apps the installer knows how to write to. A plugin lists the ones it supports. */
export const TARGETS = ["claude", "codex", "cursor", "opencode"];
export const PLUGIN_MANIFEST = ".marsai-plugin.json";

const SLUG = /^[a-z0-9][a-z0-9-]*$/;
const record = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const slug = (value) => typeof value === "string" && SLUG.test(value);

function manifestProblem(manifest) {
  if (!record(manifest) || manifest.schemaVersion !== 1)
    return t("catalog.schemaVersion");
  const { targets, group, legacySkills, optional } = manifest;
  if (optional !== undefined && typeof optional !== "boolean")
    return t("catalog.optional");
  if (
    !Array.isArray(targets) ||
    !targets.length ||
    !targets.every((target) => TARGETS.includes(target))
  )
    return t("catalog.targets", { targets: TARGETS.join(", ") });
  if (
    group !== undefined &&
    (!record(group) ||
      !slug(group.id) ||
      (group.aliases !== undefined &&
        (!Array.isArray(group.aliases) || !group.aliases.every(slug))) ||
      (group.label !== undefined && !isLocalized(group.label)) ||
      (group.description !== undefined && !isLocalized(group.description)))
  )
    return t("catalog.group");
  if (
    legacySkills !== undefined &&
    (!Array.isArray(legacySkills) || !legacySkills.every(slug))
  )
    return t("catalog.legacySkills");
  return null;
}

function dependencyNames(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === "string" ? entry : entry?.name))
    .filter((name) => typeof name === "string");
}

/** Everything the installer knows about one plugin, read from that plugin's folder. */
function readPlugin(root, name) {
  const dir = path.join(root.pluginsDir, name);
  const file = path.join(dir, PLUGIN_MANIFEST);
  if (!isFile(file))
    return {
      problem: t("catalog.noManifest", { name, file: PLUGIN_MANIFEST }),
    };
  const manifest = readJson(file);
  const problem =
    manifest === undefined
      ? t("catalog.invalidJson")
      : manifestProblem(manifest);
  if (problem)
    return {
      problem: t("catalog.badManifest", {
        name,
        file: PLUGIN_MANIFEST,
        problem,
      }),
    };
  const meta = readJson(path.join(dir, ".claude-plugin", "plugin.json")) ?? {};
  return {
    group: manifest.group,
    plugin: {
      name,
      dir,
      root,
      description: typeof meta.description === "string" ? meta.description : "",
      version: typeof meta.version === "string" ? meta.version : null,
      dependencies: dependencyNames(meta.dependencies),
      targets: TARGETS.filter((target) => manifest.targets.includes(target)),
      group: manifest.group?.id ?? null,
      legacySkills: manifest.legacySkills,
      optional: manifest.optional === true,
    },
  };
}

function pluginFolders(root) {
  return fs
    .readdirSync(root.pluginsDir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        isFile(
          path.join(
            root.pluginsDir,
            entry.name,
            ".claude-plugin",
            "plugin.json",
          ),
        ),
    )
    .map((entry) => entry.name)
    .sort();
}

/**
 * Plugins, groups and MCP providers of the given roots, merged. Roots are read in
 * order and plugins by name inside each one, so the first root wins a duplicated
 * name and a group takes its label and description from the first plugin that
 * states them. Each plugin keeps the root it came from: for Claude Code that root
 * is the marketplace the plugin is installed from.
 *
 * `entry` is the root of the distribution the person ran (see `installationRoots`).
 * @param {{ roots: ReturnType<typeof import("./roots.js").readRoot>[], entry?: object, scheduledRoots?: string[] }} options
 */
export function loadCatalog({ roots, entry = roots[0], scheduledRoots = [] }) {
  const plugins = new Map();
  const groups = new Map();
  // Another name a plugin declares for its group, such as an English one: alias -> id.
  const groupAliases = new Map();
  const problems = [];
  for (const root of roots) {
    for (const name of pluginFolders(root)) {
      if (!slug(name)) {
        problems.push(t("catalog.badName", { name }));
        continue;
      }
      const { plugin, group, problem } = readPlugin(root, name);
      if (problem) {
        problems.push(problem);
        continue;
      }
      if (plugins.has(name)) {
        problems.push(
          t("catalog.duplicate", {
            name,
            first: plugins.get(name).root.dir,
            second: root.dir,
          }),
        );
        continue;
      }
      plugins.set(name, plugin);
      if (!group) continue;
      const merged = groups.get(group.id) ?? { id: group.id, plugins: [] };
      for (const alias of group.aliases ?? [])
        if (!groupAliases.has(alias)) groupAliases.set(alias, group.id);
      for (const key of ["label", "description"])
        if (merged[key] === undefined && group[key] !== undefined)
          merged[key] = group[key];
      merged.plugins.push(name);
      groups.set(group.id, merged);
    }
  }
  return {
    roots,
    entry,
    scheduledRoots,
    plugins,
    groups,
    groupAliases,
    providers: collectProviders([...plugins.values()]),
    problems,
  };
}

/** Plugins of the chosen groups, in catalog order. */
export function groupPlugins(catalog, groups) {
  return [
    ...new Set(groups.flatMap((id) => catalog.groups.get(id)?.plugins ?? [])),
  ];
}

/**
 * The chosen plugins plus everything they depend on, dependencies first, so the
 * base plugin always comes along and comes before the ones built on it.
 * Choosing nothing means every non-optional plugin.
 */
export function resolvePlugins(catalog, names) {
  const chosen = names.length ? names : [...catalog.plugins.values()]
    .filter((plugin) => !plugin.optional).map((plugin) => plugin.name);
  const ordered = [];
  const visit = (name, trail) => {
    const plugin = catalog.plugins.get(name);
    if (!plugin || ordered.includes(name) || trail.includes(name)) return;
    for (const dependency of plugin.dependencies)
      visit(dependency, [...trail, name]);
    ordered.push(name);
  };
  for (const name of chosen) visit(name, []);
  return ordered;
}

/** Catalog entries of the named plugins that are distributed to `target`. */
export function pluginsFor(catalog, names, target) {
  return names
    .map((name) => catalog.plugins.get(name))
    .filter((plugin) => plugin?.targets.includes(target));
}
