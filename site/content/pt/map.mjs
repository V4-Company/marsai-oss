// The interactive map, the guides and the questions page.
// Same inline markup as skills.mjs. Links to pages use route names: [mapa](@map).

/**
 * The map is a hand-laid flow diagram: four bands of five columns. Rows 0, 2,
 * 4 and 6 hold the complete path, which goes through every step; rows 1, 3
 * and 5 hold what hangs from it. `skill` links a node to its page; nodes
 * without one carry their own detail.
 *
 * A gate (G0 to G6) is a small diamond on the line between two steps. `after`
 * puts it in the gap to the right of a node; `at` puts it at a point of a
 * connector.
 *
 * A routing decision (`kind: 'routing'`) sits on the complete path. Its "no"
 * stays on that path; its "yes" is a shortcut, an edge with `shortcut` that
 * keeps its own colour and is always drawn. An edge with `jump` is drawn only
 * while the journey uses it: the way back from a gate, and the entries for
 * work that is already under way.
 */
import { reviewBot } from './review-bot.mjs';
export const map = {
  nodeW: 136,
  nodeH: 44,
  gapX: 50,
  padLeft: 44,
  padRight: 22,
  rowY: [60, 164, 326, 406, 524, 604, 722],
  phases: [
    { label: 'Fase 1 · Planejamento', mode: 'liberdade total', rows: [0, 1], tone: 'plan' },
    { label: 'Fase 2 · Hardening', mode: 'qualidade máxima', rows: [2, 6], tone: 'hard', labelX: 170 },
  ],
  nodes: [
    { id: 'comecar', label: 'Começar', kind: 'pessoa', col: 0, row: 0, skill: 'marsai-mode', tag: 'marsai-mode' },
    { id: 'problema', label: 'Problema', kind: 'pessoa', col: 1, row: 0 },
    { id: 'd-small', label: 'Tarefa pequena?', kind: 'routing', col: 1, row: 1 },
    { id: 'intent', label: 'Intent', kind: 'pessoa', col: 2, row: 0 },
    { id: 'grill', label: 'Grill', kind: 'pessoa', col: 3, row: 0, skill: 'grill-with-docs' },
    { id: 'wayfinder', label: 'Wayfinder', kind: 'pessoa', col: 3, row: 1, skill: 'wayfinder', optional: true, tag: 'mapa de decisões' },
    { id: 'd-how', label: 'Só falta o como?', kind: 'routing', col: 4, row: 0 },
    { id: 'demo', label: 'Demo', kind: 'agente', col: 4, row: 1, skill: 'demo', person: true },

    { id: 'spec', label: 'Spec', kind: 'agente', col: 0, row: 2, skill: 'to-spec', tag: 'corte da v1 · plano' },
    { id: 'tickets', label: 'Tickets', kind: 'agente', col: 1, row: 2, skill: 'to-tickets', person: true },
    { id: 'implement-spec', label: 'implement-spec', kind: 'agente', col: 2, row: 2, skill: 'implement-spec' },
    { id: 'implement', label: 'implement', kind: 'agente', col: 2, row: 3, skill: 'implement', tag: 'fast track' },
    { id: 'implementador', label: 'Implementador', kind: 'agente', col: 3, row: 2 },
    { id: 'checks', label: 'Checks', kind: 'freio', col: 4, row: 2 },

    { id: 'review', label: 'Review', kind: 'agente', col: 0, row: 4, skill: 'code-review' },
    { id: 'pr', label: 'PR', kind: 'agente', col: 1, row: 4, skill: 'open-pr' },
    { id: 'ci', label: 'CI', kind: 'freio', col: 2, row: 4 },
    { id: 'babysit', label: 'babysit-pr', kind: 'agente', col: 2, row: 5, skill: 'babysit-pr' },
    { id: 'bot', label: 'Review do bot', kind: 'freio', col: 3, row: 4 },
    { id: 'humano', label: 'Review humano', kind: 'pessoa', col: 4, row: 4 },

    { id: 'merge', label: 'Merge', kind: 'pessoa', col: 0, row: 6 },
    { id: 'producao', label: 'Produção', kind: 'pessoa', col: 1, row: 6 },
    { id: 'retro', label: 'Retro', kind: 'agente', col: 2, row: 6, skill: 'retro', person: true, tag: 'check · standard' },

    { id: 'g0', label: 'G0', kind: 'gate', after: 'problema' },
    { id: 'g1', label: 'G1', kind: 'gate', after: 'intent' },
    { id: 'g2', label: 'G2', kind: 'gate', at: { x: 856, y: 134 } },
    { id: 'g3', label: 'G3', kind: 'gate', at: { x: 484, y: 252 } },
    { id: 'g4', label: 'G4', kind: 'gate', after: 'spec' },
    { id: 'g5', label: 'G5', kind: 'gate', at: { x: 484, y: 686 } },
    { id: 'g6', label: 'G6', kind: 'gate', after: 'producao' },
  ],
  edges: [
    // The complete path.
    { from: 'comecar', to: 'problema' },
    { from: 'problema', to: 'd-small' },
    { from: 'd-small', to: 'g0', route: 'hv', bare: true, label: 'não' },
    { from: 'g0', to: 'intent' },
    { from: 'intent', to: 'g1', bare: true },
    { from: 'g1', to: 'grill' },
    { from: 'grill', to: 'd-how' },
    { from: 'grill', to: 'wayfinder', fromDx: -18, toDx: -18, dashed: true },
    { from: 'wayfinder', to: 'grill', fromDx: 18, toDx: 18, dashed: true },
    { from: 'd-how', to: 'g2', bare: true, label: 'não' },
    { from: 'g2', to: 'demo' },
    { from: 'demo', to: 'g3', route: 'wrapin', bare: true },
    { from: 'g3', to: 'spec', route: 'wrapout' },

    { from: 'spec', to: 'g4', bare: true },
    { from: 'g4', to: 'tickets' },
    { from: 'tickets', to: 'implement-spec' },
    { from: 'implement-spec', to: 'implementador' },
    { from: 'implement', to: 'implementador', route: 'hv', toDx: -26 },
    { from: 'implementador', to: 'checks' },
    { from: 'checks', to: 'implementador', route: 'under', depth: 15, label: 'vermelho', fromDx: -14 },
    { from: 'checks', to: 'review', route: 'wrap', midY: 488 },

    { from: 'review', to: 'pr' },
    { from: 'pr', to: 'ci' },
    { from: 'ci', to: 'bot' },
    { from: 'ci', to: 'babysit', fromDx: 16, toDx: 16, label: 'falhou' },
    { from: 'babysit', to: 'ci', fromDx: -16, toDx: -16 },
    { from: 'bot', to: 'babysit', route: 'vh', toDy: -4, label: 'achado', labelAt: 0.3 },
    { from: 'bot', to: 'humano' },
    { from: 'humano', to: 'babysit', route: 'vh', toDy: 13, label: 'pede mudança', labelAt: 0.22, labelBelow: true },
    { from: 'humano', to: 'g5', route: 'wrapin', bare: true },
    { from: 'g5', to: 'merge', route: 'wrapout' },

    { from: 'merge', to: 'producao' },
    { from: 'producao', to: 'g6', bare: true },
    { from: 'g6', to: 'retro' },

    // The shortcuts: the "yes" of each routing decision.
    { from: 'd-small', to: 'implement', route: 'rail', shortcut: 'small', label: 'sim', labelSegment: 0, labelAt: 0.1, note: 'tarefa pequena: direto para implementar', noteSegment: 2 },
    { from: 'd-how', to: 'spec', side: 'right', via: [[958, 82], [958, 276], [142, 276]], toDx: 30, shortcut: 'how', label: 'sim', labelSegment: 0, note: 'só falta o como: direto para a spec, sem demo', noteSegment: 2, noteAt: 0.3 },

    // The way back from a gate. Drawn only while the journey uses it.
    { from: 'g1', to: 'intent', route: 'under', depth: 14, jump: true, label: 'ajustar' },
    { from: 'g2', to: 'grill', side: 'left', via: [[700, 134]], toSide: 'bottom', toDx: 30, jump: true, label: 'dúvida' },
    { from: 'g3', to: 'demo', route: 'vhv', midY: 238, jump: true, label: 'ajustar demo' },
    { from: 'g3', to: 'grill', route: 'vhv', midY: 140, toDx: -30, jump: true, label: 'repensar', labelSegment: 0 },
    { from: 'g4', to: 'spec', route: 'under', depth: 14, jump: true, label: 'refazer' },
    { from: 'g5', to: 'babysit', route: 'v', jump: true, label: 'corrigir' },

    // Entries for work that is already under way. Drawn only while the journey uses them.
    { from: 'comecar', to: 'implement-spec', side: 'left', via: [[14, 82], [14, 399], [436, 399]], toSide: 'bottom', toDx: -48, jump: true, shortcut: 'resume' },
    { from: 'comecar', to: 'babysit', route: 'rail', railX: 14, jump: true, shortcut: 'resume' },
  ],
  details: {
    'd-small': {
      title: 'É uma tarefa pequena?',
      line: 'Bug, ajuste pequeno ou débito técnico: um comportamento só, com escopo claro e nenhuma decisão de desenho em aberto.',
      points: [
        'Sim: o dev pega o problema e vai direto para a [[implement]], com implementador, checks e review. Bug começa por um teste que o reproduz.',
        'Não: é uma feature. Ela segue pelo caminho completo, com intent, grill e demo.',
      ],
      choices: {
        options: [
          { label: 'Não: seguir o caminho completo', goto: 'g0' },
          { label: 'Sim: direto para a implementação', goto: 'implement', path: 'small' },
        ],
      },
    },
    'd-how': {
      title: 'Só falta decidir como construir?',
      line: 'A demo existe para provar valor. Quando o valor já está claro e as decisões estão tomadas, ela não acrescenta nada.',
      points: [
        'Sim: pule a demo e vá para a [[to-spec]], que escreve o plano técnico.',
        'Não: ainda há dúvida de valor. Construa a demo e coloque na mão de um usuário.',
      ],
      choices: {
        options: [
          { label: 'Não: provar o valor numa demo', goto: 'g2' },
          { label: 'Sim: direto para a spec, sem demo', goto: 'spec', path: 'how' },
        ],
      },
    },
    comecar: {
      line: 'Diga o que quer numa frase: o agente recomenda o caminho e conduz até o fim.',
      points: [
        'Dev ou PM, todo mundo chama `/marsai-core:marsai-mode`. O caminho vira uma checklist, com os gates como parada.',
        'Antes de perguntar, a skill olha a branch, a PR aberta e a issue.',
        'Feature passa pelas duas fases. Bug, ajuste pequeno e débito técnico entram direto no build.',
      ],
      links: ['marsai-mode'],
      choices: {
        question: 'Vai retomar um trabalho que já andou?',
        options: [
          { label: 'Problema novo: começar pelo problema', goto: 'problema' },
          { label: 'Issue com spec e fatias: implement-spec', goto: 'implement-spec', path: 'resume' },
          { label: 'PR aberta: babysit-pr', goto: 'babysit', path: 'resume' },
        ],
      },
    },
    problema: {
      title: 'Descoberta do problema',
      line: 'Um problema aparece. Pode vir de qualquer lugar.',
      points: [
        'Cliente, stakeholder, dados, suporte ou o próprio time.',
        'Descreva quem sofre e qual é o impacto.',
        'É um passo de pessoa: não tem skill. O card nasce no tracker, com a origem e a evidência.',
        'Um card que já existe é um começo válido: o agente lê, diz o que ele já responde do G0 e do G1 e pergunta só o que falta.',
      ],
      person: 'Você traz o problema, não a solução.',
      records: ['Card com origem e evidência'],
    },
    intent: {
      title: 'Intent',
      line: 'Escreva a intenção antes da solução.',
      points: [
        'Qual é o problema.',
        'Qual é o resultado esperado.',
        'Como medir o sucesso.',
        'O que fica fora do escopo.',
      ],
      person: 'O intent fica no card, nas palavras de quem teve a ideia.',
      records: ['Intent no card'],
    },
    grill: {
      line: 'PM, dev e agente desafiam o plano. O agente faz as perguntas difíceis.',
      points: [
        'Ele pergunta, busca os fatos no código e recomenda. Quem decide é você.',
        'Fecha as regras de negócio, lista as hipóteses que a demo vai testar e define quem vai usar a demo.',
        'Termo resolvido entra no glossário na hora. Decisão difícil de desfazer vira ADR.',
        'Uma pergunta de desenho que só se resolve vendo funcionar vai para um [[prototype|protótipo]], em outro agente.',
      ],
      records: ['Resumo do grill', 'CONTEXT.md', 'docs/adr/'],
      links: ['grill-with-docs', 'prototype'],
      choices: {
        question: 'As perguntas cresceram além de uma conversa?',
        options: [
          { label: 'Sim, abrir o Wayfinder', goto: 'wayfinder' },
          { label: 'Não, seguir em frente', goto: 'd-how' },
        ],
      },
    },
    wayfinder: {
      line: 'O grill revelou perguntas demais para uma conversa. Agora elas viram um mapa.',
      points: [
        'Registra no tracker um destino, as decisões tomadas e o que ainda não dá para especificar.',
        'Cada filha é uma pergunta a resolver, com os bloqueios entre elas. Não é uma fatia de implementação.',
        'Retome uma pergunta desbloqueada por sessão. Com o caminho claro, o grill fecha e a demo começa.',
      ],
      person: 'Você decide o destino e as escolhas de desenho. O agente investiga e mantém o mapa.',
      records: ['Mapa de decisões', 'Perguntas e bloqueios'],
    },
    demo: {
      line: 'Uma v1 que funciona, dentro da codebase sempre que der. Feia por dentro, real por fora.',
      points: [
        'De meio dia a dois dias. Passou disso? Quebre o problema.',
        'Onde roda, por ordem de preferência: produção atrás de feature flag, para usuários selecionados; dev, com o usuário usando; fora da codebase, como último recurso, sem reaproveitar nada do código dela. Dentro da codebase, fica numa branch `demo/<nome>`.',
        'Sem foco em arquitetura: os Standards e o review ficam para o hardening.',
        'Um experimento em produção precisa da aprovação explícita de quem responde pela área, da flag desligada para todos os outros, de público restrito, dados protegidos, checks de segurança e rollback. Escritas em produção precisam de aprovação explícita. O hardening completo vem antes da liberação geral.',
        'O veredito leva ao hardening, volta ao grill para outra demo ou descarta a ideia.',
      ],
      person: 'Um usuário real usa a demo, não só vê. O veredito é seu.',
      records: ['Demo rodando (branch e link)', 'Vídeo ou GIF', 'Feedback e decisão'],
    },
    spec: {
      title: 'Corte e plano técnico',
      line: 'A demo provou valor. Agora corte a v1 e planeje.',
      points: [
        'A v1 é menor que a demo.',
        'Para cada parte: reaproveitar o que a demo fez ou reescrever do zero. Depois de uma demo fora da codebase, tudo é reescrito.',
        'Arquitetura, modelo de dados e segurança definidos, com evidência do código atual.',
        'O plano desce até o desenho do programa: as peças novas com seus tipos e assinaturas, onde elas se ligam ao código existente e onde cada teste entra. Ele também lista as fatias e a ordem delas.',
        'Sai com um nível de risco, que define quanta atenção a PR vai pedir.',
        'É aprovado numa sessão de refinamento de até 30 minutos, com o TL, o PM e o dev responsável. O TL decide, e a sessão define quem lê as PRs.',
      ],
      records: ['Escopo da v1', 'Plano técnico na issue-mãe', 'Nível de risco', 'Registro da sessão'],
    },
    tickets: {
      line: 'A spec é cortada em fatias verticais, com os bloqueios entre elas.',
      points: [
        'Uma fatia é um comportamento funcionando de ponta a ponta.',
        'O corte é por comportamento, não por repositório nem por camada.',
        'Parte das fatias que a sessão de refinamento aprovou: detalha e publica.',
        'Cada fatia se lê bem como uma PR. Passou de cerca de 400 linhas alteradas, é mais de uma fatia.',
      ],
      person: 'Você confirma o corte antes de qualquer issue ser criada.',
      records: ['Fatias no tracker', 'Bloqueios entre elas'],
    },
    'implement-spec': {
      line: 'A spec inteira vira código revisado, sem esperar ninguém entre as fatias.',
      points: [
        'Percorre as fatias na ordem dos bloqueios. As que não se bloqueiam rodam ao mesmo tempo.',
        'Um implementador novo por fatia.',
        'No fim, revisa tudo e entrega uma PR por repositório, ou uma por fatia quando o conjunto ficaria grande demais para ler bem: acima de cerca de 400 linhas alteradas.',
        'Uma fatia que não dá para construir como foi desenhada fica parada. A mudança é escrita na issue e aprovada pelo TL antes de a fatia seguir.',
      ],
      person: 'Você só é chamado se uma fatia depender de uma decisão que a spec não tomou.',
      records: ['Um commit por fatia', 'PR em rascunho'],
    },
    implement: {
      line: 'O fast track: bug, ajuste pequeno e débito técnico entram direto aqui.',
      points: [
        'É o mesmo caminho de implementador, checks e review, para uma coisa só.',
        'Bug começa por um teste que reproduz o bug.',
        'Se a única dúvida é como fazer, não precisa de demo.',
      ],
    },
    implementador: {
      title: 'Implementador',
      line: 'Um agente por fatia. Faz o código funcionar, com o teste primeiro.',
      points: [
        'Não carrega os Standards: explora, escreve o teste, faz passar.',
        'Segue o desenho do programa que vem com a fatia e o exemplo mais próximo do repositório. Um time pode dar a ele um guia de implementação.',
        'Para e pergunta quando a tarefa deixa uma decisão em aberto.',
      ],
      links: ['backend-engineer-typescript', 'frontend-engineer', 'tdd'],
    },
    checks: {
      title: 'Checks do repositório',
      line: 'Lint, tipos e testes, na máquina. Não gastam token.',
      points: [
        'É o freio mais barato: dá sempre o mesmo resultado.',
        'Um comando só, igual na máquina e no CI.',
        'Vermelho volta para o implementador.',
      ],
      choices: {"question":"Os checks passaram?","options":[{"label":"Sim: seguir para o review","goto":"review"},{"label":"Não: corrigir no implementador","goto":"implementador"}]},
    },
    review: {
      line: 'O reviewer aplica os Standards, corrige e commita.',
      points: [
        'Dois eixos: Standards (segue as regras?) e Spec (entrega o que as fatias pediam, construído como o desenho do programa diz?).',
        'As correções entram em commits separados.',
        'Requisito faltando volta para o implementador.',
        'Código que foge do desenho do programa: o reviewer traz de volta um desvio local, e um desvio estrutural volta para o implementador.',
        'Mudança de rumo é escrita na issue e aprovada pelo TL antes.',
      ],
      links: ['code-review', 'code-reviewer'],
    },
    pr: {
      line: 'Uma PR que o revisor entende em um minuto.',
      points: [
        'Abre com o efeito prático, em uma frase.',
        'Evidência: o antes e o depois, de algo que foi executado.',
        'Perigo do merge: dá para desfazer? O que mais pode quebrar?',
        'Tamanho e desenho: as linhas alteradas, se uma entrega acima de cerca de 400 foi dividida por fatia, e que o código segue o desenho combinado.',
      ],
      records: ['PR no GitHub'],
    },
    ci: {
      title: 'CI',
      line: 'Os mesmos checks da máquina, mais a análise estática.',
      points: [
        'Na V4, o SonarQube roda aqui e bloqueia pelo quality gate.',
        'O que ele costuma acusar (função complexa demais, bloco duplicado, comportamento sem teste) o review já procura antes.',
        'Falhou: a `babysit-pr` corrige.',
      ],
      choices: {"question":"O CI passou?","options":[{"label":"Sim: ler o review do bot","goto":"bot"},{"label":"Não: corrigir com babysit-pr","goto":"babysit"}]},
    },
    bot: {
      title: 'Review do bot',
      line: 'Um revisor automático lê a PR e dá uma nota.',
      points: [
        ...reviewBot.paragraphs,
        'A nota é a pior entre seis dimensões.',
        'Informa o merge de uma pessoa. Com um `full-send` explícito, a nota 5 no último commit é uma das condições para o merge sozinho de uma porta de duas vias.',
        'Achado passa por triagem: válido, falso positivo, já corrigido ou fora do escopo.',
      ],
      records: ['Nota na PR'],
      choices: {"question":"Há um achado válido a corrigir?","options":[{"label":"Sim: corrigir com babysit-pr","goto":"babysit"},{"label":"Não: seguir para o review humano","goto":"humano"}]},
    },
    babysit: {
      line: 'Corrige o que os freios acusam até a PR ficar pronta.',
      points: [
        'Protege o objetivo original da PR: o que é fora do escopo vai para outra.',
        'Rejeita falso positivo por escrito, com o motivo.',
        'Merge e rebase só com autorização explícita.',
      ],
    },
    humano: {
      title: 'Review humano',
      line: 'Uma pessoa lê toda PR. O risco define a profundidade da leitura.',
      points: [
        'É o freio mais caro, então chega por último, com tudo o mais já conferido.',
        'Quem lê é alguém que participou da sessão de refinamento, quando a entrega teve uma.',
        'Revise intenção, risco e arquitetura. Linha por linha, só onde o risco é alto.',
        'Pedido de mudança volta para a `babysit-pr`.',
      ],
      person: 'É aqui que a atenção de uma pessoa é gasta.',
      choices: {"question":"O review humano pediu mudança?","options":[{"label":"Sim: corrigir com babysit-pr","goto":"babysit"},{"label":"Não: avaliar se a PR está pronta","goto":"g5"}]},
    },
    merge: {
      title: 'Merge',
      line: 'Por padrão, o merge é de uma pessoa.',
      points: [
        'Nenhum agente aprova o próprio código.',
        'Com um `full-send` explícito, uma porta de duas vias entra sozinha só quando os checks, a nota 5 do bot de review e o `sol-loop` passam no último commit (ADR 0018).',
        'Porta de mão única sempre espera uma pessoa.',
      ],
      person: 'Você decide quando entra.',
    },
    producao: {
      title: 'Produção',
      line: 'Entrega com flag, quando faz sentido. Depois, meça.',
      points: [
        'Meça a métrica do intent.',
        'Atualize a documentação.',
        'Garanta que o número 2 sabe como funciona.',
      ],
      person: 'Quem constrói sustenta.',
      records: ['Métrica acompanhada', 'Aprendizado registrado'],
    },
    retro: {
      line: 'O erro que se repete vira regra, no freio mais barato possível.',
      points: [
        'Se uma máquina consegue conferir, vira check no repositório.',
        'Se é julgamento, vira regra nos Standards.',
        'Anota quanto tempo a leitura humana levou e quantas rodadas de mudança ela pediu.',
        'O que você aprende em produção volta como novo problema, no passo 1.',
      ],
      person: 'A retro só propõe. Quem aprova e aplica é você.',
      records: ['Check novo', 'Regra nos Standards', 'Novos cards'],
    },
  },
  gateLabels: { who: 'Quem decide', done: 'Pronto quando', out: 'O que entrega', exits: 'Saídas do gate' },
  gates: {
    g0: {
      question: 'Problema aceito?',
      who: 'PM ou TL da frente',
      done: ['O problema diz quem sofre', 'Tem evidência: dado, relato ou ticket', 'Tem impacto estimado', 'Não existe outro card igual'],
      out: ['Card com origem e evidência'],
      exits: [{ tone: 'yes', label: 'Sim: escreva o intent', goto: 'intent' }, { tone: 'no', label: 'Não: arquive com o motivo' }],
    },
    g1: {
      question: 'Intent aprovado?',
      who: 'PM, junto com o stakeholder quando houver',
      done: ['As quatro perguntas do intent têm resposta', 'O stakeholder concorda'],
      out: ['Intent no card, nas palavras de quem teve a ideia'],
      exits: [{ tone: 'yes', label: 'Sim: grill with docs', goto: 'grill' }, { tone: 'adjust', label: 'Ajustar: reescreva o intent', goto: 'intent' }],
    },
    g2: {
      question: 'Pronto para a demo?',
      who: 'Dev dono da frente, com o PM',
      done: ['Nenhuma dúvida aberta trava a demo', 'As regras de negócio estão fechadas', 'As hipóteses estão listadas', 'Está definido o que é sucesso'],
      out: ['Resumo do grill', 'CONTEXT.md e ADRs atualizados'],
      exits: [{ tone: 'yes', label: 'Sim: construa a demo', goto: 'demo' }, { tone: 'adjust', label: 'Dúvida aberta: volte ao grill', goto: 'grill' }],
    },
    g3: {
      question: 'A demo resolve o intent?',
      who: 'PM e stakeholder, juntos, com base no uso real',
      done: ['A issue registra onde a demo rodou e por que uma opção mais alta não foi possível', 'Um usuário real usou, não só viu', 'O feedback está registrado', 'A decisão está tomada'],
      out: ['Demo rodando (branch e link)', 'Vídeo ou GIF', 'Feedback e decisão'],
      exits: [{ tone: 'yes', label: 'Sim: hardening', goto: 'spec' }, { tone: 'adjust', label: 'Ajustar: nova demo', goto: 'demo' }, { tone: 'adjust', label: 'Repensar: volte ao grill, depois outra demo', goto: 'grill' }, { tone: 'no', label: 'Não: descarte a ideia e registre o motivo' }],
    },
    g4: {
      question: 'Plano técnico aprovado?',
      who: 'O TL decide, com o PM e o dev responsável, numa sessão de até 30 minutos',
      done: ['O escopo da v1 está cortado', 'Decisão: reaproveitar ou reescrever', 'Arquitetura e modelo de dados definidos', 'Desenho do programa definido: as peças novas, onde elas se ligam e onde cada teste entra', 'Segurança definida', 'Definido como medir o resultado em produção', 'Nível de risco definido', 'As fatias e a ordem delas estão combinadas', 'Está definido quem lê as PRs'],
      out: ['Escopo da v1', 'Plano técnico', 'Nível de risco', 'Registro da sessão'],
      exits: [{ tone: 'yes', label: 'Sim: build', goto: 'tickets' }, { tone: 'adjust', label: 'Refazer: novo plano', goto: 'spec' }],
    },
    g5: {
      question: 'PR pronta?',
      who: 'Bots primeiro, depois uma pessoa que participou da sessão de refinamento, quando a entrega teve uma',
      done: ['CI verde', 'Testes cobrem regras e casos de borda', 'Revisor automático em 5/5, ou sem achado válido aberto', 'Evidência na PR', 'O código segue o desenho combinado, ou a mudança foi aprovada por escrito antes', 'Acima de cerca de 400 linhas alteradas, uma PR por fatia, ou a PR diz por que não', 'Uma pessoa leu a PR, na profundidade que o risco pede', 'Nenhum agente aprova o próprio código'],
      out: ['PR com evidência', 'Resumo de risco', 'Findings viram regra'],
      exits: [{ tone: 'yes', label: 'Sim: produção', goto: 'merge' }, { tone: 'no', label: 'Não: volte ao build', goto: 'babysit' }],
    },
    g6: {
      question: 'Entregue de verdade?',
      who: 'Dono da frente',
      done: ['Está em produção', 'A métrica do intent está sendo medida', 'A documentação está atualizada', 'O número 2 sabe como funciona'],
      out: ['Métrica acompanhada', 'Aprendizado registrado', 'Novos cards', 'Tempo de leitura e retrabalho, anotados na retro'],
      exits: [{ tone: 'yes', label: 'Aprendizado: novo problema no passo 1', goto: 'retro' }],
    },
  },
  scenarios: [
    {
      id: 'feature',
      label: 'Caminho completo',
      say: 'Uma feature passa por todas as etapas: primeiro a demo, depois o hardening. Sete gates no caminho.',
      path: ['comecar', 'problema', 'd-small', 'g0', 'intent', 'g1', 'grill', 'd-how', 'g2', 'demo', 'g3', 'spec', 'g4', 'tickets', 'implement-spec', 'implementador', 'checks', 'review', 'pr', 'ci', 'bot', 'humano', 'g5', 'merge', 'producao', 'g6', 'retro'],
    },
    {
      id: 'large',
      label: 'O grill ficou grande',
      say: 'As perguntas não cabem numa conversa: um mapa de decisões organiza tudo antes da demo.',
      path: ['comecar', 'problema', 'd-small', 'g0', 'intent', 'g1', 'grill', 'wayfinder', 'grill', 'd-how', 'g2', 'demo', 'g3', 'spec', 'g4', 'tickets', 'implement-spec', 'implementador', 'checks', 'review', 'pr', 'ci', 'bot', 'humano', 'g5', 'merge', 'producao', 'g6', 'retro'],
    },
    {
      id: 'how',
      label: 'Só falta o como',
      say: 'O valor já está claro e a dúvida é só como construir: sem demo, direto para a spec.',
      path: ['comecar', 'problema', 'd-small', 'g0', 'intent', 'g1', 'grill', 'd-how', 'spec', 'g4', 'tickets', 'implement-spec', 'implementador', 'checks', 'review', 'pr', 'ci', 'bot', 'humano', 'g5', 'merge', 'producao', 'g6', 'retro'],
    },
    {
      id: 'slices',
      label: 'Issue com spec e fatias',
      say: 'O trabalho já tem spec e fatias: entra direto na implementação.',
      path: ['comecar', 'implement-spec', 'implementador', 'checks', 'review', 'pr', 'ci', 'bot', 'humano', 'g5', 'merge', 'producao', 'g6', 'retro'],
    },
    {
      id: 'bug',
      label: 'Tarefa pequena',
      say: 'Fast track: um comportamento só, sem decisão de desenho. Direto para a implementação, com checks e review.',
      path: ['comecar', 'problema', 'd-small', 'implement', 'implementador', 'checks', 'review', 'pr', 'ci', 'bot', 'humano', 'g5', 'merge', 'producao', 'g6', 'retro'],
    },
    {
      id: 'pr',
      label: 'PR aberta',
      say: 'O trabalho já tem PR: check vermelho, achado do bot ou comentário.',
      path: ['comecar', 'babysit', 'ci', 'bot', 'humano', 'g5', 'merge', 'producao', 'g6', 'retro'],
    },
  ],
};

