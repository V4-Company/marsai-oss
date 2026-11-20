// The home page and "make it yours". Same inline markup as skills.mjs.
// {{site}} and {{repo}} are filled in by the build.

export const home = {
  hero: {
    eyebrow: ['V4 COMPANY', 'our way of building with AI, open source'],
    title: ['AI writes the code.', 'You judge.'],
    lead: 'MarsAI is the development workflow V4 uses with AI agents: skills, agents and gates, from idea to production. Demo first, hardening after.',
    primary: 'I want to try it',
    secondary: 'See the flow',
    note: 'Open source. Use it, fork it and adapt it to your team.',
  },
  steps: {
    label: 'HOW AN IDEA GETS SHIPPED',
    items: [
      ['01', 'Plan', 'Problem, intent and grill. You decide; the agent asks.'],
      ['02', 'Prove', "A demo that works, in a real user's hands."],
      ['03', 'Harden', 'The v1 cut from the demo, with tests, review and a PR.'],
      ['04', 'Learn', 'In production, what went wrong becomes a rule.'],
    ],
    link: 'Watch this path take shape, step by step',
  },
  tryIt: {
    kicker: 'I WANT TO TRY IT',
    title: 'Paste this into your agent.',
    lead: 'It works in Claude Code, Codex, Cursor and OpenCode. The agent installs it, runs a brief interview and helps you adapt the skills to your project and architecture.',
    prompt: "Install MarsAI, V4 Company's development workflow, in this coding agent. Before starting work, briefly interview me about my role, whether I am starting from scratch or working on an existing project, the team size and the architecture standards we already use. Read the repository so you do not ask about what is already documented, and help me adapt the skills to our architecture, code examples and checks.\n\nFollow the instructions at {{site}}/install.md and the interview at {{site}}/onboarding.md. Ask before touching anything outside the agent's own configuration.",
    copy: 'Copy the prompt',
    after: ['It installs `marsai-core` and `marsai-dev` and explains how to undo it.', 'It briefly interviews you about your role, project and team.', 'It reads the existing architecture and proposes how to adapt the skills.', 'It records the context, with your permission, and guides you through your first task.'],
    manualTitle: 'Prefer to do it by hand?',
    manual: [
      { title: 'With the wizard', text: 'It asks which apps to install in: Claude Code, Codex, Cursor and OpenCode.', commands: ['npx --yes github:{{repo}}'] },
      { title: 'Claude Code only', text: 'The dev plugin brings `marsai-core` along.', commands: ['claude plugin marketplace add {{repo}}', 'claude plugin install marsai-dev@marsai-oss'] },
    ],
    agentNote: 'Are you an agent reading this page? The instructions are at [/install.md]({{site}}/install.md) and the index is at [/llms.txt]({{site}}/llms.txt).',
  },
  homeRepo: {
    kicker: 'HOW V4 RUNS IT TODAY',
    title: 'The Home Repo thesis.',
    text: [
      'At V4, about 40 people work across 80+ repositories. An agent started inside one product repository is blind to the rest of the architecture, and the skills and rules copied into each repository drift apart.',
      "So we stopped installing plugins machine by machine. Inspired by [Matt Pocock's Home Repo Pattern](https://www.aihero.dev/the-home-repo-pattern), every agent session at V4 starts in one central Home Repo, Home MarsAI. It holds a pointer to every repository, a living wiki of the system, our coding Standards, and MarsAI's skills right in `.claude/` (and `.agents/skills` for Codex). A `git pull` updates the whole team, with zero installer.",
    ],
    pathsTitle: 'Two ways in',
    paths: [
      { title: '1 · Start fast', text: 'One repository, or just you trying it out: install `{{repo}}` as plugins or with the CLI. It takes a minute, in Claude Code, Codex, Cursor or OpenCode.', cta: 'Install it' },
      { title: '2 · Scale to a multi-repo team', text: "Do what V4 does: run [[home-repo]], included in the package, to set up your team's Home Repo, with the pointers, the wiki, your Standards and the skills in `.claude/`, updated with `git pull`.", cta: 'See the skill' },
    ],
    link: 'Read the decision (ADR 0019)',
  },
  phases: {
    kicker: 'THE FLOW',
    title: 'Two phases. Seven gates.',
    lead: 'In the first phase, total freedom to find out whether the idea is any good. In the second, maximum quality only for what proved its value. At each gate, a person decides whether the work moves on.',
    cards: [
      { tag: 'Phase 1 · Planning', mode: 'Total freedom', steps: ['Problem', 'Intent', 'Grill', 'Demo'], tone: 'plan' },
      { tag: 'Phase 2 · Hardening', mode: 'Maximum quality', steps: ['Spec', 'Tickets', 'Build and review', 'PR', 'Production'], tone: 'hard' },
    ],
    cta: 'Explore the map',
  },
  why: {
    kicker: 'WHY',
    title: 'The bottleneck moved.',
    text: [
      'Writing code got cheap. Deciding what to build and making sure it is good is still expensive.',
      'The manifesto explains why the flow is the way it is: ten principles, with examples, and how to ask an agent for work.',
    ],
    cta: 'Read the manifesto',
    principles: ["The code is the agent's. The judgment is yours.", 'Ask big. Then let the agent work.', 'Human at the ends. Machine in the middle.'],
  },
  paths: {
    kicker: 'WHERE TO START',
    title: 'The size of the change changes the path.',
    items: [
      { scenario: 'bug', title: 'Is it a bug, a small adjustment or tech debt?', text: 'Fast track: implement it directly, with checks and review.' },
      { scenario: 'feature', title: 'Is it a feature?', text: 'Start with the problem. The demo comes before any engineering.' },
      { scenario: 'how', title: 'You know the what but need the how?', text: 'No demo: straight to the spec.' },
    ],
    go: 'Explore',
  },
  open: {
    kicker: "IT'S V4'S. MAKE IT YOURS.",
    title: 'Use it, fork it and adapt it.',
    text: [
      'This is the way V4 works, published as it is. Anyone who wants to use it can. Anyone who wants to contribute can.',
      'It comes with our choices: Linear as the tracker, our own review bot, linear history. The best way to adopt it is to fork it and swap what is ours for what is yours.',
    ],
    actions: { fork: 'Fork it', guide: 'What to swap', issue: 'Open an issue', contribute: 'Contribute' },
  },
  origin: {
    kicker: 'WHERE IT CAME FROM',
    title: 'Good ideas deserve credit.',
    text: [
      "The flow builds on [Matt Pocock's skills](https://github.com/mattpocock/skills), adapted under the MIT license. We keep the names to connect this guide to his materials.",
      'The repository began as an adaptation of Ring, by Lerian Studio, under the Apache 2.0 license. Its original repository is no longer public; the attribution stays in `NOTICE`.',
      'V4 adds the demo before hardening, the gates, the work across repositories, the review that fixes the code and the team packs.',
    ],
    link: "Get to know Matt's work",
  },
  credits: "Made by V4 Company. Flow and skills adapted from Matt Pocock's work.",
};

