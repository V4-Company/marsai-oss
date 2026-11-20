# MarsAI

MarsAI is the development workflow V4 Company uses to build with AI agents, published as plugins. This glossary defines the language of the flow: the terms that appear in the skills, the issues and the pull requests. Terms only; decisions live in `docs/adr/`.

Each term is given in English, the language of this repository, and in Brazilian Portuguese, the language the V4 team speaks. An agent that talks to the person in Portuguese uses the Portuguese term.

## Language

### Gates and brakes

**Gate** (pt-BR: **Gate**):
A point in the flow where a person decides whether the work moves on. There are seven, G0 to G6, each with an owner and a definition of done.
_pt-BR_: Ponto do fluxo em que uma pessoa decide se o trabalho avança. São sete, de G0 a G6, cada um com dono e definição de pronto.
_Avoid_: checkpoint, approval step
_Evite_: checkpoint, etapa de aprovação

**Brake** (pt-BR: **Freio**):
A mechanism that keeps bad code from moving on, inside gate G5. There are three kinds, in layers: Check, Automated review and Human review.
_pt-BR_: Mecanismo que impede código ruim de avançar, dentro do gate G5. São três tipos, em camadas: Check, Review automático e Review humano.
_Avoid_: barrier
_Evite_: barreira

**Check** (pt-BR: **Check**):
A deterministic verification that runs on its own and always gives the same result: lint, types, tests, hooks. It costs compute, not tokens.
_pt-BR_: Verificação determinística que roda sozinha e dá sempre o mesmo resultado: lint, tipos, testes, hooks. Custa processamento, não tokens.
_Avoid_: validation, automatic verification
_Evite_: validação, verificação automática

**Check Command** (pt-BR: **Check Command**):
The single command that gives the quality verdict of a repository, the same on the developer's machine and in CI.
_pt-BR_: O comando único que dá o veredito de qualidade de um repositório, igual na máquina do dev e no CI.

**Automated review** (pt-BR: **Review automático**):
A reading of the diff by an agent, to catch what the Checks let through. It happens twice: with the Reviewer, before the pull request, and with a review bot, on the pull request.
_pt-BR_: Leitura do diff por um agente, para pegar o que os Checks deixam passar. Acontece duas vezes: com o Reviewer, antes da PR, e com um bot de review, na PR.
_Avoid_: bot review, AI code review
_Evite_: revisão de bot, code review de IA

**Human review** (pt-BR: **Review humano**):
A reading of the pull request by a member of the team: someone who took part in the Refinement session, when the delivery had one. Every pull request gets it, and the risk sets how deep it goes. It is the most expensive Brake.
_pt-BR_: Leitura da PR por uma pessoa do time: alguém que participou da Sessão de refinamento, quando a entrega teve uma. Toda PR passa por ela, e o risco define a profundidade. É o Freio mais caro.

### Roles

**Implementer** (pt-BR: **Implementador**):
The agent that makes the code work: explores, writes and debugs. It does not load the Standards.
_pt-BR_: Agente que faz o código funcionar: explora, escreve e depura. Não carrega os Standards.
_Avoid_: engineer agent, specialist, dev agent
_Evite_: engineer agent, especialista, dev agent

**Reviewer** (pt-BR: **Reviewer**):
The agent that receives a diff, applies the Standards and commits the fixes. It comments only when the fix depends on a person's decision.
_pt-BR_: Agente que recebe um diff, aplica os Standards e commita as correções. Só comenta quando a correção depende de uma decisão de pessoa.
_Avoid_: code-reviewer (that is the name of the file, not of the role)
_Evite_: revisor, code-reviewer (é o nome do arquivo, não do papel)

**Review bot** (pt-BR: **Bot de review**):
An automated reviewer that comments on every open pull request and gives it a score. The flow uses an example rubric: a score from 1 to 5, equal to the lowest score across six dimensions. At V4 Company the review bot is Hermes, built in-house; another team can plug in CodeRabbit, Greptile, GitHub Copilot Review or its own.
_pt-BR_: Revisor automático que comenta toda PR aberta e dá uma nota. O fluxo usa uma rubrica de exemplo: nota de 1 a 5, igual à pior de seis dimensões. Na V4 Company, o bot de review é o Hermes, construído internamente; outro time pode usar CodeRabbit, Greptile, GitHub Copilot Review ou um bot próprio.

