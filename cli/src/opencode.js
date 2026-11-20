import fs from "node:fs";
import path from "node:path";
import { copyDir, isDir, isFile } from "./fs-utils.js";
import { t } from "./i18n.js";
import { claimDirectory, pruneDirectories, claimFile, pruneFiles } from "./ownership.js";

const MARKER = "installed-by: marsai";

// Written into the app, so in English whatever the installer's language.
const ADAPTER_BANNER =
  "\n> **MarsAI adapter (OpenCode):** this command came from the MarsAI marketplace for Claude Code. " +
  "The namespace `marsai-<plugin>:<agent>` does not exist here: dispatch the equivalent agent by its file name in " +
  "`{AGENT_DIR}` (for example `backend-engineer-typescript`), through the task tool. " +
  "MarsAI skills are in `~/.config/opencode/skills/` and trigger by themselves from their description.\n\n";

/**
 * OpenCode has no plugin system, but loads:
 *
 *  - skills   -> ~/.config/opencode/skills/<name>/SKILL.md  (highest-priority global source)
 *  - agents   -> ~/.config/opencode/agent/<name>.md          (markdown agents, frontmatter-driven)
 *  - commands -> ~/.config/opencode/command/<name>.md        (slash commands)
 *
 * Frontmatter in Claude Code skills/agents/commands is a superset: OpenCode
 * ignores unknown keys. We only need to inject `mode: subagent` into agents.
 *
 * `plugins` are catalog entries: the name and the folder of each plugin.
 */

const OPENCODE_DIR = path.join(".config", "opencode");

function base(home, kind) {
  // kind: "skills" | "agent" | "command"
  return path.join(home, OPENCODE_DIR, kind);
}

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

function markFile(file) {
  fs.appendFileSync(file, `\n${MARKER}\n`);
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

export function opencodeInstall(home, plugins) {
  const results = { skills: [], agents: [], commands: [], skipped: [] };

  for (const { name: plugin, dir: pluginDir } of plugins) {

    // Skills: copy folder as-is (frontmatter keys are compatible).
    for (const name of collect(pluginDir, "skills")) {
      const target = path.join(base(home, "skills"), name);
      if (!claimDirectory(home, target, "opencode")) {
        results.skipped.push(t("skip.skill", { name }));
        continue;
      }
      copyDir(path.join(pluginDir, "skills", name), target);
      results.skills.push(name);
    }

    // Agents: copy + inject `mode: subagent`.
    for (const name of collect(pluginDir, "agents")) {
      const target = path.join(base(home, "agent"), name);
      if (!claimFile(home, target)) {
        results.skipped.push(t("skip.agent", { name }));
        continue;
      }
      const { fm, body } = readFrontmatterAndBody(path.join(pluginDir, "agents", name));
      const lines = ["---", `description: ${fm.description || `MarsAI ${plugin} agent`}`];
      // OpenCode expects "provider/model" (ex.: anthropic/claude-sonnet-4). Claude
      // aliases like "opus"/"sonnet"/"inherit" would break agent loading — drop them.
      if (fm.model && fm.model.includes("/")) lines.push(`model: ${fm.model}`);
      lines.push("mode: subagent", "---", "");
      fs.writeFileSync(target, lines.join("\n") + body.trimStart());
      markFile(target);
      results.agents.push(name);
    }

    // Commands: keep description frontmatter, add adapter banner to the template.
    // Claude command bodies dispatch via `subagent_type marsai-<plugin>:<name>`,
    // which does not exist in OpenCode — agents live as bare file names here.
    for (const name of collect(pluginDir, "commands")) {
      const target = path.join(base(home, "command"), name);
      if (!claimFile(home, target)) {
        results.skipped.push(t("skip.command", { name }));
        continue;
      }
      const { fm, body } = readFrontmatterAndBody(path.join(pluginDir, "commands", name));
      const banner = ADAPTER_BANNER.replace(/\{AGENT_DIR\}/g, base(home, "agent"));
      const lines = ["---", `description: ${fm.description || `MarsAI ${plugin} command`}`, "---", ""];
      fs.writeFileSync(target, lines.join("\n") + banner + body.replace(/^\s+/, "") + `\n\n${MARKER}\n`);
      results.commands.push(name);
    }
  }

  pruneDirectories(home, base(home, "skills"), "opencode", "skills", results.skills);
  pruneFiles(home, base(home, "agent"), results.agents);
  pruneFiles(home, base(home, "command"), results.commands);
  return results;
}

export function opencodeNames(plugins) {
  const names = { skills: [], agents: [], commands: [] };
  for (const { name: plugin, dir: pluginDir } of plugins) {
    names.skills.push(...collect(pluginDir, "skills"));
    names.agents.push(...collect(pluginDir, "agents"));
    names.commands.push(...collect(pluginDir, "commands"));
  }
  return names;
}

export function opencodeRemove(home) {
  return {
    skills: pruneDirectories(home, base(home, "skills"), "opencode", "skills"),
    agents: pruneFiles(home, base(home, "agent")),
    commands: pruneFiles(home, base(home, "command")),
  };
}
