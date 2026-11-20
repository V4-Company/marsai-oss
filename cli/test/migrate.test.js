import "./helpers/lang.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { confirmed, defaultGroups, planApp } from "../src/migrate.js";
import {
  ALL_TARGETS,
  PORTUGUESE,
  acmeInstaller,
  acmePlugins,
  acmeRoot,
  claudeHome,
  write,
} from "./helpers/fixtures.js";

// `migrate` brings what an earlier installer left on a machine to the running one.
// Both installers here are invented: the earlier one is the same code shipped in
// another root, with another repository and a plugin the current one lacks.

/** What the earlier distribution carried: the base, the building pack and a pack that stayed behind. */
function earlierPlugins() {
  const { "acme-core": core, "acme-dev": dev } = acmePlugins();
  return {
    "acme-core": core,
    "acme-dev": dev,
    "acme-old": {
      dependencies: ["acme-core"],
      manifest: {
        schemaVersion: 1,
        targets: ALL_TARGETS,
        group: { id: "legacy", label: "Legacy" },
      },
      skills: ["old-reports"],
    },
  };
}
/**
 * What the current one carries: the standard plugins, a pack that is new in the
 * building group and does not go to Cursor, and an optional pack.
 */
function currentPlugins() {
  return {
    ...acmePlugins(),
    "acme-pack": {
      dependencies: ["acme-core", "acme-dev"],
      manifest: {
        schemaVersion: 1,
        targets: ["claude", "codex", "opencode"],
        group: { id: "building" },
      },
      skills: ["pack-rules"],
    },
    "acme-extra": {
      manifest: {
        schemaVersion: 1,
        targets: ALL_TARGETS,
        optional: true,
        group: { id: "extras", label: "Extras" },
      },
      skills: ["extra-skill"],
    },
  };
}
const earlier = (t) =>
  acmeInstaller(t, {
    pkg: {
      name: "@acme/old-kit",
      version: "0.9.0",
      type: "module",
      repository: "github:acme/old-kit",
    },
    plugins: earlierPlugins(),
  });
const current = (t) => acmeInstaller(t, { plugins: currentPlugins() });

function home(t) {
  const h = fs.mkdtempSync(path.join(os.tmpdir(), "marsai-moving-"));
  t.after(() => fs.rmSync(h, { recursive: true, force: true }));
  return h;
}
function cli(bin, args, h, env = {}) {
  const base = { ...process.env, PATH: "/nonexistent" };
  delete base.MARSAI_EXTRA_ROOTS;
  delete base.MARSAI_CHANNEL;
  return spawnSync(
    process.execPath,
    [bin, "--mcp", "skip", ...args, "--home", h],
    { encoding: "utf8", env: { ...base, ...env } },
  );
}
const statePath = (h) => path.join(h, ".marsai-installer.json");
const state = (h) => JSON.parse(fs.readFileSync(statePath(h), "utf8"));
const entryOf = (h, target) =>
  state(h).targets.find((entry) => entry.target === target);
const exists = (h, file) => fs.existsSync(path.join(h, file));
/** Every folder and file under a home, with what each file holds. */
function everything(dir) {
  const found = {};
  const walk = (folder) => {
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      const file = path.join(folder, entry.name);
      const name = path.relative(dir, file);
      if (entry.isDirectory()) {
        found[`${name}/`] = null;
        walk(file);
      } else found[name] = fs.readFileSync(file, "utf8");
    }
  };
  walk(dir);
  return found;
}
/** The file that holds the command of the daily task, on the system the tests run on. */
const taskFile = (h) =>
  process.platform === "darwin"
    ? path.join(h, "Library/LaunchAgents/com.v4company.marsai.update.plist")
    : path.join(h, ".config/systemd/user/marsai-update.service");