**Standards** (pt-BR: **Standards**):
The rules for how code should be written that depend on judgement. They are read at review, not at implementation. A mechanical rule becomes a Check, not a Standard.
_pt-BR_: Regras de como o código deve ser escrito que dependem de julgamento. São lidas no review, não na implementação. Regra mecânica vira Check, não Standard.
_Avoid_: guidelines, code rules
_Evite_: padrões, guidelines, regras de código

**Team pack** (pt-BR: **Pacote do time**):
A plugin a team installs on top of the public flow, holding what belongs to that team alone: its Standards, its implementation guides, its guards. V4's is private.
_pt-BR_: Plugin que um time instala por cima do fluxo público, com o que é só dele: seus Standards, seus guias de implementação, suas travas. O da V4 é privado.

**Implementation guide** (pt-BR: **Guia de implementação**):
A skill in a Team pack that tells the Implementer what the team's repositories share: the generator, the reference code, the fixed stack.
_pt-BR_: Skill de um Pacote do time que diz ao Implementador o que os repositórios do time têm em comum: o gerador, o código de referência, a stack fixa.

**Home Repo** (pt-BR: **Home Repo**):
The one repository where every agent session of a team starts, whatever repository the work is in. It holds what the team shares (the steering files, the docs, a wiki and the tools) and a Pointer to each of the team's other repositories.
_pt-BR_: O repositório único onde começa toda sessão de agente de um time, seja qual for o repositório do trabalho. Guarda o que o time compartilha (os arquivos de instrução, os docs, uma wiki e as ferramentas) e um Ponteiro para cada um dos outros repositórios do time.
_Avoid_: central repository, config repository, meta-repo
_Evite_: repositório central, repositório de configuração, meta-repo

**Pointer** (pt-BR: **Ponteiro**):
One line in the Home Repo that names a repository, says what it is, where it lives on disk and where to clone it from, with a hint when it needs one.
_pt-BR_: Uma linha do Home Repo que nomeia um repositório, diz o que ele é, onde fica no disco e de onde cloná-lo, com uma dica quando precisa.
_Avoid_: link, submodule
_Evite_: link, submódulo

### Planning

**Path** (pt-BR: **Caminho**):
The steps and gates one piece of work goes through, chosen by its size: Feature, both phases; Hardening, from the Spec on, when the only open question is how to build it; or Fast track, straight to implementation, for a bug, a small adjustment, tech debt, a refactor or a measured slowdown. The MarsAI mode recommends it and the person confirms it.
_pt-BR_: As etapas e os gates por onde um trabalho passa, escolhidos pelo tamanho dele: Feature, as duas fases; Hardening, da Spec em diante, quando a única dúvida é como fazer; ou Fast track, direto para a implementação, para bug, ajuste pequeno, débito técnico, refatoração ou lentidão medida. O modo MarsAI recomenda e a pessoa confirma.
_Avoid_: track, process
_Evite_: trilha, processo

**MarsAI mode** (pt-BR: **Modo MarsAI**):
The single way into any work: from one sentence or a card, the agent recommends the Path, puts it on a visible checklist with its Gates and leads the person to the end. A skipped step stays on the list with its reason.
_pt-BR_: A porta única para qualquer trabalho: a partir de uma frase ou de um card, o agente recomenda o Caminho, coloca na checklist visível com os Gates e conduz a pessoa até o fim. Etapa pulada fica na lista com o motivo.
_Avoid_: start command, router
_Evite_: comando de início, roteador

**Intent** (pt-BR: **Intent**):
What someone wants, written before any solution: the problem, the expected result, how success is measured and what is out of scope.
_pt-BR_: O que se quer, escrito antes de qualquer solução: o problema, o resultado esperado, como medir o sucesso e o que fica fora do escopo.
_Avoid_: requirement, brief
_Evite_: requisito, briefing

