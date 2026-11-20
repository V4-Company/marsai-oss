import "./helpers/lang.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import TOML from "@iarna/toml";
import { loadCatalog, pluginsFor, resolvePlugins } from "../src/catalog.js";
import { localized } from "../src/i18n.js";
import { mcpDependencies } from "../src/mcp.js";
import { startMcpLogin } from "../src/mcp-login.js";
import { readRoot } from "../src/roots.js";
import { runWizard } from "../src/wizard.js";
import {
  REPO_ROOT,
  installerAt,
  realCatalog,
  tempDir,
  write,
} from "./helpers/fixtures.js";

// These tests read the plugins this repository has today and check that each
// group and each gated MCP provider they declare behaves as the installer
// promises. They name no plugin beyond the base and the development pack, so
// they keep passing when a plugin folder is added or taken away.

const bin = path.resolve("cli/bin/marsai.js");
const catalog = realCatalog();
const BASE = ["marsai-core", "marsai-dev"];

function home(t) {
  const h = fs.mkdtempSync(path.join(os.tmpdir(), "marsai-real-"));
  t.after(() => fs.rmSync(h, { recursive: true, force: true }));
  return h;
}
function cli(from, args, h) {
  return spawnSync(process.execPath, [from, ...args, "--home", h], {
    encoding: "utf8",
    env: { ...process.env, PATH: "/nonexistent" },
  });
}
const state = (h) =>
  JSON.parse(fs.readFileSync(path.join(h, ".marsai-installer.json"), "utf8"));