export const brakes = [
  { title: 'Checks do repositório', where: 'Na máquina', cost: 'Não gastam token', catches: 'Erro de lint, de tipo e teste quebrado' },
  { title: 'Review', where: 'Antes da PR', cost: 'Tokens de um agente', catches: 'O que foge dos Standards ou do desenho combinado, e o que a spec pediu e não veio' },
  { title: 'CI na PR', where: 'No GitHub', cost: 'Minutos de máquina', catches: 'Os mesmos checks, mais o que a análise estática acusa' },
  { title: 'Review do bot', where: 'Na PR', cost: 'Tokens de um agente', catches: 'Problema de correção, segurança, teste e impacto, em seis dimensões' },
  { title: 'Pessoa', where: 'Em toda PR', cost: 'A atenção de alguém do time', catches: 'O que só quem conhece o domínio enxerga' },
];

export const botDimensions = [
  ['`correctness`', 'Regra de negócio, fluxo de dado, ordem das operações'],
  ['`security`', 'Autenticação, autorização, segredo, dado pessoal'],
  ['`tests`', 'Cobertura do que mudou, bordas, uso de substitutos'],
  ['`nil_safety`', 'Guarda de nulo até o ponto de uso'],
  ['`blast_radius`', 'O que quebra fora do diff: contrato, quem chama, quem consome'],
  ['`maintainability`', 'Qualidade, nome, código morto, duplicação'],
];