**Grill** (pt-BR: **Grill**):
An interview in which the agent asks and the person decides, round by round, until no implicit decision is left. Facts the agent finds on its own; decisions are always the person's.
_pt-BR_: Entrevista em que o agente pergunta e a pessoa decide, rodada a rodada, até não sobrar decisão implícita. Fatos o agente busca sozinho; decisões são sempre da pessoa.
_Avoid_: brainstorm, discovery, planning
_Evite_: brainstorm, discovery, planejamento

**Glossary** (pt-BR: **Glossário**):
The `CONTEXT.md` file of a repository: the terms of the domain, with the chosen word and the ones to avoid.
_pt-BR_: O arquivo `CONTEXT.md` de um repositório: os termos do domínio, com a palavra escolhida e as que devem ser evitadas.

**ADR** (pt-BR: **ADR**):
A short record of a decision that is hard to undo, surprising without context and the result of a real trade-off. It lives in the repository's `docs/adr/`, with the decision first and a "How to apply" section.
_pt-BR_: Registro curto de uma decisão difícil de desfazer, surpreendente sem contexto e fruto de um trade-off real. Vive em `docs/adr/` do repositório, com a decisão primeiro e uma seção "Como aplicar".

**Invariant** (pt-BR: **Invariante**):
A rule of the domain that can never be broken. One that another team has to respect is recorded as an ADR in the repository that owns it.
_pt-BR_: Regra do domínio que nunca pode ser violada. A que outro time precisa respeitar é registrada como ADR no repositório dono.
_Avoid_: golden rule
_Evite_: golden rule, regra de ouro

**Decision map** (pt-BR: **Mapa de decisões**):
An issue kept by Wayfinder when the Grill grows beyond one session. It records the destination, the index of decisions and the uncertainties; its child issues resolve questions before the Spec is cut into Vertical slices.
_pt-BR_: Issue mantida pelo Wayfinder quando o Grill cresce além de uma sessão. Registra o destino, o índice de decisões e as incertezas; suas filhas resolvem perguntas, antes de a Spec ser cortada em Fatias verticais.

**Demo** (pt-BR: **Demo**):
A first version of a feature used by a real user before full Hardening. In order of preference it runs in production behind a feature flag for selected users, with explicit approval, protected data and rollback; in development, with the user using it; or outside the codebase, as a last resort. General release follows Hardening.
_pt-BR_: Primeira versão de uma feature usada por um usuário real antes do Hardening completo. Por ordem de preferência, roda em produção atrás de feature flag para usuários selecionados, com aprovação explícita, dados protegidos e rollback; em dev, com o usuário usando; ou fora da codebase, como último recurso. A liberação geral vem depois do Hardening.
_Avoid_: MVP, beta
_Evite_: MVP, beta

**Prototype** (pt-BR: **Protótipo**):
Throwaway code that answers one design question that conversation cannot settle. Smaller than a Demo: a rule, a screen or an exchange of events.
_pt-BR_: Código descartável que responde uma pergunta de desenho que conversa não resolve. Menor que uma Demo: uma regra, uma tela ou uma troca de eventos.
_Avoid_: POC, spike
_Evite_: POC, spike

**Hardening** (pt-BR: **Hardening**):
The second phase of a feature: the v1 cut from the Demo is specified, built with tests, reviewed and shipped.
_pt-BR_: A segunda fase de uma feature: a v1 cortada da Demo é especificada, construída com testes, revisada e entregue.

**Handoff** (pt-BR: **Handoff**):
A short document that carries the context of a conversation to another agent, folder, harness or person. It is in transit: it does not go into a commit.
_pt-BR_: Documento curto que leva o contexto de uma conversa para outro agente, outra pasta, outro harness ou outra pessoa. É de passagem: não entra em commit.
_Avoid_: summary, briefing
_Evite_: resumo, briefing, passagem de bastão

**Spec** (pt-BR: **Spec**):
The description of the problem, the solution and the decisions of a change, published on the Parent issue. Never in a local folder.
_pt-BR_: Descrição do problema, da solução e das decisões de uma mudança, publicada na Issue-mãe. Nunca em pasta local.
_Avoid_: PRD, plan
_Evite_: PRD, plano, refinamento

