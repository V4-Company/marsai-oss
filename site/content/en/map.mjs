// The interactive map, the guides and the questions page.
// Same inline markup as skills.mjs. Links to pages use route names: [map](@map).

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
    { label: 'Phase 1 · Planning', mode: 'total freedom', rows: [0, 1], tone: 'plan' },
    { label: 'Phase 2 · Hardening', mode: 'maximum quality', rows: [2, 6], tone: 'hard', labelX: 170 },
  ],
  nodes: [
    { id: 'comecar', label: 'Start', kind: 'pessoa', col: 0, row: 0, skill: 'marsai-mode', tag: 'marsai-mode' },
    { id: 'problema', label: 'Problem', kind: 'pessoa', col: 1, row: 0 },
    { id: 'd-small', label: 'Small task?', kind: 'routing', col: 1, row: 1 },
    { id: 'intent', label: 'Intent', kind: 'pessoa', col: 2, row: 0 },
    { id: 'grill', label: 'Grill', kind: 'pessoa', col: 3, row: 0, skill: 'grill-with-docs' },
    { id: 'wayfinder', label: 'Wayfinder', kind: 'pessoa', col: 3, row: 1, skill: 'wayfinder', optional: true, tag: 'decision map' },
    { id: 'd-how', label: 'Only the how left?', kind: 'routing', col: 4, row: 0 },
    { id: 'demo', label: 'Demo', kind: 'agente', col: 4, row: 1, skill: 'demo', person: true },

    { id: 'spec', label: 'Spec', kind: 'agente', col: 0, row: 2, skill: 'to-spec', tag: 'v1 cut · plan' },
    { id: 'tickets', label: 'Tickets', kind: 'agente', col: 1, row: 2, skill: 'to-tickets', person: true },
    { id: 'implement-spec', label: 'implement-spec', kind: 'agente', col: 2, row: 2, skill: 'implement-spec' },
    { id: 'implement', label: 'implement', kind: 'agente', col: 2, row: 3, skill: 'implement', tag: 'fast track' },
    { id: 'implementador', label: 'Implementer', kind: 'agente', col: 3, row: 2 },
    { id: 'checks', label: 'Checks', kind: 'freio', col: 4, row: 2 },

    { id: 'review', label: 'Review', kind: 'agente', col: 0, row: 4, skill: 'code-review' },
    { id: 'pr', label: 'PR', kind: 'agente', col: 1, row: 4, skill: 'open-pr' },
    { id: 'ci', label: 'CI', kind: 'freio', col: 2, row: 4 },
    { id: 'babysit', label: 'babysit-pr', kind: 'agente', col: 2, row: 5, skill: 'babysit-pr' },
    { id: 'bot', label: 'Bot review', kind: 'freio', col: 3, row: 4 },
    { id: 'humano', label: 'Human review', kind: 'pessoa', col: 4, row: 4 },

    { id: 'merge', label: 'Merge', kind: 'pessoa', col: 0, row: 6 },
    { id: 'producao', label: 'Production', kind: 'pessoa', col: 1, row: 6 },
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
    { from: 'd-small', to: 'g0', route: 'hv', bare: true, label: 'no' },
    { from: 'g0', to: 'intent' },
    { from: 'intent', to: 'g1', bare: true },
    { from: 'g1', to: 'grill' },
    { from: 'grill', to: 'd-how' },
    { from: 'grill', to: 'wayfinder', fromDx: -18, toDx: -18, dashed: true },
    { from: 'wayfinder', to: 'grill', fromDx: 18, toDx: 18, dashed: true },
    { from: 'd-how', to: 'g2', bare: true, label: 'no' },
    { from: 'g2', to: 'demo' },
    { from: 'demo', to: 'g3', route: 'wrapin', bare: true },
    { from: 'g3', to: 'spec', route: 'wrapout' },

    { from: 'spec', to: 'g4', bare: true },
    { from: 'g4', to: 'tickets' },
    { from: 'tickets', to: 'implement-spec' },
    { from: 'implement-spec', to: 'implementador' },
    { from: 'implement', to: 'implementador', route: 'hv', toDx: -26 },
    { from: 'implementador', to: 'checks' },
    { from: 'checks', to: 'implementador', route: 'under', depth: 15, label: 'red', fromDx: -14 },
    { from: 'checks', to: 'review', route: 'wrap', midY: 488 },

    { from: 'review', to: 'pr' },
    { from: 'pr', to: 'ci' },
    { from: 'ci', to: 'bot' },
    { from: 'ci', to: 'babysit', fromDx: 16, toDx: 16, label: 'failed' },
    { from: 'babysit', to: 'ci', fromDx: -16, toDx: -16 },
    { from: 'bot', to: 'babysit', route: 'vh', toDy: -4, label: 'finding', labelAt: 0.3 },
    { from: 'bot', to: 'humano' },
    { from: 'humano', to: 'babysit', route: 'vh', toDy: 13, label: 'change request', labelAt: 0.22, labelBelow: true },
    { from: 'humano', to: 'g5', route: 'wrapin', bare: true },
    { from: 'g5', to: 'merge', route: 'wrapout' },

    { from: 'merge', to: 'producao' },
    { from: 'producao', to: 'g6', bare: true },
    { from: 'g6', to: 'retro' },

    // The shortcuts: the "yes" of each routing decision.
    { from: 'd-small', to: 'implement', route: 'rail', shortcut: 'small', label: 'yes', labelSegment: 0, labelAt: 0.1, note: 'small task: straight to implementation', noteSegment: 2 },
    { from: 'd-how', to: 'spec', side: 'right', via: [[958, 82], [958, 276], [142, 276]], toDx: 30, shortcut: 'how', label: 'yes', labelSegment: 0, note: 'only the how left: straight to the spec, no demo', noteSegment: 2, noteAt: 0.3 },

    // The way back from a gate. Drawn only while the journey uses it.
    { from: 'g1', to: 'intent', route: 'under', depth: 14, jump: true, label: 'adjust' },
    { from: 'g2', to: 'grill', side: 'left', via: [[700, 134]], toSide: 'bottom', toDx: 30, jump: true, label: 'question' },
    { from: 'g3', to: 'demo', route: 'vhv', midY: 238, jump: true, label: 'adjust demo' },
    { from: 'g3', to: 'grill', route: 'vhv', midY: 140, toDx: -30, jump: true, label: 'rethink', labelSegment: 0 },
    { from: 'g4', to: 'spec', route: 'under', depth: 14, jump: true, label: 'redo' },
    { from: 'g5', to: 'babysit', route: 'v', jump: true, label: 'fix' },

    // Entries for work that is already under way. Drawn only while the journey uses them.
    { from: 'comecar', to: 'implement-spec', side: 'left', via: [[14, 82], [14, 399], [436, 399]], toSide: 'bottom', toDx: -48, jump: true, shortcut: 'resume' },
    { from: 'comecar', to: 'babysit', route: 'rail', railX: 14, jump: true, shortcut: 'resume' },
  ],
  details: {
    'd-small': {
      title: 'Is it a small task?',
      line: 'A bug, a small adjustment or tech debt: one behavior, with clear scope and no open design decision.',
      points: [
        'Yes: the developer takes the problem straight to [[implement]], with the implementer, checks and review. A bug starts with a test that reproduces it.',
        'No: it is a feature. It follows the complete path, with intent, grill and demo.',
      ],
      choices: {
        options: [
          { label: 'No: follow the complete path', goto: 'g0' },
          { label: 'Yes: straight to implementation', goto: 'implement', path: 'small' },
        ],
      },
    },
    'd-how': {
      title: 'Is how to build it the only thing left?',
      line: 'The demo exists to prove value. When the value is already clear and the decisions are made, it adds nothing.',
      points: [
        'Yes: skip the demo and go to [[to-spec]], which writes the technical plan.',
        'No: the value is still in doubt. Build the demo and put it in the hands of a user.',
      ],
      choices: {
        options: [
          { label: 'No: prove the value in a demo', goto: 'g2' },
          { label: 'Yes: straight to the spec, no demo', goto: 'spec', path: 'how' },
        ],
      },
    },
    comecar: {
      line: 'Say what you want in one sentence: the agent recommends the path and sees it through to the end.',
      points: [
        'Developers and PMs alike call `/marsai-core:marsai-mode`. The path becomes a checklist, with the gates as stops.',
        'Before asking, the skill looks at the branch, the open PR and the issue.',
        'A feature goes through both phases. A bug, a small adjustment and tech debt go straight into the build.',
      ],
      links: ['marsai-mode'],
      choices: {
        question: 'Picking up work that is already under way?',
        options: [
          { label: 'New problem: start from the problem', goto: 'problema' },
          { label: 'Issue with spec and slices: implement-spec', goto: 'implement-spec', path: 'resume' },
          { label: 'Open PR: babysit-pr', goto: 'babysit', path: 'resume' },
        ],
      },
    },
    problema: {
      title: 'Problem discovery',
      line: 'A problem shows up. It can come from anywhere.',
      points: [
        'A customer, a stakeholder, the data, support or the team itself.',
        'Describe who it hurts and what the impact is.',
        'It is a step for a person: it has no skill. The card is created in the tracker, with its origin and evidence.',
        'A card that already exists is a valid start: the agent reads it, says which parts of G0 and G1 it already answers and asks only for what is missing.',
      ],
      person: 'You bring the problem, not the solution.',
      records: ['A card with origin and evidence'],
    },
    intent: {
      title: 'Intent',
      line: 'Write the intent before the solution.',
      points: [
        'What the problem is.',
        'What the expected result is.',
        'How success is measured.',
        'What is out of scope.',
      ],
      person: 'The intent stays on the card, in the words of whoever had the idea.',
      records: ['Intent on the card'],
    },
    grill: {
      line: 'The PM, the developer and the agent challenge the plan. The agent asks the hard questions.',
      points: [
        'It asks, finds the facts in the code and recommends. You decide.',
        'It settles the business rules, lists the hypotheses the demo will test and decides who will use the demo.',
        'A resolved term goes into the glossary right away. A decision that is hard to undo becomes an ADR.',
        'A design question that can only be settled by seeing it work goes to a [[prototype|prototype]], in another agent.',
      ],
      records: ['Grill summary', 'CONTEXT.md', 'docs/adr/'],
      links: ['grill-with-docs', 'prototype'],
      choices: {
        question: 'Did the questions outgrow one conversation?',
        options: [
          { label: 'Yes, open Wayfinder', goto: 'wayfinder' },
          { label: 'No, move on', goto: 'd-how' },
        ],
      },
    },
    wayfinder: {
      line: 'The grill revealed too many questions for one conversation. Now they become a map.',
      points: [
        'It records in the tracker a destination, the decisions made and what cannot be specified yet.',
        'Each child issue is a question to resolve, with the blockers between them. It is not an implementation slice.',
        'Pick up one unblocked question per session. With the path clear, the grill closes and the demo starts.',
      ],
      person: 'You decide the destination and the design choices. The agent investigates and keeps the map.',
      records: ['Decision map', 'Questions and blockers'],
    },
    demo: {
      line: 'A v1 that works, inside the codebase whenever possible. Ugly on the inside, real on the outside.',
      points: [
        'Half a day to two days. More than that? Break the problem down.',
        'Where it runs, in order of preference: production behind a feature flag, for selected users; development, with the user using it; outside the codebase, as a last resort, with none of its code reused. Inside the codebase it lives on a `demo/<name>` branch.',
        'No focus on architecture: the Standards and the review wait for hardening.',
        'A production experiment needs explicit approval from the area owner, the flag off for everyone else, a restricted audience, protected data, safety checks and rollback. Production writes need explicit approval. Full hardening comes before general release.',
        'The verdict sends it to hardening, back to the grill for another demo, or drops the idea.',
      ],
      person: 'A real user uses the demo, not just sees it. The verdict is yours.',
      records: ['Demo running (branch and link)', 'Video or GIF', 'Feedback and decision'],
    },
    spec: {
      title: 'Cut and technical plan',
      line: 'The demo proved its value. Now cut the v1 and plan.',
      points: [
        'The v1 is smaller than the demo.',
        'For each part: reuse what the demo did or rewrite from scratch. After a demo outside the codebase, everything is rewritten.',
        'Architecture, data model and security defined, with evidence from the current code.',
        'The plan goes down to the program design: the new pieces with their types and signatures, where they plug into the existing code and where each test hooks in. It also lists the slices and their order.',
        'It assigns a risk level, which sets how much attention the PR will call for.',
        'It is approved in a refinement session of up to 30 minutes, with the tech lead, the PM and the developer responsible. The tech lead decides, and the session names who reads the PRs.',
      ],
      records: ['Scope of the v1', 'Technical plan on the parent issue', 'Risk level', 'Record of the session'],
    },
    tickets: {
      line: 'The spec is cut into vertical slices, with the blockers between them.',
      points: [
        'A slice is one behavior working from end to end.',
        'The cut is by behavior, not by repository or by layer.',
        'It starts from the slices the refinement session approved: it details and publishes them.',
        'Each slice reads well as one PR. Past about 400 changed lines, it is more than one slice.',
      ],
      person: 'You confirm the cut before any issue is created.',
      records: ['Slices in the tracker', 'Blockers between them'],
    },
    'implement-spec': {
      line: 'The whole spec becomes reviewed code, without waiting for anyone between slices.',
      points: [
        'It walks the slices in blocker order. The ones that do not block each other run at the same time.',
        'A fresh implementer per slice.',
        'At the end, it reviews everything and delivers one PR per repository, or one per slice when the whole would be too large to read well: above about 400 changed lines.',
        'A slice that cannot be built as designed stops. The change is written on the issue and approved by the tech lead before the slice goes on.',
      ],
      person: 'You are called only if a slice depends on a decision the spec did not make.',
      records: ['One commit per slice', 'Draft PR'],
    },
    implement: {
      line: 'The fast track: a bug, a small adjustment and tech debt come in right here.',
      points: [
        'It is the same path through the implementer, checks and review, for one thing only.',
        'A bug starts with a test that reproduces it.',
        'If the only open question is how to do it, no demo is needed.',
      ],
    },
    implementador: {
      title: 'Implementer',
      line: 'One agent per slice. It makes the code work, test first.',
      points: [
        'It does not load the Standards: it explores, writes the test, makes it pass.',
        'It follows the program design that comes with the slice and the nearest example in the repository. A team can give it an implementation guide.',
        'It stops and asks when the task leaves a decision open.',
      ],
      links: ['backend-engineer-typescript', 'frontend-engineer', 'tdd'],
    },
    checks: {
      title: "The repository's checks",
      line: 'Lint, types and tests, on the machine. They cost no tokens.',
      points: [
        'They are the cheapest brake: they always give the same result.',
        'One command, the same on the machine and in CI.',
        'Red goes back to the implementer.',
      ],
      choices: {"question":"Did the checks pass?","options":[{"label":"Yes: continue to review","goto":"review"},{"label":"No: fix with the implementer","goto":"implementador"}]},
    },
    review: {
      line: 'The reviewer applies the Standards, fixes and commits.',
      points: [
        'Two axes: Standards (does it follow the rules?) and Spec (does it deliver what the slices asked for, built the way the program design says?).',
        'The fixes go in as separate commits.',
        'A missing requirement goes back to the implementer.',
        'Code that departs from the program design: the reviewer brings a local departure back in line, and a structural one goes back to the implementer.',
        'A change of course is written on the issue and approved by the tech lead first.',
      ],
      links: ['code-review', 'code-reviewer'],
    },
    pr: {
      line: 'A PR a human reviewer understands in one minute.',
      points: [
        'It opens with the practical effect, in one sentence.',
        'Evidence: the before and the after, from something that was actually run.',
        'Merge danger: can it be undone? What else can break?',
        'Size and design: the lines changed, whether a delivery above about 400 was split by slice, and that the code follows the agreed design.',
      ],
      records: ['PR on GitHub'],
    },
    ci: {
      title: 'CI',
      line: 'The same checks as on the machine, plus static analysis.',
      points: [
        'At V4, SonarQube runs here and blocks the PR through its quality gate.',
        'What it usually flags (an overly complex function, a duplicated block, behavior with no test), the review has already checked for.',
        'Failed: `babysit-pr` fixes it.',
      ],
      choices: {"question":"Did CI pass?","options":[{"label":"Yes: read the bot review","goto":"bot"},{"label":"No: fix with babysit-pr","goto":"babysit"}]},
    },
    bot: {
      title: 'Bot review',
      line: 'An automated reviewer reads the PR and gives a score.',
      points: [
        ...reviewBot.paragraphs,
        'The score is the worst of six dimensions.',
        "It informs a person's merge. Under an explicit `full-send`, its 5 on the latest commit is one of the conditions for merging a two-way door alone.",
        'A finding goes through triage: valid, false positive, already fixed or out of scope.',
      ],
      records: ['Score on the PR'],
      choices: {"question":"Is there a valid finding to fix?","options":[{"label":"Yes: fix with babysit-pr","goto":"babysit"},{"label":"No: continue to human review","goto":"humano"}]},
    },
    babysit: {
      line: 'Fixes what the brakes flag until the PR is ready.',
      points: [
        'It protects the original goal of the PR: what is out of scope goes to another one.',
        'It rejects a false positive in writing, with the reason.',
        'Merge and rebase only with explicit authorization.',
      ],
    },
    humano: {
      title: 'Human review',
      line: 'A person reads every PR. The risk sets how deep the reading goes.',
      points: [
        'It is the most expensive brake, so it comes last, with everything else already checked.',
        'The reader is someone who took part in the refinement session, when the delivery had one.',
        'Review intent, risk and architecture. Line by line, only where the risk is high.',
        'A change request goes back to `babysit-pr`.',
      ],
      person: "This is where a person's attention is spent.",
      choices: {"question":"Did human review request changes?","options":[{"label":"Yes: fix with babysit-pr","goto":"babysit"},{"label":"No: assess whether the PR is ready","goto":"g5"}]},
    },
    merge: {
      title: 'Merge',
      line: 'By default, the merge belongs to a person.',
      points: [
        'No agent approves its own code.',
        'Under an explicit `full-send`, a two-way door merges on its own only when the checks, a 5 from the review bot and the `sol-loop` all pass on the latest commit (ADR 0018).',
        'A one-way door always waits for a person.',
      ],
      person: 'You decide when it goes in.',
    },
    producao: {
      title: 'Production',
      line: 'Ship behind a flag, when it makes sense. Then measure.',
      points: [
        "Measure the intent's metric.",
        'Update the documentation.',
        'Make sure the number two knows how it works.',
      ],
      person: 'You build it, you run it.',
      records: ['Metric tracked', 'Lesson recorded'],
    },
    retro: {
      line: 'The mistake that repeats becomes a rule, at the cheapest brake possible.',
      points: [
        'If a machine can check it, it becomes a check in the repository.',
        'If it takes judgment, it becomes a rule in the Standards.',
        'It notes how long the human review took and how many rounds of changes it asked for.',
        'What you learn in production comes back as a new problem, at step 1.',
      ],
      person: 'The retro only proposes. You approve and apply.',
      records: ['New check', 'Rule in the Standards', 'New cards'],
    },
  },
  gateLabels: { who: 'Who decides', done: 'Done when', out: 'What it delivers', exits: 'Ways out of the gate' },
  gates: {
    g0: {
      question: 'Problem accepted?',
      who: 'PM or tech lead of the area',
      done: ['The problem says who it hurts', 'There is evidence: data, a report or a ticket', 'It has an estimated impact', 'There is no other card like it'],
      out: ['A card with origin and evidence'],
      exits: [{ tone: 'yes', label: 'Yes: write the intent', goto: 'intent' }, { tone: 'no', label: 'No: archive it with the reason' }],
    },
    g1: {
      question: 'Intent approved?',
      who: 'PM, together with the stakeholder when there is one',
      done: ['The four questions of the intent have an answer', 'The stakeholder agrees'],
      out: ['Intent on the card, in the words of whoever had the idea'],
      exits: [{ tone: 'yes', label: 'Yes: grill with docs', goto: 'grill' }, { tone: 'adjust', label: 'Adjust: rewrite the intent', goto: 'intent' }],
    },
    g2: {
      question: 'Ready for the demo?',
      who: 'The developer who owns the area, with the PM',
      done: ['No open question blocks the demo', 'The business rules are settled', 'The hypotheses are listed', 'What counts as success is defined'],
      out: ['Grill summary', 'CONTEXT.md and ADRs updated'],
      exits: [{ tone: 'yes', label: 'Yes: build the demo', goto: 'demo' }, { tone: 'adjust', label: 'Open question: back to the grill', goto: 'grill' }],
    },
    g3: {
      question: 'Does the demo fulfill the intent?',
      who: 'PM and stakeholder, together, based on real use',
      done: ['The issue records where the demo ran and why a higher-ranked option was not possible', 'A real user used it, not just saw it', 'The feedback is recorded', 'The decision is made'],
      out: ['Demo running (branch and link)', 'Video or GIF', 'Feedback and decision'],
      exits: [{ tone: 'yes', label: 'Yes: hardening', goto: 'spec' }, { tone: 'adjust', label: 'Adjust: a new demo', goto: 'demo' }, { tone: 'adjust', label: 'Rethink: back to the grill, then another demo', goto: 'grill' }, { tone: 'no', label: 'No: drop the idea and record why' }],
    },
    g4: {
      question: 'Technical plan approved?',
      who: 'The tech lead decides, with the PM and the developer responsible, in a session of up to 30 minutes',
      done: ['The scope of the v1 is cut', 'Decision: reuse or rewrite', 'Architecture and data model defined', 'Program design defined: the new pieces, where they plug in and where each test hooks in', 'Security defined', 'How to measure the result in production is defined', 'Risk level defined', 'The slices and their order are agreed', 'Who reads the PRs is named'],
      out: ['Scope of the v1', 'Technical plan', 'Risk level', 'Record of the session'],
      exits: [{ tone: 'yes', label: 'Yes: build', goto: 'tickets' }, { tone: 'adjust', label: 'Redo: a new plan', goto: 'spec' }],
    },
    g5: {
      question: 'PR ready?',
      who: 'Bots first, then a person who took part in the refinement session, when the delivery had one',
      done: ['CI green', 'Tests cover rules and edge cases', 'Automated reviewer at 5/5, or no valid finding left open', 'Evidence on the PR', 'The code follows the agreed design, or the change was approved in writing first', 'Above about 400 changed lines, one PR per slice, or the PR says why not', 'A person read the PR, at the depth the risk calls for', 'No agent approves its own code'],
      out: ['PR with evidence', 'Risk summary', 'Findings become rules'],
      exits: [{ tone: 'yes', label: 'Yes: production', goto: 'merge' }, { tone: 'no', label: 'No: back to the build', goto: 'babysit' }],
    },
    g6: {
      question: 'Delivered for real?',
      who: 'Area owner',
      done: ['It is in production', "The intent's metric is being measured", 'The documentation is up to date', 'The number two knows how it works'],
      out: ['Metric tracked', 'Lesson recorded', 'New cards', 'Reading time and rework, noted at the retro'],
      exits: [{ tone: 'yes', label: 'Lesson: a new problem at step 1', goto: 'retro' }],
    },
  },
  scenarios: [
    {
      id: 'feature',
      label: 'Complete path',
      say: 'A feature goes through every step: demo first, hardening after. Seven gates along the way.',
      path: ['comecar', 'problema', 'd-small', 'g0', 'intent', 'g1', 'grill', 'd-how', 'g2', 'demo', 'g3', 'spec', 'g4', 'tickets', 'implement-spec', 'implementador', 'checks', 'review', 'pr', 'ci', 'bot', 'humano', 'g5', 'merge', 'producao', 'g6', 'retro'],
    },
    {
      id: 'large',
      label: 'The grill got big',
      say: 'The questions do not fit in one conversation: a decision map organizes them before the demo.',
      path: ['comecar', 'problema', 'd-small', 'g0', 'intent', 'g1', 'grill', 'wayfinder', 'grill', 'd-how', 'g2', 'demo', 'g3', 'spec', 'g4', 'tickets', 'implement-spec', 'implementador', 'checks', 'review', 'pr', 'ci', 'bot', 'humano', 'g5', 'merge', 'producao', 'g6', 'retro'],
    },
    {
      id: 'how',
      label: 'Only the how left',
      say: 'The value is already clear and the only open question is how to build it: no demo, straight to the spec.',
      path: ['comecar', 'problema', 'd-small', 'g0', 'intent', 'g1', 'grill', 'd-how', 'spec', 'g4', 'tickets', 'implement-spec', 'implementador', 'checks', 'review', 'pr', 'ci', 'bot', 'humano', 'g5', 'merge', 'producao', 'g6', 'retro'],
    },
    {
      id: 'slices',
      label: 'Issue with spec and slices',
      say: 'The work already has a spec and slices: it goes straight to implementation.',
      path: ['comecar', 'implement-spec', 'implementador', 'checks', 'review', 'pr', 'ci', 'bot', 'humano', 'g5', 'merge', 'producao', 'g6', 'retro'],
    },
    {
      id: 'bug',
      label: 'Small task',
      say: 'Fast track: one behavior, no design decision. Straight to implementation, with checks and review.',
      path: ['comecar', 'problema', 'd-small', 'implement', 'implementador', 'checks', 'review', 'pr', 'ci', 'bot', 'humano', 'g5', 'merge', 'producao', 'g6', 'retro'],
    },
    {
      id: 'pr',
      label: 'Open PR',
      say: 'The work already has a PR: a red check, a bot finding or a comment.',
      path: ['comecar', 'babysit', 'ci', 'bot', 'humano', 'g5', 'merge', 'producao', 'g6', 'retro'],
    },
  ],
};

