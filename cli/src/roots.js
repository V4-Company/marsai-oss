import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./constants.js";
import { isDir } from "./fs-utils.js";
import { t } from "./i18n.js";

const NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return undefined;
  }
}

/** `Owner/name` from a package.json `repository`, when it points to GitHub. */
export function githubRepo(repository) {
  const url = typeof repository === "string" ? repository : repository?.url;
  if (typeof url !== "string") return null;
  const match =
    /^(?:git\+)?(?:https?|ssh|git):\/\/(?:[^@/]+@)?github\.com\/([^/]+)\/([^/#]+?)(?:\.git)?\/?(?:#.*)?$/.exec(
      url,
    ) ||
    /^(?:git@github\.com:|github:)([^/]+)\/([^/#]+?)(?:\.git)?(?:#.*)?$/.exec(
      url,
    ) ||
    /^([A-Za-z0-9][A-Za-z0-9-]*)\/([A-Za-z0-9._-]+)$/.exec(url);
  return match ? `${match[1]}/${match[2]}` : null;
}

/**
 * A root is a directory with `.claude-plugin/marketplace.json` and `plugins/`.
 * Its marketplace name comes from that file and its repository from its own
 * `package.json`, so nothing about where a root lives is written in the code.
 * @returns {{ dir: string, pluginsDir: string, marketplace: string, owner: string|null, repo: string|null, packageName: string|null, version: string|null }}
 */
export function readRoot(dir) {
  const root = path.resolve(dir);
  const marketplace = readJson(
    path.join(root, ".claude-plugin", "marketplace.json"),
  );
  const pluginsDir = path.join(root, "plugins");
  if (
    typeof marketplace?.name !== "string" ||
    !NAME.test(marketplace.name) ||
    !isDir(pluginsDir)
  )
    throw new Error(t("roots.notRoot", { dir: root }));
  const pkg = readJson(path.join(root, "package.json")) ?? {};
  return {
    dir: root,
    pluginsDir,
    marketplace: marketplace.name,
    owner:
      typeof marketplace.owner?.name === "string"
        ? marketplace.owner.name
        : null,
    repo: githubRepo(pkg.repository),
    packageName: typeof pkg.name === "string" ? pkg.name : null,
    version: typeof pkg.version === "string" ? pkg.version : null,
  };
}

let primary;

/** The root this installer was shipped with. */
export function primaryRoot() {
  primary ??= readRoot(ROOT);
  return primary;
}

/** Directories named in `MARSAI_EXTRA_ROOTS`, separated like `PATH`. */
export function extraRootDirs(env = process.env) {
  return (env.MARSAI_EXTRA_ROOTS || "")
    .split(path.delimiter)
    .map((dir) => dir.trim())
    .filter(Boolean);
}

/**
 * Every root of this run: the installer's own, then the ones the caller of
 * `run()` passed, then the ones in `MARSAI_EXTRA_ROOTS`.
 *
 * `entry` is the distribution the person ran: a package that calls `run()` with
 * itself as an extra root is the entry, otherwise it is the installer's own
 * root. The daily update runs the entry again, so `scheduledRoots` lists only
 * the extra roots that running the entry would not bring back.
 * @param {{ extraRoots?: string[], env?: NodeJS.ProcessEnv }} [options]
 */
export function installationRoots({ extraRoots = [], env = process.env } = {}) {
  const own = primaryRoot();
  const roots = [own];
  const add = (dir, origin) => {
    let root;
    try {
      root = readRoot(dir);
    } catch (error) {
      throw new Error(`${origin}: ${error.message}`);
    }
    if (roots.some((known) => known.dir === root.dir)) return [];
    const clash = roots.find((known) => known.marketplace === root.marketplace);
    if (clash)
      throw new Error(
        `${origin}: ${t("roots.sameMarketplace", { dir: root.dir, name: root.marketplace, other: clash.dir })}`,
      );
    roots.push(root);
    return [root];
  };
  const given = extraRoots.flatMap((dir) => add(dir, t("roots.extra")));
  const fromEnv = extraRootDirs(env).flatMap((dir) =>
    add(dir, "MARSAI_EXTRA_ROOTS"),
  );
  const entry = given.find((root) => npxSpec(root)) ?? own;
  return {
    roots,
    entry,
    scheduledRoots: (entry === own ? [...given, ...fromEnv] : fromEnv).map(
      (root) => root.dir,
    ),
  };
}

export function repoUrl(root) {
  return root.repo ? `https://github.com/${root.repo}` : null;
}

/** What `npx` runs to get the installer of this root from its `main` branch. */
export function npxSpec(root) {
  return root.repo ? `github:${root.repo}#main` : null;
}

/** Folder of this root's bundled marketplace copy under `~/.marsai/marketplace`. */
export function checkoutKey(root) {
  return root.repo ? root.repo.replace("/", "--") : root.marketplace;
}
