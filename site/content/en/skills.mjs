// What the page teaches about each skill. The skill texts themselves are read
// from plugins/ at build time (build.mjs), so the reference never drifts.
//
// Inline markup understood by the page: `code`, **bold**, [[slug]] (link to a
// skill page), [[slug|text]] and links to pages by route name: [map](@map).
//
// The running example is illustrative: a change that crosses two services.

import { extras, extraGroup } from './extras.mjs';
export const site = { version: '5.0' };

export const example = {
  title: 'Canceling a recurring deal cancels the subscription at the provider',
  summary:
    'Today, when a recurring deal is canceled, the subscription stays alive at the payment provider and can charge again. The change touches two services: `billing`, which asks for the cancellation, and `payments`, which talks to the provider.',
};

export const actors = {
  pessoa: { label: 'Person decides', hint: 'The agent asks and brings the facts. The person decides.' },
  agente: { label: 'Agent alone', hint: 'Runs without waiting for anyone. Stops only when a decision is missing.' },
  freio: { label: 'Automatic brake', hint: 'A machine checks. It costs nobody any attention.' },
};

export const groups = [
  {
    id: 'comecar',
    title: 'Start',
    desc: 'Adapt it to your project and choose the right step to work on.',
    skills: ['marsai-mode', 'using-marsai', 'home-repo'],
  },
  {
    id: 'fluxo',
    title: 'The main flow',
    desc: 'From idea to merge, in order.',
    skills: ['grill-with-docs', 'demo', 'to-spec', 'to-tickets', 'implement-spec', 'code-review', 'open-pr', 'babysit-pr', 'retro'],
  },
  {
    id: 'desvios',
    title: 'Detours and shortcuts',
    desc: 'For when the main path does not fit.',
    skills: ['wayfinder', 'prototype', 'handoff', 'implement', 'tdd'],
  },
  {
    id: 'agentes',
    title: 'Agents',
    desc: "The ones the skills dispatch. You don't call them directly.",
    skills: ['backend-engineer-typescript', 'frontend-engineer', 'code-reviewer'],
  },
];

const ONLY_YOU = 'Only you call it, from the `/` menu. The agent does not trigger it on its own.';
const BOTH = 'You call it from the `/` menu. The agent also loads it on its own when the situation calls for it.';