test("a state from an earlier installer: what this one carries is kept, a new plugin of a saved group comes along and the rest is reported", (t) => {
  const old = earlier(t);
  const now = current(t);
  const h = home(t);
  const installed = cli(
    old.bin,
    ["install", "--target", "codex", "--target", "opencode", "--group", "building", "--plugin", "acme-old", "--yes"],
    h,
  );
  assert.equal(installed.status, 0, installed.stderr);
  const had = ["acme-core", "acme-old", "acme-dev"];
  for (const target of ["codex", "opencode"]) {
    assert.deepEqual(entryOf(h, target).plugins, had);
    assert.equal(entryOf(h, target).version, "0.9.0");
  }
  assert.ok(exists(h, ".agents/skills/old-reports/SKILL.md"));

  // `update` refuses a selection it does not carry; `migrate` is the way through.
  const refused = cli(now.bin, ["update"], h);
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /não distribui: acme-old\. Nada foi alterado\./);

  const r = cli(now.bin, ["migrate", "--yes"], h);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const has = ["acme-core", "acme-dev", "acme-pack"];
  for (const target of ["codex", "opencode"]) {
    const entry = entryOf(h, target);
    assert.deepEqual(entry.plugins, has, target);
    assert.deepEqual(entry.groups, ["building"], target);
    assert.equal(entry.version, "1.2.3", target);
  }
  assert.deepEqual(state(h).plugins, has);
  for (const dir of [".agents/skills", ".config/opencode/skills"]) {
    assert.ok(exists(h, `${dir}/pack-rules/SKILL.md`), dir);
    assert.ok(exists(h, `${dir}/craft/SKILL.md`), dir);
    // Nothing of a group the app did not have, of an optional pack or of the pack left behind.
    for (const skill of ["reports", "extra-skill", "old-reports"])
      assert.equal(exists(h, `${dir}/${skill}`), false, `${dir}/${skill}`);
  }
  assert.match(r.stdout, /^\nMarsAI · Migração · v1\.2\.3\n/);
  assert.match(r.stdout, /para esta versão, de GitHub acme\/kit\.\n/);
  const report = r.stdout.slice(r.stdout.indexOf("\nRelatório\n"));
  for (const app of ["Codex", "OpenCode"])
    assert.ok(
      report.includes(
        `\n${app}\n  tinha: acme-core, acme-old, acme-dev\n  tem agora: acme-core, acme-dev, acme-pack\n  adicionados (novos nos grupos, exigidos ou pedidos): acme-pack\n  não distribuídos aqui: acme-old. Ficam de fora, e o que foi instalado para eles sai deste aplicativo; busque-os na distribuição que os tem.\n`,
      ),
      report,
    );
  assert.match(report, /\nMigração concluída\.\n/);
  // Nothing names the earlier distribution but what the machine itself held.
  assert.doesNotMatch(r.stdout, /old-kit/);

  // The second run finds nothing to do and writes nothing.
  const before = everything(h);
  const again = cli(now.bin, ["migrate", "--yes"], h);
  assert.equal(again.status, 0, again.stderr);
  for (const app of ["Codex", "OpenCode"])
    assert.ok(
      again.stdout.includes(
        `\n${app}\n  já está nesta versão: acme-core, acme-dev, acme-pack\n`,
      ),
      again.stdout,
    );
  assert.match(again.stdout, /\nNada mais a migrar\. Nada foi alterado\.\n$/);
  assert.doesNotMatch(again.stdout, /Relatório|Aplicando/);
  assert.deepEqual(everything(h), before);
  // From here on the ordinary update works.
  assert.equal(cli(now.bin, ["update"], h).status, 0);
});

