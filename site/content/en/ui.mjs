// Every string of the page chrome: navigation, buttons, labels. Page content
// lives in the other files of this folder.

import { reviewBot } from './review-bot.mjs';
export const ui = {
  meta: {
    siteName: 'MarsAI',
    tagline: "V4's development workflow, open source",
    titles: {
      home: 'MarsAI · AI writes the code. You judge.',
      map: 'The flow, from idea to production',
      manifesto: 'Manifesto: AI writes the code, you judge',
      skills: 'Skills',
      example: 'One example, start to finish',
      decide: 'Who decides what',
      brakes: 'The brakes',
      decisions: 'Why it works this way',
      glossary: 'Glossary',
      questions: 'Questions',
      fork: 'Make it yours',
      notFound: 'Page not found',
    },
    descriptions: {
      home: 'The development workflow V4 Company uses with AI agents, open source: skills, agents and gates, from idea to production. Demo first, hardening after.',
      map: 'The interactive map of the flow: two phases, seven gates, and the path each kind of change takes.',
      manifesto: 'Writing code got cheap. Deciding what to build and making sure it is good did not. Ten principles, with examples, of how V4 builds with AI.',
      skills: 'What each MarsAI skill and agent does, when to use it, and the text the agent reads.',
      fork: "What is V4's, what is yours, and how to adapt the flow to your team.",
      skill: 'MarsAI skill',
    },
  },
  nav: {
    home: 'Home', manifesto: 'Manifesto', map: 'Map', skills: 'Skills', questions: 'Questions',
    explore: 'Explore', guides: 'Guides', reference: 'Reference', project: 'Project',
    example: 'One example, start to finish', decide: 'Who decides what', brakes: 'The brakes', decisions: 'Why it works this way',
    glossary: 'Glossary', fork: 'Make it yours', repo: 'Repository', matt: "Matt Pocock's skills",
    search: 'Search', github: 'GitHub', menu: 'Open the menu', langLabel: 'Language',
    try: 'I want to try it',
  },
  common: {
    copy: 'Copy', copied: 'Copied', copyLink: 'Copy link', prev: '← Previous', next: 'Next →', nextF: 'Next →',
    notFound: 'Page not found', backHome: 'Back to the home page →', person: 'PERSON', agent: 'AGENT',
    illustrative: 'Illustrative example', badge: 'person',
    soon: 'Soon',
  },
  search: {
    placeholder: 'Search for a skill, a term or a question',
    empty: 'Nothing found. Try another word.',
    kinds: { skill: 'Skill', agent: 'Agent', question: 'Question', guide: 'Guide', term: 'Term', principle: 'Principle' },
    guides: {
      home: ['What MarsAI is', "V4's flow and skills, with the prompt to install it through your agent"],
      manifesto: ['Manifesto', 'The thesis, the ten principles and how to ask an agent for work'],
      map: ['The map of the flow', 'Interactive: the complete path, the shortcuts and the gates, step by step'],
      example: ['One example, start to finish', 'The same change at every step'],
      decide: ['Who decides what', 'What stays with the person and what the agent does alone'],
      brakes: ['The brakes', 'Checks, review, CI, bot and person'],
      decisions: ['Why it works this way', 'The recorded decisions'],
      skills: ['Install', 'Through the agent, the wizard, or directly in Claude Code'],
      fork: ['Make it yours', "What is V4's and how to swap it for what is yours"],
      questions: ['Questions', 'The common ones, answered'],
    },
  },
  map: {
    eyebrow: "V4's development workflow",
    title: 'One step reveals the next.',
    lead: 'The complete path goes through every step, and you can walk all of it. At two decision points the work takes a shortcut: a small task goes straight to implementation, and when the only open question is how to build it, the demo is skipped. The seven gates sit where a person decides.',
    full: 'Show the whole map', stepwise: 'Back to step by step',
    play: '▶ Play', pause: '❚❚ Pause', hint: 'Click any step, or use ← →',
    stepOf: 'Step {n} of {total}', offPath: 'Off this path',
    routeChip: 'Routing decision', routeLegend: 'Routing decision',
    shortcuts: { small: 'Shortcut: small task', how: 'Shortcut: only the how left' },
    journey: 'Your journey', inspect: 'Inspecting a step', resume: 'Return to the current step', restart: 'Restart', archived: 'The journey ends here, with the reason recorded',
    gateChip: 'Gate · a person decides', gateLegend: 'Gate',
    below: {
      example: ['One example, start to finish', 'The same change going through every step, with what each one produces.', 'See the example →'],
      decide: ['Who decides what', 'At each step, what stays with the person and what the agent does alone.', 'See the split →'],
      brakes: ['The brakes', 'Five brakes, from the cheapest to the most expensive. Each one catches what the one before let through.', 'See the brakes →'],
      manifesto: ['Why the demo comes before hardening', 'The manifesto explains the thesis behind the flow.', 'Read the manifesto →'],
    },
    simulation: 'The map is a simulation for learning the flow. It does not run work or track your pull requests.',
  },
  skills: {
    eyebrow: 'reference',
    title: ['Skills for working', 'with agents'],
    lead: 'Each skill drives one step of the flow. You call it from the `/` menu, and the agent follows its text. Here is what each one does, when to use it, and the text the agent reads.',
    stats: ['SKILLS', 'AGENTS', 'RECORDED DECISIONS'],
    section: 'Skills', sectionLead: 'Grouped by when you reach for them. Most people start with the main flow.',
    startWith: 'Start with',
    installTitle: 'Install',
    callSkill: 'How to call it', callAgent: 'Agent name',
    sections: {
      what: 'What it does', whenSkill: 'When to use it', whenAgent: 'When it comes in', how: 'How it works', returns: 'What it returns',
      example: 'In the example', records: 'What stays on record', worksIf: 'It worked if', faq: 'Common questions',
      textSkill: 'The skill text', textAgent: 'The agent text',
    },
    whenHead: ['What you have', 'What to use'],
    textNote: 'This is exactly what the agent reads{files}. The agent talks to you in your own language.',
    textFiles: ', with its supporting files',
    showAll: 'Show all of it', onThisPage: 'On this page', whereItFits: 'Where it fits',
    slices: ['Slice', 'Repositories', 'Blocked by'],
  },
  guides: {
    label: 'Guide',
    example: {
      eyebrow: 'one change, every step', title: 'One example, start to finish',
      lead: 'The same change going through the whole flow: what the person says, what the agent answers, and what each step leaves ready for the next.',
      note: 'The example is illustrative.',
    },
    decide: {
      eyebrow: 'person and agent', title: 'Who decides what',
      lead: 'The design rule of the flow: the person decides, the agent executes. The agent asks and recommends, but no skill hands it a design decision.',
      head: ['Step', 'The person decides', 'The agent does alone'],
      stopsTitle: 'When the agent stops and calls you',
      stopsLead: 'From the spec on, the agent runs alone. It stops in three cases, and it stops that slice, not the whole job.',
      stops: ['A design decision is missing that the spec did not make.', 'The checks do not go green after an honest attempt to fix them.', 'The work would have to step outside the agreed contract, scope or program design.'],
      neverTitle: 'What is never the agent’s',
      never: ['The merge, by default. Only an explicit [[full-send]] lets the agent merge a two-way door after every check passes; a one-way door is always a person’s.', 'The verdict on the demo.', 'Approving what the [[retro]] proposes.', 'Changing behavior, contracts, schemas or events during the review.', 'Rebasing or closing a pull request without explicit permission.'],
    },
    brakes: {
      eyebrow: 'from the cheapest to the most expensive', title: 'The brakes',
      lead: 'A brake is what keeps bad code from moving on. Each one catches what the one before let through. A mistake caught late sends the work back through the whole pipeline, so whatever can be caught earlier is caught earlier.',
      cost: 'cost',
      repeatTitle: 'A finding that repeats moves down a rung',
      repeatLead: 'If the same problem shows up again and again at an expensive brake, it should become a check at a cheaper one. That is the job of the [[retro]]: what a machine can verify becomes a check; what takes judgment becomes a rule in the Standards, which the reviewer applies.',
      botTitle: 'The bot’s score',
      botLead: 'The example rubric scores every pull request from 1 to 5. The score is not an average: it is the worst of six dimensions, so one weak dimension brings down a pull request that is perfect in the other five. Any review bot or CI check can apply it; at V4, our in-house bot Hermes does.',
      botHead: ['Dimension', 'What it covers'],
      reviewBot,
    },
    decisions: {
      eyebrow: 'the decisions behind the design', title: 'Why it works this way',
      lead: 'Every choice in the flow has a record: what was decided, what it costs and what was rejected. Open one to read the whole record.',
      more: 'Read the full decision →',
    },
    cut: { byRepo: '✗ Cut by repository', allOf: 'Everything in {repo}', byRepoNote: 'Nothing works until both pieces are done. Integration mistakes show up at the end.', byBehaviour: '✓ Cut by behavior', byBehaviourNote: 'Each row is a slice: it can be demonstrated on its own.' },
    lanes: ['start', 'time →', 'PR ready'],
    danger: {
      twoWay: 'Two-way door', twoWayText: 'Reverting the merge restores the previous state, with no loss. This is the case for most pull requests.',
      oneWay: 'One-way door', oneWayText: 'Reverting the code does not undo the effect.',
      oneWayItems: ['A migration that deletes or transforms data', 'An email already sent, or a charge already made', 'An event another service already consumed', 'A contract a client now depends on'],
      radius: 'Blast radius: what else can break if it goes wrong', scale: ['local', 'service', 'across services', 'customer'],
    },
  },
  glossary: {
    eyebrow: 'the language of the flow', title: 'Glossary',
    lead: 'The terms that appear in the skills, the issues and the pull requests. They come from the repository’s `CONTEXT.md`, which gives each term in English and in Portuguese.',
    filter: 'Filter terms', avoid: 'avoid', other: 'in Portuguese',
  },
  questions: {
    title: 'Questions',
    lead: 'The common ones, answered. For anything else, press ⌘K (Ctrl+K) to search the whole site, or open an issue on [GitHub](https://github.com/{{repo}}/issues).',
  },
  manifesto: {
    nav: 'In this manifesto', mapCta: 'See it on the map', versus: 'vs.',
    before: 'Before', now: 'Now', equals: '=',
  },
  fork: { guideLabel: 'Guide' },
  footer: {
    license: 'Open source under the Apache 2.0 license.',
    links: { repo: 'Repository', issues: 'Open an issue', contributing: 'How to contribute', matt: "Matt Pocock's original skills" },
  },
};

ui.skills.invocation = {
  "title": "Who invokes each skill?",
  "note": "Invocation is about who starts the skill. “Person decides” and “Agent alone” describe how the work happens. The labels below come from the actual Claude Code skill settings; other apps may present or enforce these controls differently.",
  "user": {
    "label": "User-invoked",
    "description": "Only you can invoke it, from the / menu. The agent cannot invoke the skill automatically."
  },
  "both": {
    "label": "User + agent-invoked",
    "description": "You can invoke it from the / menu. The agent can also invoke it when the context calls for it or another skill routes to it."
  },
  "agent": {
    "label": "Agent-invoked",
    "description": "Another agent loads or dispatches it. It does not appear in the / menu."
  }
};
ui.skills.extras = {
  "title": "Install this optional pack",
  "note": "Not included in the main installation. This command installs all the extras together; the wizard asks which apps to install them in. Sources: [Matt Pocock](https://github.com/mattpocock/skills), [Lauren Tan](https://github.com/cursor/plugins/tree/main/pstack) and [Cathryn Lavery](https://github.com/cathrynlavery/diagram-design).",
  "claude": "Claude Code only, with the MarsAI marketplace already added:"
};