export const decisionPoints = [
  ['Problema e intent', 'O que resolver, para quem, e como medir', 'O agente lê o card, quando já existe um, e pergunta só o que falta'],
  ['Grill', 'Todas as decisões de desenho', 'O agente pergunta, traz os fatos e recomenda'],
  ['Demo', 'Onde a demo roda, e se ela resolve o intent, com base no uso real', 'O agente constrói a demo e prepara o roteiro'],
  ['Spec', 'O corte da v1, o que reaproveitar e o nível de risco. O TL aprova o plano na sessão de refinamento', 'O agente lê o código, escreve o plano até o desenho do programa e prepara a sessão'],
  ['Tickets', 'Se o corte das fatias está certo', 'O agente desenha as fatias e publica'],
  ['Implementar', 'Só o que a spec não decidiu', 'O agente implementa, testa e integra'],
  ['Review', 'O que mudaria comportamento ou contrato, e qualquer mudança no desenho combinado', 'O reviewer corrige o resto, traz de volta ao desenho um desvio local e commita'],
  ['PR', 'A aprovação e o merge, depois de uma pessoa ler a PR', 'O agente abre a PR e corrige o que os freios acusam'],
  ['Produção', 'Se foi entregue de verdade', 'Nada: quem constrói sustenta'],
  ['Retro', 'Quais propostas entram', 'O agente levanta a evidência e propõe'],
];

