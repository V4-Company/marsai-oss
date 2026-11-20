import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  DEFAULT_LANG,
  LANGS,
  currentLang,
  detectLang,
  localized,
  normalizeLang,
  setLang,
  t,
} from "../src/i18n.js";
import en from "../src/messages/en.js";
import ptBR from "../src/messages/pt-BR.js";
import { runWizard } from "../src/wizard.js";
import {
  PORTUGUESE,
  REPO_ROOT,
  acmeInstaller,
  acmeRoot,
} from "./helpers/fixtures.js";

// The installer speaks English unless the environment asks for Portuguese. The
// other suites pin Portuguese; this one chooses the language itself each time.

const bin = path.resolve("cli/bin/marsai.js");

function home(t) {
  const h = fs.mkdtempSync(path.join(os.tmpdir(), "marsai-lang-"));
  t.after(() => fs.rmSync(h, { recursive: true, force: true }));
  return h;
}
/** Runs with nothing about language in the environment but what `env` gives. */
function cli(from, args, env = {}) {
  const base = { ...process.env, PATH: "/nonexistent" };
  for (const key of ["MARSAI_LANG", "LC_ALL", "LC_MESSAGES", "LANG", "LANGUAGE"])
    delete base[key];
  return spawnSync(process.execPath, [from, ...args], {
    encoding: "utf8",
    env: { ...base, ...env },
  });
}
/** Run `body` with the language fixed, then give it back to the environment. */
async function speaking(lang, body) {
  setLang(lang);
  try {
    return await body();
  } finally {
    setLang(undefined);
  }
}
function sources(dir = path.join(REPO_ROOT, "cli", "src")) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory())
      return entry.name === "messages" ? [] : sources(path.join(dir, entry.name));
    return entry.name.endsWith(".js")
      ? [fs.readFileSync(path.join(dir, entry.name), "utf8")]
      : [];
  });
}

test("English and Portuguese have the same texts, of the same kind", () => {
  assert.deepEqual(LANGS, ["en", "pt-BR"]);
  assert.equal(DEFAULT_LANG, "en");
  assert.deepEqual(Object.keys(ptBR).sort(), Object.keys(en).sort());
  // Any value a text may ask for: a number where it counts, a name elsewhere.
  const values = new Proxy(
    {},
    {
      get: (_, name) =>
        name === "n" ? 2 : name === "kind" ? "skills" : String(name),
    },
  );
  for (const [key, text] of Object.entries(en)) {
    assert.equal(typeof ptBR[key], typeof text, key);
    for (const entry of [text, ptBR[key]]) {
      const shown = typeof entry === "function" ? entry(values) : entry;
      assert.equal(typeof shown, "string", key);
      assert.ok(shown.length > 0, key);
    }
  }
  // English is not a copy of the Portuguese, and carries no Portuguese spelling.
  for (const [key, text] of Object.entries(en)) {
    const shown = typeof text === "function" ? text(values) : text;
    assert.doesNotMatch(shown, PORTUGUESE, key);
  }
});