const skillsOf = (plugin) =>
  fs.existsSync(path.join(plugin.dir, "skills"))
    ? fs
        .readdirSync(path.join(plugin.dir, "skills"), { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
    : [];
const question = (dependency) =>
  `${localized(dependency.access.question, "pt-BR")} [Sim/Não]: `;
/** MCP dependencies that ask about access, among the given plugins. */
const gatedAmong = (plugins) =>
  (
    mcpDependencies({ plugins, providers: catalog.providers }).dependencies || []
  ).filter((dependency) => dependency.access);
/** What each group brings: every plugin, and the ones Codex receives. */
const groups = [...catalog.groups.values()].map((group) => {
  const names = resolvePlugins(catalog, group.plugins);
  const forCodex = pluginsFor(catalog, names, "codex");
  return {
    group,
    names,
    forCodex,
    gated: gatedAmong(names.map((name) => catalog.plugins.get(name))),
    gatedForCodex: gatedAmong(forCodex),
  };
});

test("this repository: every plugin folder is distributed and the base plugins are there", () => {
  assert.deepEqual(catalog.problems, []);
  const folders = fs
    .readdirSync(path.join(REPO_ROOT, "plugins"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual([...catalog.plugins.keys()], folders);
  for (const name of BASE) assert.ok(catalog.plugins.has(name), name);
  assert.equal(catalog.plugins.get("marsai-core").group, null);
  assert.equal(catalog.plugins.get("marsai-dev").group, "desenvolvimento");
  for (const group of catalog.groups.values()) {
    assert.ok(localized(group.label, "pt-BR"), `${group.id} label pt-BR`);
    assert.ok(localized(group.label, "en"), `${group.id} label en`);
  }
  // Every MCP a plugin depends on is built in or declared by some plugin here.
  const all = mcpDependencies({
    plugins: [...catalog.plugins.values()],
    providers: catalog.providers,
  });
  assert.equal(all.ok, true, all.message);
});

for (const { group, names, forCodex, gated } of groups) {
  test(`this repository: --group ${group.id} --yes installs the group's plugins and what they depend on`, (t) => {
    const h = home(t);
    const r = cli(
      bin,
      ["--mcp", "skip", "install", "--target", "codex", "--group", group.id, "--yes"],
      h,
    );
    assert.equal(r.status, 0, r.stderr);
    for (const name of group.plugins) assert.ok(names.includes(name), name);
    assert.deepEqual(
      state(h).targets[0].plugins,
      forCodex.map((plugin) => plugin.name),
    );
    assert.deepEqual(state(h).targets[0].groups, [group.id]);
    const skills = path.join(h, ".agents/skills");
    const installed = fs.existsSync(skills) ? fs.readdirSync(skills).sort() : [];
    const wanted = [...new Set(forCodex.flatMap(skillsOf))].sort();
    assert.deepEqual(installed, wanted);
    assert.match(r.stdout, /Base MarsAI incluída nas escolhas\./);
  });

  if (!gated.length) continue;
  test(`this repository: the wizard asks the access question of each gated MCP of --group ${group.id}`, async (t) => {
    const prompts = [];
    let transcript = "";
    const result = await runWizard(
      {
        home: home(t),
        targets: ["codex"],
        groups: [group.id],
        plugins: [],
        autoUpdate: false,
      },
      [],
      catalog,
      {
        ask: async (text) => {
          prompts.push(text);
          return "não";
        },
        output: { write: (text) => (transcript += text) },
      },
    );
    assert.equal(result.ok, true);
    assert.deepEqual(prompts, gated.map(question));
    for (const { id, provider, access } of gated) {
      assert.equal(result.args.mcpAccess[id], false);
      const notice = localized(access.notice, "pt-BR");
      assert.ok(
        transcript.includes(
          `\n${provider.name}\n${provider.url ? `${provider.url}\n` : ""}O login será feito no aplicativo escolhido.\nConexões existentes serão preservadas.\n${notice ? `${notice}\n` : ""}`,
        ),
        transcript,
      );
    }
  });
}

for (const { group, dependency } of groups.flatMap(({ group, gatedForCodex }) =>
  gatedForCodex.map((dependency) => ({ group, dependency })),
)) {
  const { id, provider, access } = dependency;

  test(`this repository: --${id}-url and --${id}-access keep working for --group ${group.id}`, (t) => {
    for (const flags of [
      [`--${id}-url`, "http://127.0.0.1:9", `--${id}-access`, "no"],
      ["--mcp-url", `${id}=http://127.0.0.1:9`, "--mcp-access", `${id}=no`],
    ]) {
      const h = home(t);
      const r = cli(
        bin,
        ["install", "--target", "codex", "--group", group.id, "--yes", ...flags],
        h,
      );
      assert.equal(r.status, 0, r.stderr);
      assert.equal(
        TOML.parse(fs.readFileSync(path.join(h, ".codex/config.toml"), "utf8"))
          .mcp_servers[id].url,
        `http://127.0.0.1:9${provider.path ?? "/"}`,
      );
      const whom = access.contact
        ? `Peça acesso para ${access.contact}.`
        : "Peça acesso a quem administra o serviço.";
      assert.ok(
        r.stdout.includes(
          `\n  ${provider.name}\n    ! Acesso ao ${provider.name} pendente.\n    ${whom}\n`,
        ),
        r.stdout,
      );
    }
    const bad = cli(bin, ["install", `--${id}-access`, "maybe"], home(t));
    assert.match(bad.stderr, new RegExp(`--${id}-access deve ser yes ou no`));
  });

  test(`this repository: saying yes starts the ${id} login through the app`, (t) => {
    const h = home(t);
    fs.mkdirSync(path.join(h, ".codex"));
    fs.writeFileSync(
      path.join(h, ".codex/config.toml"),
      `[mcp_servers.${id}]\nurl = "https://example.test/mcp"\n`,
    );
    const calls = [];
    const result = startMcpLogin({
      home: h,
      currentHome: h,
      target: "codex",
      dependency,
      access: true,
      configured: true,
      exists: () => true,
      run: (...args) => {
        calls.push(args.slice(0, 2));
        return { status: 0 };
      },
    });
    assert.equal(result.state, "client-success");
    assert.deepEqual(calls, [["codex", ["mcp", "login", id]]]);
  });
}

test("a root with only the base and development plugins installs and knows nothing else", async (t) => {
  const dir = tempDir(t, "marsai-public-");
  fs.cpSync(path.join(REPO_ROOT, "package.json"), path.join(dir, "package.json"));
  const marketplace = JSON.parse(
    fs.readFileSync(
      path.join(REPO_ROOT, ".claude-plugin", "marketplace.json"),
      "utf8",
    ),
  );
  write(path.join(dir, ".claude-plugin", "marketplace.json"), {
    ...marketplace,
    plugins: marketplace.plugins.filter((entry) => BASE.includes(entry.name)),
  });
  for (const name of BASE)
    fs.cpSync(
      path.join(REPO_ROOT, "plugins", name),
      path.join(dir, "plugins", name),
      { recursive: true },
    );
  const publicBin = installerAt(dir);
  const reduced = loadCatalog({ roots: [readRoot(dir)] });
  assert.deepEqual([...reduced.plugins.keys()], BASE);
  assert.deepEqual([...reduced.groups.keys()], ["desenvolvimento"]);
  assert.equal(reduced.groups.has("dados"), false);
  assert.deepEqual(reduced.problems, []);

  const h = home(t);
  const help = cli(publicBin, ["--help"], h).stdout;
  assert.match(help, /--group <name>      desenvolvimento; repetível/);
  assert.match(help, /só este plugin \(marsai-core \| marsai-dev\); repetível/);

  // What the full repository has beyond this root is unknown here: its plugins,
  // its groups and the flags of its MCP providers.
  for (const name of catalog.plugins.keys()) {
    if (BASE.includes(name)) continue;
    assert.ok(!help.includes(name), `${name} in help`);
    const r = cli(publicBin, ["install", "--plugin", name], h);
    assert.match(r.stderr, new RegExp(`plugin desconhecido: ${name}\\.`));
  }
  for (const id of catalog.groups.keys()) {
    if (reduced.groups.has(id)) continue;
    const r = cli(publicBin, ["install", "--group", id, "--yes"], h);
    assert.notEqual(r.status, 0);
    assert.match(
      r.stderr,
      new RegExp(`grupo desconhecido: ${id}\\. Válidos: desenvolvimento`),
    );
  }
  for (const id of catalog.providers.keys()) {
    if (reduced.providers.has(id)) continue;
    assert.ok(!help.includes(`--${id}-`), `--${id}- flags in help`);
    for (const flag of [`--${id}-url`, `--${id}-access`]) {
      const r = cli(publicBin, ["install", flag, "yes"], h);
      assert.match(r.stderr, new RegExp(`flag desconhecida: ${flag}`));
    }
  }
  const noGroup = cli(publicBin, ["install", "--group", "dados", "--yes"], h);
  assert.match(
    noGroup.stderr,
    /grupo desconhecido: dados\. Válidos: desenvolvimento/,
  );
  assert.deepEqual(fs.readdirSync(h), []);

  const all = cli(
    publicBin,
    ["--mcp", "skip", "install", "--target", "codex", "--target", "opencode", "--yes"],
    h,
  );
  assert.equal(all.status, 0, all.stderr);
  assert.deepEqual(
    state(h).targets.map((entry) => entry.plugins),
    [BASE, BASE],
  );
  assert.ok(fs.existsSync(path.join(h, ".agents/skills/using-marsai/SKILL.md")));
  assert.ok(fs.existsSync(path.join(h, ".config/opencode/skills/tdd/SKILL.md")));
  assert.deepEqual(
    fs.readdirSync(path.join(h, ".agents/skills")).sort(),
    BASE.flatMap((name) => skillsOf(reduced.plugins.get(name))).sort(),
  );

  const prompts = [];
  const answers = ["2", "1", "n"];
  const wizard = await runWizard(
    { targets: [], plugins: [], groups: [], home: home(t) },
    [],
    reduced,
    {
      ask: async (text) => {
        prompts.push(text);
        return answers.shift();
      },
      output: { write() {} },
    },
  );
  assert.equal(wizard.ok, true);
  assert.deepEqual(wizard.args.groups, ["desenvolvimento"]);
  assert.deepEqual(wizard.args.mcpAccess, {});
  assert.equal(prompts.length, 3);
  assert.match(prompts[1], /\n  1\. Desenvolvimento: [^\n]+\n\nEscolha/);
  assert.doesNotMatch(prompts[1], /\n  2\. /);

  assert.equal(cli(publicBin, ["remove"], h).status, 0);
  assert.equal(fs.existsSync(path.join(h, ".agents/skills/tdd")), false);
});