export const skills = {
  'wayfinder': {
    ref: 'marsai-core:wayfinder',
    call: '/marsai-core:wayfinder [grill context or URL of the map]',
    callNote: ONLY_YOU,
    icon: 'map',
    actor: 'pessoa',
    tagline: 'When the grill grows, find the way one decision at a time.',
    what: [
      'Uses Linear to organize a plan that grew too big for one conversation. The map holds the destination and an index of the decisions; the child issues hold the questions and their answers.',
      'It comes in after you start with [[grill-with-docs]]. A small change can go straight to [[implement]]. If the grill already made the path clear, there is no need for a map.',
    ],
    when: { rows: [
      ['A small change, easy to review and redo', '[[implement]], with checks and review'],
      ['A medium or large change with no alignment yet', '[[grill-with-docs]] first'],
      ['The grill revealed many questions that depend on each other', '[[wayfinder]]'],
      ['A decision map already exists', 'Resume from its URL and resolve one unblocked question'],
      ['The decisions are resolved', '[[demo]], for a feature; [[to-spec]], when the only open question is how to build it'],
    ] },
    steps: [
      'Reuses the grill and confirms the destination and the scope with you.',
      'Creates a map issue, and child issues for the questions that can already be asked. Records the blockers between them.',
      'In each session, it takes on one unblocked question: research, a prototype, a grill or a task that unblocks a decision.',
      'Records the answer on the child issue, updates the index and turns new uncertainties into questions once they are clear.',
      'When the path is decided, the feature moves on to the demo and, after it, the map is the source for the spec. The implementation slices come later.',
    ],
    records: ['The map and the questions in Linear', 'Decisions and evidence on the child issues', 'Glossary and ADRs where they fit'],
    worksIf: ['Another session can pick up a question without rereading the whole conversation.', 'The destination is clear and the decisions the work needs are resolved.'],
    faq: [
      ['Do I start a big project with Wayfinder?', 'Start with [[grill-with-docs]]. It may show that the solution is smaller than it looked. Create the map only when the conversation shows you need one.'],
      ['Are the children of the map the implementation slices?', 'No. They resolve questions. [[to-tickets]] cuts the spec into behaviors that can be implemented, once the decisions are clear.'],
      ['Where did it come from?', "Adapted from Matt Pocock's Wayfinder skill. The link to the original is in the skill text; in MarsAI the map lives in Linear."],
    ],
  },
  'marsai-mode': {
    ref: 'marsai-core:marsai-mode',
    call: '/marsai-core:marsai-mode [what you want, or the issue identifier]',
    callNote: ONLY_YOU,
    icon: 'play',
    actor: 'pessoa',
    tagline: 'Say what you want in one sentence. The agent sees it through to the end.',
    what: [
      'It is the single way into any work: a feature, a bug, an adjustment, a question about the code, a delivery to check on or a PR to look after. It serves developers and product people alike. You write what you want, or bring a card, and the agent leads from there to the last step.',
      'It reads what already exists, recommends the size of the work and its path, and you confirm it. The path becomes a visible checklist, with the gates marked as stops. A step the work will not go through stays on the list, with its reason. Between gates it goes on alone; at each gate, it stops and waits for your decision.',
      'The idea comes from `poteto-mode`, by Lauren Tan, in pstack. MarsAI keeps its own rule on top: at every gate, a person decides.',
    ],
    when: {
      rows: [
        ['You are about to start any work', '`/marsai-core:marsai-mode`, with what you want in one sentence'],
        ['You know the step and want only that one', 'Call the skill directly'],
        ['You are using MarsAI for the first time', '[[using-marsai]], which adapts it to your project first'],
        ['You want to see the whole path first', 'The [map](@map)'],
      ],
    },
    steps: [
      'Reads what you wrote, the branch, the open PR, the project setup and the issue, when there is one. A card that already exists is a valid start: it says which parts of gates G0 and G1 the card already answers, asks only for what is missing and writes the answers back on the card.',
      'Recommends the path with its reason in one sentence, and you confirm or change it.',
      'Puts the path on the session\'s task list, with the gates marked as stops and each skipped step with its reason.',
      'Calls the skill of each step, one after the other. Stops at each gate and before any action that cannot be undone: a merge, a deploy, deleting data, writing to a customer.',
      'If the work changes size along the way, it says so and rewrites the checklist once you agree.',
    ],
    tables: [
      {
        id: 'caminhos',
        title: 'The paths',
        intro: 'One question decides between the fast track and a feature: can we tell the change is right by reading the code and running the tests, or only when a user uses it? If only a user can tell, it needs a demo.',
        head: ['The work', 'Path', 'Starts at'],
        rows: [
          ['A new behavior nobody has proven is worth it', 'Feature: both phases', 'The problem and the intent, gates G0 and G1'],
          ['The value is decided and the only open question is how to build it', 'Hardening', '[[to-spec]]'],
          ['A bug, a small adjustment, tech debt, a refactor or a measured slowdown, with the expected result known', 'Fast track', '[[implement]]'],
          ['An issue that already went through part of the flow', 'Where it left off', 'The first step it still lacks'],
          ['An open PR', 'Follow-up', '[[babysit-pr]]'],
          ['A question about the code, or about how a delivery is going', 'Answer', 'No skill: the agent reads and answers, changing nothing'],
        ],
      },
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'You speak once. The agent leads. At the gates, you decide.',
        nodeW: 170,
        nodes: [
          { id: 'f', label: 'One sentence or a card', kind: 'pessoa', col: 0, row: 0 },
          { id: 'r', label: 'Recommended path', sub: 'you confirm it', kind: 'pessoa', col: 1, row: 0 },
          { id: 'c', label: 'Checklist', sub: 'gates and skipped steps', kind: 'doc', col: 2, row: 0 },
          { id: 'e', label: 'Step by step', sub: 'the agent calls the skill', kind: 'agente', col: 3, row: 0 },
          { id: 'g', label: 'Gate', sub: 'you decide', kind: 'pessoa', col: 4, row: 0 },
        ],
        edges: [
          { from: 'f', to: 'r' }, { from: 'r', to: 'c' }, { from: 'c', to: 'e' }, { from: 'e', to: 'g' },
        ],
      },
    ],
    example: {
      kind: 'chat',
      lines: [
        ['pessoa', '/marsai-core:marsai-mode I want canceling a recurring deal to cancel the subscription at the provider'],
        ['agente', 'The tests can tell whether the cancellation reaches the provider, but not what to do with a charge already scheduled or what the customer sees, and that is a product decision nobody has made yet. I recommend the feature path, starting from the problem and the intent. Can you confirm?'],
        ['pessoa', 'Confirmed.'],
        ['agente', 'The checklist has both phases, with the seven gates marked as stops. I\'ll start at G0: who is affected by this, and with what impact?'],
      ],
    },
    records: ['The checklist of the path, on the session\'s task list', 'What the card was missing, written back on it', 'Each gate decision, on the issue'],
    worksIf: ['You confirmed the path before the first step.', 'The checklist shows every step, skipped ones included, with the reason.', 'No gate passed without your decision.'],
    faq: [
      ['What about dev-start and pm-start?', 'They are now just a notice: they show the command `/marsai-core:marsai-mode` for you to type. The mode serves developers and product people alike; with a product person, it talks about what changes for whoever uses the product.'],
      ['Who decides whether it is small?', 'The agent recommends, with its reason, and you confirm. If the size changes along the way, it says so and proposes the new path.'],
      ['Do I always have to use it?', 'No. If you know the step, call the skill directly. The mode exists so you do not have to memorize the path.'],
      ['Where does it come from?', 'From `poteto-mode`, by Lauren Tan, in pstack, MIT licensed: the single front door, the visible checklist and the skipped step that keeps its reason. The text was written here, for the MarsAI paths and gates.'],
    ],
  },

  'using-marsai': {
    ref: 'marsai-core:using-marsai',
    call: '/marsai-core:using-marsai',
    callNote: BOTH,
    icon: 'map',
    actor: 'pessoa',
    tagline: 'Adapt MarsAI to your architecture and find the next step.',
    what: [
      'It is the map in text: the ten steps of the main path, the shortcuts, what is done with the person and what runs on its own, and the order of the brakes. The path has two phases, planning and hardening, and seven gates, the points where a person decides whether the work moves on.',
      'On first use, it briefly interviews you about your role, project and team. It reads the existing architecture, code examples and checks to propose an adaptation. With your permission, it records the context for later sessions. Then it helps you choose the right skill.',
    ],
    when: {
      rows: [
        ["You are trying out MarsAI or adapting it to your team's architecture", '`/marsai-core:using-marsai`, with a brief interview before the first task'],
        ['You want the agent to tell you the next step', 'Ask. It loads the map on its own'],
        ['You want to be led from start to finish', '[[marsai-mode]]'],
        ['You want to understand the design', 'The [interactive map](@map) on this site'],
      ],
    },
    steps: [],
    records: [],
    worksIf: [],
    faq: [
      ['How is it different from marsai-mode?', "First-time setup adapts MarsAI to your project. Once that is recorded, [[marsai-mode]] leads today's work from start to finish."],
    ],
  },

  'home-repo': {
    ref: 'marsai-core:home-repo',
    call: '/marsai-core:home-repo',
    callNote: BOTH,
    icon: 'layers',
    actor: 'pessoa',
    tagline: 'One repository where every session starts, pointing at all the others.',
    what: [
      'A team that works in many repositories ends up with a copy of its skills and agent instructions in each one, and every session sees only the repository it started in. The Home Repo is the remedy Matt Pocock named: one repository with what the team shares (the steering files, the docs, a wiki and the tools) and a pointer to each of the other repositories. Every session starts there, so every session has the same setup and the whole picture.',
      "The skill sets it up in four steps, following the arc of Matt's setup prompt: it inventories the repositories, measuring activity by merged pull requests; it inventories the skills, rules and agent instructions, and finds the copies by content; it agrees with you where each item goes; and it applies the plan, with one pull request per repository. The code stays where it is.",
      "It is how V4 runs MarsAI today: about 40 people, 80+ repositories, and every session starting in one Home Repo whose `.claude/` holds the team's skills, Standards and guards, and MarsAI itself. A `git pull` updates everyone. To try MarsAI on one repository, you do not need any of this: install the plugins.",
    ],
    when: {
      rows: [
        ['The work spans several repositories', '`/marsai-core:home-repo`, once for the team'],
        ['The same skills or instructions are copied across repositories', '`/marsai-core:home-repo`: the second step finds the copies and proposes one place for each'],
        ['A new repository, area or tool joins', 'Ask: it adds the pointer to the file of its area'],
        ['The team has one repository, or a monorepo', 'Not needed: that repository is already the home'],
      ],
    },
    steps: [
      "Inventories the repositories: path, remote, visibility and activity, the pull requests merged in the last 30 days and by how many people. It asks which ones the home points at, where it lives and whether it is yours or the team's.",
      'Inventories what is written for agents: skills, AGENTS.md and CLAUDE.md, rules, settings with hooks, Standards, glossaries, ADRs. It compares the copies by content and sorts each item into shared, duplicate, repo-specific, installed or personal.',
      "Shows the plan: a table with each item, where it is, its bucket and its destination, and the home's entry file with its pointers. A skill, an agent, a hook or a Standard goes into the home's `.claude/`; a steering file, a doc or a tool goes to the home too. You approve it.",
      'Applies it: creates the home with its pointers, settings and check, copies each item to its one place and, in each repository that had a copy, opens a pull request that removes it.',
    ],
    tables: [
      {
        id: 'onde',
        title: 'What goes where',
        intro: 'One question for each item: is it true of one repository, or of all of them?',
        head: ['What', 'Where it goes'],
        rows: [
          ['The pointers, the entry file every session loads, the wiki, the tools', 'The Home Repo'],
          ['A skill, a Standard or an implementation guide the whole team uses', "The home's `.claude/`, loaded with no install; or a team pack, when it must reach sessions started elsewhere"],
          ['A term or a decision no single repository owns', 'The Home Repo'],
          ['The code, its build and test commands, its own AGENTS.md, glossary and ADRs', 'Each repository'],
          ['How you like to work', 'Your user folder'],
        ],
      },
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'Every session starts in the home. The pointers lead to the clones, and each piece of work gets its own worktree and its own pull request.',
        nodeW: 168,
        nodes: [
          { id: 'p', label: 'You', sub: 'one sentence', kind: 'pessoa', col: 0, row: 0 },
          { id: 'h', label: 'Home Repo', sub: 'entry file, pointers, wiki', kind: 'doc', col: 1, row: 0 },
          { id: 'a', label: 'billing', sub: 'a worktree of its clone', kind: 'agente', col: 2, row: 0 },
          { id: 'b', label: 'payments', sub: 'a worktree of its clone', kind: 'agente', col: 2, row: 1 },
          { id: 'r', label: 'One PR per repository', sub: 'linked to the same issue', kind: 'freio', col: 3, row: 0 },
        ],
        edges: [
          { from: 'p', to: 'h' }, { from: 'h', to: 'a', label: 'pointer' }, { from: 'h', to: 'b', route: 'vh', label: 'pointer' },
          { from: 'a', to: 'r' }, { from: 'b', to: 'r', route: 'hv' },
        ],
      },
    ],
    example: {
      kind: 'doc',
      title: 'A pointer in repos/finance.md',
      lines: [
        '**payments** (payment links, webhooks, refunds): `<root>/payments`.',
        'If it is missing, clone `acme/payments` there.',
        'Read its AGENTS.md before changing it. Its ADRs live in `docs/decisions/`.',
      ],
    },
    records: ["The home's entry file and one pointer file per area", 'A catalog of the repositories, from which the pointers are rendered', 'One pull request in each repository that had a copy to remove'],
    worksIf: ['A session started in the home finds any repository without being told where it is.', 'Each skill and each rule lives in one place only.', 'Nobody copies an instruction into a new repository again.'],
    faq: [
      ['Does everyone use the same home?', 'Yes. For a team, the home is the thing everyone shares, and everyone starts their sessions in it. How each person likes to work stays in their own user folder.'],
      ["Do the repositories' own settings and hooks still run?", "Not from the home: a session loads the settings and instructions of the folder it started in. That is why the home's settings and `.claude/hooks/` carry the guards everyone needs, and the entry file tells the agent to read a repository's AGENTS.md before changing it."],
      ['Why not a monorepo?', 'When you can have one, it fits better. The home is for when you cannot: public and private repositories side by side, separate deploys, or a team that will not move.'],
      ['Where does it come from?', "From Matt Pocock's article The Home Repo Pattern, on AI Hero. MarsAI adds the activity measured by merged pull requests, the team's skills and Standards in the home's `.claude/`, the optional step of keeping MarsAI itself there, and the settings that give every session the same guards."],
      ['Do I need a Home Repo to use MarsAI?', 'No. One repository, or one person trying it out, only needs the plugins or the installer. The Home Repo is how a team with many repositories scales it, as V4 does.'],
    ],
  },

  'grill-with-docs': {
    ref: 'marsai-core:grill-with-docs',
    call: '/marsai-core:grill-with-docs',
    callNote: BOTH,
    icon: 'chat',
    actor: 'pessoa',
    tagline: 'Get interviewed about the plan, and leave with the decisions on record.',
    what: [
      "The agent interviews you until no implicit decision is left. It asks, finds the facts and recommends. You decide: planning is the person's job, and no skill hands the design to a planning agent.",
      'As the conversation moves along, it writes to the repository. A resolved term goes into the glossary (`CONTEXT.md`) right away. A decision that is hard to undo becomes an ADR in `docs/adr/`.',
      'A misunderstanding caught here costs one answer. Caught on the PR, it costs the whole pipeline.',
    ],
    when: {
      rows: [
        ['You have an idea and the design is not decided yet', '`/marsai-core:grill-with-docs`'],
        ['The decisions were already made in a call or a doc', '[[to-spec]], which calls the grill only for what was left open'],
        ['A question can only be settled by seeing it work', 'The grill sends it to a [[prototype|prototype]] in another agent'],
        ['It is an adjustment to a single behavior', '[[implement]]'],
        ['The grill is over and it is a feature', '[[demo]]'],
      ],
    },
    steps: [
      'Confirms the **intent**: the problem, the expected result, how success is measured and what is out of scope.',
      'The plan becomes a **decision tree**: each decision opens the ones that depend on it.',
      'In each round, the agent asks all at once everything that can already be answered (the **frontier**), numbered, with its recommendation on each question.',
      'A fact is not a question. Before each round it reads the code (from an up-to-date checkout), the Linear issue and the event catalog.',
      'The first fact is the list of repositories the change touches, with the deploy order and the contract that links each pair.',
      'It ends when the frontier is empty. It summarizes the decisions and moves on only after you confirm. For a feature, the summary lists the hypotheses the demo will test and who will use it.',
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'A question enters a round only when the answers it depends on already exist.',
        nodeW: 178,
        colLabels: { 1: 'Round 1', 2: 'Round 2' },
        nodes: [
          { id: 'p', label: 'The plan', kind: 'doc', col: 0, row: 0.5 },
          { id: 'q1', label: 'Q1 · Which reasons end the subscription?', kind: 'pessoa', col: 1, row: 0 },
          { id: 'q2', label: 'Q2 · What if the provider fails?', kind: 'pessoa', col: 1, row: 1 },
          { id: 'q3', label: 'Q3 · Where does finance see "pending"?', kind: 'pessoa', col: 2, row: 0 },
          { id: 'q4', label: 'Q4 · Alert after how long?', kind: 'pessoa', col: 2, row: 1 },
          { id: 'r', label: 'Summary confirmed', sub: 'glossary and ADRs written', kind: 'doc', col: 3, row: 0.5 },
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
        ['agente', 'I read the code: billing publishes subscription.cancel-requested and payments only cancels an OPEN link. Two repositories, payments deploys first.\n\nQ1 - Which reasons end the subscription? I recommend three: deal canceled, billing canceled and last installment paid. Repricing does not.\n\nQ2 - If the payment provider fails on the cancellation, what happens? I recommend marking it as pending and trying again, without sending it to the error queue.'],
        ['pessoa', 'Q1 ok. Q2: pending, but I want an alert if it stays that way for more than a day.'],
        ['agente', 'Noted. "Pending" goes into the payments glossary. The rule "a subscription canceled at the provider does not come back" becomes an ADR there, because another team has to respect it.'],
      ],
    },
    records: ['`CONTEXT.md`: the resolved terms', '`docs/adr/`: the decisions that are hard to undo', 'The list of repositories, with deploy order and contract'],
    worksIf: [
      'Every question the agent asked was a decision, not a fact it could have read.',
      'You confirmed a summary with no decision assumed in silence.',
      'The new terms are in the glossary of the repository that owns the concept.',
    ],
    faq: [
      ['Can the agent decide for me?', 'No. It recommends on each question, and you decide. It is the most important design rule of the flow: the person plans.'],
      ['Does everything become an ADR?', 'No. Only what is hard to undo, surprising without context and the result of a real trade-off. If one of the three is missing, it is not an ADR. A rule another team has to respect is an ADR.'],
      ['What if I bring the transcript of a call?', 'The decisions the call already made go in as resolved, and the grill covers only what was left open. It checks every technical name the transcript cites against the code, because transcripts get names wrong.'],
    ],
  },

  demo: {
    ref: 'marsai-dev:demo',
    call: '/marsai-dev:demo [issue or what to demo]',
    callNote: BOTH,
    icon: 'play',
    actor: 'agente',
    gate: 'A real user uses the demo. The verdict is yours.',
    tagline: "The feature working, in a user's hands, before any hardening.",
    what: [
      'Builds a first version that works, inside the real codebase whenever possible: ugly inside, real outside. It answers one question in half a day to two days: is this what the user wanted?',
      'Full technical refinement goes into what proved its value. The demo runs, in order of preference, in production behind a feature flag for selected users, with explicit approval, protected data and rollback; in development, with the user using it; or outside the codebase, as a last resort. After it, [[to-spec]] cuts the v1 and hardening prepares its general release.',
    ],
    when: {
      rows: [
        ['A feature came out of the grill', '`/marsai-dev:demo`'],
        ['A bug, a small adjustment or tech debt', '[[implement]], no demo'],
        ['The only open question is how to build it', '[[to-spec]], no demo'],
        ['A single design question: a rule, a screen, an exchange of events', '[[prototype]], which costs less'],
      ],
    },
    steps: [
      'Starts from the grill summary: the intent, the settled rules, the hypotheses and who will use it.',
      'Sizes it: half a day to two days. If it does not fit, it proposes smaller demos, one per hypothesis.',
      'Builds on a `demo/<name>` branch, for speed: it reuses what exists, with no Standards and no review. A demo outside the codebase lives in a folder of its own.',
      'Agrees with you on where it runs, taking the highest option the feature allows: production behind a feature flag, development or, as a last resort, outside the codebase. It says which one it took and why a higher one was not possible.',
      'Hands you what you need to put it in front of the user: where it runs, a script with one item per hypothesis, and a video or GIF.',
      'Records the verdict on the issue: where it ran, what the user did and said, and the decision.',
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'Only one verdict leads to hardening.',
        nodeW: 176,
        nodes: [
          { id: 'g', label: 'Grill summary', sub: 'hypotheses and user', kind: 'doc', col: 0, row: 1.5 },
          { id: 'd', label: 'Demo', sub: 'demo/<name> branch', kind: 'agente', col: 1, row: 1.5 },
          { id: 'u', label: 'User uses it', sub: 'not just sees it', kind: 'pessoa', col: 2, row: 1.5 },
          { id: 's', label: 'Solves it', sub: 'to-spec cuts the v1', kind: 'agente', col: 3, row: 0 },
          { id: 'a', label: 'Almost', sub: 'another round', kind: 'agente', col: 3, row: 1 },
          { id: 'r', label: 'Raised a question', sub: 'back to the grill, then another demo', kind: 'pessoa', col: 3, row: 2 },
          { id: 'n', label: 'Does not solve it', sub: 'drop the idea and record why', kind: 'bad', col: 3, row: 3 },
        ],
        edges: [
          { from: 'g', to: 'd' }, { from: 'd', to: 'u' }, { from: 'u', to: 's' }, { from: 'u', to: 'a' }, { from: 'u', to: 'r' }, { from: 'u', to: 'n' },
        ],
      },
    ],
    tables: [
      {
        id: 'inegociavel',
        title: 'What stays the same in a demo and in production',
        intro: 'There are only four rules, because breaking one of them costs the same in both.',
        head: ['Rule', 'Why'],
        rows: [
          ['Merge only with approval for a protected experiment', 'General release waits for hardening'],
          ['Isolated data; production writes need approval and rollback', 'A demo mistake cannot cost real data'],
          ['Customer data stays in a controlled environment', 'Privacy has no draft mode'],
          ['No secret in the code', 'A demo branch leaks too'],
        ],
      },
    ],
    example: {
      kind: 'chat',
      lines: [
        ['pessoa', "/marsai-dev:demo subscription cancellation, from yesterday's grill"],
        ['agente', 'The demo tests two hypotheses: finance understands the "pending" state with no explanation, and the alert after one day is enough. Who uses it: the finance analyst. It fits in one day. I will build it on demo/subscription-cancellation, with the provider simulated.'],
        ['agente', 'Running in the preview. Script: cancel a deal with a paid cycle; take the provider down and see the pending state; wait for the alert. The GIF of the main path is on the issue.'],
        ['pessoa', 'She used it. Pending was clear, but she wants to see the reason for the cancellation in the list.'],
        ['agente', 'Recorded on the issue: it fulfills the intent, with one adjustment for the v1 (the reason in the list). Next step: to-spec, which cuts the v1.'],
      ],
    },
    records: ['The `demo/<name>` branch, where it ran and why a higher option was not possible', 'Video or GIF of the main path', "The user's feedback and the decision, on the issue"],
    worksIf: ['A real user used the demo.', 'The issue holds the decision and the evidence behind it.', 'The issue says where the demo ran and why a higher option was not possible. A production experiment has explicit approval and recorded safeguards.'],
    faq: [
      ['Does the demo become the final code?', 'Not all of it. [[to-spec]] cuts the v1, which is smaller than the demo, and records what is reused and what is rewritten. After a demo outside the codebase, everything is rewritten. What goes in passes through hardening.'],
      ['What if it takes more than two days?', 'The problem is too big for one demo. The skill proposes smaller demos, each testing one hypothesis.'],
      ['Why no Standards and no review?', "Because the demo's question is whether the idea is any good, not whether the code is good. Quality comes later, only for what proved its value."],
      ['How is it different from a prototype?', 'A [[prototype|prototype]] answers one design question with throwaway code, in one file. The demo is the whole feature working, for a user to use.'],
    ],
  },

  'to-spec': {
    ref: 'marsai-dev:to-spec',
    call: '/marsai-dev:to-spec',
    callNote: BOTH,
    icon: 'doc',
    actor: 'agente',
    tagline: 'What was decided becomes a spec on the parent issue in Linear. After a demo, the spec cuts the v1.',
    what: [
      'The spec interviews nobody: it synthesizes what was already decided and anchors everything in the current code. A decision that is still open goes back to you before any text is written. After a demo, it cuts the v1, which is smaller than the demo, says part by part what is reused and what is rewritten, and records a risk level.',
      'Every technical claim comes from code read in this session, with file and line. Memory and transcripts do not count: in one real case, the transcript said "be to be" and the enum was `B2B`.',
      'The technical refinement goes down to the **program design**: the new pieces with their types and signatures, where they plug into the existing code and who calls whom, and where each test hooks in. It also lists the slices and their order. The plan is approved in a **refinement session** of up to 30 minutes with the tech lead, the PM and the developer responsible; the tech lead decides.',
    ],
    when: {
      rows: [
        ['The demo proved its value', '`/marsai-dev:to-spec`, which cuts the v1'],
        ['A grill just ended and the only open question is how to build it', '`/marsai-dev:to-spec`, in the same conversation'],
        ['You have the transcript of a call with the decisions', '`/marsai-dev:to-spec` with the transcript'],
        ['Someone asked for the issue, the job story or the technical refinement', '`/marsai-dev:to-spec`'],
        ['A design decision is still open', '[[grill-with-docs]] first'],
      ],
    },
    steps: [
      'Gathers what already exists: the decisions from the grill, or the ones that come out of the transcript, the issue or the request.',
      'Checks that each checkout is up to date before reading. A repository 115 commits behind once produced the conclusion "this service does not consume the event", with file and line, and it was false.',
      'Reads the glossary and the ADRs of each repository touched, including those of another team, and notes the invariants the change has to respect.',
      'Confirms in the event catalog who publishes and who consumes each event.',
      'Reads the call path of the change: where it enters, what it calls down to storage and which tests already cover it. The program design is built on it.',
      'After a demo, cuts the v1, smaller than the demo: says part by part what is reused and what is rewritten, and records the risk level, which sets how much attention the PR will ask for. After a demo outside the codebase, every part is rewritten.',
      'Agrees with you on where the change will be tested.',
      'Shows the draft, asks all at once what only you know (title, team, tech lead and PM) and publishes.',
      "Prepares the refinement session: the link to the refinement, the decisions that have to be made in the session and the questions still open. You run the session. Afterwards, it records on the issue who attended, what changed, the tech lead's approval and who will read the PRs.",
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'Three sources go in. Two things come out, both on the same issue.',
        nodeW: 196,
        nodes: [
          { id: 'a', label: 'Decisions from the grill', sub: 'or from the call transcript', kind: 'doc', col: 0, row: 0 },
          { id: 'b', label: 'Current code', sub: 'read in the session, with file:line', kind: 'doc', col: 0, row: 1 },
          { id: 'c', label: 'Rules of each repository', sub: 'CONTEXT.md and ADRs', kind: 'doc', col: 0, row: 2 },
          { id: 's', label: 'to-spec', kind: 'agente', col: 1, row: 1 },
          { id: 'd', label: 'Description of the parent issue', sub: 'product: job story and acceptance criteria', kind: 'doc', col: 2, row: 0.5 },
          { id: 'e', label: 'Comment on the parent issue', sub: 'technical: contract, invariants, program design', kind: 'doc', col: 2, row: 1.5 },
        ],
        edges: [
          { from: 'a', to: 's' }, { from: 'b', to: 's' }, { from: 'c', to: 's' }, { from: 's', to: 'd' }, { from: 's', to: 'e' },
        ],
      },
    ],
    example: {
      kind: 'doc',
      title: 'APP-123 · Canceling a recurring deal cancels the subscription',
      lines: [
        'Job story: when I cancel a recurring deal, I want the charge to stop at the provider, so the customer is not charged again.',
        'Acceptance criteria: subscription canceled at the provider · a repeated event does not cancel twice · a provider failure does not go to the error queue.',
        'Invariants to respect: in payments, "a subscription canceled at the provider does not come back."',
        'Where it is broken today: payments ignores the reason and only cancels an OPEN link.',
      ],
    },
    records: ['Description of the parent issue: the product part', 'Comment on the parent issue: the technical refinement, with the program design, the slices and the record of the session', 'An ADR in the owning repository, if a decision is hard to undo'],
    worksIf: [
      'Every uncertainty has a destination: a decision, an acceptance criterion or an open question with an owner.',
      'Each repository has its current state with evidence, what changes in it, the invariants that hold there and the call path the change goes through.',
      'The spec is on the parent issue, not in a local folder.',
      "The issue holds the record of the refinement session: who attended, the tech lead's approval and who reads the PRs.",
    ],
    faq: [
      ['Where does the spec live?', 'On the parent issue in Linear, never in a local folder. The product part goes in the description; the technical refinement goes in a comment, which is the single source of truth for the contracts.'],
      ['What if the PM already wrote the description?', 'The description is theirs and stays as it is. The technical refinement goes in as a comment.'],
      ['What about a small piece of work in a single repository?', 'It becomes a single issue, with a shorter template. It needs no parent issue with children.'],
      ['Is the v1 the demo?', 'No. The v1 is smaller than the demo. The tech lead decides what is reused and what is rewritten, and only the v1 goes through hardening.'],
    ],
  },

  'to-tickets': {
    ref: 'marsai-dev:to-tickets',
    call: '/marsai-dev:to-tickets',
    callNote: BOTH,
    icon: 'layers',
    actor: 'agente',
    gate: 'You confirm the cut of the slices before any issue is created.',
    tagline: 'The spec is cut into vertical slices, with the blockers between them.',
    what: [
      'A **slice** is one behavior working from end to end: it crosses every layer and every repository it needs, and can be demonstrated on its own.',
      'The cut is by behavior, not by repository or by layer. "Canceling the deal ends the subscription at the provider" is a slice. "Everything in payments" and "the backend" are not: you only see them working when every piece is finished, and the mismatch between services shows up at the end.',
    ],
    when: {
      rows: [
        ['You just published the spec', '`/marsai-dev:to-tickets`, in the same conversation'],
        ['You have a refined issue and want to break it into tasks', '`/marsai-dev:to-tickets` with the identifier'],
        ['The change is a single slice', 'Not needed: [[implement]]'],
      ],
    },
    steps: [
      'Starts from the spec and, when the refinement session approved a list of slices, from that list. Lists the repositories, the deploy order and the contract that links each pair.',
      'Draws up the slices. Each one fits in a fresh implementation conversation, reads well as one PR (up to about 400 changed lines) and states what blocks it.',
      'If a refactoring makes the change easy, it is slice 1, and the others are blocked by it.',
      'Shows the numbered list and asks: is the size right? Are the blockers right? Does any part belong to another team?',
      "Publishes one issue per slice, a child of the parent issue, with Linear's native blocking relation.",
    ],
    diagrams: [
      {
        type: 'cut',
        caption: 'The same work, cut two ways. Only the second shows something working before the end.',
        repos: ['billing', 'payments'],
        slices: [
          { label: 'Canceling the deal ends the subscription', spans: [1, 1] },
          { label: 'A repeated event does not cancel twice', spans: [0, 1] },
          { label: 'A provider failure stays pending', spans: [0, 1] },
          { label: 'The last installment paid also ends it', spans: [1, 0] },
        ],
      },
      {
        type: 'flow',
        caption: 'The blockers form a graph. Slice 1 unblocks the other three, which do not depend on each other.',
        nodeW: 210,
        nodes: [
          { id: 'f1', label: '1 · Canceling the deal ends the subscription', kind: 'agente', col: 0, row: 1 },
          { id: 'f2', label: '2 · A repeated event does not cancel twice', kind: 'agente', col: 1, row: 0 },
          { id: 'f3', label: '3 · A provider failure stays pending', kind: 'agente', col: 1, row: 1 },
          { id: 'f4', label: '4 · The last installment paid also ends it', kind: 'agente', col: 1, row: 2 },
        ],
        edges: [
          { from: 'f1', to: 'f2' }, { from: 'f1', to: 'f3' }, { from: 'f1', to: 'f4' },
        ],
      },
    ],
    example: {
      kind: 'slices',
      lines: [
        ['1. Canceling the deal ends the subscription at the provider', 'payments → billing', 'nothing: it can start'],
        ['2. A repeated event does not cancel twice', 'payments', 'slice 1'],
        ['3. A provider failure stays pending and is retried', 'payments', 'slice 1'],
        ['4. The last installment paid also ends it', 'billing', 'slice 1'],
      ],
    },
    records: ['One issue per slice, a child of the parent issue', "Blockers as Linear's native relation"],
    worksIf: [
      'Each slice can be demonstrated on its own.',
      'Each slice depends only on what really blocks it.',
      'You approved the list before it went to Linear.',
    ],
    faq: [
      ['What about a mechanical change that spreads across the whole codebase?', 'It does not fit a vertical slice. It happens in three steps: add the new form next to the old one; migrate the usages in batches; remove the old form at the end.'],
      ['How many PRs does a slice that touches two repositories become?', 'It goes into the PR of each repository it touches, all linked to the same issue. The consumer of the event deploys before the producer.'],
      ['What if another team is part of the work?', 'It becomes a sub-issue in the owning team, with what they need to decide without a meeting: what is being asked, the contract and the rules of their repository that were read.'],
    ],
  },

  'implement-spec': {
    ref: 'marsai-dev:implement-spec',
    call: '/marsai-dev:implement-spec <parent issue>',
    callNote: BOTH,
    icon: 'graph',
    actor: 'agente',
    gate: 'You are called only if a slice depends on a decision the spec did not make.',
    tagline: 'The whole spec becomes reviewed code, without waiting for anyone between one slice and the next.',
    what: [
      'Takes the parent issue and walks the slices in blocker order, with a fresh implementer for each one. At the end, it reviews everything and delivers one PR per repository when the whole delivery reads well in one, or one PR per slice when it would be too large.',
      'The slices are not a list of steps. They are a graph: at any moment there is a **frontier**, the slices whose blockers are finished and that can start. The ones that do not block each other run at the same time.',
      'The implementer does not load the Standards. It explores, writes the test, makes it pass. The rules come in later, at review, when there is a finished diff and context to spare.',
    ],
    when: {
      rows: [
        ['You have a parent issue with a spec and slices', '`/marsai-dev:implement-spec <identifier>`'],
        ['The parent issue has no slices yet', '[[to-tickets]] first'],
        ['It is a single slice, an adjustment or a bug', '[[implement]]'],
      ],
    },
    steps: [
      'Reads the spec, with its program design, and the slices. If one of them depends on a decision the spec did not make, it asks now, all at once.',
      'Chooses the shape of the delivery, per repository: one branch and one PR when the whole change stays under about 400 changed lines; above that, one PR per slice, in blocker order. It tells you which shape it chose and why, and you can ask for the other.',
      "Dispatches one implementer per slice on the frontier, each in its own working copy. Each implementer follows the nearest example in the repository and loads the team's implementation guide when the task names one.",
      "Checks what comes back: the test failing and then passing, the repository's checks green.",
      'Integrates into the PR branch and closes the slice in Linear. When the first slice is integrated, it opens the PR as a draft. With one PR per slice, each slice opens its own.',
      'Recalculates the frontier and repeats until the whole graph is done.',
      'Runs [[code-review]] on the whole branch, completes the PR description and takes it out of draft.',
    ],
    diagrams: [
      {
        type: 'lanes',
        caption: 'Slice 1 unblocks the other three, which run at the same time. In a single-PR delivery, the review happens once, over everything.',
        cols: 6,
        lanes: [
          { label: 'Slice 1', bars: [{ from: 0, to: 2, kind: 'agente', text: 'implementer' }] },
          { label: 'Slice 2', bars: [{ from: 2, to: 4, kind: 'agente', text: 'implementer' }] },
          { label: 'Slice 3', bars: [{ from: 2, to: 4, kind: 'agente', text: 'implementer' }] },
          { label: 'Slice 4', bars: [{ from: 2, to: 4, kind: 'agente', text: 'implementer' }] },
          { label: 'Review', bars: [{ from: 4, to: 5, kind: 'agente', text: 'code-review' }] },
          { label: 'PR', bars: [{ from: 2, to: 5, kind: 'doc', text: 'draft' }, { from: 5, to: 6, kind: 'pessoa', text: 'ready' }] },
        ],
      },
      {
        type: 'flow',
        caption: 'The cycle of each slice.',
        nodeW: 172,
        nodes: [
          { id: 'f', label: 'Frontier', sub: 'slices that can start', kind: 'doc', col: 0, row: 0 },
          { id: 'i', label: 'Implementer', sub: 'one per slice', kind: 'agente', col: 1, row: 0 },
          { id: 'c', label: 'Checks', sub: 'lint, types, tests', kind: 'freio', col: 2, row: 0 },
          { id: 'g', label: 'Integrate and close', sub: 'commit on the PR, issue in Linear', kind: 'agente', col: 3, row: 0 },
        ],
        edges: [
          { from: 'f', to: 'i' }, { from: 'i', to: 'c' }, { from: 'c', to: 'g', label: 'green' },
          { from: 'c', to: 'i', route: 'under', depth: 20, label: 'red', fromDx: -16, toDx: 16 },
          { from: 'g', to: 'f', route: 'under', depth: 44, label: 'recalculates the frontier' },
        ],
      },
    ],
    example: {
      kind: 'terminal',
      lines: [
        '$ pnpm vitest run RequestSubscriptionsCancellation',
        '  ✗ cancels the subscription when the reason ends the contract   (failing, as expected)',
        '  ... writes the rule ...',
        '  ✓ cancels the subscription when the reason ends the contract',
        '',
        "$ <the repository's Check Command>",
        '  ✓ lint  ✓ types  ✓ tests',
      ],
    },
    records: ['One commit per slice, with its identifier', 'Each slice closed in Linear, with the criteria that passed', 'One PR per repository, or one per slice in a large delivery', 'A comment on the parent issue with the state of each slice'],
    worksIf: [
      'Each slice delivered has the test that failed and then passed.',
      "The repository's checks are green.",
      'What stopped is marked in Linear, with the reason.',
    ],
    stops: {
      title: 'When it stops',
      intro: 'It stops one slice, not the whole job. The ones that do not depend on it carry on.',
      items: [
        'The slice depends on a decision the spec did not make.',
        'The checks do not go green after an honest attempt to fix them.',
        'Implementing would mean departing from the agreed contract, scope or program design. The change is written on the issue and approved by the tech lead before the slice goes on.',
      ],
    },
    faq: [
      ['Is there one PR per slice?', 'Only in a large delivery. When the whole change reads well in one PR, there is one per repository the spec touches, with the commits of each slice identified. Above about 400 changed lines, it goes out as one PR per slice, in blocker order, or the PR says why it was not split. The threshold guides attention; it does not block.'],
      ['Why does the PR start as a draft?', "So the work is visible and linked to the issues from the first slice. While it is a draft, the review bot usually does not review it yet. The PR leaves draft after the review."],
      ["Why doesn't the implementer follow the Standards?", "Because the implementer's context is already full from exploring and debugging. The reviewer gets the finished diff and has context to spare to read the rules in full and make the fixes."],
    ],
  },

  'code-review': {
    ref: 'marsai-dev:code-review',
    call: '/marsai-dev:code-review',
    callNote: '[[implement-spec]] and [[implement]] already call it. Use it on its own to review a branch.',
    icon: 'search',
    actor: 'agente',
    tagline: 'The reviewer applies the Standards, fixes and commits.',
    what: [
      'There are two axes, reviewed separately so one does not hide the other. **Standards**: does the code follow the documented Standards? **Spec**: does the code do what the ticket asked, built the way the technical refinement designed it?',
      'Code that follows every Standard and implements the wrong thing passes the first and fails the second. The opposite happens too.',
      "On the Standards axis, the reviewer does not hand back a list of comments: it fixes what has one right answer and commits. It comments only when the fix depends on a person's decision.",
      'The **program design** of the technical refinement is the standard for that delivery. The reviewer brings a local departure back to it, and a structural one goes back to implementation. When the course has to change, the new design is written on the issue and approved by the tech lead first.',
    ],
    when: {
      rows: [
        ['You finished implementing', 'Already called by [[implement-spec]] or [[implement]]'],
        ['You want to review a branch before opening the PR', '`/marsai-dev:code-review`'],
        ['The diff is only documentation, formatting or generated files', 'No review needed; the skill says it skipped it'],
      ],
    },
    steps: [
      'Sets the comparison point (the base you name, or `origin/main`).',
      'Finds the spec: the ticket in the conversation, the identifier in the branch or in the commits. Takes the program design from the technical refinement.',
      "Gathers the Standards: the rules of the repository, the Standards a team pack offers for the diff's stack (a skill whose description starts with `Standards extension`), the baseline and the program design of the delivery.",
      'Dispatches the two axes at the same time, in separate agents.',
      "Presents the two reports without mixing them, and predicts the review bot's score for what remains open.",
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'Two axes in parallel. One fixes, the other reports.',
        nodeW: 184,
        nodes: [
          { id: 'd', label: 'The branch diff', kind: 'doc', col: 0, row: 0.5 },
          { id: 's', label: 'Standards', sub: 'the reviewer reads the rules in full', kind: 'agente', col: 1, row: 0 },
          { id: 'p', label: 'Spec', sub: 'checks against the issue, the slices and the design', kind: 'agente', col: 1, row: 1 },
          { id: 's2', label: 'Fixes and commits', sub: 'commits separate from yours', kind: 'agente', col: 2, row: 0 },
          { id: 'p2', label: 'Report', sub: 'missing · extra · wrong · off the design', kind: 'doc', col: 2, row: 1 },
          { id: 'h', label: 'Predicted review bot score', kind: 'freio', col: 3, row: 0.5 },
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
        title: 'Which rule wins',
        intro: 'The program design decides the structure of the delivery. Where it contradicts a documented rule, the review reports it instead of choosing.',
        head: ['Order', 'Source'],
        rows: [
          ['1', 'A documented rule of the repository (`CLAUDE.md`, `CONTEXT.md`, ADRs)'],
          ['2', "The team's Standards, from a team pack"],
          ['3', 'The baseline, which holds even where nothing is documented'],
        ],
      },
    ],
    example: {
      kind: 'terminal',
      lines: [
        'Standards',
        '  fixed      unbounded query in findPendingCancellations  →  commit a41c9e2',
        '  fixed      domain exception thrown as Error             →  commit a41c9e2',
        'Spec',
        '  ok         slices 1, 2 and 4',
        '  missing    slice 3: nothing retries the pending cancellation  →  back to the implementer',
        '',
        'Predicted review bot score: 3 (correctness)',
      ],
    },
    records: ["The review's fix commits, separate from the implementation commits"],
    worksIf: [
      "The reviewer's fixes are in their own commits and the checks are still green.",
      'The report separates what was fixed from what is waiting for a decision from you.',
      'A missing requirement, or structure that departs from the program design, went back to implementation.',
    ],
    faq: [
      ['Can the reviewer change the behavior of my code?', 'No. It fixes what has one right answer and does not change behavior or a public contract. Whatever would change behavior, a contract, a schema or an event becomes "needs a decision".'],
      ['Does what lint and typecheck already catch go into the review?', 'No. What a machine already guarantees is left out.'],
      ['What if there is no spec?', 'The Spec axis is skipped, and the report says so.'],
      ['How is the review bot score predicted?', 'With an example rubric any review bot can use: the score is the worst of six dimensions: correctness, security, tests, nil_safety, blast_radius and maintainability. The review classifies what remains open in those dimensions, pessimistically on purpose.'],
    ],
  },

  'open-pr': {
    ref: 'marsai-core:open-pr',
    call: '/marsai-core:pr',
    callNote: 'The `/marsai-core:pr` command loads the `open-pr` skill. `/marsai-core:pr draft` opens it as a draft.',
    icon: 'pr',
    actor: 'agente',
    tagline: 'A PR a human reviewer understands in one minute.',
    what: [
      'Opens the PR for the current branch and writes the description. On a PR that already exists, it rewrites the description.',
      'The description is written for a human reviewer who will not read it all, has no context and has no time. It opens with the practical effect, shows the proof that it works and says how much attention the PR asks for.',
    ],
    when: {
      rows: [
        ['The code is ready and reviewed', '`/marsai-core:pr`'],
        ['You want the PR visible while the work is in progress', '`/marsai-core:pr draft`'],
        ['The description of a PR turned into a wall of text', '`/marsai-core:pr`, which rewrites it'],
        ['The PR is open and needs following', '[[babysit-pr]]'],
      ],
    },
    steps: [
      'Checks whether a PR already exists for the branch. If it does, the job is its description.',
      'Reads the whole diff and confirms it delivers what was asked, and only that.',
      "Reads the repository's PR template and follows its convention.",
      'Writes: one sentence with what changes in production, what changes, what does not change, where to look first, the evidence, the size and the merge danger. Above about 400 changed lines, it says that the delivery was split by slice, or why it was not. When there is a technical refinement, it says that the code follows it, or links the approved change.',
      'Says a check passed only if it saw it pass.',
    ],
    diagrams: [
      {
        type: 'danger',
        caption: 'The merge danger tells the human reviewer how much attention the PR asks for. Judge the effect, not the size of the diff.',
      },
    ],
    example: {
      kind: 'doc',
      title: 'feat(subscriptions): canceling a recurring deal cancels the subscription',
      lines: [
        'In one sentence: canceling a recurring deal now cancels the subscription at the payment provider. Today the request dies in the error queue and the subscription stays alive.',
        'Evidence · Before: canceling a deal with a paid cycle threw an exception. After: e2e across the services, subscriptions canceled, no second DELETE on redelivery.',
        'Merge danger · Door: one-way. A subscription canceled at the provider stays canceled even if the PR is reverted.',
        'Blast radius: across services. A misclassified reason would cancel the subscription of an active contract.',
      ],
    },
    records: ['The PR on GitHub, linked to the parent issue and the slices'],
    worksIf: [
      'The description opens with the effect in one sentence and has at most six bullets.',
      'There is before-and-after evidence from something that was actually run.',
      'The merge danger is visible, outside any collapsed section.',
    ],
    faq: [
      ['What is a one-way door?', 'A change where reverting the code does not undo the effect: a migration that deletes data, an email already sent, a charge already made, an event another service already consumed. When unsure which door it is, declare one-way and say why.'],
      ['Does the merge danger change who has to approve?', "No. A person reads every PR, and the merge danger guides how deep that reading goes. The team's approval rule stays the same."],
      ['Who merges?', 'By default, a person. With an explicit [[full-send]], the agent merges a two-way door on its own, only when the checks, a 5 from the review bot and the [[sol-loop]] all pass on the latest commit. A one-way door always waits for a person.'],
      ['Can I open the PR directly with `gh pr create`?', 'A hook blocks a direct `gh pr create` and points to `/marsai-core:pr`, so the PR goes out with validation and context.'],
    ],
  },

  'babysit-pr': {
    ref: 'marsai-core:babysit-pr',
    call: 'marsai-core:babysit-pr',
    callNote: 'Ask the agent to follow the PR. It loads the skill.',
    icon: 'eye',
    actor: 'agente',
    tagline: 'Follows the PR until it is ready, blocked or waiting for you.',
    what: [
      'Reads every CI failure and every review finding, fixes what holds up, answers what does not and waits for the next round.',
      'Any review bot fits: CodeRabbit, Greptile, GitHub Copilot Review or your own. At V4 Company we built ours in-house, called Hermes. For smaller operations we recommend CodeRabbit or Greptile; at scale, it is worth considering a bot of your own. [Read our recommendation](@brakes#review-bot).',
      'It protects the original goal of the PR. A suggestion is actionable only when it fixes a real problem inside that goal. Unrelated refactoring, opportunistic cleanup and new features go to another PR.',
    ],
    when: {
      rows: [
        ['The PR is open with a red check', 'Ask the agent to follow it: `babysit-pr`'],
        ['The review bot or a person left findings', '`babysit-pr`'],
        ['A comment from a person keeps repeating across PRs', 'It suggests the [[retro]]'],
      ],
    },
    steps: [
      'Records the starting point: current commit, goal, required checks, required approvals, who reads the PR and the review bot\'s score.',
      'For each finding: checks it against the code and the goal, and classifies it as valid, false positive, already fixed or out of scope.',
      'Fixes what is valid and in scope. Rejects a false positive with a short reason, in writing.',
      'After each push, the new commit is the new baseline: only what came after it counts.',
      'With nothing new, it stays quiet.',
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'Each brake can send the PR back. The cycle ends only when both pass on the latest commit and a person has read the PR.',
        nodeW: 168,
        nodes: [
          { id: 'pr', label: 'PR open', kind: 'doc', col: 0, row: 0 },
          { id: 'ci', label: 'CI', sub: 'at V4, with SonarQube', kind: 'freio', col: 1, row: 0 },
          { id: 'h', label: 'Review bot', sub: 'score from 1 to 5', kind: 'freio', col: 2, row: 0 },
          { id: 'ok', label: 'Ready', sub: "the merge is the person's", kind: 'pessoa', col: 3, row: 0 },
          { id: 'b', label: 'babysit-pr', sub: 'fixes and pushes', kind: 'agente', col: 1.5, row: 1 },
        ],
        edges: [
          { from: 'pr', to: 'ci' }, { from: 'ci', to: 'h', label: 'passed' }, { from: 'h', to: 'ok', label: '5' },
          { from: 'ci', to: 'b', route: 'vh', label: 'failed' }, { from: 'h', to: 'b', route: 'vh', label: 'finding' },
          { from: 'b', to: 'pr', route: 'under', depth: 18, label: 'new commit' },
        ],
      },
    ],
    example: {
      kind: 'terminal',
      note: 'A real case, from a V4 repository.',
      lines: [
        'Review bot  2/5   tests: 2   "the typecheck exits successfully without checking anything"',
        'babysit-pr  fixes, runs the tests, pushes',
        'Review bot  2/5   correctness: 3   "a use case with no domain does not compile"',
        'babysit-pr  the suggestion breaks a rule the repository tests: explains, adds the warning and the test',
        'Review bot  5/5   ✅ the findings were handled or accepted',
      ],
    },
    records: ['Written answers to each finding', "The review bot's score on the latest commit"],
    worksIf: [
      'Required checks green on the latest commit.',
      'No valid finding left open.',
      'A person read the PR: someone from the refinement session, when the delivery had one.',
      'The latest review bot review scores 5, or has no blocking finding.',
    ],
    stops: {
      title: 'When it stops',
      items: [
        "**Ready**: it says so. The merge is the person's, unless a [[full-send]] covers a two-way door.",
        '**Blocked**: a failure, a missing approval, an ambiguity or a decision only you can make.',
        '**Obsolete**: another PR replaces it. It says which one and asks before closing.',
      ],
    },
    faq: [
      ['Does the review bot block the merge?', "Not a person's merge: it informs it. A 5 says the bot found no problem in that review; it does not override a failing check, an open valid finding, a missing approval or the human review. Under an explicit [[full-send]], its 5 is one of the conditions for merging a two-way door alone."],
      ['What if the bot\'s finding is wrong?', "It rejects it in writing, with the reason. A bot's finding goes through the same triage as a person's."],
      ['Does it merge or rebase?', 'Only with explicit authorization. If the branch fell behind, it states the impact and asks first.'],
      ['Where do I see what SonarQube flagged?', "In the job log or in the PR comment. At V4, SonarQube runs in the PR's CI, blocks through its quality gate and is treated as a required check."],
    ],
  },

  retro: {
    ref: 'marsai-core:retro',
    call: '/marsai-core:retro',
    callNote: BOTH,
    icon: 'loop',
    actor: 'agente',
    gate: 'The retro only proposes. You approve and apply the changes.',
    tagline: 'The mistake that repeats becomes a rule, at the cheapest brake possible.',
    what: [
      'Looks back and proposes improvements to the **environment** the agents work in, so the next round comes out better than this one. The principle: no review comment should be written twice.',
      'The central question is where to put the rule. If a machine can check it, it becomes a check. If it takes judgment, it becomes a rule in the Standards, which the reviewer applies.',
    ],
    when: {
      rows: [
        ['A human reviewer pointed out something the machine should have caught', '`/marsai-core:retro` on the PR'],
        ['The same comment showed up in more than one review', '`/marsai-core:retro`'],
        ["You want to look at the week's PRs", '`/marsai-core:retro` with the period'],
        ['The session ran many searches before getting started', '`/marsai-core:retro` on the session'],
        ['The human review took a long time, or needed more than one round', '`/marsai-core:retro` on the PR: it proposes what the program design should have stated'],
      ],
    },
    steps: [
      "Reads the primary sources: the session, the PR with its comments and the findings from the review bot, or the week's PRs. On a PR, it notes how long the human review took and how many rounds of changes it asked for.",
      'Looks for candidates in seven categories: checks, Standards, alignment, navigation, access to information, tool economy and leftover instructions.',
      'Presents them from the most serious to the least, each with the evidence, the proposed change and where it goes.',
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'The question that decides where the rule lives.',
        nodeW: 190,
        gapX: 76,
        nodes: [
          { id: 'a', label: 'A finding that repeated', kind: 'doc', col: 0, row: 0.5 },
          { id: 'q', label: 'Can a machine check it?', kind: 'pessoa', col: 1, row: 0.5 },
          { id: 'c', label: 'Check', sub: 'lint, hook or CI, in the repository', kind: 'freio', col: 2, row: 0 },
          { id: 's', label: 'Standard', sub: 'judgment, in the team pack', kind: 'agente', col: 2, row: 1 },
        ],
        edges: [
          { from: 'a', to: 'q' }, { from: 'q', to: 'c', label: 'yes' }, { from: 'q', to: 's', label: 'no' },
        ],
      },
    ],
    tables: [
      {
        id: 'onde',
        title: 'Where each change goes',
        head: ['Change', 'Place'],
        rows: [
          ['A new or re-enabled check', 'In the repository where the mistake happened: linter, hook or CI'],
          ['A judgment rule', 'A PR to the team pack, in the Standards'],
          ['A navigation pointer', "The repository's `CLAUDE.md` or `AGENTS.md`, one line"],
          ['A missing term or decision', "The repository's `CONTEXT.md` or `docs/adr/`"],
        ],
      },
    ],
    example: {
      kind: 'terminal',
      lines: [
        'Finding that repeated in 3 PRs: "unbounded query in a listing"',
        '  mechanical?  yes, lint can detect it',
        '  proposal     a lint rule in the repository',
        '',
        'Finding: "new event with no version in the events package"',
        '  mechanical?  no, it depends on understanding the contract',
        '  proposal     a new rule in the events section of the Standards',
      ],
    },
    records: ['A new check in the repository', 'A new rule in the Standards', 'A pointer in `CLAUDE.md`'],
    worksIf: [
      'Each proposal has its evidence: the excerpt from the session or the PR comment.',
      'A mechanical mistake became a check, not a written rule.',
      'Nothing was applied without your approval.',
    ],
    faq: [
      ['Why does a code rule go to the reviewer and not to the implementer?', 'The implementer explores, writes and debugs: that is the step with the fullest context. The reviewer gets a finished diff and has context to spare.'],
      ['Does a check that exists but is switched off count?', 'It counts, and it is the finding. So is a repository with no check before the push or in CI.'],
    ],
  },

  prototype: {
    ref: 'marsai-dev:prototype',
    call: '/marsai-dev:prototype',
    callNote: BOTH,
    icon: 'cube',
    actor: 'agente',
    gate: 'You evaluate the prototype and give the verdict.',
    tagline: 'Throwaway code that answers one question.',
    what: [
      'Some decisions do not come out of conversation: the rule looks right until you click on it. A prototype exists to answer a question, not to become the product.',
      'The question decides the shape. There are three branches, and picking the wrong one wastes the prototype.',
    ],
    when: {
      rows: [
        ['"Is this rule or this state model right?"', 'Logic branch: a single HTML file, with buttons and scenarios, that someone from product clicks through alone'],
        ['"What should this screen look like?"', "Screen branch: very different versions on the same route, with the repository's component library"],
        ['"What happens if the event arrives twice or the provider fails?"', 'Flow branch: each service is an actor and you deliver, repeat or drop each message'],
        ['The question came up in the middle of a grill', 'The grill sends it to another agent through a [[handoff]]'],
      ],
    },
    steps: [
      'Identifies the question and chooses the branch.',
      'Builds the prototype close to where the real code will live, with `prototype` in the name.',
      'Shows the full state after each action, so you see what changed.',
      'You evaluate. The validated decision goes into the spec, or into an ADR if it is hard to undo.',
      'The prototype goes to a `prototype/<name>` branch, outside `main`, with the link on the issue.',
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'The question chooses the branch.',
        nodeW: 196,
        nodes: [
          { id: 'q', label: 'What is the question?', kind: 'pessoa', col: 0, row: 1 },
          { id: 'l', label: 'Rule or states', sub: 'a single HTML file, clickable', kind: 'agente', col: 1, row: 0 },
          { id: 'u', label: 'Screen', sub: 'variations on the real route', kind: 'agente', col: 1, row: 1 },
          { id: 'f', label: 'Flow between services', sub: 'repeat, delay, drop', kind: 'agente', col: 1, row: 2 },
          { id: 'v', label: 'Verdict', sub: 'the decision goes to the spec', kind: 'pessoa', col: 2, row: 1 },
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
        ['agente', 'Q3 depends on seeing the screen: where does finance see that the subscription is "pending cancellation"? Can I send it to another agent to build three variations on the real route while we carry on with the other questions?'],
        ['pessoa', 'Send it.'],
        ['agente', 'Handoff written. The Q3 branch stays open until the answer comes back.'],
      ],
    },
    records: ['The decision, in the spec or in an ADR', 'The prototype, on a `prototype/<name>` branch outside `main`'],
    worksIf: [
      'The prototype runs with a double click or with the dev command the project already has.',
      'You reached a verdict on the question.',
      'Nobody would mistake the prototype for production code.',
    ],
    faq: [
      ['Does the prototype become the final code?', 'No. It is throwaway from day one: no tests, no error handling beyond what it needs, no persistence. The decision is what moves on to the real code.'],
      ['What is the screen built with?', "With the repository's component library, on the real route, with the versions switchable through a URL parameter."],
      ['How is it different from a demo?', 'A [[demo]] is the whole feature working, for a real user to use. A prototype answers a single design question, in one file.'],
    ],
  },

  handoff: {
    ref: 'marsai-core:handoff',
    call: '/marsai-core:handoff',
    callNote: BOTH,
    icon: 'swap',
    actor: 'agente',
    tagline: 'Takes the context to where this conversation cannot reach.',
    what: [
      'Writes a short document that lets a fresh agent carry on the work without anyone explaining it again. What a handoff buys is portability.',
      'The most common use is a detour in the middle of a step: a side task shows up and you do not want to spend the current conversation on it. The conversation stays open; a second agent takes the detour.',
    ],
    when: {
      rows: [
        ['A detour in the middle of a step (a prototype during the grill)', '`/marsai-core:handoff`, there and back'],
        ['You are switching tools (from Claude Code to Codex)', '`/marsai-core:handoff`'],
        ['You will continue in another folder, another repository or with another person', '`/marsai-core:handoff`'],
        ['Nothing is going to travel', 'Not needed: carry on in the conversation'],
      ],
    },
    steps: [
      'Writes the document: what to do, where we are, the decisions that hold, what was verified and what is assumed, where each thing is, the suggested skills and what to return.',
      'Points instead of copying: spec, ADR, issue and commit go in as a path or a link.',
      'Saves it outside the repository and shows the path. If the destination is another machine or another person, it shows the content in the answer.',
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'On a detour, the handoff happens twice. The original conversation stays intact in between.',
        nodeW: 176,
        nodes: [
          { id: 'a', label: 'Grill conversation', sub: 'the question comes up', kind: 'pessoa', col: 0, row: 0 },
          { id: 'b', label: 'Another agent', sub: 'builds the prototype', kind: 'agente', col: 1, row: 1 },
          { id: 'c', label: 'Verdict', sub: 'with the evidence', kind: 'pessoa', col: 2, row: 1 },
          { id: 'd', label: 'Grill conversation', sub: 'picks up where it left off', kind: 'pessoa', col: 3, row: 0 },
        ],
        edges: [
          { from: 'a', to: 'b', route: 'vh', label: 'out' }, { from: 'b', to: 'c' },
          { from: 'c', to: 'd', route: 'hv', label: 'back' },
          { from: 'a', to: 'd', dashed: true, label: 'carries on with what does not depend on the answer' },
        ],
      },
    ],
    example: {
      kind: 'doc',
      title: 'Handoff: prototype of the pending subscription screen',
      lines: [
        'What to do: build three variations of where finance sees the subscription "pending cancellation."',
        'Decisions that hold: pending is not an error; alert after one day.',
        'Verified and assumed: the status exists in payments (verified). The finance screen reads that status (assumed).',
        'Suggested skills: marsai-dev:prototype.',
        'What to return: the verdict, the evidence and the prototype branch.',
      ],
    },
    records: ['A file in transit, outside the repository. It does not go into a commit.'],
    worksIf: ['Someone can read the document cold, without the conversation open, and know what to do.'],
    faq: [
      ['Why separate "verified" from "assumed"?', 'Because the next agent treats the document as a contract and does not check again. "X does not exist yet" goes under verified only if someone looked.'],
      ['Can the document hold a secret?', 'No. Keys, tokens, passwords and personal data come out before it is saved.'],
    ],
  },

  implement: {
    ref: 'marsai-dev:implement',
    call: '/marsai-dev:implement <slice or request>',
    callNote: BOTH,
    icon: 'brick',
    actor: 'agente',
    tagline: 'A single slice, an adjustment or a bug, by the same path.',
    what: [
      'It is the path for small things. It takes a slice from the ticket to reviewed code: you drive it through the skill, and the implementer writes the code, in a conversation of its own.',
      'The path is the same as [[implement-spec]], for one thing only: implementer, checks, review.',
    ],
    when: {
      rows: [
        ['An isolated slice, with acceptance criteria', '`/marsai-dev:implement <identifier>`'],
        ['An adjustment to a single behavior', '`/marsai-dev:implement` with the request'],
        ['A bug', '`/marsai-dev:implement`: the implementer starts with the test that reproduces it'],
        ['A parent issue with several slices', '[[implement-spec]]'],
        ['A question about the code, or a docs-only change', 'Not implementation: handle it directly'],
      ],
    },
    steps: [
      'Understands the slice: reads the issue, the comments and the technical refinement on the parent issue, with the contract, the invariants and the program design to follow.',
      'Dispatches the right implementer: backend or frontend.',
      'Checks what comes back: the test failing and then passing, the checks green and, when the task names a team implementation guide, what the guide had the implementer generate.',
      'Records the commit and goes through [[code-review]].',
      'Closes the slice in Linear, with the criteria it saw pass.',
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'The same path as implement-spec, for one slice.',
        nodeW: 160,
        nodes: [
          { id: 'f', label: 'The slice', kind: 'doc', col: 0, row: 0 },
          { id: 'i', label: 'Implementer', kind: 'agente', col: 1, row: 0 },
          { id: 'c', label: 'Checks', kind: 'freio', col: 2, row: 0 },
          { id: 'r', label: 'code-review', kind: 'agente', col: 3, row: 0 },
          { id: 'l', label: 'Close in Linear', kind: 'doc', col: 4, row: 0 },
        ],
        edges: [
          { from: 'f', to: 'i' }, { from: 'i', to: 'c' }, { from: 'c', to: 'r', label: 'green' }, { from: 'r', to: 'l' },
          { from: 'c', to: 'i', route: 'under', depth: 18, label: 'red' },
        ],
      },
    ],
    tables: [
      {
        id: 'quem',
        title: 'Which implementer',
        head: ['The slice touches', 'Who implements'],
        rows: [
          ['API, use case, repository, entity, migration, event, worker', '[[backend-engineer-typescript]]'],
          ['Component, page, form, table, screen state', '[[frontend-engineer]]'],
        ],
      },
    ],
    example: null,
    records: ['A commit with the slice identifier', 'The slice issue updated in Linear'],
    worksIf: [
      'There is a test that failed and then passed.',
      "The repository's checks are green.",
      'The review ran: an implementation is done only after it.',
    ],
    faq: [
      ['Does a bug need a spec?', 'It does not need a parent issue. A bug starts with a test that reproduces it, then the fix.'],
      ['What if acceptance criteria are missing?', 'If the request can be read more than one way, the skill asks before dispatching.'],
      ['What if the slice cannot be built the way it was designed?', "It stops. The design changes on the issue, with the tech lead's approval, before the code does."],
    ],
  },

  tdd: {
    ref: 'marsai-dev:tdd',
    call: 'marsai-dev:tdd',
    callNote: 'It is the testing reference the implementer follows. You rarely call it directly.',
    icon: 'check',
    actor: 'agente',
    tagline: 'The red → green cycle, with tests worth keeping.',
    what: [
      'A good test checks behavior through the public interface, not an implementation detail. The code can change completely inside and the test still holds.',
      'You cannot test everything. Agreeing on the test points in the spec is what puts the effort on the critical path.',
    ],
    when: {
      rows: [
        ['A domain rule or invariant', 'A test of the aggregate, the entity or the value object'],
        ['Orchestration, error paths, idempotency', 'A test of the use case, with its dependencies replaced'],
        ['Query, filter, ordering', 'An integration test of the repository, against a real database'],
        ['Route, permission, effect on the database', 'An integration or end-to-end test'],
      ],
      head: ['What you want to prove', 'Where the test goes'],
    },
    steps: [
      '**Red before green.** Writes the test, runs it and sees it fail for the right reason. The pasted output of the failure is the proof.',
      '**One slice at a time.** One point, one test, one minimal implementation.',
      '**A bug starts with a test that reproduces it.**',
      '**Refactoring is not part of the cycle.** It belongs to the review.',
    ],
    diagrams: [
      {
        type: 'flow',
        caption: 'One behavior per loop.',
        nodeW: 160,
        nodes: [
          { id: 'a', label: 'Write the test', kind: 'agente', col: 0, row: 0 },
          { id: 'b', label: 'See it fail', sub: 'for the right reason', kind: 'bad', col: 1, row: 0 },
          { id: 'c', label: 'Write the minimum', kind: 'agente', col: 2, row: 0 },
          { id: 'd', label: 'See it pass', kind: 'freio', col: 3, row: 0 },
        ],
        edges: [
          { from: 'a', to: 'b' }, { from: 'b', to: 'c' }, { from: 'c', to: 'd' },
          { from: 'd', to: 'a', route: 'under', depth: 18, label: 'next behavior' },
        ],
      },
    ],
    tables: [
      {
        id: 'evitar',
        title: 'What to avoid',
        head: ['Kind', 'How to spot it'],
        rows: [
          ['Tied to the implementation', 'The test breaks when you refactor without changing behavior'],
          ['Tautological', 'The expected value is computed the same way the code computes it. It passes by construction'],
          ['Unable to fail', 'The dependency was replaced by something that always gives the right answer'],
          ['Batched', 'All the tests first, all the implementation after'],
        ],
      },
    ],
    example: null,
    records: [],
    worksIf: ['Each test was seen failing before it passed.', 'The test reads as a specification: "canceling a recurring deal ends the subscription."'],
    faq: [
      ['Do the repository and the controller get unit tests?', 'No. A test with the database replaced proves the replacement, not the query. They are covered by integration tests, against a real database.'],
    ],
  },

  'backend-engineer-typescript': {
    ref: 'agent:backend-engineer-typescript',
    call: 'marsai-dev:backend-engineer-typescript',
    callNote: "You don't call it directly. It is dispatched by [[implement-spec]], [[implement]] or the `/marsai-dev:backend` command.",
    icon: 'bot',
    actor: 'agente',
    kind: 'agent',
    tagline: 'Makes a ticket work in a backend service, test first.',
    what: [
      'It is the backend implementer for TypeScript services. It makes **one** ticket work in **one** repository.',
      "It does not load the Standards. The shape of the code comes from the nearest example in the repository itself and, when the task names one, from the team's implementation guide.",
    ],
    steps: [
      'Reads the task: what to deliver, the acceptance criteria, where to test and the contract.',
      'Reads the repository: the instructions, the glossary, the ADRs and the nearest example of what it is about to build. The repository takes precedence over what it remembers.',
      "Loads the team's implementation guide when the task names one. That is where a team keeps what its services share: the generator, the reference code, the fixed stack.",
      'Builds test first, one behavior at a time.',
      "Runs the repository's checks until they are green.",
    ],
    stops: {
      title: 'When it stops and asks',
      items: [
        'Which part of the domain owns a piece of data or a rule.',
        'Which events fire, in what order, and who consumes them.',
        'Who is allowed to call a route.',
        'Whether it is a new use case or an extension of an existing one.',
        'An acceptance criterion that can be read two ways.',
        'A contract the other repository has not agreed to yet.',
        'A library the repository does not have.',
      ],
    },
    returns: ['What now works', 'What the implementation guide had it generate and what it adjusted', 'The files changed', 'Each test, with the output failing and then passing', 'The verification command and its final output', 'The open questions'],
    records: [],
    worksIf: [],
    faq: [
      ['What if the team has no implementation guide?', 'It does not need one. It follows the nearest example in the repository and says in its report that no guide was named.'],
    ],
  },

  'frontend-engineer': {
    ref: 'agent:frontend-engineer',
    call: 'marsai-dev:frontend-engineer',
    callNote: "You don't call it directly. It is dispatched by [[implement-spec]], [[implement]] or the `/marsai-dev:frontend` command.",
    icon: 'bot',
    actor: 'agente',
    kind: 'agent',
    tagline: 'Makes a ticket work in a frontend, with the components the repository already has.',
    what: [
      'It is the frontend implementer, for React and Next.js applications. It makes a ticket work in one repository: explores, writes, debugs.',
      'Its attention goes to a screen that behaves correctly for the person using it. The Standards are applied afterwards, by the reviewer.',
    ],
    steps: [
      'Reads the task: what to deliver, the acceptance criteria, the design when there is one and the API contract.',
      'Reads the repository: the page, the component, the hook and the form closest to what it is about to build.',
      "Loads the team's implementation guide when the task names one.",
      "Builds with the repository's component library. It looks up the component before writing one.",
      'Writes the test first where the logic lives: a hook, a formatter, a form rule.',
      "Runs the repository's checks until they are green.",
    ],
    stops: {
      title: 'When it stops and asks',
      items: [
        'A library the repository does not have.',
        'An API contract that is missing, or that the backend has not agreed to.',
        'A design that conflicts with the component library or with an existing screen.',
        'An acceptance criterion that can be read two ways.',
      ],
    },
    returns: ['What now works', 'The files changed', 'The tests, failing and then passing', 'The verification command and its final output', 'Where it departed from the design, and why', 'The open questions'],
    records: [],
    worksIf: [],
    faq: [],
  },

  'code-reviewer': {
    ref: 'agent:code-reviewer',
    call: 'marsai-dev:code-reviewer',
    callNote: "You don't call it directly. It is dispatched by [[code-review]].",
    icon: 'bot',
    actor: 'agente',
    kind: 'agent',
    tagline: 'Reads the diff against the Standards and the program design, and leaves the branch better than it found it.',
    what: [
      "It is the reviewer. The implementer explored, wrote and debugged without loading the Standards; applying them is the reviewer's job, and it has context to spare for that.",
      'It reads each Standards file in full and reviews against what is written, not against what it remembers. A program design, when it gets one, is the standard for that delivery, read the same way.',
    ],
    steps: [
      'Reads the diff and enough of the surrounding code to understand each hunk.',
      'Reads every Standards file it was given, in full.',
      'Finds where the diff departs from a documented rule or from the program design.',
      'Fixes what has one right answer, with no effect on behavior or on the public contract. A local departure from the design is fixed the same way: a name, a signature, a file in the wrong place. It stays inside the diff.',
      'Runs the checks after the fixes. If a fix does not go green, it undoes it and reports it.',
      "Makes small commits, grouped by rule. The implementer's commits stay as they are.",
    ],
    stops: {
      title: 'When it stops and asks',
      items: [
        'The fix would change behavior, a public contract, a schema or an event.',
        'Bringing the code back to the program design would mean rewriting a piece or moving behavior between pieces. That goes back to implementation.',
        "The Standard and the repository's pattern disagree, and nothing documents which one wins.",
        'The judgment belongs to whoever owns the ticket: naming a concept, splitting a module, cutting scope.',
        'The checks were already red before its changes.',
        'A Standards file is missing. It says so; it does not review from memory.',
      ],
    },
    returns: ['What it fixed, with the rule and the commit', 'What needs a decision, with the options', 'The verification command and its final output'],
    records: [],
    worksIf: [],
    faq: [
      ['Does it touch code I did not change?', 'No. Code outside the diff stays out, even when it has the same problem.'],
    ],
  },
};