export const brakes = [
  { title: "The repository's checks", where: 'On the machine', cost: 'They cost no tokens', catches: 'Lint errors, type errors and broken tests' },
  { title: 'Review', where: 'Before the PR', cost: "One agent's tokens", catches: 'What departs from the Standards or from the agreed design, and what the spec asked for that is missing' },
  { title: 'CI on the PR', where: 'On GitHub', cost: 'Machine minutes', catches: 'The same checks, plus what static analysis flags' },
  { title: 'Bot review', where: 'On the PR', cost: "One agent's tokens", catches: 'Correctness, security, testing and impact problems, across six dimensions' },
  { title: 'Person', where: 'On every PR', cost: 'The attention of someone on the team', catches: 'What only someone who knows the domain can see' },
];

export const botDimensions = [
  ['`correctness`', 'Business rules, data flow, order of operations'],
  ['`security`', 'Authentication, authorization, secrets, personal data'],
  ['`tests`', 'Coverage of what changed, edge cases, use of test doubles'],
  ['`nil_safety`', 'Null guards all the way to the point of use'],
  ['`blast_radius`', 'What breaks outside the diff: contracts, callers, consumers'],
  ['`maintainability`', 'Quality, naming, dead code, duplication'],
];

export const decisionPoints = [
  ['Problem and intent', 'What to solve, for whom, and how to measure it', 'The agent reads the card, when one exists, and asks only for what is missing'],
  ['Grill', 'Every design decision', 'The agent asks, brings the facts and recommends'],
  ['Demo', 'Where the demo runs, and whether it fulfills the intent, based on real use', 'The agent builds the demo and prepares the script'],
  ['Spec', 'The cut of the v1, what to reuse and the risk level. The tech lead approves the plan in the refinement session', 'The agent reads the code, writes the plan down to the program design and prepares the session'],
  ['Tickets', 'Whether the slices are cut right', 'The agent drafts the slices and publishes them'],
  ['Implement', 'Only what the spec did not decide', 'The agent implements, tests and integrates'],
  ['Review', 'What would change behavior or a contract, and any change to the agreed design', 'The reviewer fixes the rest, brings a local departure back in line with the design and commits'],
  ['PR', 'The approval and the merge, after a person has read the PR', 'The agent opens the PR and fixes what the brakes flag'],
  ['Production', 'Whether it was delivered for real', 'Nothing: you build it, you run it'],
  ['Retro', 'Which proposals go in', 'The agent gathers the evidence and proposes'],
];

