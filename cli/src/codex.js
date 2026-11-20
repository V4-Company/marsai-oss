import fs from "node:fs";
import path from "node:path";
import { copyDir, isDir, isFile } from "./fs-utils.js";
import { t } from "./i18n.js";
import { LEGACY_RULES_VERSION, legacyRules } from "./legacy-rules.js";
import { repoUrl } from "./roots.js";
import { readState } from "./state.js";
import { claimDirectory, pruneDirectories, claimFile, ownedFile } from "./ownership.js";

/**
 * Codex has no plugin marketplace. We map MarsAI to Codex's native surfaces:
 *
 *  - skills  -> ~/.agents/skills/<name>/SKILL.md   (Codex USER skill scope)
 *  - rules   -> ~/.codex/marsai-AGENTS.md, referenced by @import from
 *             ~/.codex/AGENTS.md (global instruction chain)
 *
 * Codex reads `$HOME/.agents/skills` (USER scope) and `~/.codex/AGENTS.md`
 * (global). We do NOT touch agents/commands: Codex has no Task-tool dispatcher
 * and no slash-command registry compatible with Claude Code frontmatter.
 *
 * `plugins` are catalog entries (name, dir, version, legacySkills), in install
 * order: a plugin comes after the ones it depends on.
 */

const CODEX_DIR = ".codex";
const AGENTS_SKILLS_DIR = path.join(".agents", "skills");
const RULES_FILE = "marsai-AGENTS.md";
const IMPORT_LINE = '@import "./marsai-AGENTS.md"';
const SENTINEL_START = "<!-- marsai:start -->";
const SENTINEL_END = "<!-- marsai:end -->";
const MARKER = "installed-by: marsai";

function codexHome(home) {
  return path.join(home, CODEX_DIR);
}

function skillsHome(home) {
  return path.join(home, AGENTS_SKILLS_DIR);
}

function collectSkillDirs(pluginDir) {
  const skillsDir = path.join(pluginDir, "skills");
  if (!isDir(skillsDir)) return [];
  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && isFile(path.join(skillsDir, e.name, "SKILL.md")))
    .map((e) => path.join(skillsDir, e.name));
}

const packagedSkills = (plugin) => collectSkillDirs(plugin.dir).map((dir) => path.basename(dir));

/**
 * The rules file the installer writes into Codex. It is written in English and
 * does not follow `--lang`: it is read by the agent, which talks to the person
 * in the person's language anyway. `root` is the installer's own root and
 * `installedSkills` the skills that were really copied.
 */
function buildRules(plugins, { root, version, installedSkills }) {
  const docs = repoUrl(root);
  const lines = [
    `# MarsAI${root.owner ? ` (${root.owner})` : ""}`,
    "",
    `Version ${version} - installed by the MarsAI installer.`,
    "",
    ...(plugins.every((plugin) => plugin.optional) ? [] : [
      "How this flow works:",
      "",
      "1. Production code changes go through `marsai-dev:implement-spec` (a spec with slices) or `marsai-dev:implement` (a single slice): implementer first, then review.",
      "2. The map of the flow is the `using-marsai` skill. Read it when the person asks where to start, which skill to use or what the next step is.",
      "3. History stays linear: integrate with `git rebase <base>` and `git push --force-with-lease`, not with `git merge`.",
      "4. Talk to the person in their language. Write specs, tickets, pull requests and commits in the language the repository already uses.",
      "",
    ]),
    "MarsAI skills installed in `~/.agents/skills/` (Codex USER scope):",
    "",
  ];
  for (const plugin of plugins) {
    for (const name of packagedSkills(plugin)) {
      if (!installedSkills.includes(name)) continue;
      lines.push(`- \`${plugin.name}:${name}\`: see ~/.agents/skills/${name}/SKILL.md`);
    }
  }
  lines.push("", ...(docs ? [`Full docs: ${docs}`, ""] : []));
  return lines.join("\n");
}

