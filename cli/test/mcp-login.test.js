import "./helpers/lang.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { configureMcp } from "../src/mcp.js";
import { ACME_BI, acmeRoot } from "./helpers/fixtures.js";

// The login step is driven by a dependency entry; this one is invented.
const dependency = ACME_BI;
const dependencies = [dependency];
function home(t) {
  const h = fs.mkdtempSync(path.join(os.tmpdir(), "marsai-auth-"));
  t.after(() => fs.rmSync(h, { recursive: true, force: true }));
  return h;
}
test("access prompt shows the declared notice and question, validates yes/no and cancels on EOF", async () => {
  const { askAccess } = await import("../src/mcp-login.js");
  const { access } = dependency;
  const answers = ["maybe", "", "SIM"];
  const prompts = [];
  let written = "";
  assert.deepEqual(
    await askAccess({
      access,
      question: async (text) => {
        prompts.push(text);
        return answers.shift();
      },
      output: { write: (s) => (written += s) },
    }),
    { ok: true, access: true },
  );
  assert.match(written, /Esta skill precisa de acesso ao Acme BI\.\n/);
  assert.match(written, /Sim ou Não/);
  assert.equal(prompts[0], "Já tem acesso ao Acme BI? [Sim/Não]: ");
  assert.deepEqual(
    await askAccess({
      access,
      question: async () => "não",
      output: { write() {} },
    }),
    { ok: true, access: false },
  );
  assert.equal(
    (
      await askAccess({
        access,
        question: async () => undefined,
        output: { write() {} },
      })
    ).ok,
    false,
  );
});
test("an access block without a notice asks only the question", async () => {
  const { askAccess } = await import("../src/mcp-login.js");
  let written = "";
  const result = await askAccess({
    access: { question: "Tem acesso?" },
    question: async () => "s",
    output: { write: (s) => (written += s) },
  });
  assert.deepEqual(result, { ok: true, access: true });
  assert.equal(written, "");
});
test("Codex login uses existing alias and explicit safe execution context", async (t) => {
  const { startMcpLogin } = await import("../src/mcp-login.js");
  const h = home(t);
  fs.mkdirSync(path.join(h, ".codex"));
  fs.writeFileSync(
    path.join(h, ".codex/config.toml"),
    '[mcp_servers.acme-bi_server]\nurl="https://example.test/mcp"\n',
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
      calls.push(args);
      return { status: 0 };
    },
    env: {
      HOME: "/wrong",
      CODEX_HOME: "/wrong",
      OPENCODE_CONFIG: "/wrong",
      CLAUDE_CONFIG_DIR: "/wrong",
    },
  });
  assert.equal(result.state, "client-success");
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], "codex");
  assert.deepEqual(calls[0][1], ["mcp", "login", "acme-bi_server"]);
  assert.equal(calls[0][2].cwd, h);
  assert.equal(calls[0][2].shell, false);
  assert.equal(calls[0][2].stdio, "inherit");
  assert.equal(calls[0][2].env.CODEX_HOME, path.join(h, ".codex"));
  assert.equal(calls[0][2].env.OPENCODE_CONFIG, undefined);
  assert.equal(calls[0][2].env.CLAUDE_CONFIG_DIR, undefined);
});
test("no access, unspecified access, update, dry run and alternate home never spawn login", async (t) => {
  const { startMcpLogin } = await import("../src/mcp-login.js");
  const h = home(t);
  let count = 0;
  const states = [];
  for (const override of [
    { access: false },
    { access: undefined },
    { updating: true },
    { dryRun: true },
    { currentHome: "/other" },
    { configured: false },
  ]) {
    const result = startMcpLogin({
      home: h,
      currentHome: h,
      target: "codex",
      dependency,
      access: true,
      configured: true,
      exists: () => true,
      run: () => {
        count++;
        return { status: 0 };
      },
      ...override,
    });
    assert.notEqual(result.state, "client-success");
    states.push(result);
  }
  assert.equal(count, 0);
  assert.equal(states[0].state, "access-required");
  assert.equal(states[0].message, "Peça acesso para data@acme.test.");
  assert.equal(states[1].state, "access-unknown");
  assert.match(states[1].message, /--acme-bi-access yes/);
});
test("a provider that names no contact still says access has to be requested", async (t) => {
  const { startMcpLogin } = await import("../src/mcp-login.js");
  const { contact, ...access } = dependency.access;
  const result = startMcpLogin({
    home: home(t),
    target: "codex",
    dependency: { ...dependency, access },
    access: false,
    configured: true,
  });
  assert.equal(result.state, "access-required");
  assert.doesNotMatch(result.message, /undefined|acme\.test/);
});
test("supported Claude uses login, old Claude and Cursor give manual steps, exit failure is explicit", async (t) => {
  const { startMcpLogin } = await import("../src/mcp-login.js");
  const h = home(t);
  configureMcp({ home: h, target: "claude", dependencies });
  configureMcp({ home: h, target: "opencode", dependencies });
  const base = {
    home: h,
    currentHome: h,
    dependency,
    access: true,
    configured: true,
    exists: () => true,
  };
  const calls = [];
  const logged = startMcpLogin({
    ...base,
    target: "claude",
    run: (...args) => {
      calls.push(args);
      return {
        status: 0,
        stdout: args[1].includes("--help") ? "login [name]" : "",
        stderr: "",
      };
    },
  });
  assert.equal(logged.state, "client-success");
  assert.deepEqual(calls.at(-1)[1], ["mcp", "login", "acme-bi"]);
  const oldClaude = startMcpLogin({
    ...base,
    target: "claude",
    run: () => ({ status: 0, stdout: "add list remove", stderr: "" }),
  });
  assert.equal(oldClaude.state, "manual");
  assert.match(oldClaude.message, /Autenticar para o Acme BI/);
  const cursor = startMcpLogin({
    ...base,
    target: "cursor",
    run: () => {
      assert.fail("must not spawn");
    },
  });
  assert.equal(cursor.state, "manual");
  assert.match(cursor.message, /autentique o Acme BI/);
  const failed = startMcpLogin({
    ...base,
    target: "opencode",
    run: (...args) => {
      calls.push(args);
      return { status: 1 };
    },
  });
  assert.equal(failed.state, "client-error");
  assert.equal(failed.exitCode, 1);
  assert.deepEqual(calls.at(-1)[1], ["mcp", "auth", "acme-bi"]);
});
test("wizard asks about access even when an existing provider config is preserved", async (t) => {
  const { runWizard } = await import("../src/wizard.js");
  const { catalog } = acmeRoot(t);
  const h = home(t);
  configureMcp({ home: h, target: "codex", dependencies });
  const before = fs.readFileSync(path.join(h, ".codex/config.toml"), "utf8");
  const prompts = [];
  let transcript = "";
  const result = await runWizard(
    {
      home: h,
      targets: ["codex"],
      plugins: [],
      groups: ["analytics"],
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
  assert.deepEqual(result.args.mcpAccess, { "acme-bi": false });
  assert.equal(prompts.length, 1);
  assert.match(prompts[0], /Já tem acesso ao Acme BI\?/);
  assert.match(transcript, /Acme BI\nConexão existente detectada/);
  assert.equal(
    fs.readFileSync(path.join(h, ".codex/config.toml"), "utf8"),
    before,
  );
});
test("EOF while waiting for access finishes without files or login", async () => {
  const { PassThrough } = await import("node:stream");
  const { createInterface } = await import("node:readline/promises");
  const { terminalQuestion, askAccess } = await import("../src/mcp-login.js");
  const input = new PassThrough();
  const output = new PassThrough();
  const rl = createInterface({ input, output });
  const result = askAccess({
    access: dependency.access,
    question: (text) => terminalQuestion(rl, text),
    output,
  });
  input.end();
  assert.equal((await result).ok, false);
  rl.close();
});
test("login result presentation prioritizes access request and separates client success from data permissions", async () => {
  const { integrationLines } = await import("../src/presentation.js");
  const item = {
    id: "acme-bi",
    name: "Acme BI",
    state: "auth-pending",
    message: "Autentique no cliente: codex mcp login acme-bi.",
  };
  const no = integrationLines(item, {
    target: "codex",
    login: {
      state: "access-required",
      message: "Peça acesso para data@acme.test.",
    },
  }).join("\n");
  assert.match(no, /! Acesso ao Acme BI pendente\./);
  assert.match(no, /data@acme\.test/);
  assert.doesNotMatch(no, /codex mcp login/);
  const yes = integrationLines(item, {
    target: "codex",
    login: { state: "client-success" },
  }).join("\n");
  assert.match(yes, /Login concluído pelo aplicativo/);
  assert.match(yes, /Permissões de consulta não verificadas/);
  assert.doesNotMatch(yes, /login pendente/);
});
