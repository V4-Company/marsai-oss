# MarsAI (Acme)

Versão 3.3.0 — instalado por `npx @acme/kit`.

Regras não-negociáveis do time V4:

1. **Agents são executores, não decisores.** Verificam (não assumem), reportam bloqueadores e perguntam quando incertos.
2. **ZERO THROW POLICY.** Exceções não tratadas e `process.exit()` são proibidos fora de handlers de topo. Use try/catch e retorne erros tipados.
3. **Use uma skill quando ela se aplicar.** Verifique as skills MarsAI disponíveis antes de qualquer tarefa; 'tarefa simples' não é desculpa para pular.
4. **Histórico linear — sem merge commits.** Integra com rebase + force-push (`git rebase <base>`, `git push --force-with-lease`), nunca `git merge`.

Skills MarsAI instaladas em `~/.agents/skills/` (escopo USER do Codex):

- `acme-core:guide` — veja ~/.agents/skills/guide/SKILL.md
- `acme-core:old-guide` — veja ~/.agents/skills/old-guide/SKILL.md
- `acme-dev:craft` — veja ~/.agents/skills/craft/SKILL.md

Docs completas: https://github.com/acme/kit
