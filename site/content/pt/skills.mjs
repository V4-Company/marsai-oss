// What the page teaches about each skill. The skill texts themselves are read
// from plugins/ at build time (build.mjs), so the reference never drifts.
//
// Inline markup understood by the page: `code`, **bold**, [[slug]] (link to a
// skill page), [[slug|text]] and links to pages by route name: [mapa](@map).
//
// The running example is illustrative: a change that crosses two services.

import { extras, extraGroup } from './extras.mjs';
export const site = { version: '5.0' };

export const example = {
  title: 'Cancelar um deal recorrente cancela a assinatura no provedor',
  summary:
    'Hoje, quando um deal recorrente é cancelado, a assinatura continua viva no provedor de pagamento e pode voltar a cobrar. A mudança mexe em dois serviços: `billing`, que pede o cancelamento, e `payments`, que fala com o provedor.',
};

export const actors = {
  pessoa: { label: 'Pessoa decide', hint: 'O agente pergunta e traz os fatos. Quem decide é a pessoa.' },
  agente: { label: 'Agente sozinho', hint: 'Roda sem esperar ninguém. Para só quando falta uma decisão.' },
  freio: { label: 'Freio automático', hint: 'Uma máquina confere. Não gasta a atenção de ninguém.' },
};

export const groups = [
  {
    id: 'comecar',
    title: 'Começar',
    desc: 'Adapte ao seu projeto e escolha a etapa certa para trabalhar.',
    skills: ['marsai-mode', 'using-marsai', 'home-repo'],
  },
  {
    id: 'fluxo',
    title: 'O fluxo principal',
    desc: 'Da ideia ao merge, em ordem.',
    skills: ['grill-with-docs', 'demo', 'to-spec', 'to-tickets', 'implement-spec', 'code-review', 'open-pr', 'babysit-pr', 'retro'],
  },
  {
    id: 'desvios',
    title: 'Desvios e atalhos',
    desc: 'Para quando o caminho principal não é o caso.',
    skills: ['wayfinder', 'prototype', 'handoff', 'implement', 'tdd'],
  },
  {
    id: 'agentes',
    title: 'Agentes',
    desc: 'Quem as skills despacham. Você não chama direto.',
    skills: ['backend-engineer-typescript', 'frontend-engineer', 'code-reviewer'],
  },
];

const ONLY_YOU = 'Só você chama, pelo menu `/`. O agente não dispara sozinho.';
const BOTH = 'Você chama pelo menu `/`. O agente também carrega sozinho quando a situação pede.';