/** Skills dirs across the selected plugins, deduped by skill name (the first plugin wins). */
function skillDirsFor(plugins) {
  const byName = new Map();
  for (const plugin of plugins) {
    for (const dir of collectSkillDirs(plugin.dir)) {
      const name = path.basename(dir);
      if (!byName.has(name)) byName.set(name, { plugin: plugin.name, dir });
    }
  }
  return [...byName.values()];
}

/**
 * The bytes 3.3.0 wrote for the saved selection, or undefined when they cannot be
 * known. A rules file with exactly these bytes is the installer's, although it
 * has no marker; see legacy-rules.js.
 */
function legacyRulesOwned(home, catalog) {
  const saved = readState(home).targets.find((entry) => entry.target === "codex");
  if (saved?.version !== LEGACY_RULES_VERSION || !saved.rules?.includes(RULES_FILE) || !Array.isArray(saved.plugins)) return undefined;
  const plugins = saved.plugins.map((name) => catalog.plugins.get(name));
  if (!plugins.every((plugin) => Array.isArray(plugin?.legacySkills))) return undefined;
  return legacyRules(plugins, catalog.roots[0]);
}

export function codexInstall(home, plugins, catalog) {
  const results = { skills: [], rules: [], skipped: [] };

  // 1. Skills -> ~/.agents/skills/<name>/
  const skillsHomeDir = skillsHome(home);
  for (const { dir } of skillDirsFor(plugins)) {
    const name = path.basename(dir);
    const destination = path.join(skillsHomeDir, name);
    if (!claimDirectory(home, destination, "codex", "skills", true)) {
      results.skipped.push(t("skip.skill", { name }));
      continue;
    }
    copyDir(dir, destination);
    results.skills.push(name);
  }

  pruneDirectories(home, skillsHomeDir, "codex", "skills", results.skills, true);

  // 2. Rules -> ~/.codex/marsai-AGENTS.md + @import from ~/.codex/AGENTS.md
  const rulesFile = path.join(codexHome(home), RULES_FILE);
  if (!claimFile(home, rulesFile, legacyRulesOwned(home, catalog))) {
    results.skipped.push(t("skip.rules", { name: RULES_FILE }));
    return results;
  }
  const root = catalog.roots[0];
  const rules = buildRules(plugins, {
    root,
    version: plugins[0]?.version ?? root.version,
    installedSkills: results.skills,
  });
  fs.writeFileSync(rulesFile, rules + `\n${MARKER}\n`);

  const globalAgents = path.join(codexHome(home), "AGENTS.md");
  let content = "";
  if (isFile(globalAgents)) content = fs.readFileSync(globalAgents, "utf8");
  if (!content.includes(IMPORT_LINE)) {
    const block = `${SENTINEL_START}\n${IMPORT_LINE}\n${SENTINEL_END}\n`;
    content = content ? `${content.replace(/\s*$/, "\n\n")}${block}` : block;
    fs.writeFileSync(globalAgents, content);
  }
  results.rules.push(RULES_FILE);

  return results;
}

export function codexSkillNames(plugins) {
  return skillDirsFor(plugins).map((s) => path.basename(s.dir));
}

export function codexRemove(home) {
  const skills = pruneDirectories(home, skillsHome(home), "codex", "skills", [], true);
  const rulesFile = path.join(codexHome(home), RULES_FILE);
  const rules = [];
  if (ownedFile(home, rulesFile)) {
    fs.rmSync(rulesFile);
    rules.push(RULES_FILE);
  }

  const globalAgents = path.join(codexHome(home), "AGENTS.md");
  if (isFile(globalAgents)) {
    const content = fs.readFileSync(globalAgents, "utf8");
    const block = `${SENTINEL_START}\n${IMPORT_LINE}\n${SENTINEL_END}\n`;
    if (content.includes(block)) {
      const cleaned = content.replace(block, "").replace(/\n{3,}$/, "\n");
      fs.writeFileSync(globalAgents, cleaned.endsWith("\n") ? cleaned : `${cleaned}\n`);
    }
  }
  return { removedSkills: skills, removedRules: rules };
}
