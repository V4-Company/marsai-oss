import "./helpers/lang.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
test("install prints a concise application summary and identifies test mode", (t) => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "marsai-ui-"));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  const result = spawnSync(
    process.execPath,
    [
      path.resolve("cli/bin/marsai.js"),
      "install",
      "--home",
      home,
      "--target",
      "opencode",
      "--plugin",
      "marsai-core",
      "--mcp",
      "skip",
    ],
    { encoding: "utf8", env: { ...process.env, PATH: "/nonexistent" } },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Modo de teste/);
  assert.match(result.stdout, /OpenCode/);
  assert.match(result.stdout, /\d+ skills/);
  assert.ok(!result.stdout.includes(home));
  assert.doesNotMatch(
    result.stdout,
    /using-marsai|code-reviewer|\.marsai-installer|targets:|plugins:/,
  );
});
test("integration presentation separates login from configuration without raw state ids", async () => {
  const { integrationLines } = await import("../src/presentation.js");
  // The shape the MCP step returns: what happened, and the client command apart.
  const item = {
    id: "acme-bi",
    name: "Acme BI",
    state: "auth-pending",
    detail: "Servidor exige autenticação.",
    login: "codex mcp login acme-bi",
    message:
      "Servidor exige autenticação. Autentique no cliente: codex mcp login acme-bi.",
  };
  const text = integrationLines(item, {
    target: "codex",
    testMode: false,
  }).join("\n");
  assert.match(text, /^\n  Acme BI\n/);
  assert.match(text, /configurado/i);
  assert.match(text, /login pendente/i);
  assert.match(text, /Próximo passo:\n\s+codex mcp login acme-bi/);
  assert.doesNotMatch(text, /auth-pending/);
  assert.equal(text.match(/codex mcp login/g).length, 1);
  const isolated = integrationLines(item, {
    target: "codex",
    testMode: true,
  }).join("\n");
  assert.match(isolated, /Login não realizado neste teste/);
  assert.doesNotMatch(isolated, /codex mcp login/);
});
test("an integration without a declared name is titled by its id, and an optional one says so", async () => {
  const { integrationLines } = await import("../src/presentation.js");
  const lines = integrationLines(
    { id: "acme-bi", state: "skipped", required: false },
    { target: "codex" },
  );
  assert.equal(lines[0], "\n  acme-bi (opcional)");
});
test("integration presentation keeps actual failures, skips and readiness distinct", async () => {
  const { integrationLines } = await import("../src/presentation.js");
  assert.match(
    integrationLines(
      {
        id: "acme-bi",
        state: "error",
        message: "Falha de rede: conexão recusada.",
      },
      { target: "codex" },
    ).join("\n"),
    /Falha de rede: conexão recusada/,
  );
  assert.match(
    integrationLines(
      {
        id: "acme-bi",
        state: "skipped",
        message: "MCP ignorado por --mcp skip.",
      },
      { target: "codex" },
    ).join("\n"),
    /ignorada/i,
  );
  const ready = integrationLines(
    {
      id: "acme-bi",
      state: "verified",
      message: "MCP verificado.",
      toolCount: 5,
    },
    { target: "codex" },
  ).join("\n");
  assert.match(ready, /conexão verificada/i);
  assert.doesNotMatch(ready, /login pendente|verified|SQL pronto/);
});
test("explicit actual home is not presented as a test installation", async () => {
  const { isTestMode } = await import("../src/presentation.js");
  assert.equal(isTestMode({ home: os.homedir() }), false);
  assert.equal(
    isTestMode({ home: path.join(os.tmpdir(), "marsai-alternate-home") }),
    true,
  );
});
test("prepared scheduler summary preserves the reason activation did not happen", async () => {
  const { autoUpdateSummary } = await import("../src/presentation.js");
  const result = autoUpdateSummary({
    status: "prepared",
    message: "npx não encontrado junto ao Node. Tarefa preparada, não ativada.",
  });
  assert.match(result, /npx não encontrado/);
});
test("update dry run ends as simulation and leaves state untouched", (t) => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "marsai-ui-dry-"));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  const env = { ...process.env, PATH: "/nonexistent" };
  const bin = path.resolve("cli/bin/marsai.js");
  const installed = spawnSync(
    process.execPath,
    [
      bin,
      "install",
      "--home",
      home,
      "--target",
      "codex",
      "--plugin",
      "marsai-core",
      "--mcp",
      "skip",
    ],
    { encoding: "utf8", env },
  );
  assert.equal(installed.status, 0, installed.stderr);
  const state = fs.readFileSync(
    path.join(home, ".marsai-installer.json"),
    "utf8",
  );
  const result = spawnSync(
    process.execPath,
    [bin, "update", "--home", home, "--dry-run"],
    { encoding: "utf8", env },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Simulação concluída/);
  assert.doesNotMatch(result.stdout, /Atualização concluída/);
  assert.equal(
    fs.readFileSync(path.join(home, ".marsai-installer.json"), "utf8"),
    state,
  );
});
