import "./helpers/lang.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const BIN = path.resolve("cli/bin/marsai.js");

function sandbox() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "marsai-test-"));
}

function run(args, home) {
  return execFileSync("node", [BIN, "--mcp", "skip", ...args, "--home", home], { encoding: "utf8" });
}

test("--group development is the English name of the desenvolvimento group", () => {
  const home = sandbox();
  run(["install", "--target", "codex", "--group", "development", "--yes"], home);
  const state = JSON.parse(fs.readFileSync(path.join(home, ".marsai-installer.json"), "utf8"));
  assert.deepEqual(state.targets[0].groups, ["desenvolvimento"]);
  assert.ok(fs.existsSync(path.join(home, ".agents/skills/tdd/SKILL.md")));
  run(["remove", "--yes"], home);
});

test("optional extras add to each app's workflow and ship the interview, learning references and license", () => {
  const home = sandbox();
  const targets = ["codex", "cursor", "opencode"];
  const flags = targets.flatMap((target) => ["--target", target]);
  run(["install", ...flags, "--group", "desenvolvimento", "--yes"], home);
  const before = JSON.parse(fs.readFileSync(path.join(home, ".marsai-installer.json"), "utf8"));
  assert.equal(fs.existsSync(path.join(home, ".agents/skills/teach")), false);
  const upstreamSkill = path.join(home, ".agents/skills/diagram-design/SKILL.md");
  fs.mkdirSync(path.dirname(upstreamSkill), { recursive: true });
  fs.writeFileSync(upstreamSkill, "Original global diagram skill, keep intact.\n");
  run(["install", ...flags, "--group", "extras", "--yes"], home);
  for (const dir of [".agents/skills", ".config/opencode/skills"]) {
    assert.ok(fs.existsSync(path.join(home, dir, "tdd/SKILL.md")));
    assert.match(fs.readFileSync(path.join(home, dir, "grill-me/SKILL.md"), "utf8"), /GRILLING\.md/);
    assert.match(fs.readFileSync(path.join(home, dir, "grill-me/GRILLING.md"), "utf8"), /design tree/);
    assert.ok(fs.existsSync(path.join(home, dir, "teach/MISSION-FORMAT.md")));
    assert.ok(fs.existsSync(path.join(home, dir, "writing-for-agents/SKILL-MECHANICS.md")));
    const diagram = path.join(home, dir, "marsai-diagram");
    for (const file of ["SKILL.md", "UPSTREAM.md", "assets/profile-v4.md", "assets/template-v4.html", "assets/template.html", "references/type-swimlane.md", "references/marsai-semantics.md", "scripts/browser_check.js", "scripts/self_check.py", "scripts/verify-geometry.py", "scripts/mermaid_extract.py", "scripts/drawio_extract.py", "scripts/excalidraw_extract.py", "scripts/export_svg.py"])
      assert.ok(fs.existsSync(path.join(diagram, file)), `diagram support file: ${file}`);
    assert.match(fs.readFileSync(path.join(diagram, "LICENSE.txt"), "utf8"), /Copyright.*Cathryn Lavery/);
    assert.match(fs.readFileSync(path.join(home, dir, "in-your-own-words/SKILL.md"), "utf8"), /in your own words/);
    assert.match(fs.readFileSync(path.join(home, dir, "in-your-own-words/LICENSE.txt"), "utf8"), /Copyright.*Lauren Tan/);
    for (const name of ["sol-loop", "full-send", "full-stop"])
      assert.match(fs.readFileSync(path.join(home, dir, name, "LICENSE.txt"), "utf8"), /Copyright.*Theo Browne/);
    for (const name of ["teach", "research", "grill-me", "writing-for-agents"])
      assert.match(fs.readFileSync(path.join(home, dir, name, "LICENSE.txt"), "utf8"), /Copyright.*Matt Pocock/);
  }
  run(["update", "--yes"], home);
  const state = JSON.parse(fs.readFileSync(path.join(home, ".marsai-installer.json"), "utf8"));
  for (const target of state.targets) {
    assert.deepEqual(target.plugins, [...before.targets.find((entry) => entry.target === target.target).plugins, "marsai-extras"]);
    assert.deepEqual(target.groups, ["desenvolvimento", "extras"]);
  }
  run(["remove", "--yes"], home);
  assert.equal(fs.readFileSync(upstreamSkill, "utf8"), "Original global diagram skill, keep intact.\n");
  assert.equal(fs.existsSync(path.join(home, ".agents/skills/marsai-diagram")), false);
  assert.equal(fs.existsSync(path.join(home, ".agents/skills/teach")), false);
  run(["install", "--target", "codex", "--group", "extras", "--yes"], home);
  assert.equal(fs.existsSync(path.join(home, ".agents/skills/tdd")), false);
  assert.doesNotMatch(fs.readFileSync(path.join(home, ".codex/marsai-AGENTS.md"), "utf8"), /implement-spec|implementer first/);
  run(["remove", "--yes"], home);
});