export const skills = {
  'wayfinder': {
    ref: 'marsai-core:wayfinder',
    call: '/marsai-core:wayfinder [contexto do grill ou URL do mapa]',
    callNote: ONLY_YOU,
    icon: 'map',
    actor: 'pessoa',
    tagline: 'Quando o grill cresce, encontre o caminho uma decisão de cada vez.',
    what: [
      'Organiza no Linear um planejamento que ficou grande demais para uma conversa. O mapa guarda o destino e um índice das decisões; as issues filhas guardam as perguntas e suas respostas.',
      'Entra depois de começar pelo [[grill-with-docs]]. Uma mudança pequena pode seguir direto para [[implement]]. Se o grill já deixou o caminho claro, não precisa de mapa.',
    ],
    when: { rows: [
      ['Mudança pequena, fácil de revisar e refazer', '[[implement]], com checks e review'],
      ['Mudança média ou grande ainda sem alinhamento', '[[grill-with-docs]] primeiro'],
      ['O grill revelou muitas perguntas dependentes', '[[wayfinder]]'],
      ['Já existe um mapa de decisões', 'Retome pela URL e resolva uma pergunta desbloqueada'],
      ['Decisões resolvidas', '[[demo]], se é uma feature; [[to-spec]], se a única dúvida é como construir'],
    ] },
    steps: [
      'Reaproveita o grill e confirma com você o destino e o escopo.',
      'Cria uma issue-mapa e filhas para perguntas que já podem ser formuladas. Registra os bloqueios entre elas.',
      'Em cada sessão, assume uma pergunta desbloqueada: pesquisa, protótipo, grill ou uma tarefa que libera uma decisão.',
      'Registra a resposta na filha, atualiza o índice e transforma novas incertezas em perguntas quando ficam claras.',
      'Quando o caminho está decidido, a feature segue para a demo e, depois dela, o mapa serve de fonte para a spec. As fatias de implementação vêm depois.',
    ],
    records: ['Mapa e perguntas no Linear', 'Decisões e evidências nas filhas', 'Glossário e ADRs quando couber'],
    worksIf: ['Outra sessão consegue retomar uma pergunta sem reler a conversa inteira.', 'O destino ficou claro e as decisões necessárias à execução estão resolvidas.'],
    faq: [
      ['Começo um projeto grande pelo Wayfinder?', 'Comece pelo [[grill-with-docs]]. Ele pode mostrar que a solução é menor do que parecia. Só crie o mapa quando a conversa revelar que precisa dele.'],
      ['As filhas do mapa são as fatias de implementação?', 'Não. Elas resolvem perguntas. [[to-tickets]] corta a spec em comportamentos implementáveis depois que as decisões estão claras.'],
      ['De onde veio?', 'Adaptado da skill Wayfinder de Matt Pocock. O link para o original está no texto da skill; no MarsAI o mapa vive no Linear.'],
    ],
  },
  'marsai-mode': {
    ref: 'marsai-core:marsai-mode',
    call: '/marsai-core:marsai-mode [o que você quer, ou o identificador da issue]',
    callNote: ONLY_YOU,
    icon: 'play',
    actor: 'pessoa',
    tagline: 'Diga o que quer numa frase. O agente conduz até o fim.',
    what: [
      'É a porta única para qualquer trabalho: feature, bug, ajuste, uma pergunta sobre o código, uma entrega para acompanhar ou uma PR para cuidar. Serve para quem desenvolve e para quem cuida de produto. Você escreve o que quer, ou traz um card, e o agente conduz dali até a última etapa.',
      'Ele lê o que já existe, recomenda o tamanho do trabalho e o caminho, e você confirma. O caminho vira uma checklist visível, com os gates marcados como parada. Etapa que o trabalho não vai fazer continua na lista, com o motivo. Entre um gate e outro ele segue sozinho; em cada gate, para e espera a sua decisão.',
      'A ideia vem do `poteto-mode`, de Lauren Tan, no pstack. O MarsAI mantém a sua regra por cima: em cada gate, uma pessoa decide.',
    ],
    when: {
      rows: [
        ['Vai começar qualquer trabalho', '`/marsai-core:marsai-mode`, com o que você quer numa frase'],
        ['Já sabe a etapa e quer só ela', 'Chame a skill direto'],
        ['Vai usar o MarsAI pela primeira vez', '[[using-marsai]], que adapta ao seu projeto antes'],
        ['Quer ver o caminho inteiro antes', 'O [mapa](@map)'],
      ],
    },
    steps: [
      'Lê o que você escreveu, a branch, a PR aberta, a configuração do projeto e a issue, quando há uma. Um card que já existe é um começo válido: diz o que ele já responde dos gates G0 e G1, pergunta só o que falta e grava as respostas no card.',
      'Recomenda o caminho com o motivo em uma frase, e você confirma ou troca.',
      'Coloca o caminho na lista de tarefas da sessão, com os gates marcados como parada e cada etapa pulada com o motivo.',
      'Chama a skill de cada etapa, uma depois da outra. Para em cada gate e antes de qualquer ação que não se desfaz: merge, deploy, apagar dados, escrever para um cliente.',
      'Se o trabalho muda de tamanho no meio, avisa e reescreve a checklist depois que você concorda.',
    ],
    tables: [
      {
        id: 'caminhos',
        title: 'Os caminhos',
        intro: 'Uma pergunta decide entre o fast track e uma feature: dá para saber se a mudança está certa lendo o código e rodando os testes, ou só quando um usuário usar? Só quando um usuário usar, precisa de demo.',
        head: ['O trabalho', 'Caminho', 'Começa em'],
        rows: [
          ['Comportamento novo que ninguém provou que vale', 'Feature: as duas fases', 'O problema e o intent, gates G0 e G1'],
          ['O valor está decidido e a única dúvida é como fazer', 'Hardening', '[[to-spec]]'],
          ['Bug, ajuste pequeno, débito técnico, refatoração ou lentidão medida, com o resultado esperado conhecido', 'Fast track', '[[implement]]'],
          ['Issue que já passou por parte do fluxo', 'De onde parou', 'A primeira etapa que falta'],
          ['PR aberta', 'Acompanhamento', '[[babysit-pr]]'],
          ['Pergunta sobre o código, ou sobre como anda uma entrega', 'Resposta', 'Sem skill: o agente lê e responde, sem mudar nada'],
        ],
      },
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'Você fala uma vez. O agente conduz. Nos gates, você decide.',
        nodeW: 170,
        nodes: [
          { id: 'f', label: 'Uma frase ou um card', kind: 'pessoa', col: 0, row: 0 },
          { id: 'r', label: 'Caminho recomendado', sub: 'você confirma', kind: 'pessoa', col: 1, row: 0 },
          { id: 'c', label: 'Checklist', sub: 'gates e etapas puladas', kind: 'doc', col: 2, row: 0 },
          { id: 'e', label: 'Etapa por etapa', sub: 'o agente chama a skill', kind: 'agente', col: 3, row: 0 },
          { id: 'g', label: 'Gate', sub: 'você decide', kind: 'pessoa', col: 4, row: 0 },
        ],
        edges: [
          { from: 'f', to: 'r' }, { from: 'r', to: 'c' }, { from: 'c', to: 'e' }, { from: 'e', to: 'g' },
        ],
      },
    ],
    example: {
      kind: 'chat',
      lines: [
        ['pessoa', '/marsai-core:marsai-mode quero que cancelar um deal recorrente cancele a assinatura no provedor'],
        ['agente', 'Os testes dizem se o cancelamento chega ao provedor, mas não dizem o que fazer com a cobrança já agendada nem o que o cliente vê, e isso é decisão de produto que ainda não foi tomada. Recomendo o caminho de feature, começando pelo problema e pelo intent. Confirma?'],
        ['pessoa', 'Confirmo.'],
        ['agente', 'A checklist tem as duas fases, com os sete gates marcados como parada. Começo pelo G0: quem sofre com isso e qual é o impacto?'],
      ],
    },
    records: ['A checklist do caminho, na lista de tarefas da sessão', 'O que faltava no card, gravado nele', 'Cada decisão de gate, na issue'],
    worksIf: ['Você confirmou o caminho antes da primeira etapa.', 'A checklist mostra todas as etapas, inclusive as puladas, com o motivo.', 'Nenhum gate passou sem a sua decisão.'],
    faq: [
      ['E a dev-start e a pm-start?', 'Viraram um aviso: mostram o comando `/marsai-core:marsai-mode` para você digitar. O modo serve para quem desenvolve e para quem cuida de produto; com quem cuida de produto, fala do que muda para quem usa.'],
      ['Quem decide se é pequeno?', 'O agente recomenda, com o motivo, e você confirma. Se o tamanho mudar no meio do trabalho, ele avisa e propõe o novo caminho.'],
      ['Preciso usar sempre?', 'Não. Sabendo a etapa, chame a skill direto. O modo existe para você não precisar decorar o caminho.'],
      ['De onde veio?', 'Do `poteto-mode`, de Lauren Tan, no pstack, com licença MIT: a porta única, a checklist visível e a etapa pulada que fica com o motivo. O texto foi escrito aqui, para os caminhos e os gates do MarsAI.'],
    ],
  },

  'using-marsai': {
    ref: 'marsai-core:using-marsai',
    call: '/marsai-core:using-marsai',
    callNote: BOTH,
    icon: 'map',
    actor: 'pessoa',
    tagline: 'Adapte o MarsAI à sua arquitetura e encontre o próximo passo.',
    what: [
      'É o mapa em texto: as dez etapas do caminho principal, os atalhos, o que se faz com a pessoa e o que roda sozinho, e a ordem dos freios. O caminho tem duas fases, planejamento e hardening, e sete gates, os pontos em que uma pessoa decide se o trabalho avança.',
      'No primeiro uso, faz uma entrevista breve sobre seu papel, o projeto e o time. Lê a arquitetura, os exemplos de código e os checks existentes para propor uma adaptação. Com sua autorização, registra o contexto para as próximas sessões. Depois, ajuda a escolher a skill certa.',
    ],
    when: {
      rows: [
        ['Vai testar o MarsAI ou adaptá-lo à arquitetura do seu time', '`/marsai-core:using-marsai`, com uma entrevista breve antes do primeiro trabalho'],
        ['Quer que o agente diga o próximo passo', 'Pergunte. Ele carrega o mapa sozinho'],
        ['Quer ser conduzido do começo ao fim', '[[marsai-mode]]'],
        ['Quer entender o desenho', 'O [mapa interativo](@map) desta página'],
      ],
    },
    steps: [],
    records: [],
    worksIf: [],
    faq: [
      ['Qual a diferença para o marsai-mode?', 'A primeira configuração adapta o MarsAI ao seu projeto. Com ela registrada, o [[marsai-mode]] conduz o trabalho de hoje do começo ao fim.'],
    ],
  },

  'home-repo': {
    ref: 'marsai-core:home-repo',
    call: '/marsai-core:home-repo',
    callNote: BOTH,
    icon: 'layers',
    actor: 'pessoa',
    tagline: 'Um repositório onde toda sessão começa, apontando para todos os outros.',
    what: [
      'Um time que trabalha em muitos repositórios acaba com uma cópia das skills e das instruções de agente em cada um, e cada sessão só enxerga o repositório em que começou. O Home Repo é o remédio que o Matt Pocock nomeou: um repositório com o que o time compartilha (os arquivos de instrução, os docs, uma wiki e as ferramentas) e um ponteiro para cada um dos outros repositórios. Toda sessão começa nele, então toda sessão tem a mesma configuração e a visão do todo.',
      'A skill monta o home em quatro passos, seguindo o arco do prompt de setup do Matt: inventaria os repositórios, medindo a atividade pelas PRs mergeadas; inventaria as skills, as regras e as instruções de agente, e acha as cópias pelo conteúdo; combina com você onde cada item fica; e aplica o plano, com uma PR por repositório. O código fica onde está.',
      'É como a V4 roda o MarsAI hoje: cerca de 40 pessoas, 80+ repositórios, e toda sessão começando num Home Repo cujo `.claude/` guarda as skills, os Standards e as travas do time, e o próprio MarsAI. Um `git pull` atualiza todo mundo. Para testar o MarsAI num repositório, você não precisa de nada disso: instale os plugins.',
    ],
    when: {
      rows: [
        ['O trabalho passa por vários repositórios', '`/marsai-core:home-repo`, uma vez para o time'],
        ['As mesmas skills ou instruções estão copiadas em vários repositórios', '`/marsai-core:home-repo`: o segundo passo acha as cópias e propõe um lugar para cada uma'],
        ['Entra um repositório, uma área ou uma ferramenta nova', 'Peça: ele adiciona o ponteiro no arquivo da área'],
        ['O time tem um repositório só, ou um monorepo', 'Não precisa: esse repositório já é o home'],
      ],
    },
    steps: [
      'Inventaria os repositórios: caminho, remoto, visibilidade e atividade, as PRs mergeadas nos últimos 30 dias e por quantas pessoas. Pergunta para quais o home aponta, onde ele fica e se é seu ou do time.',
      'Inventaria o que foi escrito para agentes: skills, AGENTS.md e CLAUDE.md, regras, settings com hooks, Standards, glossários, ADRs. Compara as cópias pelo conteúdo e coloca cada item em compartilhado, duplicado, do repositório, instalado ou pessoal.',
      'Mostra o plano: uma tabela com cada item, onde está, o balde e o destino, e o arquivo de entrada do home com os ponteiros. Uma skill, um agente, um hook ou um Standard vai para o `.claude/` do home; um arquivo de instrução, um doc ou uma ferramenta também vai para o home. Você aprova.',
      'Aplica: cria o home com os ponteiros, as settings e o check, copia cada item para o seu lugar único e, em cada repositório que tinha uma cópia, abre uma PR que a remove.',
    ],
    tables: [
      {
        id: 'onde',
        title: 'O que vai onde',
        intro: 'Uma pergunta para cada item: isso vale para um repositório, ou para todos?',
        head: ['O quê', 'Para onde vai'],
        rows: [
          ['Os ponteiros, o arquivo de entrada que toda sessão carrega, a wiki, as ferramentas', 'O Home Repo'],
          ['Uma skill, um Standard ou um guia de implementação que o time todo usa', 'O `.claude/` do home, carregado sem instalação; ou um pacote do time, quando precisa chegar a sessões que começam em outro lugar'],
          ['Um termo ou uma decisão que nenhum repositório sozinho possui', 'O Home Repo'],
          ['O código, os comandos de build e teste, o AGENTS.md, o glossário e as ADRs de cada um', 'Cada repositório'],
          ['Como você gosta de trabalhar', 'A sua pasta de usuário'],
        ],
      },
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'Toda sessão começa no home. Os ponteiros levam aos clones, e cada trabalho ganha a sua worktree e a sua PR.',
        nodeW: 168,
        nodes: [
          { id: 'p', label: 'Você', sub: 'uma frase', kind: 'pessoa', col: 0, row: 0 },
          { id: 'h', label: 'Home Repo', sub: 'entrada, ponteiros, wiki', kind: 'doc', col: 1, row: 0 },
          { id: 'a', label: 'billing', sub: 'uma worktree do clone', kind: 'agente', col: 2, row: 0 },
          { id: 'b', label: 'payments', sub: 'uma worktree do clone', kind: 'agente', col: 2, row: 1 },
          { id: 'r', label: 'Uma PR por repositório', sub: 'ligadas à mesma issue', kind: 'freio', col: 3, row: 0 },
        ],
        edges: [
          { from: 'p', to: 'h' }, { from: 'h', to: 'a', label: 'ponteiro' }, { from: 'h', to: 'b', route: 'vh', label: 'ponteiro' },
          { from: 'a', to: 'r' }, { from: 'b', to: 'r', route: 'hv' },
        ],
      },
    ],
    example: {
      kind: 'doc',
      title: 'Um ponteiro em repos/finance.md',
      lines: [
        '**payments** (links de pagamento, webhooks, reembolsos): `<root>/payments`.',
        'Se faltar, clone `acme/payments` ali.',
        'Leia o AGENTS.md dele antes de mudar. As ADRs ficam em `docs/decisions/`.',
      ],
    },
    records: ['O arquivo de entrada do home e um arquivo de ponteiros por área', 'Um catálogo dos repositórios, do qual os ponteiros são gerados', 'Uma PR em cada repositório que tinha uma cópia para remover'],
    worksIf: ['Uma sessão que começa no home acha qualquer repositório sem alguém dizer onde ele está.', 'Cada skill e cada regra mora num lugar só.', 'Ninguém copia mais uma instrução para um repositório novo.'],
    faq: [
      ['Todo mundo usa o mesmo home?', 'Sim. Para um time, o home é o que todos compartilham, e todos começam as sessões nele. O jeito de cada pessoa trabalhar fica na pasta de usuário dela.'],
      ['As settings e os hooks de cada repositório continuam valendo?', 'Não a partir do home: a sessão carrega as settings e as instruções da pasta em que começou. Por isso as settings do home e o `.claude/hooks/` levam as travas de que todos precisam, e o arquivo de entrada manda o agente ler o AGENTS.md de um repositório antes de mudá-lo.'],
      ['Por que não um monorepo?', 'Quando dá para ter um, ele encaixa melhor. O home é para quando não dá: repositórios públicos e privados lado a lado, deploys separados, ou um time que não vai migrar.'],
      ['De onde vem?', 'Do artigo The Home Repo Pattern, do Matt Pocock, no AI Hero. O MarsAI acrescenta a atividade medida pelas PRs mergeadas, as skills e os Standards do time no `.claude/` do home, o passo opcional de manter o próprio MarsAI ali e as settings que dão a toda sessão as mesmas travas.'],
      ['Preciso de um Home Repo para usar o MarsAI?', 'Não. Um repositório só, ou uma pessoa testando, precisa apenas dos plugins ou do instalador. O Home Repo é como um time com muitos repositórios escala o uso, como a V4 faz.'],
    ],
  },

  'grill-with-docs': {
    ref: 'marsai-core:grill-with-docs',
    call: '/marsai-core:grill-with-docs',
    callNote: BOTH,
    icon: 'chat',
    actor: 'pessoa',
    tagline: 'Seja entrevistado sobre o plano, e saia com as decisões gravadas.',
    what: [
      'O agente entrevista você até não sobrar decisão implícita. Ele pergunta, busca os fatos e recomenda. Quem decide é você: planejar é trabalho da pessoa, e nenhuma skill entrega o desenho a um agente planejador.',
      'Enquanto a conversa anda, ele escreve no repositório. Termo resolvido entra no glossário (`CONTEXT.md`) na hora. Decisão difícil de desfazer vira ADR em `docs/adr/`.',
      'Erro de entendimento pego aqui custa uma resposta. Pego na PR, custa a esteira inteira.',
    ],
    when: {
      rows: [
        ['Tem uma ideia e o desenho ainda não está decidido', '`/marsai-core:grill-with-docs`'],
        ['As decisões já foram tomadas numa call ou num doc', '[[to-spec]], que chama o grill só para o que ficou em aberto'],
        ['Uma pergunta só se resolve vendo funcionar', 'O grill manda para o [[prototype|protótipo]] em outro agente'],
        ['É um ajuste de um comportamento só', '[[implement]]'],
        ['O grill terminou e é uma feature', '[[demo]]'],
      ],
    },
    steps: [
      'Confirma o **intent**: o problema, o resultado esperado, como medir o sucesso e o que fica fora do escopo.',
      'O plano vira uma **árvore de decisões**: cada decisão abre as que dependem dela.',
      'A cada rodada, o agente pergunta de uma vez tudo que já dá para responder (a **fronteira**), numerado, com a recomendação dele em cada pergunta.',
      'Fato não é pergunta. Antes de cada rodada ele lê o código (com o checkout atualizado), a issue do Linear e o catálogo de eventos.',
      'O primeiro fato é a lista de repositórios que a mudança toca, com a ordem de deploy e o contrato que liga cada par.',
      'Termina quando a fronteira está vazia. Ele resume as decisões e só segue depois que você confirma. Para uma feature, o resumo lista as hipóteses que a demo vai testar e quem vai usar.',
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'Uma pergunta só entra na rodada quando as respostas de que ela depende já existem.',
        nodeW: 178,
        colLabels: { 1: 'Rodada 1', 2: 'Rodada 2' },
        nodes: [
          { id: 'p', label: 'O plano', kind: 'doc', col: 0, row: 0.5 },
          { id: 'q1', label: 'Q1 · Quais motivos encerram a assinatura?', kind: 'pessoa', col: 1, row: 0 },
          { id: 'q2', label: 'Q2 · E se o provedor falhar?', kind: 'pessoa', col: 1, row: 1 },
          { id: 'q3', label: 'Q3 · Onde o financeiro vê "pendente"?', kind: 'pessoa', col: 2, row: 0 },
          { id: 'q4', label: 'Q4 · Alerta depois de quanto tempo?', kind: 'pessoa', col: 2, row: 1 },
          { id: 'r', label: 'Resumo confirmado', sub: 'glossário e ADRs gravados', kind: 'doc', col: 3, row: 0.5 },
        ],
        edges: [
          { from: 'p', to: 'q1' }, { from: 'p', to: 'q2' }, { from: 'q1', to: 'q3' }, { from: 'q2', to: 'q4' },
          { from: 'q3', to: 'r' }, { from: 'q4', to: 'r' },
        ],
      },
    ],
    example: {
      kind: 'chat',
      lines: [
        ['agente', 'Li o código: o billing publica subscription.cancel-requested e o payments só cancela link OPEN. Dois repositórios, payments sobe antes.\n\nQ1 - Quais motivos encerram a assinatura? Recomendo três: deal cancelado, billing cancelado e última parcela paga. Reprecificação não.\n\nQ2 - Se o provedor de pagamento falhar no cancelamento, o que acontece? Recomendo marcar como pendente e tentar de novo, sem mandar para a fila de erro.'],
        ['pessoa', 'Q1 ok. Q2: pendente, mas quero um alerta se ficar mais de um dia.'],
        ['agente', 'Anotado. "Pendente" entra no glossário do payments. A regra "assinatura cancelada no provedor não volta" vira ADR lá, porque outro time precisa respeitar.'],
      ],
    },
    records: ['`CONTEXT.md`: os termos resolvidos', '`docs/adr/`: as decisões difíceis de desfazer', 'A lista de repositórios, com ordem de deploy e contrato'],
    worksIf: [
      'Toda pergunta que o agente fez era uma decisão, não um fato que ele podia ter lido.',
      'Você confirmou um resumo sem nenhuma decisão assumida em silêncio.',
      'Os termos novos estão no glossário do repositório dono do conceito.',
    ],
    faq: [
      ['O agente pode decidir por mim?', 'Não. Ele recomenda em cada pergunta, e você decide. É a regra de desenho mais importante do fluxo: quem planeja é a pessoa.'],
      ['Tudo vira ADR?', 'Não. Só o que é difícil de desfazer, surpreendente sem contexto e fruto de um trade-off real. Faltou uma das três, não é ADR. Regra que outro time precisa respeitar é ADR.'],
      ['E se eu trouxer a transcrição de uma call?', 'As decisões que a call já tomou entram como resolvidas, e o grill cobre só o que ficou em aberto. Ele confere no código cada nome técnico citado, porque transcrição erra nome.'],
    ],
  },

  demo: {
    ref: 'marsai-dev:demo',
    call: '/marsai-dev:demo [issue ou o que demonstrar]',
    callNote: BOTH,
    icon: 'play',
    actor: 'agente',
    gate: 'Um usuário real usa a demo. O veredito é seu.',
    tagline: 'A feature funcionando, na mão de um usuário, antes de qualquer hardening.',
    what: [
      'Constrói uma primeira versão que funciona, dentro da codebase real sempre que der: feia por dentro, real por fora. Ela responde uma pergunta em meio dia a dois dias: era isso que o usuário queria?',
      'O refinamento técnico completo vai para o que provou valor. A demo roda, por ordem de preferência, em produção atrás de feature flag para usuários selecionados, com aprovação explícita, dados protegidos e rollback; em dev, com o usuário usando; ou fora da codebase, como último recurso. Depois dela, a [[to-spec]] corta a v1 e o hardening prepara a liberação geral.',
    ],
    when: {
      rows: [
        ['Uma feature saiu do grill', '`/marsai-dev:demo`'],
        ['Bug, ajuste pequeno ou débito técnico', '[[implement]], sem demo'],
        ['A única dúvida é como construir', '[[to-spec]], sem demo'],
        ['Uma pergunta de desenho só: uma regra, uma tela, uma troca de eventos', '[[prototype]], que custa menos'],
      ],
    },
    steps: [
      'Parte do resumo do grill: o intent, as regras fechadas, as hipóteses e quem vai usar.',
      'Dimensiona: de meio dia a dois dias. Se não cabe, propõe demos menores, uma por hipótese.',
      'Constrói numa branch `demo/<nome>`, pela velocidade: reaproveita o que existe, sem Standards e sem review. Uma demo fora da codebase fica numa pasta própria.',
      'Combina com você onde ela roda, pela opção mais alta que a feature permite: produção atrás de feature flag, dev ou, como último recurso, fora da codebase. Diz qual opção usou e por que uma mais alta não foi possível.',
      'Entrega o que você precisa para pôr na mão do usuário: onde roda, um roteiro por hipótese e um vídeo ou GIF.',
      'Registra o veredito na issue: onde rodou, o que o usuário fez e disse, e a decisão.',
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'Só uma saída do veredito leva ao hardening.',
        nodeW: 176,
        nodes: [
          { id: 'g', label: 'Resumo do grill', sub: 'hipóteses e usuário', kind: 'doc', col: 0, row: 1.5 },
          { id: 'd', label: 'Demo', sub: 'branch demo/<nome>', kind: 'agente', col: 1, row: 1.5 },
          { id: 'u', label: 'Usuário usa', sub: 'não só vê', kind: 'pessoa', col: 2, row: 1.5 },
          { id: 's', label: 'Resolve', sub: 'to-spec corta a v1', kind: 'agente', col: 3, row: 0 },
          { id: 'a', label: 'Quase', sub: 'outra rodada', kind: 'agente', col: 3, row: 1 },
          { id: 'r', label: 'Abriu uma dúvida', sub: 'volta ao grill, depois outra demo', kind: 'pessoa', col: 3, row: 2 },
          { id: 'n', label: 'Não resolve', sub: 'descarte a ideia e registre o motivo', kind: 'bad', col: 3, row: 3 },
        ],
        edges: [
          { from: 'g', to: 'd' }, { from: 'd', to: 'u' }, { from: 'u', to: 's' }, { from: 'u', to: 'a' }, { from: 'u', to: 'r' }, { from: 'u', to: 'n' },
        ],
      },
    ],
    tables: [
      {
        id: 'inegociavel',
        title: 'O que vale igual na demo e em produção',
        intro: 'São só quatro regras, porque quebrar uma delas custa o mesmo nos dois casos.',
        head: ['Regra', 'Por quê'],
        rows: [
          ['Merge só com aprovação de um experimento protegido', 'A liberação geral espera o hardening'],
          ['Dados isolados; escritas em produção só com aprovação e rollback', 'Um erro de demo não pode custar dado real'],
          ['Dado de cliente fica em ambiente controlado', 'Privacidade não tem modo rascunho'],
          ['Nenhum segredo no código', 'Branch de demo também vaza'],
        ],
      },
    ],
    example: {
      kind: 'chat',
      lines: [
        ['pessoa', '/marsai-dev:demo o cancelamento de assinatura, do grill de ontem'],
        ['agente', 'A demo testa duas hipóteses: o financeiro entende o estado "pendente" sem explicação, e o alerta depois de um dia é suficiente. Quem usa: a analista do financeiro. Cabe em um dia. Vou construir em demo/cancelamento-assinatura, com o provedor simulado.'],
        ['agente', 'Rodando no preview. Roteiro: cancelar um deal com ciclo pago; derrubar o provedor e ver o pendente; esperar o alerta. O GIF do caminho principal está na issue.'],
        ['pessoa', 'Ela usou. O pendente ficou claro, mas ela quer ver o motivo do cancelamento na lista.'],
        ['agente', 'Registrado na issue: resolve o intent, com um ajuste para a v1 (motivo na lista). Próximo passo: to-spec, que corta a v1.'],
      ],
    },
    records: ['A branch `demo/<nome>`, onde ela rodou e por que uma opção mais alta não foi possível', 'Vídeo ou GIF do caminho principal', 'Feedback do usuário e a decisão, na issue'],
    worksIf: ['Um usuário real usou a demo.', 'A issue tem a decisão e a evidência por trás dela.', 'A issue diz onde a demo rodou e por que uma opção mais alta não foi possível. Um experimento em produção tem aprovação explícita e proteções registradas.'],
    faq: [
      ['A demo vira o código final?', 'Não inteira. A [[to-spec]] corta a v1, que é menor que a demo, e registra o que reaproveita e o que reescreve. Depois de uma demo fora da codebase, tudo é reescrito. O que entra passa pelo hardening.'],
      ['E se passar de dois dias?', 'O problema é grande demais para uma demo. A skill propõe demos menores, cada uma testando uma hipótese.'],
      ['Por que sem Standards e sem review?', 'Porque a pergunta da demo é se a ideia presta, não se o código está bom. Qualidade vem depois, só no que provou valor.'],
      ['Qual a diferença para o protótipo?', 'O [[prototype|protótipo]] responde uma pergunta de desenho com código descartável, num arquivo. A demo é a feature inteira funcionando, para um usuário usar.'],
    ],
  },

  'to-spec': {
    ref: 'marsai-dev:to-spec',
    call: '/marsai-dev:to-spec',
    callNote: BOTH,
    icon: 'doc',
    actor: 'agente',
    tagline: 'O que foi decidido vira spec na issue-mãe do Linear. Depois de uma demo, a spec corta a v1.',
    what: [
      'A spec não entrevista ninguém: ela sintetiza o que já foi decidido e ancora tudo no código atual. Decisão que ainda está aberta volta para você antes de qualquer texto ser escrito. Depois de uma demo, ela corta a v1, que é menor que a demo, diz parte por parte o que é reaproveitado e o que é reescrito, e registra um nível de risco.',
      'Toda afirmação técnica vem de código lido nesta sessão, com arquivo e linha. Memória e transcrição não contam: num caso real, a transcrição dizia "be to be" e o enum era `B2B`.',
      'O refinamento técnico desce até o **desenho do programa**: as peças novas com seus tipos e assinaturas, onde elas se ligam ao código existente e quem chama quem, e onde cada teste entra. Ele também lista as fatias e a ordem delas. O plano é aprovado numa **sessão de refinamento** de até 30 minutos, com o tech lead, o PM e o dev responsável; quem decide é o tech lead.',
    ],
    when: {
      rows: [
        ['A demo provou valor', '`/marsai-dev:to-spec`, que corta a v1'],
        ['Acabou um grill e a única dúvida é como construir', '`/marsai-dev:to-spec`, na mesma conversa'],
        ['Tem a transcrição de uma call com as decisões', '`/marsai-dev:to-spec` com a transcrição'],
        ['Pediram para escrever a issue, o job story ou o refinamento técnico', '`/marsai-dev:to-spec`'],
        ['Ainda há decisão de desenho em aberto', '[[grill-with-docs]] primeiro'],
      ],
    },
    steps: [
      'Junta o que já existe: as decisões do grill, ou as que saem da transcrição, da issue ou do pedido.',
      'Confere se cada checkout está atualizado antes de ler. Um repositório 115 commits atrás já produziu a conclusão "este serviço não consome o evento", com arquivo e linha, e era falsa.',
      'Lê o glossário e as ADRs de cada repositório tocado, inclusive os de outro time, e anota as invariantes que a mudança precisa respeitar.',
      'Confirma no catálogo de eventos quem publica e quem consome cada evento.',
      'Lê o caminho de chamadas da mudança: por onde ela entra, o que ela chama até o armazenamento e quais testes já cobrem esse caminho. O desenho do programa é escrito em cima dele.',
      'Depois de uma demo, corta a v1, menor que a demo: diz parte por parte o que é reaproveitado e o que é reescrito, e registra o nível de risco, que define quanta atenção a PR vai pedir. Depois de uma demo fora da codebase, todas as partes são reescritas.',
      'Combina com você em que ponto a mudança será testada.',
      'Mostra o rascunho, pergunta de uma vez o que só você sabe (título, time, TL e PM) e publica.',
      'Prepara a sessão de refinamento: o link do refinamento, as decisões que precisam ser tomadas na sessão e as questões ainda em aberto. Quem conduz a sessão é você. Depois, registra na issue quem participou, o que mudou, a aprovação do tech lead e quem vai ler as PRs.',
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'Três fontes entram. Duas coisas saem, as duas na mesma issue.',
        nodeW: 196,
        nodes: [
          { id: 'a', label: 'Decisões do grill', sub: 'ou da transcrição da call', kind: 'doc', col: 0, row: 0 },
          { id: 'b', label: 'Código atual', sub: 'lido na sessão, com arquivo:linha', kind: 'doc', col: 0, row: 1 },
          { id: 'c', label: 'Regras de cada repositório', sub: 'CONTEXT.md e ADRs', kind: 'doc', col: 0, row: 2 },
          { id: 's', label: 'to-spec', kind: 'agente', col: 1, row: 1 },
          { id: 'd', label: 'Descrição da issue-mãe', sub: 'produto: job story e critérios de aceite', kind: 'doc', col: 2, row: 0.5 },
          { id: 'e', label: 'Comentário na issue-mãe', sub: 'técnico: contrato, invariantes, desenho do programa', kind: 'doc', col: 2, row: 1.5 },
        ],
        edges: [
          { from: 'a', to: 's' }, { from: 'b', to: 's' }, { from: 'c', to: 's' }, { from: 's', to: 'd' }, { from: 's', to: 'e' },
        ],
      },
    ],
    example: {
      kind: 'doc',
      title: 'APP-123 · Cancelar deal recorrente cancela a assinatura',
      lines: [
        'Job story: quando cancelo um deal recorrente, quero que a cobrança pare no provedor, para o cliente não ser cobrado de novo.',
        'Critérios de aceite: assinatura cancelada no provedor · evento repetido não cancela duas vezes · falha do provedor não vai para a fila de erro.',
        'Invariantes a respeitar: no payments, "assinatura cancelada no provedor não volta".',
        'Onde está quebrado hoje: o payments ignora o motivo e só cancela link OPEN.',
      ],
    },
    records: ['Descrição da issue-mãe: a parte de produto', 'Comentário na issue-mãe: o refinamento técnico, com o desenho do programa, as fatias e o registro da sessão', 'ADR no repositório dono, se houver decisão difícil de desfazer'],
    worksIf: [
      'Toda dúvida tem destino: uma decisão, um critério de aceite ou uma questão em aberto com dono.',
      'Cada repositório tem o estado atual com evidência, o que muda nele, as invariantes que valem ali e o caminho de chamadas por onde a mudança passa.',
      'A spec está na issue-mãe, não numa pasta local.',
      'A issue tem o registro da sessão de refinamento: quem participou, a aprovação do tech lead e quem lê as PRs.',
    ],
    faq: [
      ['Onde mora a spec?', 'Na issue-mãe do Linear, nunca em pasta local. A parte de produto fica na descrição; o refinamento técnico, num comentário, que é a fonte única dos contratos.'],
      ['E se o PM já escreveu a descrição?', 'A descrição é dele e fica como está. O refinamento técnico entra como comentário.'],
      ['E um trabalho pequeno, de um repositório só?', 'Vira uma issue só, num modelo mais curto. Não precisa de issue-mãe com filhas.'],
      ['A v1 é a demo?', 'Não. A v1 é menor que a demo. O tech lead decide o que é reaproveitado e o que é reescrito, e só a v1 passa pelo hardening.'],
    ],
  },

  'to-tickets': {
    ref: 'marsai-dev:to-tickets',
    call: '/marsai-dev:to-tickets',
    callNote: BOTH,
    icon: 'layers',
    actor: 'agente',
    gate: 'Você confirma o corte das fatias antes de qualquer issue ser criada.',
    tagline: 'A spec é cortada em fatias verticais, com os bloqueios entre elas.',
    what: [
      'Uma **fatia** é um comportamento funcionando de ponta a ponta: atravessa todas as camadas e todos os repositórios necessários, e pode ser demonstrada sozinha.',
      'O corte é por comportamento, não por repositório nem por camada. "Cancelar o deal encerra a assinatura no provedor" é uma fatia. "Tudo do payments" e "o backend" não são: só dá para ver funcionando quando todos os pedaços terminam, e o erro de encaixe entre serviços aparece no fim.',
    ],
    when: {
      rows: [
        ['Acabou de publicar a spec', '`/marsai-dev:to-tickets`, na mesma conversa'],
        ['Tem uma issue refinada e quer quebrar em tarefas', '`/marsai-dev:to-tickets` com o identificador'],
        ['A mudança é uma fatia só', 'Não precisa: [[implement]]'],
      ],
    },
    steps: [
      'Parte da spec e, quando a sessão de refinamento aprovou uma lista de fatias, dessa lista. Lista os repositórios, a ordem de deploy e o contrato que liga cada par.',
      'Desenha as fatias. Cada uma cabe numa conversa nova de implementação, se lê bem como uma PR (até cerca de 400 linhas alteradas) e declara o que a bloqueia.',
      'Se uma refatoração deixa a mudança fácil, ela é a fatia 1, e as outras ficam bloqueadas por ela.',
      'Mostra a lista numerada e pergunta: o tamanho está certo? Os bloqueios estão certos? Alguma parte é de outro time?',
      'Publica uma issue por fatia, filha da mãe, com a relação de bloqueio nativa do Linear.',
    ],
    diagrams: [
      {
        type: 'cut',
        caption: 'O mesmo trabalho, cortado de dois jeitos. Só o segundo mostra algo funcionando antes do fim.',
        repos: ['billing', 'payments'],
        slices: [
          { label: 'Cancelar o deal encerra a assinatura', spans: [1, 1] },
          { label: 'Evento repetido não cancela duas vezes', spans: [0, 1] },
          { label: 'Falha do provedor fica pendente', spans: [0, 1] },
          { label: 'Última parcela paga também encerra', spans: [1, 0] },
        ],
      },
      {
        type: 'flow',
        caption: 'Os bloqueios formam um grafo. A fatia 1 destrava as outras três, que não dependem entre si.',
        nodeW: 210,
        nodes: [
          { id: 'f1', label: '1 · Cancelar o deal encerra a assinatura', kind: 'agente', col: 0, row: 1 },
          { id: 'f2', label: '2 · Evento repetido não cancela duas vezes', kind: 'agente', col: 1, row: 0 },
          { id: 'f3', label: '3 · Falha do provedor fica pendente', kind: 'agente', col: 1, row: 1 },
          { id: 'f4', label: '4 · Última parcela paga também encerra', kind: 'agente', col: 1, row: 2 },
        ],
        edges: [
          { from: 'f1', to: 'f2' }, { from: 'f1', to: 'f3' }, { from: 'f1', to: 'f4' },
        ],
      },
    ],
    example: {
      kind: 'slices',
      lines: [
        ['1. Cancelar o deal encerra a assinatura no provedor', 'payments → billing', 'nada: pode começar'],
        ['2. Evento repetido não cancela duas vezes', 'payments', 'bloqueada pela 1'],
        ['3. Falha do provedor fica pendente e é refeita', 'payments', 'bloqueada pela 1'],
        ['4. Última parcela paga também encerra', 'billing', 'bloqueada pela 1'],
      ],
    },
    records: ['Uma issue por fatia, filha da issue-mãe', 'Bloqueios como relação nativa do Linear'],
    worksIf: [
      'Cada fatia pode ser demonstrada sozinha.',
      'Cada fatia depende só do que de fato a trava.',
      'Você aprovou a lista antes de ela ir para o Linear.',
    ],
    faq: [
      ['E mudança mecânica que se espalha pelo código inteiro?', 'Não cabe em fatia vertical. Vai em três tempos: acrescenta a forma nova ao lado da antiga; migra os usos em lotes; remove a forma antiga no fim.'],
      ['Uma fatia que mexe em dois repositórios vira quantas PRs?', 'Ela entra na PR de cada repositório que toca, todas ligadas à mesma issue. O consumidor do evento sobe antes do produtor.'],
      ['E quando outro time faz parte do trabalho?', 'Vira uma sub-issue no time dono, com o que eles precisam para decidir sem reunião: o que se pede, o contrato e as regras do repositório deles que foram lidas.'],
    ],
  },

  'implement-spec': {
    ref: 'marsai-dev:implement-spec',
    call: '/marsai-dev:implement-spec <issue-mãe>',
    callNote: BOTH,
    icon: 'graph',
    actor: 'agente',
    gate: 'Você só é chamado se uma fatia depender de uma decisão que a spec não tomou.',
    tagline: 'A spec inteira vira código revisado, sem esperar ninguém entre uma fatia e outra.',
    what: [
      'Recebe a issue-mãe e percorre as fatias na ordem dos bloqueios, com um implementador novo para cada uma. No fim, revisa tudo e entrega uma PR por repositório quando a entrega inteira se lê bem numa só, ou uma PR por fatia quando ela ficaria grande demais.',
      'As fatias não são uma lista de passos. São um grafo: a qualquer momento existe uma **fronteira**, as fatias cujos bloqueios já terminaram e que podem começar. As que não se bloqueiam rodam ao mesmo tempo.',
      'Quem implementa não carrega os Standards. Explora, escreve o teste, faz passar. As regras entram depois, no review, quando há um diff pronto e contexto sobrando.',
    ],
    when: {
      rows: [
        ['Tem uma issue-mãe com spec e fatias', '`/marsai-dev:implement-spec <identificador>`'],
        ['A issue-mãe ainda não tem fatias', '[[to-tickets]] primeiro'],
        ['É uma fatia avulsa, um ajuste ou um bug', '[[implement]]'],
      ],
    },
    steps: [
      'Lê a spec, com o desenho do programa, e as fatias. Se alguma depende de decisão que a spec não tomou, pergunta agora, tudo de uma vez.',
      'Escolhe a forma da entrega, por repositório: uma branch e uma PR quando a mudança inteira fica abaixo de cerca de 400 linhas alteradas; acima disso, uma PR por fatia, na ordem dos bloqueios. Diz qual forma escolheu e por quê, e você pode pedir a outra.',
      'Despacha um implementador por fatia da fronteira, cada um na sua cópia de trabalho. Ele segue o exemplo mais próximo do repositório e carrega o guia de implementação do time quando a tarefa indica um.',
      'Confere o retorno: o teste falhando e depois passando, os checks do repositório verdes.',
      'Integra na branch da PR e fecha a fatia no Linear. Na primeira fatia integrada, abre a PR em rascunho. Com uma PR por fatia, cada fatia abre a sua.',
      'Recalcula a fronteira e repete até o grafo acabar.',
      'Roda o [[code-review]] na branch inteira, completa a descrição da PR e a tira do rascunho.',
    ],
    diagrams: [
      {
        type: 'lanes',
        caption: 'A fatia 1 destrava as outras três, que rodam ao mesmo tempo. Numa entrega de uma PR só, o review acontece uma vez, sobre tudo.',
        cols: 6,
        lanes: [
          { label: 'Fatia 1', bars: [{ from: 0, to: 2, kind: 'agente', text: 'implementador' }] },
          { label: 'Fatia 2', bars: [{ from: 2, to: 4, kind: 'agente', text: 'implementador' }] },
          { label: 'Fatia 3', bars: [{ from: 2, to: 4, kind: 'agente', text: 'implementador' }] },
          { label: 'Fatia 4', bars: [{ from: 2, to: 4, kind: 'agente', text: 'implementador' }] },
          { label: 'Review', bars: [{ from: 4, to: 5, kind: 'agente', text: 'code-review' }] },
          { label: 'PR', bars: [{ from: 2, to: 5, kind: 'doc', text: 'em rascunho' }, { from: 5, to: 6, kind: 'pessoa', text: 'pronta' }] },
        ],
      },
      {
        type: 'flow',
        caption: 'O ciclo de cada fatia.',
        nodeW: 172,
        nodes: [
          { id: 'f', label: 'Fronteira', sub: 'fatias que podem começar', kind: 'doc', col: 0, row: 0 },
          { id: 'i', label: 'Implementador', sub: 'um por fatia', kind: 'agente', col: 1, row: 0 },
          { id: 'c', label: 'Checks', sub: 'lint, tipos, testes', kind: 'freio', col: 2, row: 0 },
          { id: 'g', label: 'Integra e fecha', sub: 'commit na PR, issue no Linear', kind: 'agente', col: 3, row: 0 },
        ],
        edges: [
          { from: 'f', to: 'i' }, { from: 'i', to: 'c' }, { from: 'c', to: 'g', label: 'verde' },
          { from: 'c', to: 'i', route: 'under', depth: 20, label: 'vermelho', fromDx: -16, toDx: 16 },
          { from: 'g', to: 'f', route: 'under', depth: 44, label: 'recalcula a fronteira' },
        ],
      },
    ],
    example: {
      kind: 'terminal',
      lines: [
        '$ pnpm vitest run RequestSubscriptionsCancellation',
        '  ✗ cancela a assinatura quando o motivo encerra o contrato   (falhando, como esperado)',
        '  ... escreve a regra ...',
        '  ✓ cancela a assinatura quando o motivo encerra o contrato',
        '',
        '$ <o Check Command do repositório>',
        '  ✓ lint  ✓ tipos  ✓ testes',
      ],
    },
    records: ['Um commit por fatia, com o identificador dela', 'Cada fatia fechada no Linear, com os critérios que passaram', 'Uma PR por repositório, ou uma por fatia numa entrega grande', 'Comentário na issue-mãe com o estado de cada fatia'],
    worksIf: [
      'Cada fatia entregue tem o teste que falhou e depois passou.',
      'Os checks do repositório estão verdes.',
      'O que ficou parado está marcado no Linear, com o motivo.',
    ],
    stops: {
      title: 'Quando ele para',
      intro: 'Ele para uma fatia, não o trabalho todo. As que não dependem dela continuam.',
      items: [
        'A fatia depende de uma decisão que a spec não tomou.',
        'Os checks não ficam verdes depois de uma tentativa honesta de corrigir.',
        'Implementar exigiria sair do contrato, do escopo ou do desenho do programa combinados. A mudança é escrita na issue e aprovada pelo tech lead antes de a fatia seguir.',
      ],
    },
    faq: [
      ['Sai uma PR por fatia?', 'Só numa entrega grande. Quando a mudança inteira se lê bem numa PR, sai uma por repositório que a spec toca, com os commits de cada fatia identificados. Acima de cerca de 400 linhas alteradas, sai uma PR por fatia, na ordem dos bloqueios, ou a PR diz por que não foi dividida. A linha orienta a atenção; não bloqueia.'],
      ['Por que a PR nasce em rascunho?', 'Para o trabalho ficar visível e ligado às issues desde a primeira fatia. Em rascunho, o bot de review normalmente ainda não revisa. Ela sai do rascunho depois do review.'],
      ['Por que o implementador não segue os Standards?', 'Porque quem implementa já está com o contexto cheio explorando e depurando. O reviewer recebe o diff pronto e tem contexto sobrando para ler as regras inteiras e corrigir.'],
    ],
  },

  'code-review': {
    ref: 'marsai-dev:code-review',
    call: '/marsai-dev:code-review',
    callNote: 'A [[implement-spec]] e a [[implement]] já chamam. Use sozinha para revisar uma branch.',
    icon: 'search',
    actor: 'agente',
    tagline: 'O reviewer aplica os Standards, corrige e commita.',
    what: [
      'São dois eixos, revisados em separado para um não esconder o outro. **Standards**: o código segue os padrões documentados? **Spec**: o código faz o que o ticket pediu, construído como o refinamento técnico desenhou?',
      'Código que segue todos os padrões e implementa a coisa errada passa no primeiro e falha no segundo. O contrário também acontece.',
      'No eixo Standards o reviewer não devolve uma lista de comentários: ele conserta o que tem uma resposta certa e commita. Só comenta quando a correção depende de uma decisão de pessoa.',
      'O **desenho do programa** do refinamento técnico é o padrão daquela entrega. O reviewer traz de volta um desvio local, e um desvio estrutural volta para a implementação. Quando o rumo precisa mudar, o novo desenho é escrito na issue e aprovado pelo tech lead antes.',
    ],
    when: {
      rows: [
        ['Terminou de implementar', 'Já foi chamada pela [[implement-spec]] ou pela [[implement]]'],
        ['Quer revisar uma branch antes de abrir a PR', '`/marsai-dev:code-review`'],
        ['O diff é só documentação, formatação ou arquivo gerado', 'Dispensa review; a skill diz que pulou'],
      ],
    },
    steps: [
      'Fixa o ponto de comparação (a base que você disser, ou `origin/main`).',
      'Acha a spec: o ticket da conversa, o identificador na branch ou nos commits. Tira do refinamento técnico o desenho do programa.',
      'Junta os Standards: as regras do repositório, os Standards que um pacote do time oferece para a stack do diff (uma skill cuja descrição começa com `Standards extension`), a linha de base e o desenho do programa da entrega.',
      'Despacha os dois eixos ao mesmo tempo, em agentes separados.',
      'Apresenta os dois relatórios sem misturar, e prevê a nota do bot de review para o que ficou aberto.',
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'Dois eixos em paralelo. Um corrige, o outro reporta.',
        nodeW: 184,
        nodes: [
          { id: 'd', label: 'O diff da branch', kind: 'doc', col: 0, row: 0.5 },
          { id: 's', label: 'Standards', sub: 'o reviewer lê as regras inteiras', kind: 'agente', col: 1, row: 0 },
          { id: 'p', label: 'Spec', sub: 'confere com a issue, as fatias e o desenho', kind: 'agente', col: 1, row: 1 },
          { id: 's2', label: 'Corrige e commita', sub: 'commits separados dos seus', kind: 'agente', col: 2, row: 0 },
          { id: 'p2', label: 'Relatório', sub: 'faltando · a mais · errado · fora do desenho', kind: 'doc', col: 2, row: 1 },
          { id: 'h', label: 'Nota prevista do bot de review', kind: 'freio', col: 3, row: 0.5 },
        ],
        edges: [
          { from: 'd', to: 's' }, { from: 'd', to: 'p' }, { from: 's', to: 's2' }, { from: 'p', to: 'p2' },
          { from: 's2', to: 'h' }, { from: 'p2', to: 'h' },
        ],
      },
    ],
    tables: [
      {
        id: 'ordem',
        title: 'Qual regra vence',
        intro: 'O desenho do programa decide a estrutura da entrega. Onde ele contradiz uma regra documentada, o review reporta em vez de escolher.',
        head: ['Ordem', 'Fonte'],
        rows: [
          ['1', 'Regra documentada do repositório (`CLAUDE.md`, `CONTEXT.md`, ADRs)'],
          ['2', 'Standards do time, vindos de um pacote do time'],
          ['3', 'A linha de base, que vale mesmo onde nada está documentado'],
        ],
      },
    ],
    example: {
      kind: 'terminal',
      lines: [
        'Standards',
        '  corrigido  consulta sem limite em findPendingCancellations  →  commit a41c9e2',
        '  corrigido  exception do domínio lançada como Error          →  commit a41c9e2',
        'Spec',
        '  ok         fatias 1, 2 e 4',
        '  faltando   fatia 3: nada refaz o cancelamento pendente    →  volta ao implementador',
        '',
        'Nota prevista do bot de review: 3 (correctness)',
      ],
    },
    records: ['Commits de correção do review, separados dos commits de implementação'],
    worksIf: [
      'As correções do reviewer estão em commits próprios e os checks seguem verdes.',
      'O relatório separa o que foi corrigido do que espera uma decisão sua.',
      'Requisito faltando, ou estrutura que foge do desenho do programa, voltou para a implementação.',
    ],
    faq: [
      ['O reviewer pode mudar o comportamento do meu código?', 'Não. Ele corrige o que tem uma resposta certa e não muda comportamento nem contrato público. O que mudaria comportamento, contrato, schema ou evento vira "precisa de decisão".'],
      ['O que lint e typecheck já pegam entra no review?', 'Não. O que uma máquina já garante fica de fora.'],
      ['E se não houver spec?', 'O eixo Spec é pulado, e o relatório diz isso.'],
      ['Como a nota do bot de review é prevista?', 'Com uma rubrica de exemplo que qualquer bot de review pode usar: a nota é a pior entre seis dimensões: correctness, security, tests, nil_safety, blast_radius e maintainability. O review classifica o que ficou aberto nessas dimensões, de propósito de forma pessimista.'],
    ],
  },

  'open-pr': {
    ref: 'marsai-core:open-pr',
    call: '/marsai-core:pr',
    callNote: 'O comando `/marsai-core:pr` carrega a skill `open-pr`. `/marsai-core:pr draft` abre em rascunho.',
    icon: 'pr',
    actor: 'agente',
    tagline: 'Uma PR que o revisor entende em um minuto.',
    what: [
      'Abre a PR da branch atual e escreve a descrição. Numa PR que já existe, reescreve a descrição.',
      'A descrição é escrita para um revisor que não vai ler, não tem contexto e não tem tempo. Abre com o efeito prático, mostra a prova de que funciona e diz quanta atenção a PR pede.',
    ],
    when: {
      rows: [
        ['O código está pronto e revisado', '`/marsai-core:pr`'],
        ['Quer a PR visível com o trabalho em andamento', '`/marsai-core:pr draft`'],
        ['A descrição de uma PR virou parede de texto', '`/marsai-core:pr`, que reescreve'],
        ['A PR está aberta e precisa ser acompanhada', '[[babysit-pr]]'],
      ],
    },
    steps: [
      'Vê se já existe PR para a branch. Se existe, o trabalho é a descrição dela.',
      'Lê o diff inteiro e confirma que ele entrega o que foi pedido, e só isso.',
      'Lê o template de PR do repositório e segue a convenção de lá.',
      'Escreve: uma frase com o que muda em produção, o que muda, o que não muda, onde olhar primeiro, a evidência, o tamanho e o perigo do merge. Acima de cerca de 400 linhas alteradas, diz que a entrega foi dividida por fatia, ou por que não foi. Com um refinamento técnico, diz que o código segue o que ele definiu, ou aponta a mudança aprovada.',
      'Só afirma que um check passou se viu passar.',
    ],
    diagrams: [
      {
        type: 'danger',
        caption: 'O perigo do merge diz ao revisor quanta atenção a PR pede. Avalie o efeito, não o tamanho do diff.',
      },
    ],
    example: {
      kind: 'doc',
      title: 'feat(subscriptions): cancelar deal recorrente cancela a assinatura',
      lines: [
        'Em uma frase: cancelar um deal recorrente passa a cancelar a assinatura no provedor de pagamento. Hoje o pedido morre na fila de erro e a assinatura fica viva.',
        'Evidência · Antes: cancelar um deal com ciclo pago lançava exceção. Depois: e2e nos serviços, assinaturas canceladas, sem segundo DELETE na reentrega.',
        'Perigo do merge · Porta: mão única. Assinatura cancelada no provedor continua cancelada mesmo revertendo a PR.',
        'Raio de impacto: entre serviços. Um motivo classificado errado cancelaria a assinatura de um contrato ativo.',
      ],
    },
    records: ['A PR no GitHub, ligada à issue-mãe e às fatias'],
    worksIf: [
      'A descrição abre com o efeito em uma frase e tem até seis bullets.',
      'Há evidência com antes e depois, de algo que foi executado.',
      'O perigo do merge está visível, fora de qualquer seção recolhida.',
    ],
    faq: [
      ['O que é porta de mão única?', 'É quando reverter o código não desfaz o efeito: migration que apaga dado, e-mail ou cobrança disparados, evento que outro serviço já consumiu. Na dúvida entre as duas portas, declare mão única e diga o motivo.'],
      ['O perigo do merge muda quem precisa aprovar?', 'Não. Uma pessoa lê toda PR, e o perigo do merge orienta a profundidade dessa leitura. A regra de aprovação do time continua a mesma.'],
      ['Quem faz o merge?', 'Por padrão, uma pessoa. Com um [[full-send]] explícito, o agente faz o merge sozinho de uma porta de duas vias, só quando os checks, a nota 5 do bot de review e o [[sol-loop]] passam no último commit. Porta de mão única sempre espera uma pessoa.'],
      ['Posso abrir a PR direto com `gh pr create`?', 'Um hook bloqueia o `gh pr create` direto e aponta para `/marsai-core:pr`, para a PR sair com validação e contexto.'],
    ],
  },

  'babysit-pr': {
    ref: 'marsai-core:babysit-pr',
    call: 'marsai-core:babysit-pr',
    callNote: 'Peça para acompanhar a PR. O agente carrega a skill.',
    icon: 'eye',
    actor: 'agente',
    tagline: 'Acompanha a PR até ela ficar pronta, travada ou esperando você.',
    what: [
      'Lê cada falha de CI e cada achado de review, corrige o que procede, responde o que não procede e espera a rodada seguinte.',
      'Qualquer bot de review serve: CodeRabbit, Greptile, GitHub Copilot Review ou um próprio. Na V4 Company, construímos o nosso internamente, o Hermes. Para operações pequenas, recomendamos CodeRabbit ou Greptile; na escala, vale avaliar um bot próprio. [Entenda nossa recomendação](@brakes#review-bot).',
      'Ela protege o objetivo original da PR. Uma sugestão só é acionável quando corrige um problema real dentro desse objetivo. Refatoração sem relação, limpeza oportunista e feature nova vão para outra PR.',
    ],
    when: {
      rows: [
        ['A PR está aberta com check vermelho', 'Peça para acompanhar: `babysit-pr`'],
        ['O bot de review ou uma pessoa deixou achados', '`babysit-pr`'],
        ['Um comentário de pessoa se repete entre PRs', 'Ela sugere a [[retro]]'],
      ],
    },
    steps: [
      'Registra o ponto de partida: commit atual, objetivo, checks obrigatórios, aprovações exigidas, quem lê a PR e a nota do bot de review.',
      'Para cada achado: confere contra o código e o objetivo, e classifica em válido, falso positivo, já corrigido ou fora do escopo.',
      'Corrige o que é válido e está no escopo. Rejeita falso positivo com um motivo curto, por escrito.',
      'Depois de cada envio, o commit novo é a nova linha de base: só o que veio depois dele conta.',
      'Sem novidade, fica quieta.',
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'Cada freio pode devolver a PR. O ciclo só termina quando os dois passam no último commit e uma pessoa leu a PR.',
        nodeW: 168,
        nodes: [
          { id: 'pr', label: 'PR aberta', kind: 'doc', col: 0, row: 0 },
          { id: 'ci', label: 'CI', sub: 'na V4, com o SonarQube', kind: 'freio', col: 1, row: 0 },
          { id: 'h', label: 'Bot de review', sub: 'nota de 1 a 5', kind: 'freio', col: 2, row: 0 },
          { id: 'ok', label: 'Pronta', sub: 'o merge é da pessoa', kind: 'pessoa', col: 3, row: 0 },
          { id: 'b', label: 'babysit-pr', sub: 'corrige e envia', kind: 'agente', col: 1.5, row: 1 },
        ],
        edges: [
          { from: 'pr', to: 'ci' }, { from: 'ci', to: 'h', label: 'passou' }, { from: 'h', to: 'ok', label: '5' },
          { from: 'ci', to: 'b', route: 'vh', label: 'falhou' }, { from: 'h', to: 'b', route: 'vh', label: 'achado' },
          { from: 'b', to: 'pr', route: 'under', depth: 18, label: 'commit novo' },
        ],
      },
    ],
    example: {
      kind: 'terminal',
      note: 'Caso real, de um repositório da V4.',
      lines: [
        'Bot         2/5   tests: 2   "o typecheck sai com sucesso sem verificar nada"',
        'babysit-pr  corrige, roda os testes, envia',
        'Bot         2/5   correctness: 3   "use case sem domínio não compila"',
        'babysit-pr  a sugestão quebra uma regra que o repositório testa: explica, adiciona o aviso e o teste',
        'Bot         5/5   ✅ os achados foram tratados ou aceitos',
      ],
    },
    records: ['Respostas escritas a cada achado', 'A nota do bot de review no último commit'],
    worksIf: [
      'Checks obrigatórios verdes no último commit.',
      'Nenhum achado válido aberto.',
      'Uma pessoa leu a PR: alguém da sessão de refinamento, quando a entrega teve uma.',
      'O último review do bot está em 5, ou sem achado que trave.',
    ],
    stops: {
      title: 'Quando ela para',
      items: [
        '**Pronta**: avisa. O merge é da pessoa, a não ser que um [[full-send]] cubra uma porta de duas vias.',
        '**Travada**: falha, aprovação faltando, ambiguidade ou decisão que só você toma.',
        '**Obsoleta**: outra PR a substitui. Ela diz qual e pergunta antes de fechar.',
      ],
    },
    faq: [
      ['O bot de review trava o merge?', 'Não o merge de uma pessoa: ele informa. Um 5 diz que o bot não achou problema naquele review; não passa por cima de check falhando, achado válido aberto, aprovação faltando nem da leitura por uma pessoa. Com um [[full-send]] explícito, a nota 5 é uma das condições para o merge sozinho de uma porta de duas vias.'],
      ['E se o achado do bot estiver errado?', 'Ela rejeita por escrito, com o motivo. Achado de bot passa pela mesma triagem que achado de pessoa.'],
      ['Ela faz merge ou rebase?', 'Só com autorização explícita. Se a branch ficou para trás, ela diz o impacto e pergunta antes.'],
      ['Onde vejo o que o SonarQube acusou?', 'No log do job ou no comentário da PR. Na V4, o SonarQube roda no CI da PR, bloqueia pelo quality gate e é tratado como check obrigatório.'],
    ],
  },

  retro: {
    ref: 'marsai-core:retro',
    call: '/marsai-core:retro',
    callNote: BOTH,
    icon: 'loop',
    actor: 'agente',
    gate: 'A retro só propõe. Quem aprova e aplica é você.',
    tagline: 'O erro que se repete vira regra, no freio mais barato possível.',
    what: [
      'Olha para trás e propõe melhorias no **ambiente** em que os agentes trabalham, para a próxima rodada sair melhor que esta. O princípio: nenhum comentário de review deveria ser escrito duas vezes.',
      'A pergunta central é onde colocar a regra. Se uma máquina consegue conferir, vira check. Se é julgamento, vira regra nos Standards, que o reviewer aplica.',
    ],
    when: {
      rows: [
        ['Um revisor humano apontou algo que a máquina deveria ter pego', '`/marsai-core:retro` sobre a PR'],
        ['O mesmo comentário apareceu em mais de um review', '`/marsai-core:retro`'],
        ['Quer olhar as PRs da semana', '`/marsai-core:retro` com o período'],
        ['A sessão gastou muitas buscas antes de começar', '`/marsai-core:retro` sobre a sessão'],
        ['A leitura humana demorou, ou pediu mais de uma rodada', '`/marsai-core:retro` sobre a PR: ela propõe o que o desenho do programa deveria ter dito'],
      ],
    },
    steps: [
      'Lê as fontes primárias: a sessão, a PR com os comentários e os achados do bot de review, ou as PRs da semana. Numa PR, anota quanto tempo a leitura humana levou e quantas rodadas de mudança ela pediu.',
      'Procura candidatos em sete categorias: checks, standards, alinhamento, navegação, acesso à informação, economia de ferramentas e instruções que sobram.',
      'Apresenta do mais grave para o menos, cada um com a evidência, a mudança proposta e onde ela entra.',
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'A pergunta que decide onde a regra mora.',
        nodeW: 190,
        gapX: 76,
        nodes: [
          { id: 'a', label: 'Achado que se repetiu', kind: 'doc', col: 0, row: 0.5 },
          { id: 'q', label: 'Uma máquina consegue conferir?', kind: 'pessoa', col: 1, row: 0.5 },
          { id: 'c', label: 'Check', sub: 'lint, hook ou CI, no repositório', kind: 'freio', col: 2, row: 0 },
          { id: 's', label: 'Standard', sub: 'julgamento, no pacote do time', kind: 'agente', col: 2, row: 1 },
        ],
        edges: [
          { from: 'a', to: 'q' }, { from: 'q', to: 'c', label: 'sim' }, { from: 'q', to: 's', label: 'não' },
        ],
      },
    ],
    tables: [
      {
        id: 'onde',
        title: 'Onde cada mudança entra',
        head: ['Mudança', 'Lugar'],
        rows: [
          ['Check novo ou religado', 'No repositório onde o erro aconteceu: linter, hook ou CI'],
          ['Regra de julgamento', 'PR no pacote do time, nos Standards'],
          ['Ponteiro de navegação', '`CLAUDE.md` ou `AGENTS.md` do repositório, uma linha'],
          ['Termo ou decisão que faltava', '`CONTEXT.md` ou `docs/adr/` do repositório'],
        ],
      },
    ],
    example: {
      kind: 'terminal',
      lines: [
        'Achado que se repetiu em 3 PRs: "consulta sem limite em listagem"',
        '  é mecânico?  sim, dá para detectar no lint',
        '  proposta     regra de lint no repositório',
        '',
        'Achado: "evento novo sem versão no pacote de eventos"',
        '  é mecânico?  não, depende de entender o contrato',
        '  proposta     regra nova na seção de eventos dos Standards',
      ],
    },
    records: ['Check novo no repositório', 'Regra nova nos Standards', 'Ponteiro no `CLAUDE.md`'],
    worksIf: [
      'Cada proposta tem a evidência: o trecho da sessão ou o comentário da PR.',
      'Erro mecânico virou check, não regra em texto.',
      'Nada foi aplicado sem a sua aprovação.',
    ],
    faq: [
      ['Por que regra de código vai para o reviewer e não para quem implementa?', 'Quem implementa explora, escreve e depura: é a etapa com o contexto mais cheio. Quem revisa recebe um diff pronto e tem contexto sobrando.'],
      ['Check que existe mas está desligado conta?', 'Conta, e é o achado. Repositório sem nenhum check antes do push nem no CI também é.'],
    ],
  },

  prototype: {
    ref: 'marsai-dev:prototype',
    call: '/marsai-dev:prototype',
    callNote: BOTH,
    icon: 'cube',
    actor: 'agente',
    gate: 'Você avalia o protótipo e dá o veredito.',
    tagline: 'Código descartável que responde uma pergunta.',
    what: [
      'Algumas decisões não saem de conversa: a regra parece certa até você clicar nela. O protótipo existe para responder uma pergunta, não para virar produto.',
      'A pergunta decide a forma. São três ramos, e errar o ramo desperdiça o protótipo.',
    ],
    when: {
      rows: [
        ['"Essa regra ou esse modelo de estados está certo?"', 'Ramo de lógica: um HTML único, com botões e roteiros, que alguém de produto clica sozinho'],
        ['"Como essa tela deveria ser?"', 'Ramo de tela: versões bem diferentes na mesma rota, com a biblioteca de componentes do repositório'],
        ['"O que acontece se o evento chega duas vezes ou o provedor falha?"', 'Ramo de fluxo: cada serviço é um ator e você entrega, repete ou derruba cada mensagem'],
        ['A pergunta apareceu no meio de um grill', 'O grill manda para outro agente por [[handoff]]'],
      ],
    },
    steps: [
      'Identifica a pergunta e escolhe o ramo.',
      'Monta o protótipo perto de onde o código real vai morar, com `prototype` no nome.',
      'Mostra o estado completo depois de cada ação, para você ver o que mudou.',
      'Você avalia. A decisão validada entra na spec, ou numa ADR se for difícil de desfazer.',
      'O protótipo vai para uma branch `prototype/<nome>`, fora da `main`, com o link na issue.',
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'A pergunta escolhe o ramo.',
        nodeW: 196,
        nodes: [
          { id: 'q', label: 'Qual é a pergunta?', kind: 'pessoa', col: 0, row: 1 },
          { id: 'l', label: 'Regra ou estados', sub: 'HTML único, clicável', kind: 'agente', col: 1, row: 0 },
          { id: 'u', label: 'Tela', sub: 'variações na rota real', kind: 'agente', col: 1, row: 1 },
          { id: 'f', label: 'Fluxo entre serviços', sub: 'repetir, atrasar, derrubar', kind: 'agente', col: 1, row: 2 },
          { id: 'v', label: 'Veredito', sub: 'a decisão vai para a spec', kind: 'pessoa', col: 2, row: 1 },
        ],
        edges: [
          { from: 'q', to: 'l' }, { from: 'q', to: 'u' }, { from: 'q', to: 'f' },
          { from: 'l', to: 'v' }, { from: 'u', to: 'v' }, { from: 'f', to: 'v' },
        ],
      },
    ],
    example: {
      kind: 'chat',
      lines: [
        ['agente', 'Q3 depende de ver a tela: onde o financeiro enxerga que a assinatura está "pendente de cancelamento"? Posso mandar para outro agente montar três variações na rota real enquanto seguimos com as outras perguntas?'],
        ['pessoa', 'Manda.'],
        ['agente', 'Handoff escrito. O ramo Q3 fica aberto até a resposta voltar.'],
      ],
    },
    records: ['A decisão, na spec ou numa ADR', 'O protótipo, numa branch `prototype/<nome>` fora da `main`'],
    worksIf: [
      'O protótipo roda com dois cliques ou com o comando de dev que o projeto já tem.',
      'Você chegou a um veredito sobre a pergunta.',
      'Ninguém confundiria o protótipo com código de produção.',
    ],
    faq: [
      ['O protótipo vira o código final?', 'Não. Ele é descartável desde o primeiro dia: sem testes, sem tratamento de erro além do necessário, sem persistência. A decisão é que segue para o código real.'],
      ['Com o que a tela é montada?', 'Com a biblioteca de componentes do repositório, na rota real, com as versões trocáveis por um parâmetro na URL.'],
      ['Qual a diferença para a demo?', 'A [[demo]] é a feature inteira funcionando, para um usuário real usar. O protótipo responde uma pergunta de desenho só, num arquivo.'],
    ],
  },

  handoff: {
    ref: 'marsai-core:handoff',
    call: '/marsai-core:handoff',
    callNote: BOTH,
    icon: 'swap',
    actor: 'agente',
    tagline: 'Leva o contexto para onde esta conversa não alcança.',
    what: [
      'Escreve um documento curto que permite a um agente novo continuar o trabalho sem ninguém reexplicar nada. O que o handoff compra é portabilidade.',
      'O uso mais comum é o desvio no meio de uma etapa: aparece uma tarefa lateral e você não quer gastar a conversa atual com ela. A conversa continua aberta; um segundo agente pega o desvio.',
    ],
    when: {
      rows: [
        ['Desvio no meio de uma etapa (protótipo durante o grill)', '`/marsai-core:handoff`, ida e volta'],
        ['Vai trocar de ferramenta (de Claude Code para Codex)', '`/marsai-core:handoff`'],
        ['Vai continuar em outra pasta, outro repositório ou com outra pessoa', '`/marsai-core:handoff`'],
        ['Nada vai viajar', 'Não precisa: continue na conversa'],
      ],
    },
    steps: [
      'Escreve o documento: o que fazer, onde estamos, as decisões que valem, o que foi verificado e o que é suposição, onde está cada coisa, as skills sugeridas e o que devolver.',
      'Aponta em vez de copiar: spec, ADR, issue e commit entram como caminho ou link.',
      'Grava fora do repositório e mostra o caminho. Se o destino é outra máquina ou outra pessoa, mostra o conteúdo na resposta.',
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'Num desvio, o handoff acontece duas vezes. A conversa original fica intacta no meio.',
        nodeW: 176,
        nodes: [
          { id: 'a', label: 'Conversa do grill', sub: 'aparece a pergunta', kind: 'pessoa', col: 0, row: 0 },
          { id: 'b', label: 'Outro agente', sub: 'monta o protótipo', kind: 'agente', col: 1, row: 1 },
          { id: 'c', label: 'Veredito', sub: 'com a evidência', kind: 'pessoa', col: 2, row: 1 },
          { id: 'd', label: 'Conversa do grill', sub: 'segue de onde parou', kind: 'pessoa', col: 3, row: 0 },
        ],
        edges: [
          { from: 'a', to: 'b', route: 'vh', label: 'ida' }, { from: 'b', to: 'c' },
          { from: 'c', to: 'd', route: 'hv', label: 'volta' },
          { from: 'a', to: 'd', dashed: true, label: 'continua com o que não depende da resposta' },
        ],
      },
    ],
    example: {
      kind: 'doc',
      title: 'Handoff: protótipo da tela de assinatura pendente',
      lines: [
        'O que fazer: montar três variações de onde o financeiro vê a assinatura "pendente de cancelamento".',
        'Decisões que valem: pendente não é erro; alerta depois de um dia.',
        'Verificado e suposto: o status existe no payments (verificado). A tela do financeiro lê esse status (suposição).',
        'Skills sugeridas: marsai-dev:prototype.',
        'O que devolver: o veredito, a evidência e a branch do protótipo.',
      ],
    },
    records: ['Um arquivo de passagem, fora do repositório. Não entra em commit.'],
    worksIf: ['Alguém consegue ler o documento a frio, sem a conversa aberta, e saber o que fazer.'],
    faq: [
      ['Por que separar "verificado" de "suposto"?', 'Porque o próximo agente trata o documento como contrato e não reconfere. "X ainda não existe" só entra em verificado se alguém olhou.'],
      ['Pode ter segredo no documento?', 'Não. Chaves, tokens, senhas e dado pessoal saem antes de gravar.'],
    ],
  },

  implement: {
    ref: 'marsai-dev:implement',
    call: '/marsai-dev:implement <fatia ou pedido>',
    callNote: BOTH,
    icon: 'brick',
    actor: 'agente',
    tagline: 'Uma fatia avulsa, um ajuste ou um bug, pelo mesmo caminho.',
    what: [
      'É o caminho das coisas pequenas. Leva uma fatia do ticket ao código revisado: você conduz pela skill, e quem escreve o código é o implementador, numa conversa própria.',
      'O caminho é o mesmo da [[implement-spec]], para uma coisa só: implementador, checks, review.',
    ],
    when: {
      rows: [
        ['Uma fatia isolada, com critérios de aceite', '`/marsai-dev:implement <identificador>`'],
        ['Um ajuste de um comportamento só', '`/marsai-dev:implement` com o pedido'],
        ['Um bug', '`/marsai-dev:implement`: o implementador começa pelo teste que reproduz'],
        ['Uma issue-mãe com várias fatias', '[[implement-spec]]'],
        ['Pergunta sobre o código, ou mudança só de docs', 'Não é implementação: resolva direto'],
      ],
    },
    steps: [
      'Entende a fatia: lê a issue, os comentários e o refinamento técnico da issue-mãe, com o contrato, as invariantes e o desenho do programa a seguir.',
      'Despacha o implementador certo: backend ou frontend.',
      'Confere o retorno: o teste falhando e depois passando, os checks verdes e, quando a tarefa indica um guia de implementação do time, o que ele mandou gerar.',
      'Registra o commit e passa pelo [[code-review]].',
      'Fecha a fatia no Linear, com os critérios que viu passar.',
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'O mesmo caminho da implement-spec, para uma fatia.',
        nodeW: 160,
        nodes: [
          { id: 'f', label: 'A fatia', kind: 'doc', col: 0, row: 0 },
          { id: 'i', label: 'Implementador', kind: 'agente', col: 1, row: 0 },
          { id: 'c', label: 'Checks', kind: 'freio', col: 2, row: 0 },
          { id: 'r', label: 'code-review', kind: 'agente', col: 3, row: 0 },
          { id: 'l', label: 'Fecha no Linear', kind: 'doc', col: 4, row: 0 },
        ],
        edges: [
          { from: 'f', to: 'i' }, { from: 'i', to: 'c' }, { from: 'c', to: 'r', label: 'verde' }, { from: 'r', to: 'l' },
          { from: 'c', to: 'i', route: 'under', depth: 18, label: 'vermelho' },
        ],
      },
    ],
    tables: [
      {
        id: 'quem',
        title: 'Qual implementador',
        head: ['A fatia mexe em', 'Quem implementa'],
        rows: [
          ['API, use case, repository, entity, migration, evento, worker', '[[backend-engineer-typescript]]'],
          ['Componente, página, formulário, tabela, estado de tela', '[[frontend-engineer]]'],
        ],
      },
    ],
    example: null,
    records: ['Commit com o identificador da fatia', 'Issue da fatia atualizada no Linear'],
    worksIf: [
      'Há um teste que falhou e depois passou.',
      'Os checks do repositório estão verdes.',
      'O review rodou: implementação só está pronta depois dele.',
    ],
    faq: [
      ['Bug precisa de spec?', 'Não precisa de issue-mãe. Bug começa por um teste que reproduz o bug, e depois a correção.'],
      ['E se faltar critério de aceite?', 'Se o pedido admite mais de uma leitura, a skill pergunta antes de despachar.'],
      ['E se não der para construir a fatia como ela foi desenhada?', 'Ela para. O desenho muda na issue, com a aprovação do tech lead, antes de o código mudar.'],
    ],
  },

  tdd: {
    ref: 'marsai-dev:tdd',
    call: 'marsai-dev:tdd',
    callNote: 'É a referência de teste que o implementador segue. Você raramente chama direto.',
    icon: 'check',
    actor: 'agente',
    tagline: 'O ciclo vermelho → verde, com testes que valem a pena guardar.',
    what: [
      'Um bom teste verifica comportamento pela interface pública, não detalhe de implementação. O código pode mudar inteiro por dentro e o teste continua valendo.',
      'Não dá para testar tudo. Combinar os pontos de teste na spec é o que põe o esforço no caminho crítico.',
    ],
    when: {
      rows: [
        ['Regra e invariante do domínio', 'Teste do aggregate, da entity ou do value object'],
        ['Orquestração, caminhos de erro, idempotência', 'Teste do use case, com as dependências substituídas'],
        ['Query, filtro, ordenação', 'Teste de integração do repositório, contra banco real'],
        ['Rota, permissão, efeito no banco', 'Integração ou teste de ponta a ponta'],
      ],
      head: ['O que se quer provar', 'Onde o teste fica'],
    },
    steps: [
      '**Vermelho antes do verde.** Escreve o teste, roda e vê falhar pelo motivo certo. A saída da falha, colada, é a prova.',
      '**Uma fatia por vez.** Um ponto, um teste, uma implementação mínima.',
      '**Bug começa por um teste que reproduz o bug.**',
      '**Refatorar não faz parte do ciclo.** É do review.',
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'Um comportamento por volta.',
        nodeW: 160,
        nodes: [
          { id: 'a', label: 'Escreve o teste', kind: 'agente', col: 0, row: 0 },
          { id: 'b', label: 'Vê falhar', sub: 'pelo motivo certo', kind: 'bad', col: 1, row: 0 },
          { id: 'c', label: 'Escreve o mínimo', kind: 'agente', col: 2, row: 0 },
          { id: 'd', label: 'Vê passar', kind: 'freio', col: 3, row: 0 },
        ],
        edges: [
          { from: 'a', to: 'b' }, { from: 'b', to: 'c' }, { from: 'c', to: 'd' },
          { from: 'd', to: 'a', route: 'under', depth: 18, label: 'próximo comportamento' },
        ],
      },
    ],
    tables: [
      {
        id: 'evitar',
        title: 'O que evitar',
        head: ['Tipo', 'Como reconhecer'],
        rows: [
          ['Preso à implementação', 'O teste quebra quando você refatora sem mudar comportamento'],
          ['Tautológico', 'O valor esperado é calculado do mesmo jeito que o código calcula. Passa por construção'],
          ['Que não consegue falhar', 'A dependência foi substituída por algo que sempre responde certo'],
          ['Em lote', 'Todos os testes primeiro, toda a implementação depois'],
        ],
      },
    ],
    example: null,
    records: [],
    worksIf: ['Cada teste foi visto falhando antes de passar.', 'O teste se lê como especificação: "cancelar um deal recorrente encerra a assinatura".'],
    faq: [
      ['Repositório e controller ganham teste unitário?', 'Não. Teste com o banco substituído prova o substituto, não a query. Eles são cobertos por integração, contra banco real.'],
    ],
  },

  'backend-engineer-typescript': {
    ref: 'agent:backend-engineer-typescript',
    call: 'marsai-dev:backend-engineer-typescript',
    callNote: 'Você não chama direto. Quem despacha é a [[implement-spec]], a [[implement]] ou o comando `/marsai-dev:backend`.',
    icon: 'bot',
    actor: 'agente',
    kind: 'agent',
    tagline: 'Faz um ticket funcionar em um serviço de backend, com o teste primeiro.',
    what: [
      'É o implementador de backend para serviços TypeScript. Faz **um** ticket funcionar em **um** repositório.',
      'Ele não carrega os Standards. A forma do código vem do exemplo mais próximo do próprio repositório e, quando a tarefa indica um, do guia de implementação do time.',
    ],
    steps: [
      'Lê a tarefa: o que entregar, os critérios de aceite, onde testar e o contrato.',
      'Lê o repositório: as instruções, o glossário, as ADRs e o exemplo mais próximo do que vai construir. O repositório vence o que ele lembra.',
      'Carrega o guia de implementação do time quando a tarefa indica um. É onde o time guarda o que os serviços têm em comum: o gerador, o código de referência, a stack fixa.',
      'Constrói com o teste primeiro, um comportamento por vez.',
      'Roda os checks do repositório até ficarem verdes.',
    ],
    stops: {
      title: 'Quando ele para e pergunta',
      items: [
        'Qual parte do domínio é dona de um dado ou de uma regra.',
        'Quais eventos disparam, em que ordem, e quem consome.',
        'Quem pode chamar uma rota.',
        'Se é um use case novo ou a extensão de um existente.',
        'Um critério de aceite que pode ser lido de dois jeitos.',
        'Um contrato com que o outro repositório ainda não concordou.',
        'Uma biblioteca que o repositório não tem.',
      ],
    },
    returns: ['O que passou a funcionar', 'O que o guia de implementação mandou gerar e o que ele ajustou', 'Os arquivos alterados', 'Cada teste, com a saída falhando e depois passando', 'O comando de verificação e a saída final', 'As perguntas em aberto'],
    records: [],
    worksIf: [],
    faq: [
      ['E se o time não tiver um guia de implementação?', 'Não precisa. Ele segue o exemplo mais próximo do repositório e diz no retorno que nenhum guia foi indicado.'],
    ],
  },

  'frontend-engineer': {
    ref: 'agent:frontend-engineer',
    call: 'marsai-dev:frontend-engineer',
    callNote: 'Você não chama direto. Quem despacha é a [[implement-spec]], a [[implement]] ou o comando `/marsai-dev:frontend`.',
    icon: 'bot',
    actor: 'agente',
    kind: 'agent',
    tagline: 'Faz um ticket funcionar em um frontend, com os componentes que o repositório já tem.',
    what: [
      'É o implementador de frontend, para aplicações React e Next.js. Faz um ticket funcionar em um repositório: explora, escreve, depura.',
      'A atenção dele vai para uma tela que se comporta direito para quem usa. Os Standards são aplicados depois, pelo reviewer.',
    ],
    steps: [
      'Lê a tarefa: o que entregar, os critérios de aceite, o design quando houver e o contrato da API.',
      'Lê o repositório: a página, o componente, o hook e o formulário mais parecidos com o que vai construir.',
      'Carrega o guia de implementação do time quando a tarefa indica um.',
      'Constrói com a biblioteca de componentes do repositório. Procura o componente antes de escrever um.',
      'Escreve o teste primeiro onde mora a lógica: um hook, um formatador, uma regra de formulário.',
      'Roda os checks do repositório até ficarem verdes.',
    ],
    stops: {
      title: 'Quando ele para e pergunta',
      items: [
        'Uma biblioteca que o repositório não tem.',
        'Um contrato de API que falta, ou com que o backend não concordou.',
        'Um design que conflita com a biblioteca de componentes ou com uma tela existente.',
        'Um critério de aceite que pode ser lido de dois jeitos.',
      ],
    },
    returns: ['O que passou a funcionar', 'Os arquivos alterados', 'Os testes, falhando e depois passando', 'O comando de verificação e a saída final', 'Onde se afastou do design, e por quê', 'As perguntas em aberto'],
    records: [],
    worksIf: [],
    faq: [],
  },

  'code-reviewer': {
    ref: 'agent:code-reviewer',
    call: 'marsai-dev:code-reviewer',
    callNote: 'Você não chama direto. Quem despacha é a [[code-review]].',
    icon: 'bot',
    actor: 'agente',
    kind: 'agent',
    tagline: 'Lê o diff contra os Standards e o desenho do programa, e deixa a branch melhor do que encontrou.',
    what: [
      'É o reviewer. O implementador explorou, escreveu e depurou sem carregar os Standards; aplicá-los é o trabalho dele, e ele tem contexto sobrando para isso.',
      'Ele lê cada arquivo de Standards inteiro e revisa contra o que está escrito, não contra o que lembra. Um desenho do programa, quando ele recebe um, é o padrão daquela entrega, lido do mesmo jeito.',
    ],
    steps: [
      'Lê o diff e o suficiente do código em volta para entender cada trecho.',
      'Lê todos os arquivos de Standards que recebeu, inteiros.',
      'Acha onde o diff se afasta de uma regra documentada ou do desenho do programa.',
      'Corrige o que tem uma resposta certa, sem efeito no comportamento nem no contrato público. Um desvio local do desenho é corrigido do mesmo jeito: um nome, uma assinatura, um arquivo no lugar errado. Fica dentro do diff.',
      'Roda os checks depois das correções. Se uma correção não fica verde, desfaz e reporta.',
      'Commita em commits pequenos, agrupados por regra. Os commits do implementador ficam como estão.',
    ],
    stops: {
      title: 'Quando ele para e pergunta',
      items: [
        'A correção mudaria comportamento, contrato público, schema ou evento.',
        'Trazer o código de volta ao desenho do programa exigiria reescrever uma peça ou mover comportamento entre peças. Isso volta para a implementação.',
        'O Standard e o padrão do repositório discordam, e nada documenta qual vence.',
        'O julgamento é de quem é dono do ticket: nomear um conceito, dividir um módulo, cortar escopo.',
        'Os checks já estavam vermelhos antes das mudanças dele.',
        'Um arquivo de Standards está faltando. Ele diz isso; não revisa de memória.',
      ],
    },
    returns: ['O que corrigiu, com a regra e o commit', 'O que precisa de uma decisão, com as opções', 'O comando de verificação e a saída final'],
    records: [],
    worksIf: [],
    faq: [
      ['Ele mexe em código que eu não toquei?', 'Não. Código fora do diff fica de fora, mesmo quando tem o mesmo problema.'],
    ],
  },
};

