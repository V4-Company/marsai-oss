import "./helpers/lang.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  TARGETS,
  groupPlugins,
  loadCatalog,
  pluginsFor,
  resolvePlugins,
} from "../src/catalog.js";
import { PKG_VERSION } from "../src/constants.js";
import {
  checkoutKey,
  githubRepo,
  npxSpec,
  primaryRoot,
  readRoot,
  repoUrl,
} from "../src/roots.js";
import {
  ACME_BI,
  ALL_TARGETS,
  REPO_ROOT,
  acmeRoot,
  tempDir,
  write,
  writeRoot,
} from "./helpers/fixtures.js";

const names = (catalog) => [...catalog.plugins.keys()];

test("optional plugins stay out of defaults but can be selected by group or required by a dependency", (t) => {
  const { catalog, dir } = acmeRoot(t);
  const file = path.join(dir, "plugins", "acme-data", ".marsai-plugin.json");
  const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
  write(file, { ...manifest, optional: true });
  const reloaded = loadCatalog({ roots: [readRoot(dir)] });
  assert.deepEqual(resolvePlugins(reloaded, []), ["acme-core", "acme-dev"]);
  assert.deepEqual(resolvePlugins(reloaded, groupPlugins(reloaded, ["analytics"])), ["acme-core", "acme-data"]);
  assert.deepEqual(resolvePlugins(reloaded, ["acme-data"]), ["acme-core", "acme-data"]);
  const devFile = path.join(dir, "plugins", "acme-dev", ".claude-plugin", "plugin.json");
  write(devFile, { ...JSON.parse(fs.readFileSync(devFile, "utf8")), dependencies: ["acme-data"] });
  assert.deepEqual(resolvePlugins(loadCatalog({ roots: [readRoot(dir)] }), ["acme-dev"]), ["acme-core", "acme-data", "acme-dev"]);
  assert.equal(catalog.plugins.get("acme-data").optional, false);
});

test("invalid optional flags are reported instead of silently installing an optional pack", (t) => {
  const { dir } = acmeRoot(t);
  const file = path.join(dir, "plugins", "acme-data", ".marsai-plugin.json");
  write(file, { ...JSON.parse(fs.readFileSync(file, "utf8")), optional: "true" });
  const catalog = loadCatalog({ roots: [readRoot(dir)] });
  assert.equal(catalog.plugins.has("acme-data"), false);
  assert.match(catalog.problems[0], /optional.*booleano/);
});

test("the public extras group is separate from development and excluded from defaults", () => {
  const catalog = loadCatalog({ roots: [primaryRoot()] });
  assert.equal(resolvePlugins(catalog, []).includes("marsai-extras"), false);
  assert.deepEqual(resolvePlugins(catalog, groupPlugins(catalog, ["extras"])), ["marsai-extras"]);
  assert.equal(resolvePlugins(catalog, groupPlugins(catalog, ["desenvolvimento"])).includes("marsai-extras"), false);
});

test("this repository's coordinates are the ones in its package.json and marketplace.json", () => {
  // Read the two files here, apart from the installer, and compare: whatever
  // address the repository is published under, the installer has to follow it.
  const read = (file) =>
    JSON.parse(fs.readFileSync(path.join(REPO_ROOT, file), "utf8"));
  const pkg = read("package.json");
  const marketplace = read(".claude-plugin/marketplace.json");
  const [, owner, name] = /github\.com\/([^/]+)\/(.+?)(?:\.git)?$/.exec(
    pkg.repository.url,
  );
  const root = primaryRoot();
  assert.equal(root.dir, REPO_ROOT);
  assert.equal(root.repo, `${owner}/${name}`);
  assert.equal(root.marketplace, marketplace.name);
  assert.equal(root.owner, marketplace.owner.name);
  assert.equal(root.packageName, pkg.name);
  assert.equal(root.version, pkg.version);
  assert.equal(root.version, PKG_VERSION);
  assert.equal(npxSpec(root), `github:${owner}/${name}#main`);
  assert.equal(repoUrl(root), `https://github.com/${owner}/${name}`);
  assert.equal(checkoutKey(root), `${owner}--${name}`);
});

test("a GitHub repository is read from every form package.json accepts", () => {
  for (const value of [
    "git+https://github.com/acme/kit.git",
    "https://github.com/acme/kit",
    "https://github.com/acme/kit/",
    "git+ssh://git@github.com/acme/kit.git",
    "git@github.com:acme/kit.git",
    "github:acme/kit",
    "acme/kit",
    { type: "git", url: "git+https://github.com/acme/kit.git" },
  ])
    assert.equal(githubRepo(value), "acme/kit", JSON.stringify(value));
  for (const value of [
    undefined,
    {},
    "https://gitlab.com/acme/kit.git",
    "not a repository",
  ])
    assert.equal(githubRepo(value), null, JSON.stringify(value));
});

