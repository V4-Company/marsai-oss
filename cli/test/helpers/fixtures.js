import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadCatalog } from "../../src/catalog.js";
import { primaryRoot, readRoot } from "../../src/roots.js";

/**
 * Invented roots, plugins and MCP providers for the installer tests. Nothing here
 * names a real plugin: the installer has to work with whatever a root declares.
 */

export const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
);
export const ALL_TARGETS = ["claude", "codex", "cursor", "opencode"];

/** A gated OAuth provider with a base URL, a route and an access question. */
export const ACME_BI = Object.freeze({
  id: "acme-bi",
  skills: ["reports"],
  provider: {
    name: "Acme BI",
    docs: "https://bi.acme.test/docs/mcp",
    auth: "oauth",
    url: "https://bi.acme.test/",
    path: "/api/bi-mcp",
    acceptedPaths: ["/api/bi-mcp", "/api/mcp"],
    setupHint: {
      en: "Ask an admin to turn MCP on.",
      "pt-BR": "Peça a um admin para ligar o MCP.",
    },
  },
  access: {
    notice: {
      en: "This skill needs access to Acme BI.",
      "pt-BR": "Esta skill precisa de acesso ao Acme BI.",
    },
    question: {
      en: "Do you already have access to Acme BI?",
      "pt-BR": "Já tem acesso ao Acme BI?",
    },
    contact: "data@acme.test",
  },
});

/** Letters that only Portuguese text has. English output, and what goes into an app, has none. */
export const PORTUGUESE = /[ãõçáéíóúâêôà]/i;

/**
 * The Codex rules file as the 3.3.0 installer wrote it, in Portuguese, for the
 * invented base and development plugins: the skills each one lists in
 * `legacySkills`, not the skills it ships today. 3.3.0 wrote the file with LF; a
 * Windows checkout may hand the fixture over with CRLF, so put LF back.
 */
export function legacyRulesFixture() {
  return fs
    .readFileSync(
      new URL("../fixtures/codex-rules-3.3.0.md", import.meta.url),
      "utf8",
    )
    .replace(/\r\n/g, "\n");
}

export function tempDir(t, prefix = "marsai-fixture-") {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

export function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(
    file,
    typeof content === "string"
      ? content
      : `${JSON.stringify(content, null, 2)}\n`,
  );
  return file;
}

const skill = (name) =>
  `---\nname: ${name}\ndescription: "Fixture skill ${name}."\n---\n\n# ${name}\n`;
const agent = (name) =>
  `---\nname: ${name}\ndescription: "Fixture agent ${name}."\nmodel: opus\ntools: Read\n---\n\nYou are ${name}.\n`;
const command = (name) =>
  `---\ndescription: "Fixture command ${name}."\n---\n\nRun ${name}.\n`;

/** The standard invented plugins: a base, a development pack and a gated data pack. */
export function acmePlugins() {
  return {
    "acme-core": {
      version: "2.0.0",
      description: "Acme base everyone installs.",
      manifest: {
        schemaVersion: 1,
        targets: ALL_TARGETS,
        legacySkills: ["guide", "old-guide"],
      },
      skills: ["guide"],
      commands: ["hello"],
    },
    "acme-data": {
      version: "0.3.0",
      description: "Acme reports over the BI server.",
      dependencies: ["acme-core"],
      manifest: {
        schemaVersion: 1,
        targets: ALL_TARGETS,
        group: {
          id: "analytics",
          label: { en: "Analytics", "pt-BR": "Análises" },
          description: {
            en: "Reports over Acme BI",
            "pt-BR": "Relatórios sobre o Acme BI",
          },
        },
      },
      skills: ["reports", "reports-help"],
      mcp: [ACME_BI],
    },
    "acme-dev": {
      version: "1.1.0",
      description: "Acme building tools.",
      dependencies: ["acme-core"],
      manifest: {
        schemaVersion: 1,
        targets: ALL_TARGETS,
        group: {
          id: "building",
          label: { en: "Building", "pt-BR": "Construção" },
          description: { en: "Build and ship", "pt-BR": "Construir e entregar" },
        },
        legacySkills: ["craft"],
      },
      skills: ["craft"],
      agents: ["builder", "planner"],
      commands: ["build"],
      mcp: [{ id: "linear", skills: ["craft"], required: false }],
    },
  };
}

/**
 * Write a root to `dir`. Each plugin may give: version, description, dependencies,
 * manifest (the `.marsai-plugin.json`, omitted when null), mcp (entries of its
 * `.marsai-dependencies.json`), skills, agents and commands (names).
 */