export const decisions = [
  {
    title: 'Uma porta só conduz o trabalho inteiro, com o caminho numa checklist',
    body: 'Você diz o que quer numa frase e o agente recomenda o tamanho e o caminho; você confirma. O caminho vira uma checklist com os gates, e o que foi pulado fica com o motivo. Uma pergunta decide se precisa de demo: dá para saber que está certo pelos testes, ou só quando um usuário usar?',
    adr: '0017-one-entry-leads-the-whole-work.md',
  },
  {
    title: 'A demo prefere o uso real atrás de uma flag',
    body: 'Uma demo vale o que vale a reação do usuário, e essa reação é mais confiável onde a feature vai ser usada de verdade. Por ordem de preferência: produção atrás de feature flag para usuários selecionados, com aprovação, dados protegidos e rollback; dev, com o usuário; fora da codebase, como último recurso. O veredito leva ao hardening, de volta ao grill ou ao descarte da ideia.',
    adr: '0014-a-demo-prefers-real-use-behind-a-flag.md',
  },
  {
    title: 'A feature prova o valor numa demo antes do hardening',
    body: 'Com agentes, construir uma versão que funciona custa horas. Decidir o que construir continua caro. Então a coisa barata responde primeiro a pergunta cara: a demo vai para a mão de um usuário, e só o que ela provou recebe engenharia de verdade.',
    adr: '0010-a-feature-proves-its-value-in-a-demo.md',
  },
  {
    title: 'O plano técnico é combinado numa sessão, até o desenho do programa',
    body: 'Uma pessoa ainda lê o código que o agente escreve, e o que encurta essa leitura é combinar antes de construir. O gate G4 é decidido em até 30 minutos com o TL, o PM e o dev responsável. O plano diz as peças novas, onde elas se ligam e onde os testes entram.',
    adr: '0015-the-technical-plan-is-agreed-in-a-session.md',
  },
  {
    title: 'O código segue o desenho combinado; mudança de rumo é escrita antes',
    body: 'O que o refinamento combinou é o padrão daquela entrega, e o review traz o código de volta a ele. Mudança de rumo é escrita na issue e aprovada pelo TL antes. Uma pessoa lê toda PR, e uma entrega grande sai com uma PR por fatia.',
    adr: '0016-the-code-follows-the-agreed-design.md',
  },
  {
    title: 'Full send faz merge de uma porta de mão dupla sem leitura humana',
    body: 'Quando você diz "full send", o agente leva o trabalho sozinho até a PR mergeada: prova a mudança, um modelo de outro provedor revisa e ele acompanha a PR até o CI e os bots terminarem. Ele faz o merge sozinho só de uma porta de mão dupla, com checks verdes e 5 do bot de review; uma porta de mão única para pronta para você, como o "full stop" faz sempre. As skills estão nos extras opcionais.',
    adr: '0018-full-send-merges-a-two-way-door-alone.md',
  },
  {
    title: 'As sessões começam no Home Repo do time',
    body: 'Um time que trabalha em muitos repositórios mantém um Home Repo e começa toda sessão nele. Ele aponta para cada repositório e guarda o que o time compartilha, então nenhuma sessão trabalha sem a visão do todo e nenhuma instrução é copiada em cada repositório. As skills e os Standards do time ficam no `.claude/` dele, então um `git pull` atualiza todo mundo, e o código fica onde está. É como a V4 roda o MarsAI hoje, em 80+ repositórios.',
    adr: '0019-sessions-start-in-the-home-repo.md',
  },
  {
    title: 'Os Standards são aplicados no review, não na implementação',
    body: 'Quem implementa gasta o contexto explorando e fazendo funcionar. Quem revisa recebe um diff pronto e tem contexto sobrando para as regras. Antes, cada implementador carregava de 14 a 19 mil tokens de regras antes da primeira linha.',
    adr: '0001-standards-at-review-not-at-implementation.md',
  },
  {
    title: 'O reviewer corrige e commita',
    body: 'Comentário que o autor precisa ler, entender e aplicar é uma ida e volta. O reviewer aplica a correção e só comenta quando ela depende de uma decisão de pessoa.',
    adr: '0002-the-reviewer-fixes-and-commits.md',
  },
  {
    title: 'Quem planeja é a pessoa',
    body: 'Nenhuma skill entrega decisão de desenho a um agente planejador. O agente pergunta, busca os fatos e recomenda.',
    adr: '0003-the-person-plans.md',
  },
  {
    title: 'Trabalho que cruza repositórios é fatiado na vertical',
    body: 'Cada fatia é um comportamento funcionando de ponta a ponta, não um pedaço por repositório.',
    adr: '0004-multi-repo-work-is-sliced-vertically.md',
  },
  {
    title: 'O fluxo parte das skills do Matt Pocock',
    body: 'As skills foram copiadas e adaptadas ao que é nosso: o tracker, o trabalho em vários repositórios e o padrão de backend. Mantêm o nome original, para aproveitar os vídeos e a documentação dele.',
    adr: '0005-the-flow-starts-from-matt-pococks-skills.md',
  },
  {
    title: 'Skills e agentes são escritos sem tom de ordem',
    body: 'Instruções curtas e afirmativas. A disciplina que estava no texto passa para os freios: checks e reviewer.',
    adr: '0006-skills-and-agents-without-a-commanding-tone.md',
  },
  {
    title: 'Os Standards têm uma fonte só',
    body: 'As regras de código tinham quatro fontes. Agora moram num lugar só, e as outras apontam para ele.',
    adr: '0007-marsai-is-the-single-source-of-the-standards.md',
  },
  {
    title: 'O perigo do merge informa; a regra de aprovação não muda',
    body: 'A PR declara se dá para desfazer e o que mais pode quebrar. Isso orienta a atenção do revisor, sem liberar nada sozinho.',
    adr: '0008-merge-danger-informs-approval-does-not-change.md',
  },
  {
    title: 'Qualidade antes de custo de token',
    body: 'Modelo mais capaz em todas as etapas, e subagentes sempre que mantêm o contexto limpo ou acrescentam uma conferência. Retrabalho custa mais que token.',
    adr: '0009-quality-before-token-cost.md',
  },
  {
    title: 'Skills em inglês, respostas na língua da pessoa',
    body: 'O texto das skills é em inglês, para qualquer pessoa conseguir ler, revisar e contribuir. O agente conversa na sua língua e escreve spec, ticket e PR na língua que o repositório já usa.',
    adr: '0011-skills-in-english-answers-in-the-persons-language.md',
  },
  {
    title: 'O fluxo é aberto; o que é só da V4 mora num pacote do time',
    body: 'O core, o fluxo de código, o instalador e este site são públicos. Os Standards da V4, o código de referência e tudo que descreve os nossos sistemas ficam privados: primeiro num pacote instalado por cima, hoje dentro do Home Repo da V4 (ADR 0019).',
    adr: '0012-open-source-flow-and-team-packs.md',
  },
];