test("status sem install informa vazio", () => {
  const home = sandbox();
  const out = run(["status"], home);
  assert.match(out, /home:/);
  assert.match(out, /nada instalado/);
});

test("install codex + opencode copia skills, agents, commands e regras; remove limpa", () => {
  const home = sandbox();
  run(["install", "--target", "codex", "--target", "opencode", "--yes"], home);

  // skills para ambos os targets
  assert.ok(fs.existsSync(path.join(home, ".config/opencode/skills/tdd/SKILL.md")));
  assert.ok(fs.existsSync(path.join(home, ".config/opencode/skills/using-marsai/SKILL.md")));
  assert.ok(fs.existsSync(path.join(home, ".agents/skills/grill-with-docs/SKILL.md")));
  assert.ok(fs.existsSync(path.join(home, ".agents/skills/tdd/.marsai")));

  // agente compatível com OpenCode (mode: subagent, sem model legado tipo "opus")
  const agent = fs.readFileSync(path.join(home, ".config/opencode/agent/frontend-engineer.md"), "utf8");
  assert.match(agent, /^---\n/);
  assert.match(agent, /mode: subagent/);
  assert.doesNotMatch(agent, /model: (opus|sonnet|inherit)\n/);

  // command adaptado com banner
  const cmd = fs.readFileSync(path.join(home, ".config/opencode/command/backend.md"), "utf8");
  assert.match(cmd, /^> \*\*MarsAI adapter \(OpenCode\):\*\* this command came from the MarsAI marketplace for Claude Code\./m);
  assert.ok(cmd.includes(`by its file name in \`${path.join(home, ".config/opencode/agent")}\``));
  assert.doesNotMatch(cmd.split("\n").find((line) => line.startsWith("> **MarsAI adapter")), /[ãõçáéíóúâêô]|V4/);
  assert.match(cmd, /installed-by: marsai/);

  // regras do Codex + import idempotente
  assert.ok(fs.existsSync(path.join(home, ".codex/marsai-AGENTS.md")));
  const globalAgents = fs.readFileSync(path.join(home, ".codex/AGENTS.md"), "utf8");
  const count = globalAgents.split("@import").length - 1;
  assert.equal(count, 1);

  // update é idempotente
  run(["install", "--target", "codex", "--target", "opencode", "--yes"], home);
  const globalAgentsAgain = fs.readFileSync(path.join(home, ".codex/AGENTS.md"), "utf8");
  assert.equal(globalAgentsAgain.split("@import").length - 1, 1);

  // colisão: skill de terceiro (sem marker) no mesmo lugar não é sobrescrita
  const foreign = path.join(home, ".config/opencode/skills/git-commit/SKILL.md");
  fs.writeFileSync(foreign, "conteúdo alheio");
  fs.rmSync(path.join(home, ".config/opencode/skills/git-commit/.marsai"), { force: true });
  const out = run(["install", "--target", "opencode", "--yes"], home);
  assert.match(out, /ignorados/);
  assert.equal(fs.readFileSync(foreign, "utf8"), "conteúdo alheio");

  // remove limpa tudo que é nosso
  run(["remove"], home);
  assert.ok(!fs.existsSync(path.join(home, ".config/opencode/skills/tdd")));
  assert.ok(!fs.existsSync(path.join(home, ".config/opencode/agent/frontend-engineer.md")));
  assert.ok(!fs.existsSync(path.join(home, ".codex/marsai-AGENTS.md")));
  const cleaned = fs.readFileSync(path.join(home, ".codex/AGENTS.md"), "utf8");
  assert.doesNotMatch(cleaned, /@import/);
});

