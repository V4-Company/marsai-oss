// Every string of the page chrome: navigation, buttons, labels. Page content
// lives in the other files of this folder.

import { reviewBot } from './review-bot.mjs';
export const ui = {
  meta: {
    siteName: 'MarsAI',
    tagline: 'o fluxo de desenvolvimento da V4, aberto',
    titles: {
      home: 'MarsAI · A IA escreve o código. Você julga.',
      map: 'O fluxo, da ideia à produção',
      manifesto: 'Manifesto: a IA escreve o código, você julga',
      skills: 'Skills',
      example: 'Um exemplo do começo ao fim',
      decide: 'Quem decide o quê',
      brakes: 'Os freios',
      decisions: 'Por que é assim',
      glossary: 'Glossário',
      questions: 'Dúvidas',
      fork: 'Faça o seu',
      notFound: 'Página não encontrada',
    },
    descriptions: {
      home: 'O fluxo de desenvolvimento que a V4 Company usa com agentes de IA, aberto: skills, agentes e gates, da ideia à produção. Primeiro a demo, depois o hardening.',
      map: 'O mapa interativo do fluxo: duas fases, sete gates, e o caminho de cada tipo de mudança.',
      manifesto: 'Escrever código ficou barato. Decidir o que construir e garantir que ficou bom continua caro. Dez princípios, com exemplo, de como a V4 constrói com IA.',
      skills: 'O que cada skill e cada agente do MarsAI faz, quando usar e o texto que o agente lê.',
      fork: 'O que é da V4, o que é seu, e como adaptar o fluxo ao seu time.',
      skill: 'Skill do MarsAI',
    },
  },
  nav: {
    home: 'Início', manifesto: 'Manifesto', map: 'Mapa', skills: 'Skills', questions: 'Dúvidas',
    explore: 'Explorar', guides: 'Guias', reference: 'Referência', project: 'Projeto',
    example: 'Um exemplo do começo ao fim', decide: 'Quem decide o quê', brakes: 'Os freios', decisions: 'Por que é assim',
    glossary: 'Glossário', fork: 'Faça o seu', repo: 'Repositório', matt: 'Skills de Matt Pocock',
    search: 'Buscar', github: 'GitHub', menu: 'Abrir o menu', langLabel: 'Idioma',
    try: 'Quero testar',
  },
  common: {
    copy: 'Copiar', copied: 'Copiado', copyLink: 'Copiar link', prev: '← Anterior', next: 'Próximo →', nextF: 'Próxima →',
    notFound: 'Página não encontrada', backHome: 'Voltar ao início →', person: 'PESSOA', agent: 'AGENTE',
    illustrative: 'Exemplo ilustrativo', badge: 'pessoa',
    soon: 'Em breve',
  },
  search: {
    placeholder: 'Buscar uma skill, um termo ou uma dúvida',
    empty: 'Nada encontrado. Tente outra palavra.',
    kinds: { skill: 'Skill', agent: 'Agente', question: 'Dúvida', guide: 'Guia', term: 'Termo', principle: 'Princípio' },
    guides: {
      home: ['O que é o MarsAI', 'O fluxo e as skills da V4, com o pedido para instalar pelo seu agente'],
      manifesto: ['Manifesto', 'A tese, os dez princípios e como pedir trabalho a um agente'],
      map: ['O mapa do fluxo', 'Interativo: o caminho completo, os atalhos e os gates, etapa por etapa'],
      example: ['Um exemplo do começo ao fim', 'A mesma mudança em todas as etapas'],
      decide: ['Quem decide o quê', 'O que fica com a pessoa e o que o agente faz sozinho'],
      brakes: ['Os freios', 'Checks, review, CI, bot e pessoa'],
      decisions: ['Por que é assim', 'As decisões registradas'],
      skills: ['Instalar', 'Pelo agente, pelo assistente ou direto no Claude Code'],
      fork: ['Faça o seu', 'O que é da V4 e como trocar pelo que é seu'],
      questions: ['Dúvidas', 'As mais comuns, respondidas'],
    },
  },
  map: {
    eyebrow: 'o fluxo de desenvolvimento da V4',
    title: 'Um passo revela o próximo.',
    lead: 'O caminho completo passa por todas as etapas, e dá para percorrer ele inteiro. Em duas decisões o trabalho pega um atalho: tarefa pequena vai direto para a implementação, e quem só tem dúvida de como construir pula a demo. Os sete gates ficam onde uma pessoa decide.',
    full: 'Ver mapa inteiro', stepwise: 'Voltar ao passo a passo',
    play: '▶ Percorrer', pause: '❚❚ Pausar', hint: 'Clique em qualquer etapa, ou use ← →',
    stepOf: 'Passo {n} de {total}', offPath: 'Fora deste caminho',
    routeChip: 'Decisão de caminho', routeLegend: 'Decisão de caminho',
    shortcuts: { small: 'Atalho: tarefa pequena', how: 'Atalho: só falta o como' },
    journey: 'Seu percurso', inspect: 'Inspeção da etapa', resume: 'Voltar à etapa atual', restart: 'Recomeçar', archived: 'O percurso termina aqui, com o motivo registrado',
    gateChip: 'Gate · pessoa decide', gateLegend: 'Gate',
    below: {
      example: ['Um exemplo do começo ao fim', 'A mesma mudança atravessando todas as etapas, com o que cada uma produz.', 'Ver o exemplo →'],
      decide: ['Quem decide o quê', 'Em cada etapa, o que fica com a pessoa e o que o agente faz sozinho.', 'Ver a divisão →'],
      brakes: ['Os freios', 'Cinco conferências, da mais barata à mais cara. Cada uma pega o que a anterior deixou passar.', 'Ver os freios →'],
      manifesto: ['Por que demo antes de hardening', 'O manifesto explica a tese por trás do fluxo.', 'Ler o manifesto →'],
    },
    simulation: 'O mapa é uma simulação para aprender o fluxo. Ele não executa trabalho nem acompanha suas PRs.',
  },
  skills: {
    eyebrow: 'referência',
    title: ['Skills para trabalhar', 'com agentes'],
    lead: 'Cada skill conduz uma etapa do fluxo. Você chama pelo menu `/`, e o agente segue o texto dela. Aqui está o que cada uma faz, quando usar e o texto que o agente lê.',
    stats: ['SKILLS', 'AGENTES', 'DECISÕES REGISTRADAS'],
    section: 'Skills', sectionLead: 'Agrupadas por quando você recorre a elas. A maioria das pessoas começa pelo fluxo principal.',
    startWith: 'Comece por',
    installTitle: 'Instalar',
    callSkill: 'Como chamar', callAgent: 'Nome do agente',
    sections: {
      what: 'O que faz', whenSkill: 'Quando usar', whenAgent: 'Quando entra', how: 'Como funciona', returns: 'O que devolve',
      example: 'No exemplo', records: 'O que fica registrado', worksIf: 'Funcionou se', faq: 'Dúvidas comuns',
      textSkill: 'O texto da skill', textAgent: 'O texto do agente',
    },
    whenHead: ['O que você tem', 'O que usar'],
    textNote: 'É exatamente o que o agente lê{files}. O texto é em inglês; o agente conversa com você na sua língua.',
    textFiles: ', com os arquivos de apoio',
    showAll: 'Mostrar inteiro', onThisPage: 'Nesta página', whereItFits: 'Onde se encaixa',
    slices: ['Fatia', 'Repositórios', 'Bloqueio'],
  },
  guides: {
    label: 'Guia',
    example: {
      eyebrow: 'uma mudança, todas as etapas', title: 'Um exemplo do começo ao fim',
      lead: 'A mesma mudança atravessando o fluxo inteiro: o que a pessoa diz, o que o agente responde e o que cada etapa deixa pronto para a seguinte.',
      note: 'O exemplo é ilustrativo.',
    },
    decide: {
      eyebrow: 'pessoa e agente', title: 'Quem decide o quê',
      lead: 'A regra de desenho do fluxo: a pessoa decide, o agente executa. O agente pergunta e recomenda, mas nenhuma skill entrega uma decisão de desenho a ele.',
      head: ['Etapa', 'A pessoa decide', 'O agente faz sozinho'],
      stopsTitle: 'Quando o agente para e chama você',
      stopsLead: 'Da spec em diante o agente roda sozinho. Ele para em três casos, e para aquela fatia, não o trabalho todo.',
      stops: ['Falta uma decisão de desenho que a spec não tomou.', 'Os checks não ficam verdes depois de uma tentativa honesta de corrigir.', 'O trabalho exigiria sair do contrato, do escopo ou do desenho do programa combinados.'],
      neverTitle: 'O que nunca é do agente',
      never: ['O merge, por padrão. Só um [[full-send]] explícito deixa o agente fazer o merge de uma porta de duas vias depois que todo check passa; porta de mão única é sempre de uma pessoa.', 'O veredito sobre a demo.', 'Aprovar o que a [[retro]] propõe.', 'Mudar comportamento, contrato, schema ou evento durante o review.', 'Rebase e fechamento de PR, sem autorização explícita.'],
    },
    brakes: {
      eyebrow: 'do mais barato ao mais caro', title: 'Os freios',
      lead: 'Freio é o que impede código ruim de avançar. Cada um pega o que o anterior deixou passar. Erro pego tarde volta a esteira inteira, então o que der para pegar antes, pega-se antes.',
      cost: 'custo',
      repeatTitle: 'Achado que se repete desce um degrau',
      repeatLead: 'Se o mesmo problema aparece várias vezes num freio caro, ele deve virar check num freio mais barato. É o trabalho da [[retro]]: o que uma máquina consegue conferir vira check; o que é julgamento vira regra nos Standards, que o reviewer aplica.',
      botTitle: 'A nota do bot',
      botLead: 'A rubrica de exemplo dá nota de 1 a 5 em toda PR. A nota não é média: é a pior entre seis dimensões, então uma dimensão fraca derruba uma PR perfeita nas outras cinco. Qualquer bot de review ou check de CI pode aplicá-la; na V4, quem aplica é o Hermes, nosso bot interno.',
      botHead: ['Dimensão', 'O que cobre'],
      reviewBot,
    },
    decisions: {
      eyebrow: 'as decisões por trás do desenho', title: 'Por que é assim',
      lead: 'Cada escolha do fluxo tem um registro: o que foi decidido, o que isso custa e o que foi rejeitado. Abra uma para ler o registro inteiro. Os registros são escritos em inglês.',
      more: 'Ler a decisão completa →',
    },
    cut: { byRepo: '✗ Corte por repositório', allOf: 'Tudo do {repo}', byRepoNote: 'Nada funciona até os dois pedaços terminarem. O erro de encaixe aparece no fim.', byBehaviour: '✓ Corte por comportamento', byBehaviourNote: 'Cada linha é uma fatia: dá para demonstrar sozinha.' },
    lanes: ['começo', 'tempo →', 'PR pronta'],
    danger: {
      twoWay: 'Porta de mão dupla', twoWayText: 'Reverter o merge volta ao estado anterior, sem perda. É o caso da maioria das PRs.',
      oneWay: 'Porta de mão única', oneWayText: 'Reverter o código não desfaz o efeito.',
      oneWayItems: ['Migration que apaga ou transforma dado', 'E-mail ou cobrança disparados', 'Evento que outro serviço já consumiu', 'Contrato de que um cliente passa a depender'],
      radius: 'Raio de impacto: o que mais pode quebrar se der errado', scale: ['local', 'serviço', 'entre serviços', 'cliente'],
    },
  },
  glossary: {
    eyebrow: 'a linguagem do fluxo', title: 'Glossário',
    lead: 'Os termos que aparecem nas skills, nas issues e nas PRs. Vêm do `CONTEXT.md` do repositório, que traz cada termo em inglês e em português.',
    filter: 'Filtrar termos', avoid: 'evite', other: 'em inglês',
  },
  questions: {
    title: 'Dúvidas',
    lead: 'As mais comuns, respondidas. Para qualquer outra, aperte ⌘K (Ctrl+K) para buscar no site inteiro, ou abra uma issue no [GitHub](https://github.com/{{repo}}/issues).',
  },
  manifesto: {
    nav: 'Neste manifesto', mapCta: 'Ver no mapa', versus: 'x',
    before: 'Antes', now: 'Agora', equals: '=',
  },
  fork: { guideLabel: 'Guia' },
  footer: {
    license: 'Código aberto sob licença Apache 2.0.',
    links: { repo: 'Repositório', issues: 'Abrir uma issue', contributing: 'Como contribuir', matt: 'Skills originais de Matt Pocock' },
  },
};