test("a root needs marketplace.json with a name and a plugins folder", (t) => {
  const dir = tempDir(t);
  assert.throws(() => readRoot(dir), /não é uma raiz MarsAI/);
  write(path.join(dir, ".claude-plugin", "marketplace.json"), { name: "acme" });
  assert.throws(() => readRoot(dir), /não é uma raiz MarsAI/);
  fs.mkdirSync(path.join(dir, "plugins"));
  assert.equal(readRoot(dir).marketplace, "acme");
  write(path.join(dir, ".claude-plugin", "marketplace.json"), { plugins: [] });
  assert.throws(() => readRoot(dir), /não é uma raiz MarsAI/);
});

test("a root takes its marketplace name and repository from its own files", (t) => {
  const { root } = acmeRoot(t);
  assert.equal(root.marketplace, "acme");
  assert.equal(root.owner, "Acme");
  assert.equal(root.repo, "acme/kit");
  assert.equal(root.version, "1.2.3");
  assert.equal(npxSpec(root), "github:acme/kit#main");
  assert.equal(checkoutKey(root), "acme--kit");
  const bare = readRoot(writeRoot(tempDir(t), { pkg: null }));
  assert.equal(bare.repo, null);
  assert.equal(bare.version, null);
  assert.equal(npxSpec(bare), null);
  assert.equal(repoUrl(bare), null);
  assert.equal(checkoutKey(bare), "acme");
});

test("everything known about a plugin is read from the plugin's own folder", (t) => {
  const { catalog, dir } = acmeRoot(t);
  assert.deepEqual(catalog.problems, []);
  assert.deepEqual(names(catalog), ["acme-core", "acme-data", "acme-dev"]);
  const data = catalog.plugins.get("acme-data");
  assert.equal(data.dir, path.join(dir, "plugins", "acme-data"));
  assert.equal(data.description, "Acme reports over the BI server.");
  assert.equal(data.version, "0.3.0");
  assert.deepEqual(data.dependencies, ["acme-core"]);
  assert.deepEqual(data.targets, TARGETS);
  assert.equal(data.group, "analytics");
  assert.equal(data.legacySkills, undefined);
  const core = catalog.plugins.get("acme-core");
  assert.equal(core.group, null);
  assert.deepEqual(core.legacySkills, ["guide", "old-guide"]);
  assert.deepEqual([...catalog.providers.keys()].sort(), ["acme-bi", "linear"]);
  assert.deepEqual(catalog.providers.get("acme-bi"), {
    id: "acme-bi",
    provider: ACME_BI.provider,
    access: ACME_BI.access,
  });
});

test("plugins that declare the same group id form one group, named by the first plugin that says how", (t) => {
  const group = (extra) => ({
    schemaVersion: 1,
    targets: ALL_TARGETS,
    group: { id: "building", ...extra },
  });
  const { catalog } = acmeRoot(t, {
    plugins: {
      "acme-c": {
        manifest: group({
          label: { en: "Third" },
          description: { en: "From c", "pt-BR": "De c" },
        }),
      },
      "acme-a": { manifest: group({}) },
      "acme-b": { manifest: group({ label: "Second" }) },
      "acme-z": {
        manifest: {
          schemaVersion: 1,
          targets: ALL_TARGETS,
          group: { id: "alone", label: "Alone" },
        },
      },
      "acme-base": {},
    },
  });
  assert.deepEqual([...catalog.groups.keys()], ["building", "alone"]);
  assert.deepEqual(catalog.groups.get("building"), {
    id: "building",
    plugins: ["acme-a", "acme-b", "acme-c"],
    label: "Second",
    description: { en: "From c", "pt-BR": "De c" },
  });
  assert.deepEqual(groupPlugins(catalog, ["alone", "building"]), [
    "acme-z",
    "acme-a",
    "acme-b",
    "acme-c",
  ]);
  assert.equal(catalog.plugins.get("acme-base").group, null);
});