Object.assign(skills, extras);
Object.assign(skills, {
  'git-commit': {
    ref: 'marsai-core:git-commit', call: '/marsai-core:git-commit', callNote: BOTH,
    icon: 'check', actor: 'agente', tagline: 'Organize mudanças em commits coerentes e verificados.',
    what: ['Lê o diff, organiza mudanças relacionadas e cria commits no formato do repositório. É a skill por trás do comando `/marsai-core:commit`, com o marcador exigido pelo hook.'],
    when: { rows: [['Mudanças prontas para entrar no histórico', '[[git-commit]]']] },
    steps: ['Confere o estado e o diff.', 'Agrupa as mudanças e alinha o plano de commits conforme a autorização existente.', 'Executa os hooks, assina quando há chave e verifica o histórico.'],
    records: ['Commits no histórico'], worksIf: ['Cada commit pode ser entendido e revisado por conta própria.'],
    faq: [['Ela também faz push?', 'Segue a autorização da sessão; sem autorização para enviar, pergunta antes.']],
  },
  'issue-handoff': {
    ref: 'marsai-core:issue-handoff', call: '/marsai-core:issue-handoff [URL da PR]', callNote: BOTH,
    icon: 'swap', actor: 'agente', tagline: 'Passe uma PR ao time com contexto suficiente para assumir.',
    what: ['Reúne o problema, a intenção, os checks vistos, o que falta e o prazo em uma issue no Linear. Prepara uma mensagem curta apontando para ela; o envio depende da sua autorização.'],
    when: { rows: [['Outra pessoa vai assumir uma PR ou trabalho em andamento', '[[issue-handoff]]']] },
    steps: ['Confere a PR e os resultados reais.', 'Confirma intenção e prazo quando faltam.', 'Atualiza ou cria a issue, liga a PR e entrega a mensagem para o time.'],
    records: ['Issue de handoff', 'Link na PR', 'Mensagem pronta para enviar'], worksIf: ['Quem assume entende o estado real e os próximos passos sem depender do autor.'],
    faq: [['É igual ao handoff de sessão?', '[[handoff]] retoma contexto entre sessões. Esta skill transfere a responsabilidade de uma PR ao time.']],
  },
});
groups.find((g) => g.id === 'desvios').skills.push('git-commit', 'issue-handoff');
groups.push(extraGroup);