export function writeRoot(
  dir,
  {
    marketplace = "acme",
    owner = "Acme",
    pkg = {
      name: "@acme/kit",
      version: "1.2.3",
      type: "module",
      repository: { type: "git", url: "git+https://github.com/acme/kit.git" },
    },
    plugins = acmePlugins(),
  } = {},
) {
  if (pkg) write(path.join(dir, "package.json"), pkg);
  write(path.join(dir, ".claude-plugin", "marketplace.json"), {
    name: marketplace,
    owner: { name: owner },
    plugins: Object.keys(plugins).map((name) => ({
      name,
      source: `./plugins/${name}`,
    })),
  });
  fs.mkdirSync(path.join(dir, "plugins"), { recursive: true });
  for (const [name, spec] of Object.entries(plugins)) {
    const base = path.join(dir, "plugins", name);
    write(path.join(base, ".claude-plugin", "plugin.json"), {
      name,
      description: spec.description ?? `Fixture plugin ${name}.`,
      version: spec.version ?? "1.0.0",
      ...(spec.dependencies ? { dependencies: spec.dependencies } : {}),
    });
    if (spec.manifest !== null)
      write(
        path.join(base, ".marsai-plugin.json"),
        spec.manifest ?? { schemaVersion: 1, targets: ALL_TARGETS },
      );
    if (spec.mcp)
      write(path.join(base, ".marsai-dependencies.json"), {
        schemaVersion: 1,
        mcp: spec.mcp,
      });
    for (const item of spec.skills ?? [])
      write(path.join(base, "skills", item, "SKILL.md"), skill(item));
    for (const item of spec.agents ?? [])
      write(path.join(base, "agents", `${item}.md`), agent(item));
    for (const item of spec.commands ?? [])
      write(path.join(base, "commands", `${item}.md`), command(item));
  }
  return dir;
}

/** A temp root with the standard invented plugins, and its catalog. */
export function acmeRoot(t, options) {
  const dir = writeRoot(tempDir(t, "marsai-root-"), options);
  const root = readRoot(dir);
  return { dir, root, catalog: loadCatalog({ roots: [root] }) };
}

/** Catalog entries of the named plugins, in the given order. */
export function pick(catalog, ...names) {
  return names.map((name) => {
    const plugin = catalog.plugins.get(name);
    if (!plugin) throw new Error(`fixture has no plugin ${name}`);
    return plugin;
  });
}

/** The catalog of the repository the tests run in, whatever plugins it has today. */
export function realCatalog() {
  return loadCatalog({ roots: [primaryRoot()] });
}

/**
 * Put a copy of the installer inside `dir`, so that `dir` is the root it ships in.
 * @returns {string} path of the copied `cli/bin/marsai.js`
 */
export function installerAt(dir) {
  for (const part of ["bin", "src"])
    fs.cpSync(path.join(REPO_ROOT, "cli", part), path.join(dir, "cli", part), {
      recursive: true,
    });
  fs.symlinkSync(
    path.join(REPO_ROOT, "node_modules"),
    path.join(dir, "node_modules"),
    "junction",
  );
  return path.join(dir, "cli", "bin", "marsai.js");
}

/** A root with the standard invented plugins that carries its own installer. */
export function acmeInstaller(t, options) {
  const dir = writeRoot(tempDir(t, "marsai-root-"), options);
  return { dir, bin: installerAt(dir) };
}

/** The invented plugins plus one that joins a group and depends on the base of this repository. */
export function addonPlugins() {
  return {
    ...acmePlugins(),
    "acme-addon": {
      version: "0.1.0",
      description: "Acme extras for the development group.",
      dependencies: ["marsai-core"],
      manifest: {
        schemaVersion: 1,
        targets: ALL_TARGETS,
        group: { id: "desenvolvimento" },
      },
      skills: ["addon-skill"],
      agents: ["addon-agent"],
      commands: ["addon-command"],
    },
  };
}

/**
 * Give a root the bin a package of extra plugins ships: it runs this
 * repository's installer with the package itself as an extra root.
 * @returns {string} path of the bin
 */
export function wrapperBin(dir) {
  const installer = pathToFileURL(
    path.join(REPO_ROOT, "cli", "src", "cli.js"),
  ).href;
  return write(
    path.join(dir, "bin", "acme.mjs"),
    [
      "#!/usr/bin/env node",
      'import { fileURLToPath } from "node:url";',
      `import { run } from ${JSON.stringify(installer)};`,
      'const here = fileURLToPath(new URL("..", import.meta.url));',
      "run(process.argv.slice(2), { extraRoots: [here] }).catch((error) => {",
      "  console.error(`\\n✗ ${error.message}`);",
      "  process.exit(1);",
      "});",
      "",
    ].join("\n"),
  );
}

