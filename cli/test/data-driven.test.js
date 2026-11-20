import "./helpers/lang.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import TOML from "@iarna/toml";
import { primaryRoot } from "../src/roots.js";
import {
  PORTUGUESE,
  acmeInstaller,
  acmePlugins,
  legacyRulesFixture,
  write,
} from "./helpers/fixtures.js";

// Every test here runs the installer from an invented root: its groups, plugins,
// MCP flags and repository are whatever that root's files declare.

function home(t) {
  const h = fs.mkdtempSync(path.join(os.tmpdir(), "marsai-driven-"));
  t.after(() => fs.rmSync(h, { recursive: true, force: true }));
  return h;
}
const env = (extra = {}) => ({ ...process.env, PATH: "/nonexistent", ...extra });
function cli(bin, args, h) {
  return spawnSync(
    process.execPath,
    [bin, ...args, ...(h ? ["--home", h] : [])],
    { encoding: "utf8", env: env() },
  );
}
/** Runs without blocking this process, so a server started by the test can answer. */
function cliAsync(bin, args, extraEnv) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [bin, ...args], {
      env: env(extraEnv),
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("close", (status) => resolve({ status, stdout, stderr }));
  });
}
/** A server that answers every request asking for authentication. */
async function gatedServer(t) {
  const server = http.createServer((req, res) => {
    req.resume();
    res.writeHead(401).end();
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  return `http://127.0.0.1:${server.address().port}`;
}
const state = (h) =>
  JSON.parse(fs.readFileSync(path.join(h, ".marsai-installer.json"), "utf8"));
const codexConfig = (h) =>
  TOML.parse(fs.readFileSync(path.join(h, ".codex/config.toml"), "utf8"));
const analytics = ["install", "--target", "codex", "--group", "analytics", "--yes"];

test("help lists the groups, plugins and MCP flags the root declares, and how to run that root", (t) => {
  const { bin } = acmeInstaller(t);
  const out = cli(bin, ["--help"]).stdout;
  assert.match(out, /marketplace de plugins da Acme para Claude Code/);
  assert.match(out, /^  npx github:acme\/kit#main install \[opções\]/m);
  assert.match(out, /--group <name>      analytics \| building; repetível/);
  assert.match(
    out,
    /--plugin <name>     só este plugin \(acme-core \| acme-data \| acme-dev\); repetível/,
  );
  assert.match(out, /--acme-bi-access <yes\|no> informa acesso/);
  assert.match(
    out,
    /--acme-bi-url <url> sobrescreve a URL padrão \(https:\/\/bi\.acme\.test\/\) para novas conexões/,
  );
  assert.match(out, /--linear-url <url> /);
  assert.doesNotMatch(out, /--linear-access/);
  assert.match(out, /--mcp-url <id>=<url> /);
  assert.match(out, /--mcp-access <id>=<yes\|no> /);
  assert.match(out, /^  acme-data\s+Acme reports over the BI server\.$/m);
});

for (const [form, flags] of [
  ["--<id>-url and --<id>-access", (url) => ["--acme-bi-url", url, "--acme-bi-access", "no"]],
  ["--mcp-url and --mcp-access", (url) => ["--mcp-url", `acme-bi=${url}`, "--mcp-access", "acme-bi=no"]],
]) {
  test(`${form} set a provider's address and the answer about access`, (t) => {
    const { bin } = acmeInstaller(t);
    const h = home(t);
    const r = cli(bin, [...analytics, ...flags("http://127.0.0.1:9")], h);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(
      codexConfig(h).mcp_servers["acme-bi"].url,
      "http://127.0.0.1:9/api/bi-mcp",
    );
    assert.match(
      r.stdout,
      /\n  Acme BI\n    ! Acesso ao Acme BI pendente\.\n    Peça acesso para data@acme\.test\.\n/,
    );
  });
}

test("a built-in provider gets the same address flag as a declared one", (t) => {
  const { bin } = acmeInstaller(t);
  const h = home(t);
  const r = cli(
    bin,
    ["install", "--target", "codex", "--plugin", "acme-dev", "--yes", "--linear-url", "http://127.0.0.1:9/mcp"],
    h,
  );
  assert.equal(r.status, 0, r.stderr);
  assert.equal(codexConfig(h).mcp_servers.linear.url, "http://127.0.0.1:9/mcp");
  assert.match(r.stdout, /\n  Linear \(opcional\)\n/);
});

test("flags are validated against what the root declares", (t) => {
  const { bin } = acmeInstaller(t);
  const h = home(t);
  for (const [args, message] of [
    [["--group", "nope"], /grupo desconhecido: nope\. Válidos: analytics, building/],
    [["--plugin", "nope"], /plugin desconhecido: nope\. Válidos: acme-core, acme-data, acme-dev/],
    [["--acme-bi-access", "maybe"], /--acme-bi-access deve ser yes ou no/],
    [["--mcp-access", "acme-bi=maybe"], /--mcp-access acme-bi=.* deve ser yes ou no/],
    [["--mcp-access", "acme-bi"], /--mcp-access espera <id>=<valor>\. MCPs conhecidos: linear, acme-bi/],
    [["--mcp-url", "ghost=https://ghost.test"], /--mcp-url espera <id>=<valor>/],
    [["--ghost-url", "https://ghost.test"], /flag desconhecida: --ghost-url/],
    [["--ghost-access", "yes"], /flag desconhecida: --ghost-access/],
    [["--acme-bi-url"], /Valor obrigatório para --acme-bi-url/],
    [["--mcp-url"], /Valor obrigatório para --mcp-url/],
  ]) {
    const r = cli(bin, ["install", "--target", "codex", ...args], h);
    assert.notEqual(r.status, 0, args.join(" "));
    assert.match(r.stderr, message, args.join(" "));
  }
  assert.deepEqual(fs.readdirSync(h), []);
});

test("answering yes in an isolated home configures the provider and leaves the login undone", async (t) => {
  const { bin } = acmeInstaller(t);
  const h = home(t);
  const url = await gatedServer(t);
  const r = await cliAsync(bin, [
    ...analytics,
    "--acme-bi-url",
    url,
    "--acme-bi-access",
    "yes",
    "--home",
    h,
  ]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(
    r.stdout,
    /\n  Acme BI\n    ! MCP configurado; login pendente\.\n    Login não realizado neste teste\.\n/,
  );
  assert.doesNotMatch(r.stdout, /Iniciando o login/);
});

test("answering yes in the real home runs the app's own login for the gated provider", async (t) => {
  const { bin } = acmeInstaller(t);
  const h = home(t);
  const url = await gatedServer(t);
  const fake = path.join(h, "bin");
  fs.mkdirSync(fake);
  fs.writeFileSync(
    path.join(fake, "codex"),
    '#!/bin/sh\necho "$HOME|$CODEX_HOME|$*" >> "$HOME/codex-calls.log"\n',
  );
  fs.chmodSync(path.join(fake, "codex"), 0o755);
  const run = (answer) =>
    cliAsync(
      bin,
      [...analytics, "--acme-bi-url", url, "--acme-bi-access", answer],
      { HOME: h, USERPROFILE: h, MARSAI_HOME: "", PATH: fake },
    );
  const yes = await run("yes");
  assert.equal(yes.status, 0, yes.stderr);
  assert.match(yes.stdout, /Iniciando o login do Acme BI no aplicativo\.\.\./);
  assert.match(
    yes.stdout,
    /\n  Acme BI\n    ✓ Login concluído pelo aplicativo\.\n    Permissões de consulta não verificadas\.\n/,
  );
  assert.equal(
    fs.readFileSync(path.join(h, "codex-calls.log"), "utf8"),
    `${h}|${path.join(h, ".codex")}|mcp login acme-bi\n`,
  );
  const no = await run("no");
  assert.equal(no.status, 0, no.stderr);
  assert.match(no.stdout, /Peça acesso para data@acme\.test\./);
  assert.equal(
    fs.readFileSync(path.join(h, "codex-calls.log"), "utf8").split("\n").length,
    2,
    "no second login",
  );
});

test("a plugin is installed only into the apps its manifest lists", (t) => {
  const plugins = acmePlugins();
  plugins["acme-dev"].manifest.targets = ["codex"];
  const { bin } = acmeInstaller(t, { plugins });
  const h = home(t);
  const r = cli(
    bin,
    ["--mcp", "skip", "install", "--target", "codex", "--target", "opencode", "--group", "building", "--yes"],
    h,
  );
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(
    state(h).targets.map((entry) => [entry.target, entry.plugins]),
    [
      ["codex", ["acme-core", "acme-dev"]],
      ["opencode", ["acme-core"]],
    ],
  );
  assert.ok(fs.existsSync(path.join(h, ".agents/skills/craft/SKILL.md")));
  assert.ok(fs.existsSync(path.join(h, ".config/opencode/skills/guide/SKILL.md")));
  assert.equal(fs.existsSync(path.join(h, ".config/opencode/skills/craft")), false);
  assert.equal(fs.existsSync(path.join(h, ".config/opencode/agent/builder.md")), false);
  assert.match(
    r.stdout,
    /\nOpenCode\n  acme-dev: não distribuído para OpenCode; ignorado\.\n/,
  );
  assert.doesNotMatch(r.stdout, /não distribuído para Codex/);
});

test("update refuses, without changing anything, a saved selection this installer no longer carries", (t) => {
  const full = acmeInstaller(t);
  const h = home(t);
  assert.equal(cli(full.bin, ["--mcp", "skip", ...analytics], h).status, 0);
  const { "acme-data": moved, ...rest } = acmePlugins();
  const partial = acmeInstaller(t, { plugins: rest });
  const file = path.join(h, ".marsai-installer.json");
  const before = fs.readFileSync(file, "utf8");
  const skill = path.join(h, ".agents/skills/reports/SKILL.md");
  const r = cli(partial.bin, ["--mcp", "skip", "update"], h);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /não distribui: acme-data\. Nada foi alterado\./);
  assert.equal(fs.readFileSync(file, "utf8"), before);
  assert.ok(fs.existsSync(skill));
  assert.match(
    cli(partial.bin, ["status"], h).stdout,
    /plugins que este instalador não distribui: acme-data/,
  );
  // Choosing again, or the installer that still carries the plugin, both work.
  assert.equal(cli(full.bin, ["--mcp", "skip", "update"], h).status, 0);
  assert.ok(fs.existsSync(skill));
  const again = cli(
    partial.bin,
    ["--mcp", "skip", "update", "--group", "building"],
    h,
  );
  assert.equal(again.status, 0, again.stderr);
  assert.deepEqual(state(h).targets[0].plugins, ["acme-core", "acme-dev"]);
  assert.equal(fs.existsSync(skill), false);
  assert.equal(cli(partial.bin, ["remove"], h).status, 0);
  assert.equal(fs.existsSync(path.join(h, ".agents/skills/guide")), false);
});

test("a plugin folder the installer cannot read is reported and the rest still installs", (t) => {
  const plugins = acmePlugins();
  plugins["acme-broken"] = { manifest: null, skills: ["broken"] };
  const { bin } = acmeInstaller(t, { plugins });
  const h = home(t);
  const r = cli(bin, ["--mcp", "skip", "install", "--target", "codex", "--yes"], h);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stderr, /aviso: acme-broken: sem \.marsai-plugin\.json/);
  assert.deepEqual(state(h).targets[0].plugins, ["acme-core", "acme-data", "acme-dev"]);
  assert.equal(fs.existsSync(path.join(h, ".agents/skills/broken")), false);
  assert.match(
    cli(bin, ["install", "--plugin", "acme-broken"], h).stderr,
    /plugin desconhecido: acme-broken/,
  );
});

test("Codex rules and the scheduled update name the root that ships the installer", (t) => {
  const { bin } = acmeInstaller(t);
  const h = home(t);
  const r = cli(
    bin,
    ["--mcp", "skip", "install", "--target", "codex", "--plugin", "acme-core", "--auto-update"],
    h,
  );
  assert.equal(r.status, 0, r.stderr);
  assert.match(
    fs.readFileSync(path.join(h, ".codex/marsai-AGENTS.md"), "utf8"),
    /Full docs: https:\/\/github\.com\/acme\/kit\n/,
  );
  const task = state(h).autoUpdate.path;
  const scheduled =
    process.platform === "darwin"
      ? fs.readFileSync(task, "utf8")
      : fs.readFileSync(
          path.join(h, ".config/systemd/user/marsai-update.service"),
          "utf8",
        );
  assert.match(scheduled, /github:acme\/kit#main/);
  // Nothing of the repository these tests run in: the copy is its own root.
  assert.ok(!scheduled.includes(primaryRoot().repo));
});

test("a home with the old Portuguese rules file gets the English one after update", (t) => {
  const { bin } = acmeInstaller(t);
  const selected = ["acme-core", "acme-dev"];
  const english =
    /^# MarsAI \(Acme\)\n\nVersion 2\.0\.0 - installed by the MarsAI installer\.\n\nHow this flow works:\n\n1\. Production code changes go through /;
  // Three homes an earlier installer left behind. The rules file is in Portuguese in all of them.
  const from330 = legacyRulesFixture();
  const fromLater =
    from330.replace(
      "Versão 3.3.0 — instalado por `npx @acme/kit`.",
      "Versão 2.0.0 — instalado pelo instalador MarsAI.",
    ) + "\ninstalled-by: marsai\n";
  assert.notEqual(fromLater, `${from330}\ninstalled-by: marsai\n`);
  assert.match(from330, PORTUGUESE);
  for (const [label, content, version] of [
    ["3.3.0, which left no marker: recognised by its exact bytes", from330, "3.3.0"],
    ["3.4.0 to 5.0.0: recognised by the marker line", fromLater, "5.0.0"],
  ]) {
    const h = home(t);
    const rules = write(path.join(h, ".codex/marsai-AGENTS.md"), content);
    write(path.join(h, ".marsai-installer.json"), {
      schema: 1,
      plugins: selected,
      targets: [
        { target: "codex", plugins: selected, version, rules: ["marsai-AGENTS.md"] },
      ],
    });
    const r = cli(bin, ["--mcp", "skip", "update"], h);
    assert.equal(r.status, 0, `${label}\n${r.stderr}`);
    const after = fs.readFileSync(rules, "utf8");
    assert.match(after, english, label);
    assert.match(after, /\n- `acme-dev:craft`: see ~\/\.agents\/skills\/craft\/SKILL\.md\n/, label);
    assert.match(after, /\ninstalled-by: marsai\n$/, label);
    assert.doesNotMatch(after, PORTUGUESE, label);
    assert.doesNotMatch(after, /Regras|ZERO THROW|time V4/, label);
    assert.doesNotMatch(r.stdout, /itens ignorados/, label);
    assert.equal(state(h).targets[0].version, "1.2.3");
    assert.deepEqual(state(h).targets[0].rules, ["marsai-AGENTS.md"]);
  }

  // The same Portuguese text with no marker and no 3.3.0 record is somebody else's file: kept.
  const foreign = home(t);
  const kept = write(path.join(foreign, ".codex/marsai-AGENTS.md"), from330);
  write(path.join(foreign, ".marsai-installer.json"), {
    schema: 1,
    plugins: selected,
    targets: [
      { target: "codex", plugins: selected, version: "5.0.0", rules: ["marsai-AGENTS.md"] },
    ],
  });
  const r = cli(bin, ["--mcp", "skip", "update"], foreign);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.readFileSync(kept, "utf8"), from330);
  assert.match(r.stdout, /1 itens ignorados para preservar conteúdo existente/);
});

test("the Claude Code target registers the root's own marketplace and repository", (t) => {
  const { bin } = acmeInstaller(t);
  const h = home(t);
  const fake = path.join(h, "bin");
  fs.mkdirSync(fake);
  fs.writeFileSync(
    path.join(fake, "claude"),
    '#!/bin/sh\necho "$*" >> "$HOME/claude-calls.log"\n',
  );
  fs.writeFileSync(path.join(fake, "git"), "#!/bin/sh\nexit 0\n");
  for (const name of ["claude", "git"])
    fs.chmodSync(path.join(fake, name), 0o755);
  const r = spawnSync(
    process.execPath,
    [bin, "--mcp", "skip", "install", "--target", "claude", "--group", "analytics", "--yes", "--home", h],
    { encoding: "utf8", env: env({ PATH: fake }) },
  );
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const calls = fs
    .readFileSync(path.join(h, "claude-calls.log"), "utf8")
    .trim()
    .split("\n");
  assert.ok(
    calls.includes("plugin marketplace add acme/kit --sparse .claude-plugin plugins"),
    calls.join("\n"),
  );
  assert.ok(calls.includes("plugin install acme-core@acme"));
  assert.ok(calls.includes("plugin install acme-data@acme"));
  assert.ok(!calls.some((call) => /marsai/.test(call)), calls.join("\n"));
  const dry = spawnSync(
    process.execPath,
    [bin, "--mcp", "skip", "install", "--target", "claude", "--plugin", "acme-core", "--dry-run", "--home", h],
    { encoding: "utf8", env: env({ PATH: fake }) },
  );
  assert.match(dry.stdout, /marketplace GitHub acme\/kit \(auto-update/);
  assert.match(dry.stdout, /\.marsai\/marketplace\/acme--kit \+ install acme-core/);
});