Object.assign(skills, extras);
Object.assign(skills, {
  'git-commit': {
    ref: 'marsai-core:git-commit', call: '/marsai-core:git-commit', callNote: BOTH,
    icon: 'check', actor: 'agente', tagline: 'Organize changes into coherent, verified commits.',
    what: ["Reads the diff, groups related changes and creates commits in the repository's format. This is the skill behind `/marsai-core:commit`, using the marker required by the hook."],
    when: { rows: [['Changes are ready to go into the history', '[[git-commit]]']] },
    steps: ['Checks the state and the diff.', 'Groups the changes and aligns the commit plan with the authorization already given.', 'Runs the hooks, signs when a key exists and checks the history.'],
    records: ['Commits in history'], worksIf: ['Each commit can be understood and reviewed on its own.'],
    faq: [['Does it also push?', "It follows the session's authorization; without authorization to push, it asks first."]],
  },
  'issue-handoff': {
    ref: 'marsai-core:issue-handoff', call: '/marsai-core:issue-handoff [PR URL]', callNote: BOTH,
    icon: 'swap', actor: 'agente', tagline: 'Hand a PR to the team with enough context for them to take over.',
    what: ['Collects the problem, intent, observed checks, remaining work and deadline in a Linear issue. Drafts a short message pointing to it; sending requires your authorization.'],
    when: { rows: [['Someone else will take over a PR or work in progress', '[[issue-handoff]]']] },
    steps: ['Checks the PR and its actual results.', 'Confirms the intent and the deadline when they are missing.', 'Updates or creates the issue, links the PR and provides the message for the team.'],
    records: ['Handoff issue', 'PR link', 'Ready-to-send message'], worksIf: ['The new owner understands the real state and next steps without depending on the author.'],
    faq: [['Is this the same as a session handoff?', '[[handoff]] restores context between sessions. This skill transfers responsibility for a PR to the team.']],
  },
});
groups.find((g) => g.id === 'desvios').skills.push('git-commit', 'issue-handoff');
groups.push(extraGroup);