**Program design** (pt-BR: **Desenho do programa**):
The part of the technical refinement one level below the architecture: the new pieces with their types and signatures, where they plug into the existing code and who calls whom, and where each test hooks in. The code of that delivery is checked against it.
_pt-BR_: A parte do refinamento técnico um nível abaixo da arquitetura: as peças novas com seus tipos e assinaturas, onde elas se ligam ao código existente e quem chama quem, e onde cada teste entra. O código daquela entrega é conferido contra ele.
_Avoid_: detailed design, low-level design
_Evite_: design detalhado

**Refinement session** (pt-BR: **Sessão de refinamento**):
The meeting of up to 30 minutes where gate G4 is decided. The tech lead, the PM and the developer responsible go through the technical refinement; the tech lead approves it, and the group names who reads the pull requests.
_pt-BR_: A reunião de até 30 minutos em que o gate G4 é decidido. Tech lead, PM e dev responsável percorrem o refinamento técnico; o tech lead aprova, e o grupo define quem lê as PRs.
_Avoid_: planning, grooming
_Evite_: planning, grooming

**Excavation** (pt-BR: **Escavação**):
Reading the current code, with file and line as evidence, before stating how something works.
_pt-BR_: Leitura do código atual, com evidência de arquivo e linha, antes de afirmar como algo funciona.

**Event catalog** (pt-BR: **Catálogo de eventos**):
The record of who publishes and who consumes each event, with the schema. Consulted during the Excavation and updated in the same pull request that creates or changes an event.
_pt-BR_: O registro de quem publica e quem consome cada evento, com o schema. Consultado na Escavação e atualizado na mesma PR que cria ou muda um evento.

**Parent issue** (pt-BR: **Issue-mãe**):
The issue that describes the whole change in product language. The Vertical slices are its children.
_pt-BR_: Issue que descreve a mudança inteira em linguagem de produto. As Fatias verticais são filhas dela.
_Avoid_: umbrella, epic
_Evite_: guarda-chuva, épico

**Vertical slice** (pt-BR: **Fatia vertical**):
A piece of work that delivers one behaviour working from end to end, across every layer and every repository it needs, and that can be demonstrated on its own. Each slice is a child issue of the Parent issue.
_pt-BR_: Pedaço de trabalho que entrega um comportamento funcionando de ponta a ponta, atravessando todas as camadas e todos os repositórios necessários, e que pode ser demonstrado sozinho. Cada Fatia é uma issue filha da Issue-mãe.
_Avoid_: phase, stage, delivery by layer, delivery by repository
_Evite_: fase, etapa, entrega por camada, entrega por repositório

### Pull request

**Merge danger** (pt-BR: **Perigo do merge**):
The section of a pull request that declares the Door and the Blast radius, so the Human review knows how much attention to give.
_pt-BR_: Seção da PR que declara a Porta e o Raio de impacto, para o Review humano saber quanta atenção dar.

**Two-way door** (pt-BR: **Porta de mão dupla**):
A change that can be undone after the merge with no loss.
_pt-BR_: Mudança que dá para desfazer depois do merge sem perda.

**One-way door** (pt-BR: **Porta de mão única**):
A change that cannot be undone: a destructive migration, lost data, an email sent, a charge made.
_pt-BR_: Mudança que não dá para desfazer: migração destrutiva, perda de dado, e-mail disparado, cobrança feita.

**Blast radius** (pt-BR: **Raio de impacto**):
What else can break if the change goes wrong, and how bad it is.
_pt-BR_: O que mais pode quebrar se a mudança der errado, e quão grave é.
_Avoid_: impact
_Evite_: impacto

### Continuous improvement

**Retro** (pt-BR: **Retro**):
A retrospective of a session or of a set of pull requests that turns each repeated mistake into a Check (when it is mechanical) or into a Standard (when it is judgement).
_pt-BR_: Retrospectiva de uma sessão ou de um conjunto de PRs que transforma cada erro repetido em Check (se for mecânico) ou em Standard (se for julgamento).