export const fork = {
  eyebrow: 'what is ours and what is yours',
  title: 'Make it yours',
  lead: "MarsAI is V4's flow, open source under the Apache 2.0 license. Start with the [[using-marsai]] interview to connect it to your project's architecture and standards. For a team across several repositories, keep a Home Repo, as V4 does. For rules shared beyond it, use a team pack. A fork lets you change the flow itself.",
  ways: {
    title: 'Four ways to use it',
    items: [
      ['As it is', "Install it and use it. You get the flow, the demo, the spec, implementation with TDD and the review with its baseline rules. What is V4's shows up as an example."],
      ["With your team's pack", 'Create a plugin of your own with your Standards and your implementation guide. The public flow loads what the pack offers, without you touching it.'],
      ['With a fork', 'Copy the repository and change whatever you want: the skills, the gates, the tracker. It is the way to go when your process is different from ours.'],
      ['Inside your Home Repo', "How V4 runs it: one repository where every session starts, with a pointer to each of your repositories, a wiki of your system, your Standards and the skills in `.claude/`. [[home-repo]] sets it up; MarsAI arrives through the plugins or, as at V4, copied into the same `.claude/`, so a `git pull` updates everyone."],
    ],
  },
  ours: {
    title: "What is V4's and how to swap it",
    head: ['What', 'Where it shows up', 'How to swap it'],
    rows: [
      ['Linear as the tracker', '[[to-spec]], [[to-tickets]], [[implement-spec]], [[wayfinder]]', "The skills call Linear's MCP tools. In a fork, swap them for your tracker's."],
      ['A review bot on every PR (at V4, Hermes, which we built in-house)', '[[babysit-pr]] and the predicted score in [[code-review]]', 'Plug in CodeRabbit, Greptile, GitHub Copilot Review or your own bot. CodeRabbit and Greptile were excellent in our tests; at scale, consider building your own. [See our recommendation](@brakes#review-bot).'],
      ['SonarQube in CI', '[[babysit-pr]], [[retro]]', 'Any static analysis that runs on the PR.'],
      ['Linear history', 'The `marsai-core` hook blocks merge commits', 'Set `MARSAI_LINEAR_HISTORY=off` if your repository uses merge commits.'],
      ['Commit and PR through the skills', 'The hook blocks a direct `git commit` and `gh pr create`', 'It is what makes the message and the description come out in the standard format. In a fork, change the hook.'],
      ['The Standards', '[[code-review]]', "V4's are private. Yours go in a skill whose description starts with `Standards extension`: in your Home Repo's `.claude/` when you keep one, otherwise in a team pack."],
      ['The implementation guide', '[[implement]], the implementer agents', 'A skill whose description starts with `Implementation guide` (the generator, the reference code, the stack), in your Home Repo or your pack.'],
    ],
  },
  pack: {
    title: 'A team pack, in three files',
    lead: 'Without a Home Repo, your skills travel in a pack: an ordinary plugin that depends on `marsai-dev`. The flow finds each piece by how its description starts, so the same three files work inside a Home Repo `.claude/` too.',
    rows: [
      ['`skills/standards/SKILL.md`', 'The description starts with `Standards extension:`. It lists the rule files, by stack. The review loads it.'],
      ['`skills/backend-guide/SKILL.md`', 'The description starts with `Implementation guide:`. The implementer loads it before writing code.'],
      ['`hooks/`', 'The guards that are yours alone: a commit trailer, a branch format.'],
    ],
  },
  contribute: {
    title: 'How to contribute',
    items: [
      'Found a mistake or have an idea? Open an issue.',
      'Want to change a skill? Send a PR. The contribution guide explains how to write and test a skill.',
      'Changed the flow in your fork and it worked better? Tell us: that is how this one gets better.',
    ],
    note: 'V4 maintains the repository and decides what goes in. What is specific to one team fits better in a pack or a fork.',
  },
};