export const decisions = [
  {
    title: 'One entry point leads the work from start to finish, with its path as a checklist',
    body: 'You say what you want in one sentence and the agent recommends the size and the path; you confirm them. The path becomes a checklist with its gates, and what was skipped keeps its reason. One question decides whether it needs a demo: can we tell it is right from the tests, or only when a user uses it?',
    adr: '0017-one-entry-leads-the-whole-work.md',
  },
  {
    title: 'A demo prefers real use behind a flag',
    body: "A demo is worth as much as the user's reaction, and that reaction can be trusted most where the feature will really be used. In order of preference: production behind a feature flag for selected users, with approval, protected data and rollback; development, with the user; outside the codebase, as a last resort. The verdict leads to hardening, back to the grill or to dropping the idea.",
    adr: '0014-a-demo-prefers-real-use-behind-a-flag.md',
  },
  {
    title: 'A feature proves its value in a demo before hardening',
    body: "With agents, building a version that works costs hours. Deciding what to build is still expensive. So the cheap thing answers the expensive question first: the demo goes into a user's hands, and only what it proved gets real engineering.",
    adr: '0010-a-feature-proves-its-value-in-a-demo.md',
  },
  {
    title: 'The technical plan is agreed in a session, down to the program design',
    body: 'A person still reads the code an agent writes, and what makes that reading short is agreeing on the plan before the build. Gate G4 is decided in up to 30 minutes with the tech lead, the PM and the developer responsible. The plan states the new pieces, where they plug in and where the tests hook in.',
    adr: '0015-the-technical-plan-is-agreed-in-a-session.md',
  },
  {
    title: 'The code follows the agreed design; a change of course is written first',
    body: 'What the refinement agreed on is the standard for that delivery, and the review brings the code back to it. A change of course is written on the issue and approved by the tech lead first. A person reads every pull request, and a large delivery goes out one slice per pull request.',
    adr: '0016-the-code-follows-the-agreed-design.md',
  },
  {
    title: 'Full send merges a two-way door without a human reading it',
    body: 'When you say "full send", the agent takes the work to a merged pull request on its own: it proves the change, a model from another provider reviews it, and it follows the PR until CI and the bots are done. It merges by itself only a two-way door, with green checks and a 5 from the review bot; a one-way door stops ready for you, as "full stop" always does. The skills are in the optional extras.',
    adr: '0018-full-send-merges-a-two-way-door-alone.md',
  },
  {
    title: "Sessions start in the team's Home Repo",
    body: 'A team that works in many repositories keeps one Home Repo and starts every session there. It points at every repository and holds what the team shares, so no session works without the whole picture and no instruction is copied into each repository. The team’s skills and Standards live in its `.claude/`, so a `git pull` updates everyone, and the code stays where it is. It is how V4 runs MarsAI today, across 80+ repositories.',
    adr: '0019-sessions-start-in-the-home-repo.md',
  },
  {
    title: 'The Standards are applied at review, not at implementation',
    body: 'The implementer spends its context exploring and making things work. The reviewer gets a finished diff and has context to spare for the rules. Previously, each implementer loaded 14,000 to 19,000 tokens of rules before writing the first line.',
    adr: '0001-standards-at-review-not-at-implementation.md',
  },
  {
    title: 'The reviewer fixes and commits',
    body: 'A comment the author has to read, understand and apply is a round trip. The reviewer applies the fix and comments only when it depends on a person\'s decision.',
    adr: '0002-the-reviewer-fixes-and-commits.md',
  },
  {
    title: 'The person plans',
    body: 'No skill hands a design decision to a planning agent. The agent asks, finds the facts and recommends.',
    adr: '0003-the-person-plans.md',
  },
  {
    title: 'Work that crosses repositories is sliced vertically',
    body: 'Each slice is one behavior working from end to end, not one piece per repository.',
    adr: '0004-multi-repo-work-is-sliced-vertically.md',
  },
  {
    title: "The flow starts from Matt Pocock's skills",
    body: 'The skills were copied and adapted to what is ours: the tracker, work across several repositories and the backend pattern. They keep the original names, so his videos and documentation still apply.',
    adr: '0005-the-flow-starts-from-matt-pococks-skills.md',
  },
  {
    title: 'Skills and agents are written without a commanding tone',
    body: 'Short, affirmative instructions. The discipline that used to be in the text moves to the brakes: the checks and the reviewer.',
    adr: '0006-skills-and-agents-without-a-commanding-tone.md',
  },
  {
    title: 'The Standards have a single source',
    body: 'The code rules had four sources. Now they live in one place, and the others point to it.',
    adr: '0007-marsai-is-the-single-source-of-the-standards.md',
  },
  {
    title: 'The merge danger informs; the approval rule does not change',
    body: "The PR declares whether it can be undone and what else can break. That guides the human reviewer's attention, without clearing anything on its own.",
    adr: '0008-merge-danger-informs-approval-does-not-change.md',
  },
  {
    title: 'Quality before token cost',
    body: 'The most capable model at every step, and subagents whenever they keep the context clean or add a check. Rework costs more than tokens.',
    adr: '0009-quality-before-token-cost.md',
  },
  {
    title: "Skills in English, answers in the person's language",
    body: 'The skill text is in English, so anyone can read it, review it and contribute. The agent talks to you in your language and writes the spec, the ticket and the PR in the language the repository already uses.',
    adr: '0011-skills-in-english-answers-in-the-persons-language.md',
  },
  {
    title: "The flow is open; what is V4's alone lives in a team pack",
    body: "The core, the code flow, the installer and this site are public. V4's Standards, the reference code and everything that describes our systems stay private: first in a pack installed on top, today inside V4's Home Repo (ADR 0019).",
    adr: '0012-open-source-flow-and-team-packs.md',
  },
];

