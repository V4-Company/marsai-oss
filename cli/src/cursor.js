import fs from "node:fs";
import path from "node:path";
import { copyDir, isDir, isFile } from "./fs-utils.js";
import { t } from "./i18n.js";
import { claimDirectory, pruneDirectories, claimFile, pruneFiles } from "./ownership.js";

/**
 * Cursor supports the agentskills standard (Cursor 2.4+, agentskills.io) and
 * reads, globally:
 *
 *  - skills  -> ~/.cursor/skills/<name>/SKILL.md   + fallback ~/.agents/skills/ and ~/.claude/skills/
 *  - agents  -> ~/.cursor/agents/<name>.md         (name + description frontmatter; NO tools field)
 *  - commands -> legacy ~/.cursor/commands/, deprecated — the documented path is
 *    a skill with `disable-model-invocation: true` (exactly what Cursor's own
 *    /migrate-to-skills produces). So MarsAI commands ship as synthesized
 *    command-skills named marsai-<command>.
 *
 * Skills live in the shared standard dir ~/.agents/skills (same pipe as Codex —
 * Cursor reads it directly), avoiding duplicate skill IDs across the user dirs.
 *
 * `plugins` are catalog entries: the name and the folder of each plugin.
 */

const CURSOR_DIR = ".cursor";
const SHARED_SKILLS_DIR = path.join(".agents", "skills");
const AGENTS_SKILLS_DIR = path.join(".cursor", "agents");
const SKILLS_DIR = path.join(".cursor", "skills");
const COMMAND_SKILL_PREFIX = "marsai-";
const MARKER = "installed-by: marsai";

function readFrontmatterAndBody(file) {
  const raw = fs.readFileSync(file, "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: raw };
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return { fm, body: m[2] };
}

function frontmatterOf(pairs) {
  return ["---", ...pairs, "---", ""].join("\n");
}

function collect(pluginDir, kind) {
  const dir = path.join(pluginDir, kind);
  if (!isDir(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => {
      if (kind === "skills") return e.isDirectory() && isFile(path.join(dir, e.name, "SKILL.md"));
      return e.isFile() && e.name.endsWith(".md");
    })
    .map((e) => e.name);
}

export function cursorInstall(home, plugins) {
  const results = { skills: [], agents: [], commandSkills: [], skipped: [] };
  const sharedSkills = path.join(home, SHARED_SKILLS_DIR);
  fs.mkdirSync(path.join(home, SKILLS_DIR), { recursive: true });

  for (const { name: plugin, dir: pluginDir } of plugins) {

    // 1. Skills -> ~/.agents/skills/<name>/ (standard dir Cursor loads natively).
    for (const name of collect(pluginDir, "skills")) {
      const target = path.join(sharedSkills, name);
      if (!claimDirectory(home, target, "cursor", "skills", true)) {
        results.skipped.push(t("skip.skill", { name }));
        continue;
      }
      copyDir(path.join(pluginDir, "skills", name), target);
      results.skills.push(name);
    }

    // 2. Agents -> ~/.cursor/agents/<slug>.md, minimal frontmatter
    //    (Cursor has NO tools field — exactly name/description from Claude's).
    for (const name of collect(pluginDir, "agents")) {
      const slug = path.basename(name, ".md");
      const target = path.join(home, AGENTS_SKILLS_DIR, `${slug}.md`);
      if (!claimFile(home, target)) {
        results.skipped.push(t("skip.cursorAgent", { name: slug }));
        continue;
      }
      const { fm, body } = readFrontmatterAndBody(path.join(pluginDir, "agents", name));
      const lines = frontmatterOf([
        `name: ${slug}`,
        `description: ${fm.description || `MarsAI ${plugin} agent`}`,
        `model: inherit`,
      ]);
      fs.writeFileSync(target, lines + body.trimStart() + `\n\n${MARKER}\n`);
      results.agents.push(slug);
    }

    // 3. Commands -> synthesized command-skills
    //    (Cursor deprecated .cursor/commands; documented conversion is a skill
    //    with disable-model-invocation: true, invocable only via /name).
    for (const name of collect(pluginDir, "commands")) {
      const slug = COMMAND_SKILL_PREFIX + path.basename(name, ".md");
      const dir = path.join(home, SKILLS_DIR, slug);
      if (!claimDirectory(home, dir, "cursor", "commandSkills")) {
        results.skipped.push(t("skip.cursorCommand", { name, skill: slug }));
        continue;
      }
      const { fm, body } = readFrontmatterAndBody(path.join(pluginDir, "commands", name));
      const lines = frontmatterOf([
        `name: ${slug}`,
        `description: ${fm.description || `MarsAI ${plugin} command`}`,
        `disable-model-invocation: true`,
      ]);
      // Written into the app, so in English whatever the installer's language.
      const banner =
        `> **MarsAI adapter (Cursor):** this command came from the MarsAI marketplace for Claude Code. ` +
        `The namespace \`marsai-<plugin>:<agent>\` does not exist here: delegate to the equivalent subagent ` +
        `by name (for example \`backend-engineer-typescript\`). MarsAI skills are in ~/.agents/skills and ~/.cursor/skills.\n\n`;
      fs.writeFileSync(path.join(dir, "SKILL.md"), lines + banner + body.replace(/^\s+/, "") + `\n\n${MARKER}\n`);
      results.commandSkills.push(slug);
    }
  }

  pruneDirectories(home, sharedSkills, "cursor", "skills", results.skills, true);
  pruneDirectories(home, path.join(home, SKILLS_DIR), "cursor", "commandSkills", results.commandSkills);
  pruneFiles(home, path.join(home, AGENTS_SKILLS_DIR), results.agents.map((slug) => `${slug}.md`));
  return results;
}

export function cursorNames(plugins) {
  const names = { skills: [], agents: [], commandSkills: [] };
  for (const { name: plugin, dir: pluginDir } of plugins) {
    names.skills.push(...collect(pluginDir, "skills"));
    names.agents.push(...collect(pluginDir, "agents").map((n) => path.basename(n, ".md")));
    names.commandSkills.push(...collect(pluginDir, "commands").map((n) => COMMAND_SKILL_PREFIX + path.basename(n, ".md")));
  }
  return names;
}

export function cursorRemove(home) {
  return {
    skills: pruneDirectories(home, path.join(home, SHARED_SKILLS_DIR), "cursor", "skills", [], true),
    agents: pruneFiles(home, path.join(home, AGENTS_SKILLS_DIR)).map((name) => path.basename(name, ".md")),
    commandSkills: pruneDirectories(home, path.join(home, SKILLS_DIR), "cursor", "commandSkills"),
  };
}
