// The home page and "make it yours". Same inline markup as skills.mjs.
// {{site}} and {{repo}} are filled in by the build.

export const home = {
  hero: {
    eyebrow: ['V4 COMPANY', 'nosso jeito de construir com IA, aberto'],
    title: ['A IA escreve o código.', 'Você julga.'],
    lead: 'O MarsAI é o fluxo de desenvolvimento que a V4 usa com agentes de IA: skills, agentes e gates, da ideia à produção. Primeiro a demo, depois o hardening.',
    primary: 'Quero testar',
    secondary: 'Ver o fluxo',
    note: 'Código aberto. Use, faça fork e adapte ao seu time.',
  },
  steps: {
    label: 'COMO UMA IDEIA VIRA ENTREGA',
    items: [
      ['01', 'Planejar', 'Problema, intent e grill. Você decide; o agente pergunta.'],
      ['02', 'Provar', 'Uma demo que funciona, na mão de um usuário real.'],
      ['03', 'Endurecer', 'A v1 cortada da demo, com testes, review e PR.'],
      ['04', 'Aprender', 'Em produção, o que deu errado vira regra.'],
    ],
    link: 'Veja esse caminho se formar, etapa por etapa',
  },
  tryIt: {
    kicker: 'QUERO TESTAR',
    title: 'Cole isto no seu agente.',
    lead: 'Funciona no Claude Code, no Codex, no Cursor e no OpenCode. O agente instala, faz uma entrevista breve e ajuda a adaptar as skills ao seu projeto e à sua arquitetura.',
    prompt: 'Instale o MarsAI, o fluxo de desenvolvimento da V4 Company, neste agente de código. Antes de começar a trabalhar, faça uma entrevista breve para entender meu papel, se estou começando do zero ou num projeto existente, o tamanho do time e os padrões de arquitetura que já usamos. Leia o repositório para não perguntar sobre o que já está documentado e me ajude a adaptar as skills à nossa arquitetura, aos nossos exemplos de código e aos nossos checks.\n\nSiga as instruções de {{site}}/install.md e a entrevista de {{site}}/onboarding.md. Pergunte antes de mexer em qualquer coisa fora da configuração do próprio agente. Fale comigo em português.',
    copy: 'Copiar o pedido',
    after: ['Instala o `marsai-core` e o `marsai-dev` e explica como desfazer.', 'Faz uma entrevista breve sobre você, o projeto e o time.', 'Lê a arquitetura existente e propõe a adaptação das skills.', 'Registra o contexto, com sua autorização, e conduz o primeiro trabalho.'],
    manualTitle: 'Prefere fazer à mão?',
    manual: [
      { title: 'Com o assistente', text: 'Pergunta em quais apps instalar: Claude Code, Codex, Cursor e OpenCode.', commands: ['npx --yes github:{{repo}}'] },
      { title: 'Só no Claude Code', text: 'O plugin de dev traz o `marsai-core` junto.', commands: ['claude plugin marketplace add {{repo}}', 'claude plugin install marsai-dev@marsai-oss'] },
    ],
    agentNote: 'É um agente lendo esta página? As instruções estão em [/install.md]({{site}}/install.md) e o índice em [/llms.txt]({{site}}/llms.txt).',
  },
  homeRepo: {
    kicker: 'COMO RODAMOS NA V4 HOJE',
    title: 'A tese do Home Repo.',
    text: [
      'Na V4, cerca de 40 pessoas trabalham em 80+ repositórios. Um agente que começa dentro de um repositório de produto fica cego para o resto da arquitetura, e as skills e regras copiadas em cada repositório divergem.',
      'Por isso paramos de instalar plugins máquina por máquina. Inspirados no [Home Repo Pattern do Matt Pocock](https://www.aihero.dev/the-home-repo-pattern), toda sessão de agente na V4 começa num Home Repo central, o Home MarsAI. Ele guarda um ponteiro para cada repositório, uma wiki viva do sistema, nossos Standards de código e as skills do MarsAI direto em `.claude/` (e `.agents/skills` para o Codex). Um `git pull` atualiza o time inteiro, sem instalador.',
    ],
    pathsTitle: 'Dois caminhos',
    paths: [
      { title: '1 · Comece rápido', text: 'Um repositório só, ou um teste individual: instale `{{repo}}` como plugin ou pela CLI. Leva um minuto, no Claude Code, Codex, Cursor ou OpenCode.', cta: 'Instalar' },
      { title: '2 · Escale para um time multi-repo', text: 'Faça como a V4: rode a [[home-repo]], incluída no pacote, para montar o Home Repo do seu time, com os ponteiros, a wiki, os seus Standards e as skills em `.claude/`, atualizados com `git pull`.', cta: 'Ver a skill' },
    ],
    link: 'Ler a decisão (ADR 0019)',
  },
  phases: {
    kicker: 'O FLUXO',
    title: 'Duas fases. Sete gates.',
    lead: 'Na primeira fase, liberdade total para descobrir se a ideia presta. Na segunda, qualidade máxima só no que provou valor. Em cada gate, uma pessoa decide se o trabalho avança.',
    cards: [
      { tag: 'Fase 1 · Planejamento', mode: 'Liberdade total', steps: ['Problema', 'Intent', 'Grill', 'Demo'], tone: 'plan' },
      { tag: 'Fase 2 · Hardening', mode: 'Qualidade máxima', steps: ['Spec', 'Tickets', 'Build e review', 'PR', 'Produção'], tone: 'hard' },
    ],
    cta: 'Explorar o mapa',
  },
  why: {
    kicker: 'POR QUÊ',
    title: 'O gargalo mudou de lugar.',
    text: [
      'Escrever código ficou barato. Decidir o que construir e garantir que ficou bom continua caro.',
      'O manifesto explica por que o fluxo é assim: dez princípios, com exemplos, e o jeito de pedir trabalho a um agente.',
    ],
    cta: 'Ler o manifesto',
    principles: ['O código é do agente. O julgamento é seu.', 'Peça grande. Depois, deixe o agente trabalhar.', 'Humano nas pontas. Máquina no meio.'],
  },
  paths: {
    kicker: 'POR ONDE COMEÇAR',
    title: 'O tamanho da mudança muda o caminho.',
    items: [
      { scenario: 'bug', title: 'É bug, ajuste pequeno ou débito técnico?', text: 'Fast track: implemente direto, com checks e review.' },
      { scenario: 'feature', title: 'É uma feature?', text: 'Comece pelo problema. A demo vem antes de qualquer engenharia.' },
      { scenario: 'how', title: 'Já sabe o quê e falta o como?', text: 'Sem demo: direto para a spec.' },
    ],
    go: 'Explorar',
  },
  open: {
    kicker: 'É DA V4. FAÇA O SEU.',
    title: 'Use, faça fork e adapte.',
    text: [
      'Este é o jeito que a V4 trabalha, publicado como está. Quem quiser usar, usa. Quem quiser contribuir, contribui.',
      'Ele carrega as nossas escolhas: o Linear como tracker, um bot nosso no review, histórico linear. O melhor jeito de adotar é fazer um fork e trocar o que é nosso pelo que é seu.',
    ],
    actions: { fork: 'Fazer um fork', guide: 'O que trocar', issue: 'Abrir uma issue', contribute: 'Contribuir' },
  },
  origin: {
    kicker: 'DE ONDE VEIO',
    title: 'Boas ideias merecem crédito.',
    text: [
      'O fluxo parte das [skills de Matt Pocock](https://github.com/mattpocock/skills), adaptadas sob licença MIT. Mantemos os nomes para conectar este guia aos materiais dele.',
      'O repositório nasceu como uma adaptação do Ring, da Lerian Studio, sob licença Apache 2.0. O repositório original não é mais público; a atribuição fica no `NOTICE`.',
      'A V4 acrescenta a demo antes do hardening, os gates, o trabalho entre repositórios, o review que corrige e os pacotes do time.',
    ],
    link: 'Conheça o trabalho do Matt',
  },
  credits: 'Feito pela V4 Company. Fluxo e skills adaptados do trabalho de Matt Pocock.',
};