export const faq = [
  {
    title: 'Getting started',
    items: [
      ['Where do I start?', 'Call [[marsai-mode]] with what you want in one sentence, whether you are a developer or a product person. The agent recommends the path, shows the checklist and sees the work through to the end, stopping at each gate. A card that already exists in the tracker is a valid start: the agent reads it and asks only for what is missing.'],
      ['Do I always have to go through every step?', 'No. A bug, a small adjustment and tech debt go straight to [[implement]]. If the only open question is how to do it, go to [[to-spec]], with no demo. An issue that already has a spec and slices goes straight to [[implement-spec]]. See the paths on the [map](@map).'],
      ['How do I install it?', 'The shortest way is to paste the prompt from the [home page](@home) into your agent: it installs MarsAI and shows you the first step. By hand: `npx --yes github:{{repo}}`, which has a wizard. In Claude Code you can also install directly: `claude plugin marketplace add {{repo}}` and then `claude plugin install marsai-dev@marsai-oss`, which brings `marsai-core` along.'],
      ['Does it work outside Claude Code?', 'The installer also takes the skills to Codex, Cursor and OpenCode.'],
      ['How do I call a skill?','From the `/` menu, with the plugin name in front: `/marsai-dev:to-spec`. Agents do not show up in the menu: the skills dispatch them.'],
      ['The skills are in English. What if I write in another language?', 'The agent follows you. The text it reads is in English, but it talks in the language you write in and writes the spec, the ticket and the PR in the language the repository already uses.'],
      ['Can I use it with my team?', "You can. The license is Apache 2.0. This is V4's way of working: ideally, you fork it and swap what is ours for what is yours. See [Make it yours](@fork)."],
    ],
  },
  {
    title: 'Planning',
    items: [
      ['Can the agent plan for me?', 'No. It asks, finds the facts and recommends; you decide. No skill hands the design to a planning agent.'],
      ['Does every feature need a demo?', 'A feature, yes: that is the rule. The exception is when the only open question is how to build it. A bug, a small adjustment and tech debt go straight into the build. See [[demo]].'],
      ['What is the difference between a demo and a prototype?', 'A demo is the feature working, used by a real user, to prove its value. A prototype is smaller: throwaway code that answers one design question in the middle of the grill. See [[prototype]].'],
      ['Does the demo go to production?', 'It is the first choice: behind a feature flag, for selected users, with explicit approval, protected data and rollback. When that is not possible it runs in development, and outside the codebase only as a last resort. General release waits for hardening. The tech lead decides what is reused and what is rewritten.'],
      ['Where does the spec live?', 'On the parent issue in the tracker, never in a local folder. The product part goes in the description; the technical refinement goes in a comment.'],
      ['What is a vertical slice?', 'One behavior working from end to end, crossing every layer and every repository it needs, that can be demonstrated on its own. See [[to-tickets]].'],
    ],
  },
  {
    title: 'Implementing',
    items: [
      ['Do I use implement or implement-spec?', 'A parent issue with several slices: [[implement-spec]]. A single slice, an adjustment or a bug: [[implement]]. The path inside is the same.'],
      ["Why doesn't the implementer follow the Standards?", 'Because its context is already full from exploring and debugging. The reviewer gets the finished diff and has context to spare to read the rules in full and make the fixes.'],
      ['The agent stopped and asked for a decision. Why?', 'It stops in three cases: the slice depends on a decision the spec did not make; the checks do not go green after an honest attempt; or implementing would mean departing from the agreed contract, scope or program design. It stops that slice, not the whole job.'],
      ['I have a bug. Do I need a spec?', 'You do not need a parent issue. A bug starts with a test that reproduces it, and goes through [[implement]].'],
      ["Where do my team's code rules go?", 'In a team pack: a plugin of your own, with your Standards and your implementation guide. The review loads what the pack offers. See [Make it yours](@fork).'],
    ],
  },
  {
    title: 'PR and review',
    items: [
      ['What does the reviewer change in my code?', 'What has one right answer, without changing behavior or a public contract, and only inside the diff. That includes a local departure from the program design. The fixes go in as commits separate from yours. The rest becomes "needs a decision."'],
      ['The bot gave a low score. Now what?', 'The score is the worst of six dimensions, so one weak dimension pulls the rest down. [[babysit-pr]] triages finding by finding: it fixes what is valid and rejects a false positive in writing. The bot informs the merge; a person decides it, unless a `full-send` covers a two-way door.'],
      ['Who merges?', 'By default, a person. With an explicit [[full-send]], the agent merges a two-way door on its own, only when the checks, a 5 from the review bot and the [[sol-loop]] all pass on the latest commit. A one-way door always waits for a person.'],
      ['What is a one-way door?', 'A change where reverting the code does not undo the effect: a migration that deletes data, an email already sent, a charge already made, an event another service already consumed. The PR declares it under merge danger. See [[open-pr]].'],
      ['What is the retro for?', 'So the same comment is not written twice. It proposes where to put the rule: in a check, if a machine can verify it, or in the Standards, if it takes judgment. It also notes how long the human review took and how many rounds of changes it asked for. See [[retro]].'],
    ],
  },
];