test("a saved plugin brings its whole group here, and a plugin that does not go to an app is said so", (t) => {
  const now = current(t);
  const h = home(t);
  // No group was saved: the group comes from the plugin.
  write(statePath(h), {
    schema: 1,
    plugins: ["acme-core", "acme-dev"],
    targets: ["codex", "cursor"].map((target) => ({
      target,
      plugins: ["acme-core", "acme-dev"],
      version: "0.9.0",
    })),
  });
  const r = cli(now.bin, ["migrate", "--yes"], h);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.deepEqual(entryOf(h, "codex").plugins, ["acme-core", "acme-dev", "acme-pack"]);
  assert.deepEqual(entryOf(h, "cursor").plugins, ["acme-core", "acme-dev"]);
  for (const target of ["codex", "cursor"])
    assert.deepEqual(entryOf(h, target).groups, ["building"]);
  const plan = r.stdout.slice(0, r.stdout.indexOf("\nAplicando o plano\n"));
  assert.ok(
    plan.includes(
      "\nCursor\n  tinha: acme-core, acme-dev\n  vai ter: acme-core, acme-dev\n  acme-pack: não distribuído para Cursor; ignorado.\n",
    ),
    plan,
  );
  assert.ok(
    plan.includes(
      "\nCodex\n  tinha: acme-core, acme-dev\n  vai ter: acme-core, acme-dev, acme-pack\n  adicionados (novos nos grupos, exigidos ou pedidos): acme-pack\n",
    ),
    plan,
  );
  assert.match(cli(now.bin, ["migrate", "--yes"], h).stdout, /Nada mais a migrar\./);

  // Only the app named with --target is touched.
  const other = home(t);
  write(statePath(other), {
    schema: 1,
    plugins: ["acme-core"],
    targets: ["codex", "opencode"].map((target) => ({
      target,
      plugins: ["acme-core"],
      version: "0.9.0",
    })),
  });
  const one = cli(now.bin, ["migrate", "--target", "opencode", "--yes"], other);
  assert.equal(one.status, 0, one.stderr);
  assert.equal(entryOf(other, "opencode").version, "1.2.3");
  assert.equal(entryOf(other, "codex").version, "0.9.0");
  assert.doesNotMatch(one.stdout, /\nCodex\n/);
});