export const fork = {
  eyebrow: 'o que é nosso e o que é seu',
  title: 'Faça o seu',
  lead: 'O MarsAI é o fluxo da V4, aberto sob licença Apache 2.0. Comece pela entrevista da [[using-marsai]] para conectá-lo à arquitetura e aos padrões do seu projeto. Para um time em vários repositórios, mantenha um Home Repo, como a V4 faz. Para regras compartilhadas além dele, use um pacote do time. Um fork permite mudar o próprio fluxo.',
  ways: {
    title: 'Quatro jeitos de usar',
    items: [
      ['Como está', 'Instale e use. Você ganha o fluxo, a demo, a spec, a implementação com TDD e o review com a linha de base. O que é da V4 aparece como exemplo.'],
      ['Com um pacote do seu time', 'Crie um plugin seu com os seus Standards e o seu guia de implementação. O fluxo público carrega o que o pacote oferece, sem você mexer nele.'],
      ['Com um fork', 'Copie o repositório e mude o que quiser: as skills, os gates, o tracker. É o caminho quando o seu processo é diferente do nosso.'],
      ['Dentro do seu Home Repo', 'Como a V4 roda: um repositório onde toda sessão começa, com um ponteiro para cada repositório seu, uma wiki do seu sistema, os seus Standards e as skills em `.claude/`. A [[home-repo]] monta; o MarsAI entra pelos plugins ou, como na V4, copiado para o mesmo `.claude/`, e um `git pull` atualiza todo mundo.'],
    ],
  },
  ours: {
    title: 'O que é da V4 e como trocar',
    head: ['O que', 'Onde aparece', 'Como trocar'],
    rows: [
      ['Linear como tracker', '[[to-spec]], [[to-tickets]], [[implement-spec]], [[wayfinder]]', 'As skills chamam as ferramentas do MCP do Linear. Num fork, troque pelas do seu tracker.'],
      ['Um bot de review em toda PR (na V4, o Hermes, que construímos internamente)', '[[babysit-pr]] e a nota prevista na [[code-review]]', 'Conecte CodeRabbit, Greptile, GitHub Copilot Review ou um bot próprio. CodeRabbit e Greptile foram excelentes nos nossos testes; na escala, avalie construir o seu. [Veja a recomendação](@brakes#review-bot).'],
      ['SonarQube no CI', '[[babysit-pr]], [[retro]]', 'Qualquer análise estática que rode na PR.'],
      ['Histórico linear', 'O hook do `marsai-core` bloqueia merge commit', 'Defina `MARSAI_LINEAR_HISTORY=off` se o seu repositório faz merge.'],
      ['Commit e PR pelas skills', 'O hook bloqueia `git commit` e `gh pr create` diretos', 'É o que faz a mensagem e a descrição saírem no padrão. Num fork, mude o hook.'],
      ['Os Standards', '[[code-review]]', 'Os da V4 são privados. Os seus entram numa skill cuja descrição começa com `Standards extension`: no `.claude/` do seu Home Repo, se você mantém um, ou num pacote do time.'],
      ['O guia de implementação', '[[implement]], os agentes implementadores', 'Uma skill cuja descrição começa com `Implementation guide` (o gerador, o código de referência, a stack), no seu Home Repo ou no seu pacote.'],
    ],
  },
  pack: {
    title: 'Um pacote do time, em três arquivos',
    lead: 'Sem um Home Repo, as suas skills viajam num pacote: um plugin comum, que depende do `marsai-dev`. O fluxo encontra as peças pelo começo da descrição, então os mesmos três arquivos funcionam também dentro do `.claude/` de um Home Repo.',
    rows: [
      ['`skills/standards/SKILL.md`', 'Descrição começa com `Standards extension:`. Lista os arquivos de regras, por stack. O review carrega.'],
      ['`skills/backend-guide/SKILL.md`', 'Descrição começa com `Implementation guide:`. O implementador carrega antes de escrever código.'],
      ['`hooks/`', 'As travas que são só suas: um trailer de commit, um formato de branch.'],
    ],
  },
  contribute: {
    title: 'Como contribuir',
    items: [
      'Achou um erro ou tem uma ideia? Abra uma issue.',
      'Quer mudar uma skill? Mande uma PR. O guia de contribuição diz como escrever e como testar.',
      'Mudou o fluxo no seu fork e funcionou melhor? Conte: é assim que este aqui melhora.',
    ],
    note: 'A V4 mantém o repositório e decide o que entra. O que é específico de um time fica melhor num pacote ou num fork.',
  },
};
