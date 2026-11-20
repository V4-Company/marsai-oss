/**
 * Installer texts in Brazilian Portuguese. `en.js` has the same keys.
 * A text is a string, or a function of the values it shows.
 */
const KINDS = {
  skills: ["skill", "skills"],
  agents: ["agente", "agentes"],
  commands: ["comando", "comandos"],
  commandSkills: ["comando", "comandos"],
  rules: ["arquivo de regras", "arquivos de regras"],
};

export default {
  // Shared
  "yes.no": "[Sim/Não]",
  warning: ({ text }) => `aviso: ${text}`,
  "lang.invalid": ({ value, valid }) =>
    `idioma desconhecido: ${value}. Válidos: ${valid}`,

  // Channel
  "channel.invalid": ({ label, value, valid }) =>
    `${label} inválido: ${value}. Válidos: ${valid}`,

  // Roots
  "roots.notRoot": ({ dir }) =>
    `${dir} não é uma raiz MarsAI: precisa de .claude-plugin/marketplace.json com "name" e da pasta plugins/.`,
  "roots.extra": "raiz extra",
  "roots.sameMarketplace": ({ dir, name, other }) =>
    `${dir} usa o nome de marketplace '${name}', que já é de ${other}. Cada raiz precisa de um nome próprio em .claude-plugin/marketplace.json.`,

  // Catalog
  "catalog.schemaVersion": "schemaVersion deve ser 1",
  "catalog.optional": "optional deve ser um booleano",
  "catalog.targets": ({ targets }) =>
    `targets deve listar ao menos um de: ${targets}`,
  "catalog.group":
    "group precisa de id em kebab-case; aliases, quando houver, são nomes em kebab-case; label e description são textos",
  "catalog.legacySkills": "legacySkills deve ser uma lista de nomes de skill",
  "catalog.invalidJson": "JSON inválido",
  "catalog.noManifest": ({ name, file }) =>
    `${name}: sem ${file}; o instalador não distribui este plugin.`,
  "catalog.badManifest": ({ name, file, problem }) =>
    `${name}: ${file} inválido (${problem}); plugin ignorado.`,
  "catalog.badName": ({ name }) =>
    `${name}: nome de plugin inválido; plugin ignorado.`,
  "catalog.duplicate": ({ name, first, second }) =>
    `${name}: já existe em ${first}; a cópia em ${second} foi ignorada.`,

  // Content the copy targets could not place
  "skip.skill": ({ name }) => `skill ${name} (já existe e não é do MarsAI)`,
  "skip.rules": ({ name }) => `rules ${name} (já existe e não é do MarsAI)`,
  "skip.agent": ({ name }) => `agent ${name} (já existe e não é do MarsAI)`,
  "skip.command": ({ name }) =>
    `command ${name} (já existe e não é do MarsAI)`,
  "skip.cursorAgent": ({ name }) => `agent ${name} (já existe)`,
  "skip.cursorCommand": ({ name, skill }) =>
    `command ${name} (skill ${skill} já existe)`,

  // MCP configuration
  "mcp.badPluginName": "Nome de plugin inválido no manifest MCP.",
  "mcp.badManifest": "Manifest MCP inválido.",
  "mcp.badDependency": "Dependência MCP inválida ou provider não suportado.",
  "mcp.unreadableManifest":
    "Não foi possível ler o manifest MCP; nenhum segredo foi registrado.",
  "mcp.badTarget": "Target MCP não suportado.",
  "mcp.badConfig": "Configuração MCP inválida ou ambígua; arquivo preservado.",
  "mcp.unreadableConfig":
    "Não foi possível ler a configuração MCP; arquivo preservado.",
  "mcp.badUrlRules":
    "URL MCP inválida: use HTTPS sem credenciais, query ou fragmento; HTTP somente localhost.",
  "mcp.badUrl": "URL MCP inválida.",
  "mcp.auth.command": ({ command }) => `Autentique no cliente: ${command}.`,
  "mcp.auth.claude": "Abra /mcp no Claude Code e autentique o servidor.",
  "mcp.auth.cursor":
    "Abra Settings > Tools & MCP no Cursor e autentique o servidor.",
  "mcp.symlinkAdd":
    "Configuração é um link simbólico; preservada. Adicione o servidor pelo cliente.",
  "mcp.symlink": "Configuração é um link simbólico; preservada.",
  "mcp.changed": "Configuração mudou durante a instalação; tente novamente.",
  "mcp.unsupported": "Dependência MCP não suportada.",
  "mcp.skipped": "MCP ignorado por --mcp skip.",
  "mcp.existingKept":
    "Configuração existente preservada; conexão ainda não verificada.",
  "mcp.existingInvalid":
    "Entrada existente inválida ou desabilitada; preservada para revisão.",
  "mcp.giveUrl": ({ id }) => `Informe --${id}-url <URL-da-instância>.`,
  "mcp.dryRunAdd": "Dry run: adicionaria MCP oficial.",
  "mcp.added": "MCP oficial configurado; autenticação e conexão pendentes.",
  "mcp.addFailed":
    "Não foi possível adicionar MCP com segurança; configuração existente preservada.",
  "mcp.probe.stdio":
    "Servidor stdio preservado; valide no cliente. Doctor não executa comandos locais existentes.",
  "mcp.probe.insecure": "Endpoint existente não é HTTP seguro para verificação.",
  "mcp.probe.needsHttps": "Doctor exige HTTPS ou localhost.",
  "mcp.probe.auth":
    "Endpoint exige autenticação. Doctor não acessa tokens OAuth privados do cliente.",
  "mcp.probe.badInitialize": "initialize inválido ou MCP sem capability tools.",
  "mcp.probe.sessionAuth": "Sessão exige autenticação.",
  "mcp.probe.notification": "MCP não aceitou a notificação initialized.",
  "mcp.probe.listAuth": "tools/list exige autenticação.",
  "mcp.probe.badList": "tools/list inválido ou sem ferramentas autorizadas.",
  "mcp.probe.verified":
    "initialize + tools/list verificados nesta execução; nenhum tool/SQL foi executado. Permissões de consulta/escrita não testadas.",
  "mcp.probe.network":
    "Falha de rede, timeout ou resposta MCP inválida; conexão não verificada.",
  "mcp.remove.preexisting": "Conexão preexistente ou sem ownership: preservada.",
  "mcp.remove.gone": "Entrada gerenciada já ausente.",
  "mcp.remove.edited":
    "Conexão editada após a instalação: preservada com suas credenciais.",
  "mcp.remove.reformatted": "Bloco TOML foi reformatado ou editado: preservado.",
  "mcp.remove.removed":
    "Conexão criada pelo MarsAI removida. Credenciais privadas do cliente não foram acessadas.",
  "mcp.remove.failed":
    "Não foi possível remover a entrada MCP com segurança; configuração preservada.",
  "mcp.loginUnavailable":
    "Configuração MCP ausente, inválida ou desabilitada; login não iniciado.",

  // Login through the client app
  "login.cancelled":
    "Entrada encerrada. Instalação cancelada antes de alterar arquivos.",
  "login.answer": "Responda Sim ou Não.",
  "login.notOnUpdate": "Atualização automática não inicia login.",
  "login.askContact": ({ contact }) => `Peça acesso para ${contact}.`,
  "login.askAdmin": "Peça acesso a quem administra o serviço.",
  "login.isolated": "Login não realizado neste teste.",
  "login.unknown": ({ id }) =>
    `Acesso não informado. Use --${id}-access yes para iniciar o login ou no para pedir acesso.`,
  "login.notConfigured":
    "Login não iniciado: conclua a configuração MCP primeiro.",
  "login.cursor": ({ name }) =>
    `Abra Settings > Tools & MCP no Cursor e autentique o ${name}.`,
  "login.clientMissing": ({ target }) =>
    `CLI ${target} não encontrado. Instale o aplicativo para continuar o login.`,
  "login.claude": ({ name }) =>
    `Abra /mcp no Claude Code e escolha Autenticar para o ${name}.`,
  "login.success":
    "Login concluído pelo aplicativo. Permissões de consulta não verificadas.",
  "login.failed": ({ code }) =>
    `O login não foi concluído pelo aplicativo${code === undefined ? "" : ` (código ${code})`}. Tente novamente no cliente.`,

  // Summary of an install
  "present.count": ({ kind, n }) => `${n} ${KINDS[kind][n === 1 ? 0 : 1]}`,
  "present.installed": ({ parts }) => `✓ ${parts} instalados`,
  "present.nothing": "Nenhum conteúdo novo instalado.",
  "present.optional": " (opcional)",
  "present.loginDone": "✓ Login concluído pelo aplicativo.",
  "present.permissions": "Permissões de consulta não verificadas.",
  "present.unverified": ({ message }) =>
    `Verificação sem credenciais do cliente: ${message}`,
  "present.accessPending": ({ name }) => `! Acesso ao ${name} pendente.`,
  "present.state.verified": "✓ Conexão verificada; ferramentas disponíveis.",
  "present.state.auth-pending": "! MCP configurado; login pendente.",
  "present.state.configured":
    "! MCP configurado; conexão ainda não verificada.",
  "present.state.missing": "! MCP não configurado.",
  "present.state.missingDryRun":
    "Adicionar configuração MCP. Login será necessário.",
  "present.state.error":
    "✗ Não foi possível concluir a configuração ou verificação.",
  "present.state.skipped": "Configuração ignorada por --mcp skip.",
  "present.state.unknown": "Estado não reconhecido; consulte status.",
  "present.nextStep": "Próximo passo:",
  "present.action.claude": "Abra /mcp no Claude Code e escolha Autenticar.",
  "present.action.cursor":
    "Abra Settings > Tools & MCP no Cursor e autentique.",
  "present.action.other": "Abra a integração no aplicativo e faça login.",
  "present.autoUpdate": ({ status }) =>
    `Atualização automática: ${
      {
        enabled: "ativada, diariamente",
        prepared: "preparada, não ativada",
        disabled: "desativada",
        unsupported: "indisponível neste sistema",
        missing: "tarefa não encontrada",
        error: "falha ao configurar",
        "dry-run": "simulação, nenhuma alteração",
      }[status] || "não configurada"
    }.`,

  // Claude Code marketplace
  "claude.settings.unreadable": "não foi possível ler JSON válido",
  "claude.settings.noEntry": ({ name }) =>
    `extraKnownMarketplaces.${name} ausente`,
  "claude.settings.writeFailed": "falha ao gravar",
  "claude.settings.warn": ({ why, file, name, enabled }) =>
    `aviso: ${why} em ${file}; autoUpdate do marketplace '${name}' não foi ${enabled ? "ativado" : "desativado"} (ajuste em /plugin > Marketplaces)`,
  "claude.addFailed": ({ output }) => `marketplace add falhou:\n${output}`,
  "claude.updateAfterAddFailed": ({ name, output }) =>
    `marketplace '${name}' já existia e o update falhou:\n${output}`,
  "claude.ref.tag": ({ ref }) => `tag ${ref}`,
  "claude.github.following": ({ name, repo }) =>
    `marketplace '${name}' via GitHub ${repo}; o Claude atualiza ao iniciar`,
  "claude.github.pinned": ({ name, repo, ref }) =>
    `marketplace '${name}' via GitHub ${repo}, fixo na ${ref}; o Claude não atualiza sozinho`,
  "claude.recovery.removed": ({ name, plugins }) =>
    `marketplace '${name}' foi removido e não pôde ser registrado de novo. Plugins que estavam instalados: ${plugins || "nenhum"}.`,
  "claude.recovery.how": "Para recuperar, com acesso ao GitHub:",
  "claude.local": ({ why, name, version, pinned }) =>
    `${why}: marketplace '${name}' via checkout local embutido${version ? ` da versão ${version}` : ""}. ${pinned ? "Fica nessa versão até o próximo `marsai update`." : "Atualizações chegam pela atualização agendada, não ao abrir o Claude."}`,
  "claude.noRepository": "sem repositório GitHub declarado",
  "claude.noAccess": ({ repo }) => `sem acesso ao GitHub ${repo}`,
  "claude.noAccessKept": ({ repo }) =>
    `sem acesso ao GitHub ${repo} agora; marketplace GitHub mantido (sem voltar para checkout local)`,
  "claude.staysAt": ({ current, wanted }) =>
    `marketplace continua na ${current}; rode \`marsai update\` com acesso para ir para a ${wanted}`,
  "claude.updateFailed": ({ name, output }) =>
    `marketplace '${name}' update falhou:\n${output}`,
  "claude.tagMissing": ({ ref }) => `tag ${ref} ainda não publicada`,
  "claude.pinStays": ({ why, current }) =>
    `${why}; o pin continua em ${current}`,
  "claude.removeFailed": ({ name, source, wanted, output }) =>
    `marketplace '${name}' (${source}) não pôde ser removido para ir à ${wanted} do GitHub:\n${output}`,
  "claude.githubAddFailed": ({ wanted, output }) =>
    `marketplace add GitHub na ${wanted} falhou (${output})`,
  "claude.restored": ({ why }) => `${why}; marketplace anterior restaurado`,
  "claude.installFailed": ({ output }) => `plugin install falhou:\n${output}`,
  "claude.updated": ({ plugin }) =>
    `${plugin} já estava. atualizado para a última versão`,
  "claude.pluginUpdateFailed": ({ plugin, output }) =>
    `${plugin} já estava e o update falhou:\n${output}`,
  "claude.installed": ({ plugin }) =>
    `${plugin} instalado via marketplace nativo`,
  "claude.uninstalled": ({ plugin }) => `${plugin} removido`,
  "claude.notInstalled": ({ plugin }) => `${plugin} não estava instalado`,
  "claude.uninstallFailed": ({ output }) => `uninstall falhou:\n${output}`,

  // Daily update
  "auto.unsupported": "Atualização automática indisponível neste sistema.",
  "auto.dryRun": ({ enabled }) =>
    `Atualização automática: ${enabled ? "preparar tarefa diária" : "desativar"}`,
  "auto.disableFailed":
    "Não foi possível desativar a tarefa; arquivos preservados.",
  "auto.disabled": "Atualização automática desativada.",
  "auto.disabledLater":
    "Atualização automática desativada; a tarefa já carregada sai no próximo login.",
  "auto.noRepository":
    "Atualização automática indisponível: o pacote não declara um repositório GitHub em package.json.",
  "auto.preparedIsolated":
    "Tarefa preparada; ativação de serviços desabilitada nesta execução.",
  "auto.noNpx":
    "npx não encontrado junto ao Node. Tarefa preparada, não ativada.",
  "auto.enabled":
    "Atualização diária ativada; execução depende de npm, Git e acesso ao GitHub.",
  "auto.activationFailed":
    "Tarefa preparada, ativação falhou. Consulte status.",

  // Wizard
  "wizard.needsTerminal": ({ group, plugin }) =>
    `O assistente precisa de terminal interativo. Use install --target codex ${group ? `--group ${group} --yes (ou --plugin ${plugin})` : `--plugin ${plugin} --yes`}.`,
  "wizard.choose": ({ prompt, options, defaults }) =>
    `\n${prompt}\n\n${options}\n\nEscolha números separados por vírgula${defaults ? ` [${defaults}]` : ""}: `,
  "wizard.invalid": "Seleção inválida. Escolha ao menos uma opção da lista.",
  "wizard.banner": ({ owner }) =>
    `\nMarsAI${owner ? ` | ${owner}` : ""}\nSkills, agentes e comandos para seu assistente de IA.\nBase MarsAI obrigatória: orquestração, revisão e Git.\n\n`,
  "wizard.where": "Onde instalar?",
  "wizard.detected": " (detectado)",
  "wizard.groups": "Quais grupos você quer?",
  "wizard.existing": ({ name }) =>
    `\n${name}\nConexão existente detectada. A configuração será preservada.\n`,
  "wizard.new": ({ name, url }) =>
    `\n${name}\n${url ? `${url}\n` : ""}O login será feito no aplicativo escolhido.\nConexões existentes serão preservadas.\n`,
  "wizard.cancelled": "Instalação cancelada.",
  "wizard.autoUpdate":
    "\nAtualizações automáticas\n\nBusca atualizações no GitHub uma vez por dia e mantém suas escolhas.\nRequer Node, npm, Git e conexão com a internet.\n\n",
  "wizard.autoUpdateQuestion": "Ativar atualização diária? [s/N]: ",

  // Command line
  "cli.stableAutoUpdate":
    "Atualização diária não se aplica ao canal stable; use brew upgrade marsai && marsai update.",
  "cli.usage.access": ({ id }) =>
    `  --${id}-access <yes|no> informa acesso; yes inicia login no aplicativo`,
  "cli.usage.url": ({ id, url }) =>
    `  --${id}-url <url> sobrescreve a URL${url ? ` padrão (${url})` : ""} para novas conexões`,
  "cli.usage": ({ run, owner, groups, mcpFlags, plugins, targets, list }) =>
    `
MarsAI installer | marketplace de plugins${owner ? ` da ${owner}` : ""} para Claude Code, Codex, Cursor e OpenCode.

Uso:
  ${run}             abre o assistente de seleção
  ${run} install [opções]    instala escolhas explícitas; sem seleção abre assistente
  ${run} update [opções]     reaplica a versão em execução preservando escolhas
  ${run} migrate [opções]    traz para este instalador o que um instalador anterior deixou nesta máquina
  ${run} doctor   verifica conexão MCP sem guardar credenciais
  ${run} status              mostra o que está instalado e onde
  ${run} remove              remove tudo que o instalador colocou

Opções:
  --group <name>      ${groups || "nenhum grupo declarado"}; repetível
  --auto-update       agenda atualização diária (opt-in)
  --no-auto-update    desativa atualização diária
  --channel <name>    stable (fixo na tag v<versão>) | main (segue a main); padrão: MARSAI_CHANNEL, depois o salvo, depois main
  --mcp <auto|skip>    configura dependências MCP (padrão auto)
${[
  ...mcpFlags,
  "  --mcp-access <id>=<yes|no> o mesmo que --<id>-access, para qualquer MCP",
  "  --mcp-url <id>=<url> o mesmo que --<id>-url, para qualquer MCP",
].join("\n")}
  --plugin <name>     só este plugin (${plugins}); repetível
  --target <name>     só este target (${targets}); repetível
  --home <dir>        escreve em outro home (padrão: $HOME; sobrescreve MARSAI_HOME)
  --lang <en|pt-BR>   idioma das mensagens (padrão: MARSAI_LANG, depois o do sistema, depois en)
  --yes               não pergunta nada (aceita prompts)
  --dry-run           mostra o que faria, sem escrever nada
  --version           versão do instalador
  --help              esta ajuda

Plugins:
${list}
`.trim(),
  "cli.yesNo": ({ flag }) => `${flag} deve ser yes ou no`,
  "cli.pairAccess": ({ flag, id }) =>
    `${flag} ${id}=<valor>: o valor deve ser yes ou no`,
  "cli.pair": ({ flag, known }) =>
    `${flag} espera <id>=<valor>. MCPs conhecidos: ${known || "nenhum"}`,
  "cli.valueRequired": ({ flag }) => `Valor obrigatório para ${flag}`,
  "cli.unknownFlag": ({ flag }) => `flag desconhecida: ${flag}`,
  "cli.unknownGroup": ({ group, valid }) =>
    `grupo desconhecido: ${group}. Válidos: ${valid || "nenhum"}`,
  "cli.mcpMode": "--mcp deve ser auto ou skip",
  "cli.unknownPlugin": ({ plugin, valid }) =>
    `plugin desconhecido: ${plugin}. Válidos: ${valid}`,
  "cli.unknownTarget": ({ target, valid }) =>
    `target desconhecido: ${target}. Válidos: ${valid}`,
  "cli.oneCommand": "Use somente um comando por execução.",
  "cli.noTarget":
    "Nenhum target detectado (claude, ~/.codex, ~/.cursor, ~/.config/opencode). Use --target para forçar.",
  "cli.unsupportedTarget": ({ target }) => `target não suportado: ${target}`,
  "cli.claude.missing": ({ manual }) =>
    `~/.claude existe mas o CLI 'claude' não está no PATH. marketplace nativo não pode ser configurado automaticamente. Instale o Claude CLI${manual ? ` ou rode: ${manual}` : ""}`,
  "cli.claude.planLocal": ({ checkout, plugins }) =>
    `checkout local ${checkout} + install ${plugins}`,
  "cli.claude.planPinned": ({ repo, ref }) =>
    `marketplace GitHub ${repo}#${ref} (sem auto-update do Claude)`,
  "cli.claude.planFollowing": ({ repo }) =>
    `marketplace GitHub ${repo} (auto-update ao abrir o Claude)`,
  "cli.claude.planEither": ({ github, local }) =>
    `${github} se houver acesso, senão ${local}`,
  "cli.claude.moved": ({ plugin, before, now }) =>
    `${plugin} passou do marketplace '${before}' para '${now}'`,
  "cli.claude.movedKept": ({ plugin, before, now }) =>
    `${plugin} agora vem do marketplace '${now}', mas a cópia de '${before}' não pôde ser removida: rode claude plugin uninstall ${plugin}@${before}`,
  "cli.claude.notCarried": ({ plugins, name }) =>
    `${plugins}: instalado pelo marketplace '${name}' como estava registrado antes e não distribuído por este; não reinstalado.`,
  "cli.plan.codex": ({ plugins }) =>
    `skills -> ~/.agents/skills/, regras -> ~/.codex/marsai-AGENTS.md (${plugins})`,
  "cli.plan.cursor": ({ plugins }) =>
    `skills -> ~/.agents/skills/, agents -> ~/.cursor/agents/, commands -> skills \`marsai-*\` em ~/.cursor/skills/ (${plugins})`,
  "cli.plan.opencode": ({ plugins }) =>
    `skills/agents/commands -> ~/.config/opencode/ (${plugins})`,
  "cli.summary.rules": ({ list }) => `regras: ${list}`,
  "cli.summary.skipped": ({ list }) => `ignorados (já existiam): ${list}`,
  "cli.summary.nothing": "nada a instalar",
  "cli.notDistributed": ({ plugins, app }) =>
    `${plugins}: não distribuído para ${app}; ignorado.`,
  "cli.install.title": ({ version }) => `\nMarsAI · Instalação · v${version}`,
  "cli.testMode": "Modo de teste: instalação em uma pasta alternativa.",
  "cli.baseIncluded": "Base MarsAI incluída nas escolhas.",
  "cli.simulation": "\nSimulação: nenhuma alteração será feita.",
  "cli.wouldInstall": ({ n }) => `Instalar ${n} pacotes selecionados.`,
  "cli.pluginsInstalled": ({ n }) => `✓ ${n} plugins instalados`,
  "cli.skippedItems": ({ n }) =>
    `  ! ${n} itens ignorados para preservar conteúdo existente.\n    Consulte status para detalhes.`,
  "cli.installFailed": ({ targets }) =>
    `Falha ao instalar: ${targets}. Targets com erro não foram registrados como sucesso.`,
  "cli.install.done":
    "\nInstalação concluída. Pendências de integração estão indicadas acima.",
  "cli.install.untouched":
    "Nenhuma configuração da instalação principal foi alterada.",
  "cli.install.newSession":
    "Abra uma nova sessão do aplicativo para carregar o conteúdo.",
  "cli.install.more":
    "Detalhes: status  •  Verificar conexões novamente: doctor\n",
  "cli.startingLogin": ({ name }) =>
    `  Iniciando o login do ${name} no aplicativo...`,
  "cli.stable.wouldDisable":
    "Atualização automática: a atualização diária ativa seria desligada; ela não se aplica ao canal stable.",
  "cli.stable.disableFailed": ({ message }) =>
    `aviso: não foi possível desligar a atualização diária, que não se aplica ao canal stable. ${message}`,
  "cli.stable.disabled":
    "aviso: atualização diária desligada; ela não se aplica ao canal stable. Use brew upgrade marsai && marsai update.",
  "cli.stable.scheduledIgnored":
    "Execução agendada ignorada: no canal stable a atualização vem do brew (brew upgrade marsai && marsai update).",
  "cli.stable.fromState": ({ file, ref }) =>
    `aviso: canal stable gravado no estado (${file}); no brew, atualize com \`brew upgrade marsai && marsai update\`; para voltar ao main, use \`--channel main\`. Este instalador fixa o Claude Code na ${ref}.`,
  "cli.update.nothing":
    "Nada instalado ainda por este instalador. Rode `install` primeiro.",
  "cli.update.unknownTarget": ({ target }) =>
    `Target ${target} não registrado. Use install primeiro.`,
  "cli.update.unavailable": ({ app, plugins }) =>
    `A seleção salva de ${app} inclui plugins que este instalador não distribui: ${plugins}. Nada foi alterado. Rode o instalador que distribui esses plugins, ou refaça a seleção com \`install\`.`,
  "cli.update.title": ({ version }) => `\nMarsAI · Atualização · v${version}`,
  "cli.update.reapplying": "Reaplicando esta versão às escolhas salvas.",
  "cli.update.simulated":
    "\nSimulação concluída. Nenhuma alteração foi feita.\n",
  "cli.update.done":
    "\nAtualização concluída. Pendências de integração estão indicadas acima.\n",
  "cli.migrate.title": ({ version }) => `\nMarsAI · Migração · v${version}`,
  "cli.migrate.intro": ({ source }) =>
    `Traz o que um instalador anterior do MarsAI deixou em cada aplicativo para esta versão${source ? `, de ${source}` : ""}.`,
  "cli.migrate.plan": "\nPlano",
  "cli.migrate.report": "\nRelatório",
  "cli.migrate.had": ({ plugins }) => `tinha: ${plugins}`,
  "cli.migrate.hadNothing": "tinha: nada registrado",
  "cli.migrate.willHave": ({ plugins }) => `vai ter: ${plugins}`,
  "cli.migrate.hasNow": ({ plugins }) => `tem agora: ${plugins}`,
  "cli.migrate.added": ({ plugins }) =>
    `adicionados (novos nos grupos, exigidos ou pedidos): ${plugins}`,
  "cli.migrate.notCarried": ({ plugins }) =>
    `não distribuídos aqui: ${plugins}. Ficam de fora, e o que foi instalado para eles sai deste aplicativo; busque-os na distribuição que os tem.`,
  "cli.migrate.notCarriedClaude": ({ plugins }) =>
    `não distribuídos aqui: ${plugins}. Ficam de fora e não voltam quando o marketplace muda de origem; busque-os na distribuição que os tem.`,
  "cli.migrate.market": ({ name, from, to }) =>
    `marketplace '${name}': registrado a partir de ${from}, passa para ${to}`,
  "cli.migrate.done": ({ plugins }) => `já está nesta versão: ${plugins}`,
  "cli.migrate.failedApp": "não migrado: veja as mensagens acima",
  "cli.migrate.task.register":
    "Atualização diária: a tarefa é gravada de novo e passa a rodar este instalador.",
  "cli.migrate.task.off": "Atualização diária: desligada.",
  "cli.migrate.task.same": "Atualização diária: já roda este instalador.",
  "cli.migrate.task.none":
    "Atualização diária: estava desligada e continua desligada.",
  "cli.migrate.confirm": "\nAplicar este plano? [s/N]: ",
  "cli.migrate.cancelled": "Migração cancelada. Nada foi alterado.",
  "cli.migrate.needsYes":
    "\nNada foi alterado. Rode de novo com --yes para aplicar este plano.",
  "cli.migrate.nothing": "\nNada mais a migrar. Nada foi alterado.",
  "cli.migrate.applying": "\nAplicando o plano",
  "cli.migrate.failed": ({ targets }) =>
    `Migração incompleta: ${targets}. O que o relatório mostra como migrado foi migrado; corrija o que aparece acima e rode migrate de novo.`,
  "cli.migrate.finished": "\nMigração concluída.",
  "cli.missing.collision": ({ item }) => `colisão preservada: ${item}`,
  "cli.missing.registry": "registro nativo Claude",
  "cli.missing.badRegistry": "registro nativo Claude inválido",
  "cli.missing.noMarker": ({ file }) => `sem marcador MarsAI: ${file}`,
  "cli.status.nothing": "nada instalado por este instalador",
  "cli.status.installedAt": ({ when }) => `instalado em: ${when}`,
  "cli.status.channel": ({ channel }) => `canal: ${channel}`,
  "cli.status.autoUpdate": ({ status }) =>
    `auto-update: ${status} (arquivo verificado; execução do serviço não consultada)`,
  "cli.status.unavailable": ({ plugins }) =>
    `  plugins que este instalador não distribui: ${plugins}`,
  "cli.status.failed": ({ plugins }) => `  plugins com falha: ${plugins}`,
  "cli.status.files": ({ state }) => `  arquivos: ${state}`,
  "cli.status.filesMissing": ({ list }) => `ausentes: ${list}`,
  "cli.status.filesClaude":
    "registro nativo presente; carregamento não verificado",
  "cli.status.filesPresent": "presentes",
  "cli.status.checkout": ({ path }) =>
    `\ncheckout do marketplace (claude): ${path || "não encontrado"}`,
  "cli.status.checkoutOf": ({ name, path }) =>
    `checkout do marketplace ${name} (claude): ${path}`,
  "cli.market.gone": ({ label }) =>
    `  ${label}: removido e não registrado de novo; rode \`marsai update\``,
  "cli.market.on": "ligado",
  "cli.market.off": "desligado",
  "cli.market.unknown": "desconhecido",
  "cli.market.local": ({ version }) => `checkout local v${version || "?"}`,
  "cli.market.line": ({ label, where, autoUpdate }) =>
    `  ${label}: ${where} | auto-update do Claude: ${autoUpdate}`,
  "cli.market.drift": ({ expected }) =>
    `  ! fora do canal stable (${expected}): rode \`marsai update\``,
  "cli.remove.nothing": "nada para remover",
  "cli.remove.wouldRemove": ({ targets }) => `removeria targets: ${targets}`,
  "cli.remove.target": ({ target }) => `\n==> removendo [${target}]`,
  "cli.remove.mcpFailed":
    "Não foi possível remover uma conexão MCP gerenciada. Estado preservado para nova tentativa.",
  "cli.remove.claudeFailed":
    "Remoção Claude falhou; estado preservado para nova tentativa.",
  "cli.remove.codexSkills": ({ list }) =>
    `  ✓ skills removidas: ${list || "nenhuma"}`,
  "cli.remove.codexRules": ({ list }) => `  ✓ regras removidas: ${list}`,
  "cli.remove.none": "nenhuma",
  "cli.remove.done":
    "\n✓ Conteúdo MarsAI e conexões MCP gerenciadas inalteradas removidos. Conexões MCP preexistentes ou editadas e credenciais preservadas.",
  "cli.doctor.title": "\nMarsAI · Verificação",
  "cli.doctor.testMode": "Modo de teste: verificando a pasta alternativa.",
  "cli.doctor.nothing": "Nenhuma instalação registrada.",
  "cli.doctor.filesPending": ({ n }) =>
    `  ! ${n} pendências nos arquivos. Consulte status.`,
  "cli.doctor.filesOk": "  ✓ Conteúdo instalado presente.",
  "cli.doctor.failed": ({ targets }) =>
    `Verificação pendente ou falhou: ${targets}. Consulte os estados acima.`,
  "cli.unknownCommand": ({ command }) =>
    `comando desconhecido: ${command}. Use install | update | migrate | status | doctor | remove.`,
};