ui.skills.invocation = {
  "title": "Quem chama cada skill?",
  "note": "Invocação é quem inicia a skill. “Pessoa decide” e “Agente sozinho” indicam como o trabalho acontece. Os rótulos abaixo vêm das configurações reais das skills no Claude Code; outros apps podem apresentar ou aplicar esses controles de forma diferente.",
  "user": {
    "label": "User-invoked",
    "description": "Só você chama pelo menu /. O agente não pode invocar a skill automaticamente."
  },
  "both": {
    "label": "User + agent-invoked",
    "description": "Você pode chamar pelo menu /. O agente também pode invocar quando o contexto pede ou outra skill encaminha."
  },
  "agent": {
    "label": "Agent-invoked",
    "description": "Outro agente a carrega ou despacha. Não é uma entrada no menu / para o usuário."
  }
};
ui.skills.extras = {
  "title": "Instalar este pacote extra",
  "note": "Não entra na instalação principal. Este comando instala as extras juntas; o assistente pergunta em quais apps. Fontes: [Matt Pocock](https://github.com/mattpocock/skills), [Lauren Tan](https://github.com/cursor/plugins/tree/main/pstack) e [Cathryn Lavery](https://github.com/cathrynlavery/diagram-design).",
  "claude": "Só Claude Code, com o marketplace MarsAI já adicionado:"
};