/** A root of extra plugins with that bin. */
export function addonPackage(t, options = {}) {
  const dir = writeRoot(tempDir(t, "marsai-addon-"), {
    plugins: addonPlugins(),
    ...options,
  });
  return { dir, bin: wrapperBin(dir), root: readRoot(dir) };
}

/**
 * A stand-in for the `claude` CLI that keeps any number of marketplaces. It logs
 * each call to <home>/calls.jsonl and mirrors what the real CLI writes under
 * ~/.claude. A GitHub source is accepted when <home>/repos.json maps the
 * repository to a marketplace name; <home>/fail-adds lists sources to refuse.
 */
const FAKE_CLAUDE = `
import fs from "node:fs";
import path from "node:path";
const h = process.env.HOME;
const args = process.argv.slice(2);
fs.appendFileSync(path.join(h, "calls.jsonl"), JSON.stringify(args) + "\\n");
const plugins = path.join(h, ".claude", "plugins");
const marketFile = path.join(h, "market.json");
const knownFile = path.join(plugins, "known_marketplaces.json");
const installedFile = path.join(plugins, "installed_plugins.json");
const settingsFile = path.join(h, ".claude", "settings.json");
const read = (file, fallback) => {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
};
const write = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data));
};
const lines = (file) => {
  try { return fs.readFileSync(path.join(h, file), "utf8").split("\\n"); } catch { return []; }
};
const cmd = args.slice(0, 3).join(" ");
if (cmd === "plugin marketplace list") {
  process.stdout.write(JSON.stringify(read(marketFile, [])));
} else if (cmd === "plugin marketplace add") {
  const src = args[3];
  if (lines("fail-adds").includes(src)) {
    process.stderr.write("fatal: could not read " + src);
    process.exit(1);
  }
  let name;
  let source;
  if (path.isAbsolute(src)) {
    name = read(path.join(src, ".claude-plugin", "marketplace.json"), {}).name;
    source = { source: "directory", path: src };
  } else {
    const [repo, ref] = src.split("#");
    name = read(path.join(h, "repos.json"), {})[repo];
    source = { source: "github", repo, ...(ref ? { ref } : {}) };
  }
  if (!name) {
    process.stderr.write("fatal: repository not found " + src);
    process.exit(1);
  }
  write(marketFile, [...read(marketFile, []).filter((m) => m.name !== name), { name, ...source }]);
  write(knownFile, { ...read(knownFile, {}), [name]: { source } });
  if (source.source === "github") {
    const settings = read(settingsFile, {});
    settings.extraKnownMarketplaces = { ...settings.extraKnownMarketplaces, [name]: { source } };
    write(settingsFile, settings);
  }
} else if (cmd === "plugin marketplace remove") {
  write(marketFile, read(marketFile, []).filter((m) => m.name !== args[3]));
  const known = read(knownFile, {});
  delete known[args[3]];
  write(knownFile, known);
} else if (args[0] === "plugin" && args[1] === "install") {
  if (lines("fail-installs").includes(args[2])) {
    process.stderr.write("install failed " + args[2]);
    process.exit(1);
  }
  const data = read(installedFile, { version: 2, plugins: {} });
  data.plugins[args[2]] = [{ scope: "user" }];
  write(installedFile, data);
} else if (args[0] === "plugin" && args[1] === "uninstall") {
  const data = read(installedFile, { version: 2, plugins: {} });
  delete data.plugins[args[2]];
  write(installedFile, data);
}
`;

/**
 * A home with the stand-in `claude` in <home>/bin, to be used as PATH.
 * `git` true answers every ls-remote, false leaves git out (no GitHub access).
 * `repos` maps `Owner/name` to the marketplace name that repository holds.
 */
export function claudeHome(t, { git = true, repos = {} } = {}) {
  const home = tempDir(t, "marsai-claude-");
  const bin = path.join(home, "bin");
  write(path.join(bin, "package.json"), { type: "module" });
  write(path.join(bin, "claude"), `#!${process.execPath}\n${FAKE_CLAUDE}`);
  fs.chmodSync(path.join(bin, "claude"), 0o755);
  if (git) {
    write(
      path.join(bin, "git"),
      '#!/bin/sh\ncase "$*" in *--tags*) echo "abc123 tag";; esac\nexit 0\n',
    );
    fs.chmodSync(path.join(bin, "git"), 0o755);
  }
  write(path.join(home, "repos.json"), repos);
  return {
    home,
    path: bin,
    calls: () =>
      fs
        .readFileSync(path.join(home, "calls.jsonl"), "utf8")
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line).join(" ")),
    installed: () =>
      Object.keys(
        JSON.parse(
          fs.readFileSync(
            path.join(home, ".claude", "plugins", "installed_plugins.json"),
            "utf8",
          ),
        ).plugins,
      ).sort(),
  };
}