test("a plugin with no installer manifest, or with a bad one, is left out and reported", (t) => {
  const manifest = (extra) => ({
    schemaVersion: 1,
    targets: ALL_TARGETS,
    ...extra,
  });
  const { catalog, dir } = acmeRoot(t, {
    plugins: {
      "acme-ok": {},
      "acme-none": { manifest: null },
      "acme-version": { manifest: manifest({ schemaVersion: 2 }) },
      "acme-target": { manifest: manifest({ targets: ["codex", "vscode"] }) },
      "acme-empty": { manifest: manifest({ targets: [] }) },
      "acme-group": { manifest: manifest({ group: { id: "Bad Id" } }) },
      "acme-label": {
        manifest: manifest({ group: { id: "fine", label: { en: 3 } } }),
      },
      "acme-legacy": { manifest: manifest({ legacySkills: "guide" }) },
    },
  });
  write(path.join(dir, "plugins", "acme-json", ".claude-plugin", "plugin.json"), {
    name: "acme-json",
  });
  write(path.join(dir, "plugins", "acme-json", ".marsai-plugin.json"), "{");
  fs.mkdirSync(path.join(dir, "plugins", "not-a-plugin"));
  const reloaded = loadCatalog({ roots: [readRoot(dir)] });
  assert.deepEqual(names(catalog), ["acme-ok"]);
  assert.deepEqual(names(reloaded), ["acme-ok"]);
  assert.equal(reloaded.groups.size, 0);
  assert.equal(reloaded.problems.length, 8);
  for (const left of [
    "acme-none",
    "acme-version",
    "acme-target",
    "acme-empty",
    "acme-group",
    "acme-label",
    "acme-legacy",
    "acme-json",
  ])
    assert.ok(
      reloaded.problems.some((problem) => problem.startsWith(`${left}:`)),
      left,
    );
  assert.match(
    reloaded.problems.find((problem) => problem.startsWith("acme-none:")),
    /sem \.marsai-plugin\.json/,
  );
});

test("a selection brings what each plugin depends on, dependencies first; nothing chosen means everything", (t) => {
  const { catalog } = acmeRoot(t);
  assert.deepEqual(resolvePlugins(catalog, ["acme-data"]), [
    "acme-core",
    "acme-data",
  ]);
  assert.deepEqual(resolvePlugins(catalog, ["acme-core"]), ["acme-core"]);
  assert.deepEqual(resolvePlugins(catalog, ["acme-dev", "acme-data"]), [
    "acme-core",
    "acme-dev",
    "acme-data",
  ]);
  assert.deepEqual(resolvePlugins(catalog, ["acme-data", "acme-core"]), [
    "acme-core",
    "acme-data",
  ]);
  assert.deepEqual(resolvePlugins(catalog, []), [
    "acme-core",
    "acme-data",
    "acme-dev",
  ]);
  const chained = acmeRoot(t, {
    plugins: {
      "acme-core": {},
      "acme-dev": { dependencies: ["acme-core", "acme-missing"] },
      "acme-shared": { dependencies: [{ name: "acme-dev" }] },
      "acme-loop-a": { dependencies: ["acme-loop-b"] },
      "acme-loop-b": { dependencies: ["acme-loop-a"] },
    },
  }).catalog;
  assert.deepEqual(resolvePlugins(chained, ["acme-shared"]), [
    "acme-core",
    "acme-dev",
    "acme-shared",
  ]);
  assert.deepEqual(resolvePlugins(chained, ["acme-loop-a"]), [
    "acme-loop-b",
    "acme-loop-a",
  ]);
});

test("a plugin reaches only the apps its manifest lists", (t) => {
  const { catalog } = acmeRoot(t, {
    plugins: {
      "acme-core": {},
      "acme-codex": {
        manifest: { schemaVersion: 1, targets: ["opencode", "codex"] },
      },
    },
  });
  assert.deepEqual(catalog.plugins.get("acme-codex").targets, [
    "codex",
    "opencode",
  ]);
  const all = ["acme-core", "acme-codex", "acme-unknown"];
  const reach = (target) =>
    pluginsFor(catalog, all, target).map((plugin) => plugin.name);
  assert.deepEqual(reach("codex"), ["acme-core", "acme-codex"]);
  assert.deepEqual(reach("cursor"), ["acme-core"]);
});

test("deleting a plugin folder removes its group and its MCP provider from the installer", (t) => {
  const { catalog, dir } = acmeRoot(t);
  assert.ok(catalog.groups.has("analytics"));
  assert.ok(catalog.providers.has("acme-bi"));
  fs.rmSync(path.join(dir, "plugins", "acme-data"), { recursive: true });
  const after = loadCatalog({ roots: [readRoot(dir)] });
  assert.deepEqual(names(after), ["acme-core", "acme-dev"]);
  assert.deepEqual([...after.groups.keys()], ["building"]);
  assert.deepEqual([...after.providers.keys()], ["linear"]);
  assert.deepEqual(after.problems, []);
});
