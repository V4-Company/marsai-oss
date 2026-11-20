import "./helpers/lang.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { npxSpec, primaryRoot } from "../src/roots.js";
import { acmeInstaller, acmeRoot } from "./helpers/fixtures.js";
const bin = path.resolve("cli/bin/marsai.js");
function home(t) {
  const h = fs.mkdtempSync(path.join(os.tmpdir(), "marsai-guided-"));
  t.after(() => fs.rmSync(h, { recursive: true, force: true }));
  return h;
}
// `from` is the installer to run: this repository's, or the copy inside an invented root.
function run(h, args, env = {}, from = bin) {
  return spawnSync(
    process.execPath,
    [from, "--mcp", "skip", ...args, "--home", h],
    {
      encoding: "utf8",
      env: { ...process.env, PATH: "/nonexistent", ...env },
    },
  );
}
function state(h) {
  return JSON.parse(
    fs.readFileSync(path.join(h, ".marsai-installer.json"), "utf8"),
  );
}
test("a group installs only its plugins and the base they depend on", (t) => {
  const h = home(t);
  const acme = acmeInstaller(t);
  const r = run(
    h,
    ["install", "--target", "codex", "--group", "analytics", "--yes"],
    {},
    acme.bin,
  );
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(state(h).targets[0].plugins, ["acme-core", "acme-data"]);
  assert.deepEqual(state(h).targets[0].groups, ["analytics"]);
  assert.ok(fs.existsSync(path.join(h, ".agents/skills/reports/SKILL.md")));
  assert.ok(fs.existsSync(path.join(h, ".agents/skills/guide/SKILL.md")));
  assert.equal(fs.existsSync(path.join(h, ".agents/skills/craft")), false);
});
test("update preserves each target selection and ignores detected extra targets", (t) => {
  const h = home(t);
  assert.equal(
    run(h, ["install", "--target", "codex", "--plugin", "marsai-core"]).status,
    0,
  );
  assert.equal(
    run(h, ["install", "--target", "opencode", "--plugin", "marsai-dev"])
      .status,
    0,
  );
  fs.mkdirSync(path.join(h, ".cursor"), { recursive: true });
  const r = run(h, ["update"]);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(
    state(h).targets.map((x) => [x.target, x.plugins]),
    [
      ["codex", ["marsai-core"]],
      ["opencode", ["marsai-core", "marsai-dev"]],
    ],
  );
});
test("missing Claude CLI never records successful target", (t) => {
  const h = home(t);
  const r = run(
    h,
    ["install", "--target", "claude", "--plugin", "marsai-core"],
    { PATH: "/nonexistent" },
  );
  assert.notEqual(r.status, 0);
  assert.equal(fs.existsSync(path.join(h, ".marsai-installer.json")), false);
});
test("noninteractive no-command gives actionable wizard fallback", (t) => {
  const r = run(home(t), []);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /--target/);
});
test("explicit alternate home prepares scheduler without activation", (t) => {
  const h = home(t);
  const r = run(h, [
    "install",
    "--target",
    "codex",
    "--plugin",
    "marsai-core",
    "--auto-update",
  ]);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(state(h).autoUpdate.status, "prepared");
  assert.ok(fs.existsSync(state(h).autoUpdate.path));
});
test("Claude subprocesses receive the alternate home only", async (t) => {
  const h = home(t);
  const fake = path.join(h, "bin");
  fs.mkdirSync(fake);
  const log = path.join(h, "calls.jsonl");
  fs.writeFileSync(
    path.join(fake, "claude"),
    `#!${process.execPath}\nimport fs from 'node:fs'; fs.appendFileSync(${JSON.stringify(log)},JSON.stringify({home:process.env.HOME,config:process.env.CLAUDE_CONFIG_DIR,args:process.argv.slice(2)})+'\\n');\n`,
  );
  fs.writeFileSync(path.join(fake, "package.json"), '{"type":"module"}');
  fs.chmodSync(path.join(fake, "claude"), 0o755);
  const r = run(
    h,
    ["install", "--target", "claude", "--plugin", "marsai-core"],
    { PATH: fake, CLAUDE_CONFIG_DIR: "/must-not-use-host-config" },
  );
  assert.equal(r.status, 0, r.stderr);
  for (const call of fs
    .readFileSync(log, "utf8")
    .trim()
    .split("\n")
    .map(JSON.parse)) {
    assert.equal(call.home, h);
    assert.equal(call.config, undefined);
  }
});
test("wizard supports multiple targets and validates group choice", async (t) => {
  const { runWizard } = await import("../src/wizard.js");
  const { catalog } = acmeRoot(t);
  const answers = ["1,2", "0", "1", "n", "n"];
  const prompts = [];
  let transcript = "";
  const result = await runWizard(
    { targets: [], plugins: [], groups: [], home: home(t) },
    [],
    catalog,
    {
      ask: async (text) => {
        prompts.push(text);
        return answers.shift();
      },
      output: {
        write: (s) => {
          transcript += s;
        },
      },
    },
  );
  assert.equal(result.ok, true);
  assert.deepEqual(result.args.targets, ["claude", "codex"]);
  assert.deepEqual(result.args.groups, ["analytics"]);
  assert.equal(result.args.autoUpdate, false);
  assert.deepEqual(result.args.mcpAccess, { "acme-bi": false });
  assert.match(transcript, /^\nMarsAI \| Acme\n/);
  assert.match(transcript, /obrigatória/);
  assert.match(transcript, /inválida/);
  // Groups, their labels and descriptions are the ones the plugins declare.
  assert.match(
    prompts[1],
    /  1\. Análises: Relatórios sobre o Acme BI\n  2\. Construção: Construir e entregar\n/,
  );
});
test("wizard asks nothing about MCP access for a group whose plugins declare no gated provider", async (t) => {
  const { runWizard } = await import("../src/wizard.js");
  const { catalog } = acmeRoot(t);
  const answers = ["2", "2", "n"];
  let transcript = "";
  const result = await runWizard(
    { targets: [], plugins: [], groups: [], home: home(t) },
    [],
    catalog,
    {
      ask: async () => answers.shift(),
      output: { write: (s) => (transcript += s) },
    },
  );
  assert.equal(result.ok, true);
  assert.deepEqual(result.args.groups, ["building"]);
  assert.deepEqual(result.args.mcpAccess, {});
  assert.equal(answers.length, 0);
  assert.doesNotMatch(transcript, /Acme BI|Linear/);
});
test("wizard skips the group question when no plugin declares a group", async (t) => {
  const { runWizard } = await import("../src/wizard.js");
  const { catalog } = acmeRoot(t, {
    plugins: { "acme-core": { skills: ["guide"] } },
  });
  const prompts = [];
  const result = await runWizard(
    { targets: ["codex"], plugins: [], groups: [], home: home(t) },
    [],
    catalog,
    {
      ask: async (text) => {
        prompts.push(text);
        return "n";
      },
      output: { write() {} },
    },
  );
  assert.equal(result.ok, true);
  assert.deepEqual(result.args.groups, []);
  assert.equal(prompts.length, 1);
  assert.match(prompts[0], /atualização diária/);
});
test("status detects a deleted installed skill", (t) => {
  const h = home(t);
  assert.equal(
    run(h, ["install", "--target", "codex", "--plugin", "marsai-core"]).status,
    0,
  );
  fs.rmSync(path.join(h, ".agents/skills/using-marsai"), { recursive: true });
  assert.match(run(h, ["status"]).stdout, /ausentes:.*using-marsai/);
});
test("scheduler preparation never executes host services with alternate home", async (t) => {
  const { configureAutoUpdate } = await import("../src/auto-update.js");
  const h = home(t);
  let calls = 0;
  for (const platform of ["darwin", "linux"]) {
    const result = configureAutoUpdate(h, {
      enabled: true,
      platform,
      run: () => {
        calls++;
        return { status: 0 };
      },
    });
    assert.equal(result.status, "prepared");
    // With no distribution given, the task runs this repository's own, from its package.json.
    assert.ok(
      fs
        .readFileSync(result.path, "utf8")
        .includes(
          platform === "darwin"
            ? `<string>${npxSpec(primaryRoot())}</string>`
            : "OnCalendar=daily",
        ),
    );
    configureAutoUpdate(h, {
      enabled: false,
      platform,
      run: () => {
        calls++;
        return { status: 0 };
      },
    });
  }
  assert.equal(calls, 0);
});
test("doctor fails required missing MCP without a network request", (t) => {
  const h = home(t);
  const acme = acmeInstaller(t);
  assert.equal(
    run(
      h,
      ["install", "--target", "codex", "--group", "analytics", "--yes"],
      {},
      acme.bin,
    ).status,
    0,
  );
  const result = run(h, ["doctor"], {}, acme.bin);
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /Acme BI\n\s+! MCP não configurado/);
});
test("missing flag value is rejected before filesystem or subprocess changes", (t) => {
  const h = home(t);
  const result = spawnSync(
    process.execPath,
    [bin, "install", "--target", "claude", "--home"],
    {
      encoding: "utf8",
      env: { ...process.env, PATH: "/nonexistent", HOME: h },
    },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Valor obrigatório para --home/);
  assert.deepEqual(fs.readdirSync(h), []);
});
test("dry run including MCP and scheduler leaves alternate home empty", (t) => {
  const h = home(t);
  const acme = acmeInstaller(t);
  const result = spawnSync(
    process.execPath,
    [
      acme.bin,
      "install",
      "--target",
      "codex",
      "--group",
      "analytics",
      "--acme-bi-url",
      "https://bi.example.com",
      "--auto-update",
      "--dry-run",
      "--home",
      h,
    ],
    { encoding: "utf8", env: { ...process.env, PATH: "/nonexistent" } },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Instalar 2 pacotes selecionados\./);
  assert.match(
    result.stdout,
    /Acme BI\n\s+Adicionar configuração MCP\. Login será necessário\./,
  );
  assert.deepEqual(fs.readdirSync(h), []);
});
test("install configures and verifies MCP before recording readiness", async (t) => {
  const { createServer } = await import("node:http");
  const { spawn } = await import("node:child_process");
  const h = home(t);
  const methods = [];
  const server = createServer(async (req, res) => {
    let text = "";
    for await (const chunk of req) text += chunk;
    const request = JSON.parse(text);
    methods.push(request.method);
    if (request.method === "notifications/initialized") {
      res.writeHead(202).end();
      return;
    }
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        jsonrpc: "2.0",
        id: request.id,
        result:
          request.method === "initialize"
            ? {
                protocolVersion: "2025-03-26",
                capabilities: { tools: {} },
                serverInfo: { name: "fixture", version: "1" },
              }
            : {
                tools: [
                  { name: "read_metadata", inputSchema: { type: "object" } },
                ],
              },
      }),
    );
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  const acme = acmeInstaller(t);
  const output = await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        acme.bin,
        "install",
        "--target",
        "codex",
        "--group",
        "analytics",
        "--acme-bi-url",
        `http://127.0.0.1:${server.address().port}`,
        "--home",
        h,
      ],
      { env: { ...process.env, PATH: "/nonexistent" } },
    );
    let stdout = "",
      stderr = "";
    child.stdout.on("data", (x) => (stdout += x));
    child.stderr.on("data", (x) => (stderr += x));
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
  assert.equal(output.code, 0, output.stderr);
  assert.match(output.stdout, /Acme BI\n\s+✓ Conexão verificada/);
  assert.deepEqual(methods, [
    "initialize",
    "notifications/initialized",
    "tools/list",
  ]);
  assert.equal(state(h).targets[0].mcp[0].state, "verified");
  const TOML = await import("@iarna/toml");
  const config = () =>
    TOML.parse(fs.readFileSync(path.join(h, ".codex/config.toml"), "utf8"));
  assert.equal(
    config().mcp_servers["acme-bi"].url,
    `http://127.0.0.1:${server.address().port}/api/bi-mcp`,
  );
  assert.equal(run(h, ["update", "--mcp", "skip"], {}, acme.bin).status, 0);
  assert.equal(state(h).targets[0].mcpManaged.length, 1);
  assert.equal(run(h, ["remove"], {}, acme.bin).status, 0);
  assert.equal(config().mcp_servers?.["acme-bi"], undefined);
});
test("scheduler includes native Claude and Homebrew PATH without relative or empty entries", async (t) => {
  const { configureAutoUpdate } = await import("../src/auto-update.js");
  const h = home(t);
  for (const platform of ["darwin", "linux"]) {
    const result = configureAutoUpdate(h, {
      enabled: true,
      platform,
      pathEnv: "/opt/custom/bin::relative:/opt/custom/bin:/bad\npath",
    });
    const file =
      platform === "darwin"
        ? result.path
        : path.join(h, ".config/systemd/user/marsai-update.service");
    const text = fs.readFileSync(file, "utf8");
    assert.ok(text.includes(path.join(h, ".local/bin")));
    assert.ok(text.includes("/opt/homebrew/bin"));
    assert.ok(text.includes("/opt/custom/bin"));
    assert.ok(!text.includes("relative"));
    assert.ok(!text.includes("/bad\npath"));
    assert.ok(!text.includes("::"));
  }
});
test("failed scheduler stop preserves targets and installed files for retry", (t) => {
  const h = home(t);
  assert.equal(
    run(h, [
      "install",
      "--target",
      "codex",
      "--plugin",
      "marsai-core",
      "--auto-update",
    ]).status,
    0,
  );
  const fake = path.join(h, "bin");
  fs.mkdirSync(fake);
  for (const name of ["launchctl", "systemctl"]) {
    const file = path.join(fake, name);
    fs.writeFileSync(file, "#!/bin/sh\nexit 1\n");
    fs.chmodSync(file, 0o755);
  }
  const env = { ...process.env, HOME: h, USERPROFILE: h, PATH: fake };
  delete env.MARSAI_HOME;
  const before = fs.readFileSync(
    path.join(h, ".marsai-installer.json"),
    "utf8",
  );
  const result = spawnSync(process.execPath, [bin, "remove"], {
    encoding: "utf8",
    env,
  });
  assert.notEqual(result.status, 0, result.stdout);
  assert.equal(
    fs.readFileSync(path.join(h, ".marsai-installer.json"), "utf8"),
    before,
  );
  assert.ok(
    fs.existsSync(path.join(h, ".agents/skills/using-marsai/SKILL.md")),
  );
});
test("remove retries scheduler cleanup when no targets remain", (t) => {
  const h = home(t);
  assert.equal(
    run(h, [
      "install",
      "--target",
      "codex",
      "--plugin",
      "marsai-core",
      "--auto-update",
    ]).status,
    0,
  );
  const saved = state(h);
  saved.targets = [];
  fs.writeFileSync(
    path.join(h, ".marsai-installer.json"),
    JSON.stringify(saved),
  );
  const result = run(h, ["remove"]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(saved.autoUpdate.path), false);
  assert.equal(fs.existsSync(path.join(h, ".marsai-installer.json")), false);
  assert.match(result.stdout, /MCP.*preservad/);
});
test("status does not claim a foreign replacement is an installed skill", (t) => {
  const h = home(t);
  assert.equal(
    run(h, ["install", "--target", "codex", "--plugin", "marsai-core"]).status,
    0,
  );
  fs.rmSync(path.join(h, ".agents/skills/using-marsai/.marsai"));
  assert.match(run(h, ["status"]).stdout, /sem marcador MarsAI.*using-marsai/);
});
test("wizard uses the provider's own instance automatically without asking for its URL", async (t) => {
  const { runWizard } = await import("../src/wizard.js");
  const { catalog } = acmeRoot(t);
  let transcript = "";
  const prompts = [];
  const result = await runWizard(
    {
      home: home(t),
      targets: ["codex"],
      groups: ["analytics"],
      plugins: [],
      autoUpdate: false,
    },
    [],
    catalog,
    {
      ask: async (prompt) => {
        prompts.push(prompt);
        return "não";
      },
      output: {
        write: (text) => {
          transcript += text;
        },
      },
    },
  );
  assert.equal(result.ok, true);
  assert.equal(prompts.length, 1);
  assert.match(prompts[0], /Já tem acesso/);
  assert.deepEqual(result.args.mcpUrls, {});
  assert.match(
    transcript,
    /\nAcme BI\nhttps:\/\/bi\.acme\.test\/\nO login será feito no aplicativo escolhido\.\n/,
  );
  assert.match(transcript, /Esta skill precisa de acesso ao Acme BI\.\n/);
});
test("wizard shows the address given by flag, keeps an access answer given by flag and reaches a plugin chosen by name", async (t) => {
  const { runWizard } = await import("../src/wizard.js");
  const { catalog } = acmeRoot(t);
  let transcript = "";
  const prompts = [];
  const result = await runWizard(
    {
      home: home(t),
      targets: ["codex"],
      groups: [],
      plugins: ["acme-data"],
      autoUpdate: false,
      mcpUrls: { "acme-bi": "https://bi.example.com" },
      mcpAccess: { "acme-bi": true },
    },
    [],
    catalog,
    {
      ask: async (prompt) => {
        prompts.push(prompt);
        return "não";
      },
      output: { write: (text) => (transcript += text) },
    },
  );
  assert.equal(result.ok, true);
  assert.equal(prompts.length, 0);
  assert.match(transcript, /\nAcme BI\nhttps:\/\/bi\.example\.com\n/);
  assert.deepEqual(result.args.mcpAccess, { "acme-bi": true });
  assert.deepEqual(result.args.mcpUrls, { "acme-bi": "https://bi.example.com" });
});
test("wizard with --mcp skip asks nothing about a gated provider", async (t) => {
  const { runWizard } = await import("../src/wizard.js");
  const { catalog } = acmeRoot(t);
  const prompts = [];
  const result = await runWizard(
    {
      home: home(t),
      targets: ["codex"],
      groups: ["analytics"],
      plugins: [],
      autoUpdate: false,
      mcp: "skip",
    },
    [],
    catalog,
    {
      ask: async (prompt) => {
        prompts.push(prompt);
        return "não";
      },
      output: { write() {} },
    },
  );
  assert.equal(result.ok, true);
  assert.equal(prompts.length, 0);
  assert.deepEqual(result.args.mcpAccess, {});
});
test("wizard on the stable channel does not offer the daily update", async (t) => {
  const { runWizard } = await import("../src/wizard.js");
  const { catalog } = acmeRoot(t);
  const answers = ["2", "2"];
  const prompts = [];
  let transcript = "";
  const result = await runWizard(
    {
      targets: [],
      plugins: [],
      groups: [],
      home: home(t),
      channel: "stable",
    },
    [],
    catalog,
    {
      ask: async (text) => {
        prompts.push(text);
        return answers.shift();
      },
      output: {
        write: (s) => {
          transcript += s;
        },
      },
    },
  );
  assert.equal(result.ok, true);
  assert.equal(result.args.autoUpdate, undefined);
  assert.equal(prompts.length, 2);
  assert.doesNotMatch(prompts.join("\n") + transcript, /atualização diária/i);
});
test("codex rules no longer name a specific distribution command", (t) => {
  const h = home(t);
  assert.equal(
    run(h, ["install", "--target", "codex", "--plugin", "marsai-core"]).status,
    0,
  );
  const rules = fs.readFileSync(
    path.join(h, ".codex/marsai-AGENTS.md"),
    "utf8",
  );
  assert.ok(!rules.includes(`npx ${primaryRoot().packageName}`));
  assert.match(rules, /installed by the MarsAI installer\./);
});
test("scheduled command identifies itself with --scheduled", async (t) => {
  const { configureAutoUpdate } = await import("../src/auto-update.js");
  const h = home(t);
  const result = configureAutoUpdate(h, { enabled: true, platform: "darwin" });
  assert.match(
    fs.readFileSync(result.path, "utf8"),
    /<string>update<\/string><string>--scheduled<\/string>/,
  );
});
test("scheduler isolation comes from the home path, not from an explicit --home", async (t) => {
  const { configureAutoUpdate } = await import("../src/auto-update.js");
  const h = home(t);
  const calls = [];
  const run = (cmd, args) => {
    calls.push([cmd, ...args].join(" "));
    return { status: 0 };
  };
  const enabled = configureAutoUpdate(h, {
    enabled: true,
    platform: "darwin",
    run,
    userHome: h,
  });
  assert.ok(fs.existsSync(enabled.path));
  calls.length = 0;
  const disabled = configureAutoUpdate(h, {
    enabled: false,
    platform: "darwin",
    run,
    userHome: h,
  });
  assert.equal(disabled.status, "disabled");
  assert.ok(
    calls.some((c) => c.startsWith("launchctl bootout")),
    calls.join("\n"),
  );
});
test("disabling with unload false only removes the files, even in the real home", async (t) => {
  const { configureAutoUpdate } = await import("../src/auto-update.js");
  const h = home(t);
  let calls = 0;
  const run = () => {
    calls++;
    return { status: 0 };
  };
  for (const platform of ["darwin", "linux"]) {
    const enabled = configureAutoUpdate(h, {
      enabled: true,
      platform,
      run,
      userHome: h,
    });
    assert.ok(fs.existsSync(enabled.path));
    calls = 0;
    const disabled = configureAutoUpdate(h, {
      enabled: false,
      unload: false,
      platform,
      run,
      userHome: h,
    });
    assert.equal(calls, 0);
    assert.equal(disabled.status, "disabled");
    assert.match(disabled.message, /próximo login/);
    assert.equal(fs.existsSync(enabled.path), false);
    assert.equal(
      fs.existsSync(path.join(h, ".config/systemd/user/marsai-update.service")),
      false,
    );
  }
});