export const faq = [
  {
    title: 'Começando',
    items: [
      ['Por onde eu começo?', 'Chame [[marsai-mode]] com o que você quer numa frase, seja dev ou PM. O agente recomenda o caminho, mostra a checklist e conduz até o fim, parando em cada gate. Um card que já existe no tracker é um começo válido: o agente lê e pergunta só o que falta.'],
      ['Preciso passar por todas as etapas sempre?', 'Não. Bug, ajuste pequeno e débito técnico vão direto para a [[implement]]. Se a única dúvida é como fazer, vá para a [[to-spec]], sem demo. Issue que já tem spec e fatias vai direto para a [[implement-spec]]. Veja os caminhos no [mapa](@map).'],
      ['Como instalo?', 'O jeito mais curto é colar o pedido da [página inicial](@home) no seu agente: ele instala e mostra o primeiro passo. À mão: `npx --yes github:{{repo}}`, que tem um assistente. No Claude Code também dá para instalar direto: `claude plugin marketplace add {{repo}}` e depois `claude plugin install marsai-dev@marsai-oss`, que traz o `marsai-core` junto.'],
      ['Funciona fora do Claude Code?', 'O instalador também leva as skills para o Codex, o Cursor e o OpenCode.'],
      ['As skills são chamadas como?', 'Pelo menu `/`, com o nome do plugin na frente: `/marsai-dev:to-spec`. Agentes não aparecem no menu: quem os despacha são as skills.'],
      ['As skills estão em inglês. O agente vai falar inglês comigo?', 'Não. O texto que o agente lê é em inglês, mas ele conversa na língua em que você escreve e escreve spec, ticket e PR na língua que o repositório já usa.'],
      ['Posso usar no meu time?', 'Pode. A licença é Apache 2.0. Este é o jeito da V4: o ideal é fazer um fork e trocar o que é nosso pelo que é seu. Veja [Faça o seu](@fork).'],
    ],
  },
  {
    title: 'Planejando',
    items: [
      ['O agente pode planejar por mim?', 'Não. Ele pergunta, busca os fatos e recomenda; você decide. Nenhuma skill entrega o desenho a um agente planejador.'],
      ['Toda feature precisa de demo?', 'Feature, sim: é a regra. Só não precisa quando a única dúvida é como construir. Bug, ajuste pequeno e débito técnico entram direto no build. Veja [[demo]].'],
      ['Qual a diferença entre demo e protótipo?', 'A demo é a feature funcionando, usada por um usuário real, para provar valor. O protótipo é menor: código descartável que responde uma pergunta de desenho no meio do grill. Veja [[prototype]].'],
      ['A demo vai para produção?', 'É a primeira opção: atrás de feature flag, para usuários selecionados, com aprovação explícita, dados protegidos e rollback. Quando não dá, ela roda em dev, e fora da codebase só como último recurso. A liberação geral espera o hardening. O TL decide o que reaproveita e o que reescreve.'],
      ['Onde fica a spec?', 'Na issue-mãe do tracker, nunca em pasta local. A parte de produto fica na descrição; o refinamento técnico, num comentário.'],
      ['O que é uma fatia vertical?', 'Um comportamento funcionando de ponta a ponta, que atravessa todas as camadas e todos os repositórios necessários e pode ser demonstrado sozinho. Veja [[to-tickets]].'],
    ],
  },
  {
    title: 'Implementando',
    items: [
      ['Uso a implement ou a implement-spec?', 'Issue-mãe com várias fatias: [[implement-spec]]. Uma fatia avulsa, um ajuste ou um bug: [[implement]]. O caminho por dentro é o mesmo.'],
      ['Por que o implementador não segue os Standards?', 'Porque ele já está com o contexto cheio explorando e depurando. O reviewer recebe o diff pronto e tem contexto sobrando para ler as regras inteiras e corrigir.'],
      ['O agente parou e pediu uma decisão. Por quê?', 'Ele para em três casos: a fatia depende de uma decisão que a spec não tomou; os checks não ficam verdes depois de uma tentativa honesta; ou implementar exigiria sair do contrato, do escopo ou do desenho do programa combinados. Ele para aquela fatia, não o trabalho todo.'],
      ['Tenho um bug. Preciso de spec?', 'Não precisa de issue-mãe. Bug começa por um teste que reproduz o bug, e segue pela [[implement]].'],
      ['Onde entram as regras de código do meu time?', 'Num pacote do time: um plugin seu, com os seus Standards e o seu guia de implementação. O review carrega o que o pacote oferece. Veja [Faça o seu](@fork).'],
    ],
  },
  {
    title: 'PR e review',
    items: [
      ['O que o reviewer muda no meu código?', 'O que tem uma resposta certa, sem mudar comportamento nem contrato público, e só dentro do diff. Isso inclui um desvio local do desenho do programa. As correções entram em commits separados dos seus. O resto vira "precisa de decisão".'],
      ['O bot deu nota baixa. E agora?', 'A nota é a pior entre seis dimensões, então uma dimensão fraca derruba o resto. A [[babysit-pr]] faz a triagem achado por achado: corrige o que é válido e rejeita falso positivo por escrito. O bot informa o merge; quem decide é uma pessoa, a não ser que um `full-send` cubra uma porta de duas vias.'],
      ['Quem faz o merge?', 'Por padrão, uma pessoa. Com um [[full-send]] explícito, o agente faz o merge sozinho de uma porta de duas vias, só quando os checks, a nota 5 do bot de review e o [[sol-loop]] passam no último commit. Porta de mão única sempre espera uma pessoa.'],
      ['O que é porta de mão única?', 'É quando reverter o código não desfaz o efeito: migration que apaga dado, e-mail ou cobrança disparados, evento que outro serviço já consumiu. A PR declara isso no perigo do merge. Veja [[open-pr]].'],
      ['Para que serve a retro?', 'Para o mesmo comentário não ser escrito duas vezes. Ela propõe onde colocar a regra: num check, se uma máquina consegue conferir, ou nos Standards, se é julgamento. Ela também anota quanto tempo a leitura humana levou e quantas rodadas de mudança ela pediu. Veja [[retro]].'],
    ],
  },
];