test("every text the installer asks for exists, and every text is asked for", () => {
  const code = sources().join("\n");
  const asked = [...code.matchAll(/\b(?:t|tr)\(\s*["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
  assert.ok(asked.length > 100, `only ${asked.length} texts found`);
  for (const key of asked) assert.ok(Object.hasOwn(en, key), `missing: ${key}`);
  // A text chosen at run time is asked for by its prefix, as in t(`present.state.${state}`).
  const prefixes = [...code.matchAll(/\b(?:t|tr)\(\s*`([a-zA-Z.-]+)\$\{/g)].map(
    (match) => match[1],
  );
  for (const prefix of prefixes)
    assert.ok(
      Object.keys(en).some((key) => key.startsWith(prefix)),
      `no text starts with ${prefix}`,
    );
  for (const key of Object.keys(en))
    assert.ok(
      code.includes(`"${key}"`) ||
        code.includes(`'${key}'`) ||
        prefixes.some((prefix) => key.startsWith(prefix)),
      `never asked for: ${key}`,
    );
});

test("the language comes from MARSAI_LANG, then from the system locale, then it is English", () => {
  for (const [env, expected] of [
    [{}, "en"],
    [{ LANG: "C" }, "en"],
    [{ LANG: "en_US.UTF-8" }, "en"],
    [{ LANG: "pt_BR.UTF-8" }, "pt-BR"],
    [{ LANG: "pt_PT.UTF-8" }, "pt-BR"],
    [{ LANG: "de_DE.UTF-8" }, "en"],
    [{ LANG: "pt_BR.UTF-8", LC_MESSAGES: "en_US.UTF-8" }, "en"],
    [{ LANG: "en_US.UTF-8", LC_MESSAGES: "pt_BR.UTF-8" }, "pt-BR"],
    [{ LC_ALL: "pt_BR.UTF-8", LC_MESSAGES: "en_US.UTF-8", LANG: "C" }, "pt-BR"],
    [{ LC_ALL: "C", LC_MESSAGES: "pt_BR.UTF-8", LANG: "pt_BR.UTF-8" }, "en"],
    [{ MARSAI_LANG: "pt-BR", LANG: "en_US.UTF-8" }, "pt-BR"],
    [{ MARSAI_LANG: "pt", LC_ALL: "en_US.UTF-8" }, "pt-BR"],
    [{ MARSAI_LANG: "en", LANG: "pt_BR.UTF-8" }, "en"],
    [{ MARSAI_LANG: "EN-us", LANG: "pt_BR.UTF-8" }, "en"],
    // A value that names neither language is no choice: the locale decides.
    [{ MARSAI_LANG: "klingon", LANG: "pt_BR.UTF-8" }, "pt-BR"],
    [{ MARSAI_LANG: "", LANG: "pt_BR.UTF-8" }, "pt-BR"],
  ])
    assert.equal(detectLang(env), expected, JSON.stringify(env));
  assert.equal(normalizeLang("pt_BR.UTF-8"), "pt-BR");
  assert.equal(normalizeLang(" PT "), "pt-BR");
  assert.equal(normalizeLang("en"), "en");
  assert.equal(normalizeLang("fr"), undefined);
  assert.equal(normalizeLang(undefined), undefined);
});

test("a text follows the chosen language, and a manifest text falls back to what exists", async () => {
  await speaking("en", () => {
    assert.equal(currentLang(), "en");
    assert.equal(t("cli.status.nothing"), "nothing installed by this installer");
    assert.equal(t("login.askContact", { contact: "x@y.test" }), "Ask x@y.test for access.");
    assert.equal(t("present.count", { kind: "rules", n: 1 }), "1 rules file");
    assert.equal(t("present.count", { kind: "agents", n: 3 }), "3 agents");
    assert.equal(localized({ en: "Data", "pt-BR": "Dados" }), "Data");
    assert.equal(localized({ "pt-BR": "Dados" }), "Dados");
  });
  await speaking("pt-BR", () => {
    assert.equal(currentLang(), "pt-BR");
    assert.equal(t("cli.status.nothing"), "nada instalado por este instalador");
    assert.equal(t("present.count", { kind: "rules", n: 1 }), "1 arquivo de regras");
    assert.equal(localized({ en: "Data", "pt-BR": "Dados" }), "Dados");
    assert.equal(localized({ en: "Data" }), "Data");
    assert.equal(localized("Plain"), "Plain");
  });
  assert.equal(t("no.such.text"), "no.such.text");
});

test("with nothing said about language the installer answers in English", (t) => {
  const empty = home(t);
  const status = cli(bin, ["status", "--home", empty]);
  assert.equal(status.status, 0, status.stderr);
  // The Homebrew formula checks this sentence.
  assert.match(status.stdout, /nothing installed/);
  assert.equal(
    status.stdout.split("\n")[1],
    "nothing installed by this installer",
  );
  const help = cli(bin, ["--help"]).stdout;
  assert.match(help, /^Usage:$/m);
  assert.match(help, /--lang <en\|pt-BR> {3}language of the messages/);
  assert.doesNotMatch(help, /^Uso:$/m);
  const error = cli(bin, ["install", "--target", "editor", "--home", empty]);
  assert.notEqual(error.status, 0);
  assert.match(error.stderr, /unknown target: editor\. Valid: claude, codex/);
});

test("the locale, MARSAI_LANG and --lang each switch the language, the later one winning", (t) => {
  const empty = home(t);
  const said = (args, env) => {
    const out = cli(bin, [...args, "status", "--home", empty], env).stdout;
    return /nada instalado/.test(out) ? "pt-BR" : /nothing installed/.test(out) ? "en" : out;
  };
  assert.equal(said([], { LANG: "pt_BR.UTF-8" }), "pt-BR");
  assert.equal(said([], { LANG: "en_US.UTF-8" }), "en");
  assert.equal(said([], { LANG: "pt_BR.UTF-8", LC_ALL: "C" }), "en");
  assert.equal(said([], { MARSAI_LANG: "pt-BR", LANG: "en_US.UTF-8" }), "pt-BR");
  assert.equal(said([], { MARSAI_LANG: "en", LANG: "pt_BR.UTF-8" }), "en");
  assert.equal(said(["--lang", "pt-BR"], { MARSAI_LANG: "en" }), "pt-BR");
  assert.equal(said(["--lang", "en"], { MARSAI_LANG: "pt-BR" }), "en");
  // --lang counts wherever it is, even for the complaint about another flag.
  const after = cli(bin, ["install", "--target", "editor", "--home", empty, "--lang", "pt-BR"]);
  assert.match(after.stderr, /target desconhecido: editor/);
  const before = cli(bin, ["--lang", "en", "install", "--target", "editor", "--home", empty], {
    LANG: "pt_BR.UTF-8",
  });
  assert.match(before.stderr, /unknown target: editor/);

  const unknown = cli(bin, ["--lang", "klingon", "status", "--home", empty]);
  assert.notEqual(unknown.status, 0);
  assert.match(unknown.stderr, /unknown language: klingon\. Valid: en, pt-BR/);
  const missing = cli(bin, ["status", "--home", empty, "--lang"], { LANG: "pt_BR.UTF-8" });
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /idioma desconhecido: \. Válidos: en, pt-BR/);
  assert.deepEqual(fs.readdirSync(empty), []);
});

test("a whole run in English shows nothing in Portuguese, and the same run in Portuguese does", (t) => {
  const acme = acmeInstaller(t);
  const run = (h, args, env) => cli(acme.bin, [...args, "--home", h], env);
  const install = ["install", "--target", "codex", "--target", "opencode", "--group", "analytics", "--yes", "--acme-bi-url", "http://127.0.0.1:9", "--acme-bi-access", "no"];

  const h = home(t);
  const steps = [
    run(h, ["--help"]),
    run(h, [...install, "--dry-run"]),
    run(h, install),
    run(h, ["status"]),
    run(h, ["doctor"]),
    run(h, ["--mcp", "skip", "update", "--dry-run"]),
    run(h, ["--mcp", "skip", "update"]),
    run(h, ["remove", "--dry-run"]),
    run(h, ["remove"]),
    run(h, ["status"]),
    run(h, ["update"]),
    run(h, []),
  ];
  const english = steps.map((step) => step.stdout + step.stderr).join("\n");
  assert.doesNotMatch(english, PORTUGUESE);
  const [help, dry, installed, status, doctor, , , , removed, , nothing, wizard] = steps;
  assert.match(help.stdout, /plugin marketplace of Acme for Claude Code/);
  assert.match(help.stdout, /--acme-bi-access <yes\|no> says whether you have access/);
  assert.match(dry.stdout, /\nSimulation: nothing will be changed\.\n/);
  assert.match(dry.stdout, /\n  Install 2 selected packages\.\n/);
  assert.match(dry.stdout, /\n  Acme BI\n    Add the MCP configuration\. A login will be needed\.\n/);
  assert.equal(installed.status, 0, installed.stderr);
  assert.match(installed.stdout, /^\nMarsAI · Install · v1\.2\.3\nTest mode: installing into an alternative folder\.\nThe MarsAI base is included in the choices\.\n/);
  assert.match(installed.stdout, /\nCodex\n  ✓ 3 skills, 1 rules file installed\n/);
  assert.match(installed.stdout, /\nOpenCode\n  ✓ 3 skills, 1 command installed\n/);
  assert.match(
    installed.stdout,
    /\n  Acme BI\n    ! Access to Acme BI pending\.\n    Ask data@acme\.test for access\.\n/,
  );
  assert.match(installed.stdout, /\nInstall finished\. What is pending for the integrations is shown above\.\n/);
  assert.match(status.stdout, /\nchannel: main\n/);
  assert.match(status.stdout, /\n  files: present\n/);
  assert.notEqual(doctor.status, 0);
  assert.match(doctor.stdout, /\nMarsAI · Check\n/);
  assert.match(doctor.stderr, /Check pending or failed: codex, opencode\./);
  assert.match(removed.stdout, /\n==> removing \[codex\]\n/);
  assert.match(removed.stdout, /✓ MarsAI content and the unchanged managed MCP connections removed\./);
  assert.match(nothing.stdout, /Nothing installed by this installer yet\. Run `install` first\./);
  assert.notEqual(wizard.status, 0);
  assert.match(wizard.stderr, /The wizard needs an interactive terminal\. Use install --target codex --group analytics --yes \(or --plugin acme-core\)\./);

  const portuguese = run(home(t), install, { MARSAI_LANG: "pt-BR" });
  assert.match(portuguese.stdout, /^\nMarsAI · Instalação · v1\.2\.3\n/);
  assert.match(portuguese.stdout, /Peça acesso para data@acme\.test\./);
});

test("the wizard asks in English what the plugins declare in English, and takes yes in either language", async (t) => {
  const { catalog } = acmeRoot(t);
  for (const answer of ["yes", "sim"]) {
    const answers = ["2", "1", "y", answer];
    const prompts = [];
    let transcript = "";
    const result = await speaking("en", () =>
      runWizard({ targets: [], plugins: [], groups: [], home: home(t) }, [], catalog, {
        ask: async (text) => {
          prompts.push(text);
          return answers.shift();
        },
        output: { write: (text) => (transcript += text) },
      }),
    );
    assert.equal(result.ok, true);
    assert.equal(result.args.autoUpdate, true);
    assert.deepEqual(result.args.mcpAccess, { "acme-bi": true });
    assert.match(transcript, /^\nMarsAI \| Acme\nSkills, agents and commands for your AI assistant\.\n/);
    assert.match(prompts[0], /^\nWhere to install\?\n\n  1\. Claude Code\n/);
    assert.match(prompts[0], /\n\nChoose numbers separated by commas: $/);
    assert.match(prompts[1], /\n  1\. Analytics: Reports over Acme BI\n  2\. Building: Build and ship\n/);
    assert.equal(prompts[2], "Turn on the daily update? [y/N]: ");
    assert.equal(prompts[3], "Do you already have access to Acme BI? [Yes/No]: ");
    assert.match(transcript, /\nAcme BI\nhttps:\/\/bi\.acme\.test\/\nThe login happens in the app you chose\.\nExisting connections will be kept\.\nThis skill needs access to Acme BI\.\n/);
    assert.doesNotMatch(transcript + prompts.join("\n"), PORTUGUESE);
  }
});

test("what the installer writes into the apps is in English and does not follow the language", (t) => {
  const acme = acmeInstaller(t);
  const install = ["--mcp", "skip", "install", "--target", "codex", "--target", "cursor", "--target", "opencode", "--group", "building", "--yes"];
  /** Every file under the home but the installer's own state, with the home path taken out. */
  const written = (h) => {
    const files = {};
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(file);
        else if (path.relative(h, file) !== ".marsai-installer.json")
          files[path.relative(h, file)] = fs
            .readFileSync(file, "utf8")
            .split(h)
            .join("<home>");
      }
    };
    walk(h);
    return files;
  };
  const inEnglish = home(t);
  const inPortuguese = home(t);
  const english = cli(acme.bin, [...install, "--lang", "en", "--home", inEnglish]);
  const portuguese = cli(acme.bin, [...install, "--lang", "pt-BR", "--home", inPortuguese]);
  assert.equal(english.status, 0, english.stderr);
  assert.equal(portuguese.status, 0, portuguese.stderr);
  // The two runs talk differently and write the same.
  assert.match(english.stdout, /MarsAI · Install · /);
  assert.match(portuguese.stdout, /MarsAI · Instalação · /);
  const files = written(inEnglish);
  assert.deepEqual(written(inPortuguese), files);

  // What the installer composes itself: the rules, the adapter notes, the adapted agents.
  for (const file of [
    ".codex/marsai-AGENTS.md",
    ".codex/AGENTS.md",
    ".cursor/skills/marsai-build/SKILL.md",
    ".cursor/skills/marsai-hello/SKILL.md",
    ".cursor/agents/builder.md",
    ".config/opencode/command/build.md",
    ".config/opencode/agent/planner.md",
  ])
    assert.ok(Object.hasOwn(files, file), `${file} among ${Object.keys(files).join(", ")}`);
  for (const [file, content] of Object.entries(files)) {
    assert.doesNotMatch(content, PORTUGUESE, file);
    assert.doesNotMatch(content, /\bV4\b/, file);
  }
  assert.match(files[".codex/marsai-AGENTS.md"], /\nHow this flow works:\n/);
  assert.match(
    files[".cursor/skills/marsai-build/SKILL.md"],
    /\n> \*\*MarsAI adapter \(Cursor\):\*\* this command came from the MarsAI marketplace for Claude Code\. /,
  );
  assert.ok(
    files[".config/opencode/command/build.md"].includes(
      "\n> **MarsAI adapter (OpenCode):** this command came from the MarsAI marketplace for Claude Code. The namespace `marsai-<plugin>:<agent>` does not exist here: dispatch the equivalent agent by its file name in `<home>/.config/opencode/agent` (for example `backend-engineer-typescript`), through the task tool. MarsAI skills are in `~/.config/opencode/skills/` and trigger by themselves from their description.\n\n",
    ),
    files[".config/opencode/command/build.md"],
  );
});