test("nothing saved and one app found: it gets every group that is not optional, or the groups asked for", (t) => {
  const now = current(t);
  const h = home(t);
  fs.mkdirSync(path.join(h, ".codex"));
  const r = cli(now.bin, ["migrate", "--yes"], h);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.deepEqual(state(h).targets.map((entry) => entry.target), ["codex"]);
  assert.deepEqual(entryOf(h, "codex").plugins, ["acme-core", "acme-data", "acme-dev", "acme-pack"]);
  assert.deepEqual(entryOf(h, "codex").groups, ["analytics", "building"]);
  assert.equal(exists(h, ".agents/skills/extra-skill"), false);
  assert.ok(
    r.stdout.includes(
      "\nCodex\n  tinha: nada registrado\n  vai ter: acme-core, acme-data, acme-dev, acme-pack\n",
    ),
    r.stdout,
  );
  assert.doesNotMatch(r.stdout, /adicionados \(/);

  const asked = home(t);
  fs.mkdirSync(path.join(asked, ".config/opencode"), { recursive: true });
  const chosen = cli(now.bin, ["migrate", "--group", "extras", "--yes"], asked);
  assert.equal(chosen.status, 0, chosen.stderr);
  assert.deepEqual(entryOf(asked, "opencode").plugins, ["acme-extra"]);
  assert.deepEqual(entryOf(asked, "opencode").groups, ["extras"]);

  // With no app saved and none found there is nothing to migrate into.
  const empty = home(t);
  const none = cli(now.bin, ["migrate", "--yes"], empty);
  assert.notEqual(none.status, 0);
  assert.match(none.stderr, /Nenhum target detectado/);
  assert.deepEqual(fs.readdirSync(empty), []);
});

test("--dry-run and a run without --yes outside a terminal show the plan and change nothing", (t) => {
  const old = earlier(t);
  const now = current(t);
  const h = home(t);
  assert.equal(
    cli(old.bin, ["install", "--target", "codex", "--plugin", "acme-old", "--auto-update"], h).status,
    0,
  );
  const before = everything(h);
  const dry = cli(now.bin, ["migrate", "--dry-run"], h);
  assert.equal(dry.status, 0, dry.stderr);
  assert.ok(
    dry.stdout.includes(
      "\nPlano\n\nCodex\n  tinha: acme-core, acme-old\n  vai ter: acme-core\n  não distribuídos aqui: acme-old. ",
    ),
    dry.stdout,
  );
  assert.match(dry.stdout, /\nAtualização diária: a tarefa é gravada de novo e passa a rodar este instalador\.\n/);
  assert.match(dry.stdout, /\nSimulação concluída\. Nenhuma alteração foi feita\.\n/);
  assert.doesNotMatch(dry.stdout, /Relatório|Aplicando/);
  assert.deepEqual(everything(h), before);

  // The tests run with no terminal, so the question cannot be asked.
  const unanswered = cli(now.bin, ["migrate"], h);
  assert.equal(unanswered.status, 0, unanswered.stderr);
  assert.match(unanswered.stdout, /\n  vai ter: acme-core\n/);
  assert.match(unanswered.stdout, /\nNada foi alterado\. Rode de novo com --yes para aplicar este plano\.\n$/);
  assert.deepEqual(everything(h), before);
});

test("the question is asked once: yes in either language applies, anything else does not", async () => {
  const prompts = [];
  for (const answer of ["s", "SIM", "y", " yes "])
    assert.equal(
      await confirmed(async (text) => {
        prompts.push(text);
        return answer;
      }),
      true,
      answer,
    );
  assert.equal(new Set(prompts).size, 1);
  assert.equal(prompts[0], "\nAplicar este plano? [s/N]: ");
  for (const answer of ["", "n", "não", "talvez", undefined])
    assert.equal(await confirmed(async () => answer), false, String(answer));
  // The input ended before an answer.
  assert.equal(
    await confirmed(async () => {
      throw new Error("closed");
    }),
    false,
  );
});

test("the daily task comes along only when it was on, and then it runs this installer", (t) => {
  const old = earlier(t);
  const now = current(t);
  const install = ["install", "--target", "codex", "--plugin", "acme-core"];

  const on = home(t);
  assert.equal(cli(old.bin, [...install, "--auto-update"], on).status, 0);
  assert.ok(fs.readFileSync(taskFile(on), "utf8").includes("github:acme/old-kit#main"));
  const r = cli(now.bin, ["migrate", "--yes"], on);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const task = fs.readFileSync(taskFile(on), "utf8");
  assert.ok(task.includes("github:acme/kit#main"), task);
  assert.ok(!task.includes("old-kit"), task);
  assert.equal(state(on).autoUpdate.status, "prepared");
  assert.match(r.stdout, /\nAtualização automática: preparada, não ativada\.\n/);
  const again = cli(now.bin, ["migrate", "--yes"], on);
  assert.match(again.stdout, /\nAtualização diária: já roda este instalador\.\n/);
  assert.match(again.stdout, /\nNada mais a migrar\. Nada foi alterado\.\n$/);

  const off = home(t);
  assert.equal(cli(old.bin, install, off).status, 0);
  const kept = cli(now.bin, ["migrate", "--yes"], off);
  assert.equal(kept.status, 0, kept.stderr);
  assert.match(kept.stdout, /\nAtualização diária: estava desligada e continua desligada\.\n/);
  assert.equal(fs.existsSync(taskFile(off)), false);
  assert.equal(state(off).autoUpdate, undefined);

  // It was on and the person does not want it any more.
  const refused = home(t);
  assert.equal(cli(old.bin, [...install, "--auto-update"], refused).status, 0);
  const dropped = cli(now.bin, ["migrate", "--yes", "--no-auto-update"], refused);
  assert.equal(dropped.status, 0, dropped.stderr);
  assert.equal(fs.existsSync(taskFile(refused)), false);
  assert.equal(state(refused).autoUpdate.status, "disabled");
  assert.match(dropped.stdout, /\nAtualização diária: desligada\.\n/);

  // The stable channel has no daily update: there an active task is turned off.
  const stable = home(t);
  assert.equal(cli(old.bin, [...install, "--auto-update"], stable).status, 0);
  const pinned = cli(now.bin, ["migrate", "--yes", "--channel", "stable"], stable);
  assert.equal(pinned.status, 0, pinned.stderr);
  assert.match(pinned.stdout, /\nAtualização automática: a atualização diária ativa seria desligada; ela não se aplica ao canal stable\.\n/);
  assert.match(pinned.stdout, /\naviso: atualização diária desligada; ela não se aplica ao canal stable\./);
  assert.equal(fs.existsSync(taskFile(stable)), false);
  assert.equal(state(stable).autoUpdate.status, "disabled");
  assert.equal(state(stable).channel, "stable");
  assert.equal(entryOf(stable, "codex").version, "1.2.3");

  // Only the task was left to move: the apps are not synced again.
  const late = home(t);
  assert.equal(cli(now.bin, [...install, "--yes"], late).status, 0);
  const saved = state(late);
  const file = taskFile(late).replace(/\.service$/, ".timer");
  write(taskFile(late), "ExecStart=npx --yes github:acme/old-kit#main update\n");
  if (file !== taskFile(late)) write(file, "[Timer]\n");
  write(statePath(late), { ...saved, autoUpdate: { status: "enabled", path: file } });
  const moved = cli(now.bin, ["migrate", "--yes"], late);
  assert.equal(moved.status, 0, moved.stderr);
  assert.match(moved.stdout, /\nCodex\n  já está nesta versão: acme-core\n/);
  assert.ok(fs.readFileSync(taskFile(late), "utf8").includes("github:acme/kit#main"));
  assert.equal(entryOf(late, "codex").syncedAt, saved.targets[0].syncedAt);
});

/** A home where Claude Code has the marketplace `acme` registered from `source`, with `plugins` installed from it. */
function claudeWith(t, source, plugins) {
  const c = claudeHome(t, { repos: { "acme/kit": "acme" } });
  write(path.join(c.home, "market.json"), [{ name: "acme", ...source }]);
  write(path.join(c.home, ".claude/plugins/known_marketplaces.json"), {
    acme: { source },
  });
  write(path.join(c.home, ".claude/plugins/installed_plugins.json"), {
    version: 2,
    plugins: {
      ...Object.fromEntries(
        plugins.map((plugin) => [`${plugin}@acme`, [{ scope: "user" }]]),
      ),
      "other@elsewhere": [{ scope: "user" }],
      "acme-project@acme": [{ scope: "project" }],
    },
  });
  // The marketplace of this installer does not have the pack that stayed behind.
  fs.writeFileSync(path.join(c.home, "fail-installs"), "acme-old@acme");
  return c;
}

test("Claude Code: a marketplace of the same name registered from another repository moves here, and what it had that this one lacks is reported, not installed", (t) => {
  const now = current(t);
  // Nothing in the state: the plugins were installed by hand from the other repository.
  const c = claudeWith(t, { source: "github", repo: "acme/old-kit" }, [
    "acme-core",
    "acme-dev",
    "acme-old",
  ]);
  const env = { PATH: c.path };
  const before = everything(c.home);

  const dry = cli(now.bin, ["migrate", "--dry-run"], c.home, env);
  assert.equal(dry.status, 0, dry.stderr);
  assert.ok(
    dry.stdout.includes(
      "\nClaude Code\n  tinha: acme-core, acme-dev, acme-old\n  vai ter: acme-core, acme-dev, acme-pack\n  adicionados (novos nos grupos, exigidos ou pedidos): acme-pack\n  não distribuídos aqui: acme-old. Ficam de fora e não voltam quando o marketplace muda de origem; busque-os na distribuição que os tem.\n  marketplace 'acme': registrado a partir de GitHub acme/old-kit, passa para GitHub acme/kit\n",
    ),
    dry.stdout,
  );
  // The plan is read from files: Claude Code is not run, and nothing is written.
  assert.deepEqual(everything(c.home), before);

  const r = cli(now.bin, ["migrate", "--yes"], c.home, env);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const log = c.calls();
  const removed = log.indexOf("plugin marketplace remove acme");
  const added = log.indexOf(
    "plugin marketplace add acme/kit --sparse .claude-plugin plugins",
  );
  assert.ok(removed >= 0 && added > removed, log.join("\n"));
  for (const plugin of ["acme-core", "acme-dev", "acme-pack"])
    assert.ok(log.includes(`plugin install ${plugin}@acme`), plugin);
  assert.ok(!log.includes("plugin install acme-old@acme"), log.join("\n"));
  assert.ok(!log.some((call) => /other@elsewhere|acme-project/.test(call)));
  assert.match(
    r.stdout,
    /\n  acme-old: instalado pelo marketplace 'acme' como estava registrado antes e não distribuído por este; não reinstalado\.\n/,
  );
  const entry = entryOf(c.home, "claude");
  assert.deepEqual(entry.plugins, ["acme-core", "acme-dev", "acme-pack"]);
  assert.deepEqual(entry.groups, ["building"]);
  assert.equal(entry.marketplaceMode, "github");
  assert.equal(entry.failedPlugins, undefined);
  assert.ok(
    r.stdout.includes(
      "\nRelatório\n\nClaude Code\n  tinha: acme-core, acme-dev, acme-old\n  tem agora: acme-core, acme-dev, acme-pack\n",
    ),
    r.stdout,
  );

  // The second run reads the same files, finds the marketplace at home and runs nothing.
  const calls = log.length;
  const settled = everything(c.home);
  const again = cli(now.bin, ["migrate", "--yes"], c.home, env);
  assert.equal(again.status, 0, again.stderr);
  assert.match(again.stdout, /\n  já está nesta versão: acme-core, acme-dev, acme-pack\n/);
  assert.match(again.stdout, /\nNada mais a migrar\. Nada foi alterado\.\n$/);
  assert.equal(c.calls().length, calls);
  assert.deepEqual(everything(c.home), settled);
});

test("Claude Code: install over a marketplace registered from another repository no longer fails on a plugin it cannot have", (t) => {
  const now = current(t);
  const c = claudeWith(t, { source: "directory", path: "/somewhere/else" }, [
    "acme-core",
    "acme-old",
  ]);
  const r = cli(
    now.bin,
    ["install", "--target", "claude", "--plugin", "acme-dev", "--yes"],
    c.home,
    { PATH: c.path },
  );
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const log = c.calls();
  assert.ok(log.includes("plugin install acme-dev@acme"), log.join("\n"));
  assert.ok(log.includes("plugin install acme-core@acme"));
  assert.ok(!log.includes("plugin install acme-old@acme"));
  assert.match(r.stdout, /acme-old: instalado pelo marketplace 'acme' como estava registrado antes/);
});

test("Claude Code: the same repository on another ref still installs again everything it had, and a failure is reported per app", (t) => {
  const now = current(t);
  const c = claudeWith(t, { source: "github", repo: "acme/kit", ref: "v0.0.1" }, [
    "acme-core",
    "acme-old",
  ]);
  fs.mkdirSync(path.join(c.home, ".codex"));
  write(statePath(c.home), {
    schema: 1,
    plugins: ["acme-core"],
    targets: [{ target: "claude", plugins: ["acme-core"], version: "0.9.0" }],
  });
  const r = cli(now.bin, ["migrate", "--yes"], c.home, { PATH: c.path });
  assert.notEqual(r.status, 0);
  const log = c.calls();
  assert.ok(log.includes("plugin marketplace remove acme"), log.join("\n"));
  assert.ok(log.includes("plugin install acme-old@acme"));
  assert.match(r.stderr, /Migração incompleta: claude\./);
  // The app that failed is said so, and the other one was migrated all the same.
  assert.ok(
    r.stdout.includes(
      "\nClaude Code\n  tinha: acme-core\n  não migrado: veja as mensagens acima\n",
    ),
    r.stdout,
  );
  assert.match(r.stdout, /\nCodex\n  tinha: nada registrado\n  tem agora: acme-core, acme-data, acme-dev, acme-pack\n/);
  assert.deepEqual(entryOf(c.home, "claude").failedPlugins, ["acme-old"]);
  assert.equal(entryOf(c.home, "codex").version, "1.2.3");
});

test("the plan is a fixed point: applied to its own result it changes nothing, even when a dependency brings another group", (t) => {
  const plugins = currentPlugins();
  // The new pack of the building group depends on a plugin of the analytics group.
  plugins["acme-pack"].dependencies = ["acme-dev", "acme-data"];
  const { catalog } = acmeRoot(t, { plugins });
  assert.deepEqual(defaultGroups(catalog), ["analytics", "building"]);
  const args = { plugins: [], groups: [] };
  const first = planApp({
    target: "codex",
    entry: { plugins: ["acme-core", "acme-dev", "acme-gone"], groups: ["building", "gone"], version: "0.9.0" },
    args,
    catalog,
    version: "1.2.3",
  });
  assert.deepEqual(first.had, ["acme-core", "acme-dev", "acme-gone"]);
  assert.deepEqual([...first.now].sort(), ["acme-core", "acme-data", "acme-dev", "acme-pack"]);
  assert.deepEqual([...first.groups].sort(), ["analytics", "building"]);
  assert.deepEqual(first.added, ["acme-data", "acme-pack"]);
  assert.deepEqual(first.notCarried, ["acme-gone"]);
  assert.equal(first.current, false);
  // A plugin comes after the ones it depends on.
  for (const [plugin, dependency] of [["acme-pack", "acme-data"], ["acme-pack", "acme-dev"], ["acme-dev", "acme-core"]])
    assert.ok(first.names.indexOf(dependency) < first.names.indexOf(plugin), plugin);

  const second = planApp({
    target: "codex",
    entry: { plugins: first.now, groups: first.groups, version: "1.2.3" },
    args,
    catalog,
    version: "1.2.3",
  });
  assert.equal(second.current, true);
  assert.deepEqual(second.now, first.now);
  assert.deepEqual(second.added, []);
  assert.deepEqual(second.notCarried, []);
  // Another version, or a plugin that failed, is still work to do.
  for (const change of [{ version: "1.2.2" }, { failedPlugins: ["acme-dev"] }])
    assert.equal(
      planApp({
        target: "codex",
        entry: { plugins: first.now, groups: first.groups, version: "1.2.3", ...change },
        args,
        catalog,
        version: "1.2.3",
      }).current,
      false,
    );
  // Nothing of what the app had is carried here: it is treated as a new app.
  const stranger = planApp({
    target: "codex",
    entry: { plugins: ["acme-gone"], groups: ["gone"], version: "0.9.0" },
    args,
    catalog,
    version: "1.2.3",
  });
  assert.deepEqual([...stranger.groups].sort(), ["analytics", "building"]);
  assert.deepEqual(stranger.notCarried, ["acme-gone"]);
});

test("migrate is in the help and speaks English when asked to", (t) => {
  const old = earlier(t);
  const now = current(t);
  const h = home(t);
  assert.match(
    cli(now.bin, ["--help"], h).stdout,
    /^  npx github:acme\/kit#main migrate \[opções\] {4}traz para este instalador o que um instalador anterior deixou nesta máquina$/m,
  );
  assert.equal(
    cli(old.bin, ["install", "--target", "codex", "--plugin", "acme-old", "--yes"], h).status,
    0,
  );
  const help = cli(now.bin, ["--help", "--lang", "en"], h).stdout;
  assert.match(help, /^  npx github:acme\/kit#main migrate \[options\] {3}brings what an earlier installer left on this machine to this one$/m);
  const steps = [
    cli(now.bin, ["migrate", "--dry-run", "--lang", "en"], h),
    cli(now.bin, ["migrate", "--lang", "en"], h),
    cli(now.bin, ["migrate", "--yes", "--lang", "en"], h),
    cli(now.bin, ["migrate", "--yes", "--lang", "en"], h),
  ];
  const [dry, unanswered, applied, again] = steps.map((step) => step.stdout);
  for (const step of steps) assert.equal(step.status, 0, step.stderr);
  assert.doesNotMatch(steps.map((step) => step.stdout + step.stderr).join("\n"), PORTUGUESE);
  assert.match(dry, /^\nMarsAI · Migration · v1\.2\.3\nTest mode: installing into an alternative folder\.\nBrings what an earlier MarsAI installer left in each app to this version, from GitHub acme\/kit\.\n\nPlan\n\nCodex\n  had: acme-core, acme-old\n  will have: acme-core\n  not carried here: acme-old\. Left out, and what was installed for it is removed from this app; get it from the distribution that carries it\.\n\nDaily update: it was off and stays off\.\n\nSimulation finished\. Nothing was changed\.\n/);
  assert.match(unanswered, /\nNothing was changed\. Run again with --yes to apply this plan\.\n$/);
  assert.match(applied, /\nApplying the plan\n\nCodex\n/);
  assert.match(applied, /\nReport\n\nCodex\n  had: acme-core, acme-old\n  has now: acme-core\n  not carried here: acme-old\. /);
  assert.match(applied, /\nMigration finished\.\nNo configuration of the main installation was changed\.\n/);
  assert.match(again, /\nCodex\n  already on this version: acme-core\n\nDaily update: it was off and stays off\.\n\nNothing left to migrate\. Nothing was changed\.\n$/);
  const unknown = cli(now.bin, ["migrar", "--lang", "en"], h);
  assert.match(unknown.stderr, /unknown command: migrar\. Use install \| update \| migrate \| status \| doctor \| remove\./);
});
