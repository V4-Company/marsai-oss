import { repoUrl } from "./roots.js";

/**
 * LEGACY. The Codex rules file exactly as the 3.3.0 installer wrote it, in
 * Portuguese. Nothing writes this text any more: it exists only so that a file
 * 3.3.0 left behind is recognised as the installer's and replaced by the current
 * one, instead of being kept as somebody else's.
 *
 * 3.3.0 put no ownership marker in the file, so the only proof is the bytes:
 * the installer rebuilds what 3.3.0 would have written for the saved selection
 * and compares. From 3.4.0 on the file ends with the marker line and is
 * recognised by it, whatever its text.
 *
 * Do not edit the text: one changed byte and the old file is no longer recognised.
 */
export const LEGACY_RULES_VERSION = "3.3.0";

/**
 * @param {{ name: string, legacySkills: string[] }[]} plugins the saved selection, in the saved order
 * @param {{ owner: string|null, packageName: string|null, repo: string|null }} root the installer's own root
 */
export function legacyRules(plugins, root) {
  const docs = repoUrl(root);
  const lines = [
    `# MarsAI${root.owner ? ` (${root.owner})` : ""}`,
    "",
    `Versão ${LEGACY_RULES_VERSION} — instalado por \`npx ${root.packageName}\`.`,
    "",
    "Regras não-negociáveis do time V4:",
    "",
    "1. **Agents são executores, não decisores.** Verificam (não assumem), reportam bloqueadores e perguntam quando incertos.",
    "2. **ZERO THROW POLICY.** Exceções não tratadas e `process.exit()` são proibidos fora de handlers de topo. Use try/catch e retorne erros tipados.",
    "3. **Use uma skill quando ela se aplicar.** Verifique as skills MarsAI disponíveis antes de qualquer tarefa; 'tarefa simples' não é desculpa para pular.",
    "4. **Histórico linear — sem merge commits.** Integra com rebase + force-push (`git rebase <base>`, `git push --force-with-lease`), nunca `git merge`.",
    "",
    "Skills MarsAI instaladas em `~/.agents/skills/` (escopo USER do Codex):",
    "",
  ];
  for (const plugin of plugins)
    for (const name of plugin.legacySkills)
      lines.push(
        `- \`${plugin.name}:${name}\` — veja ~/.agents/skills/${name}/SKILL.md`,
      );
  lines.push("", ...(docs ? [`Docs completas: ${docs}`, ""] : []));
  return lines.join("\n");
}