test("install cursor: skills em ~/.agents, agents mínimos e commands como skills manuais; remove limpa", () => {
  const home = sandbox();
  run(["install", "--target", "cursor", "--yes"], home);

  // skills no diretório padrão que o Cursor carrega nativamente
  assert.ok(fs.existsSync(path.join(home, ".agents/skills/tdd/SKILL.md")));
  assert.ok(fs.existsSync(path.join(home, ".agents/skills/tdd/.marsai")));

  // agent: frontmatter mínimo (Cursor NÃO tem campo tools)
  const agent = fs.readFileSync(path.join(home, ".cursor/agents/frontend-engineer.md"), "utf8");
  assert.match(agent, /^---\nname: frontend-engineer\n/);
  assert.match(agent, /description:/);
  assert.doesNotMatch(agent, /^tools:/m);

  // command virou skill manual (disable-model-invocation), com banner adaptador
  const cmdSkill = fs.readFileSync(path.join(home, ".cursor/skills/marsai-backend/SKILL.md"), "utf8");
  assert.match(cmdSkill, /^---\nname: marsai-backend\n/);
  assert.match(cmdSkill, /disable-model-invocation: true/);
  assert.ok(
    cmdSkill.includes(
      "> **MarsAI adapter (Cursor):** this command came from the MarsAI marketplace for Claude Code. The namespace `marsai-<plugin>:<agent>` does not exist here: delegate to the equivalent subagent by name (for example `backend-engineer-typescript`). MarsAI skills are in ~/.agents/skills and ~/.cursor/skills.\n\n",
    ),
  );
  assert.ok(fs.existsSync(path.join(home, ".cursor/skills/marsai-backend/.marsai")));

  // update idempotente não duplica nada
  run(["install", "--target", "cursor", "--yes"], home);
  assert.ok(fs.existsSync(path.join(home, ".cursor/skills/marsai-backend/SKILL.md")));

  // colisão de terceiro preservada
  const foreign = path.join(home, ".agents/skills/git-commit/SKILL.md");
  fs.writeFileSync(foreign, "conteúdo alheio");
  fs.rmSync(path.join(home, ".agents/skills/git-commit/.marsai"), { force: true });
  const out = run(["install", "--target", "cursor", "--yes"], home);
  assert.match(out, /ignorados/);
  assert.equal(fs.readFileSync(foreign, "utf8"), "conteúdo alheio");

  // remove limpa
  run(["remove"], home);
  assert.ok(!fs.existsSync(path.join(home, ".agents/skills/tdd")));
  assert.ok(!fs.existsSync(path.join(home, ".cursor/agents/frontend-engineer.md")));
  assert.ok(!fs.existsSync(path.join(home, ".cursor/skills/marsai-backend")));
});

test("dry-run não escreve nada", () => {
  const home = sandbox();
  run(["install", "--target", "opencode", "--dry-run"], home);
  assert.ok(!fs.existsSync(path.join(home, ".config/opencode/skills")));
});

test("erro digitável sai com crash tipado", () => {
  const home = sandbox();
  assert.throws(() => run(["install", "--target", "editor"], home), /target desconhecido/);
});
