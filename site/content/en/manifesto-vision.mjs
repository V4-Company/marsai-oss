// Public ideas recovered from the original technology and product manifesto.
export const vision = {
  opening: {
    note: 'More intelligence to build. More humanity to choose.',
    cta: 'Explore the thesis',
    chapters: [
      'What changed',
      'What we build',
      'How we build',
      'Our agreement'
    ],
    captions: [
      'Judgment',
      'A product that learns',
      'Autonomy with brakes',
      'Multiplied impact'
    ]
  },
  evolution: {
    kicker: '01 · What changed',
    title: [
      'Writing code is almost solved.',
      'Engineering is not.'
    ],
    lead: 'The February manifesto put method above tools. October’s keeps the method and changes the ambition: increase the impact of each person.',
    head: [
      'February',
      'October'
    ],
    rows: [
      [
        'AI is an average developer.',
        'AI does most of the work when you know what you want.'
      ],
      [
        'Writing code is still the heavy lifting.',
        'Defining the problem and ensuring the outcome became the heavy lifting.'
      ],
      [
        'Grow the team to ship more.',
        'Multiply each person’s capacity to increase impact.'
      ]
    ],
    stays: 'What stays the same: the person who ships is responsible. Developers think about product. PMs understand engineering. Technical debt belongs to everyone. Nobody outsources thinking.'
  },
  learning: {
    kicker: '02 · What we build',
    title: [
      'The product should improve',
      'with every use.'
    ],
    lead: 'A delivery does not end at deployment. Each action produces data, each decision is matched with an outcome, and that outcome returns to the system. The next decision gets better.',
    stages: [
      [
        'Datafication',
        'Capture the action as it happens. Structured data, rather than a spreadsheet assembled later.'
      ],
      [
        'Attributable outcome',
        'Record whether it worked and connect the outcome to the decision that produced it.'
      ],
      [
        'Algorithmization',
        'The recurring decision enters the system: measured, corrected and improved.'
      ]
    ],
    loop: [
      'Operation',
      'Data',
      'Attributable outcome',
      'System learns',
      'Better and cheaper'
    ],
    loopNotes: [
      'The product in use',
      'What happened',
      'The decision’s outcome',
      'What we learned',
      'More value per operation'
    ],
    loopCenter: [
      'Each turn strengthens',
      'the next.'
    ],
    loopCaption: 'The outcome returns to the decision. More operations produce more learning, which improves the next operation.',
    advantage: 'Models can be rented. Tools can be copied. Operational learning accumulates.',
    advantageText: 'A product that only wraps an API competes with the next model release. A product that closes the loop uses each new model to multiply what it has already learned.',
    questionsTitle: 'Four questions before the roadmap',
    questions: [
      'What decision does this product make or support?',
      'What outcome proves whether the decision was good?',
      'How does that outcome return to the system, linked to the decision that produced it?',
      'What learning metric improves over time because of this?'
    ],
    questionsNote: 'They belong in the spec. This is not another document: it makes explicit how the product will learn.',
    measures: [
      [
        'A living product',
        'Usage, adoption and satisfaction show that someone uses it.'
      ],
      [
        'A learning product',
        'Accuracy over time shows the system getting better. The starting point is a baseline, not a target.'
      ]
    ],
    traps: [
      [
        'Does the signal take time?',
        'Define a short-term indicator and check that it still represents the real outcome.'
      ],
      [
        'Does the data address the bottleneck?',
        'Instrument the business constraint. Capturing what is easy can produce lots of data and no outcome.'
      ]
    ]
  },
  proof: {
    kicker: 'Autonomy with evidence',
    title: [
      'Human at the ends.',
      'Machine in the middle.'
    ],
    lead: 'You define the problem and criteria. The agent executes and brings proof. The review uses a separate context. You decide whether the result deserves to exist in the world.',
    nodes: [
      'You define',
      'Agent implements',
      'Checks + review',
      'You approve'
    ],
    notes: [
      'Intent and criteria',
      'Code and tests',
      'Independent evidence',
      'Intent, risk and architecture'
    ],
    caption: 'The person decides at the ends. Automatic brakes stop the line in the middle. The implementing agent does not approve its own delivery.',
    layers: [
      [
        'Deterministic checks',
        'Types, lint and tests block errors we already know how to recognize. They are fast, but green tests alone do not prove the solution is right.'
      ],
      [
        'Independent reviewer',
        'Another agent reads the diff, applies the Standards and checks it against the spec. It fixes what it can and hands back to the person whatever needs a decision.'
      ],
      [
        'Human judgment',
        'You review the problem, risk, architecture and experience. The greater the impact and the harder it is to roll back, the deeper the review.'
      ]
    ],
    loopTitle: 'The same finding does not deserve the same conversation twice.',
    loopLead: 'Fixing the PR solves today. Improving the system solves the next delivery. A mechanical rule becomes a check; a judgment rule becomes a Standard.',
    loop: [
      'Finding',
      'Fix',
      'Check or Standard',
      'Next delivery'
    ],
    loopNotes: [
      'An error surfaced',
      'Address the cause',
      'Record the lesson',
      'The system already knows'
    ],
    loopCaption: 'The retro closes the loop between production, review and the next implementation.'
  },
  economics: {
    kicker: 'Resources in service of outcomes',
    title: [
      'Frugal with money.',
      'Ambitious about returns.'
    ],
    lead: 'Measure cost against the company’s budget. Do not compare a tool that unblocks a delivery only with its subscription price; compare it with the value and time it frees up.',
    items: [
      [
        'Ask for the resource',
        'Accounts, credits, tools, environments. If a limit blocks a good delivery, bring the problem and the expected return.'
      ],
      [
        'Show the outcome',
        'Production quality, fast fixes, less rework and customer impact. Token consumption is not productivity.'
      ],
      [
        'Learn to ask for more',
        'Unused capacity every week can signal that you delegate too little. Try larger problems; measure what improved.'
      ]
    ],
    close: 'Quality before token savings. Resources with purpose. Outcomes as the measure.'
  },
  harness: {
    kicker: 'The system must evolve too',
    title: [
      'A good feature should not require',
      'reading two thousand lines to trust it.'
    ],
    lead: 'That is the destination. We are not there yet. Each error turned into a rule, each test that proves a promise and each independent review moves us closer.',
    nodes: [
      'Today',
      'Learning becomes a rule',
      'More confidence'
    ],
    notes: [
      'Lots of code to read',
      'Checks, skills and Standards',
      'Judgment where it matters'
    ],
    caption: 'Confidence grows from accumulated evidence. Autonomy grows alongside our ability to verify.',
    items: [
      [
        'An owner for the system',
        'The agent environment, skills and brakes need ongoing care.'
      ],
      [
        'Weekly iteration',
        'Share what worked, discard hype and adjust what gets in the way.'
      ],
      [
        'Pairing and repertoire',
        'Help the team level up and share complete cases, from problem to outcome.'
      ],
      [
        'Delivery and quality indicators',
        'Track impact, regression and time to fix. Tokens are not the scoreboard.'
      ]
    ],
    boundary: 'The destination includes more autonomy for easy-to-reverse changes once the brakes earn trust. Today, merging remains a human decision.'
  },
  pact: {
    kicker: '04 · Our agreement',
    title: 'Each side delivers its part.',
    lead: 'Autonomy needs context, resources and trust. In return, the team owns the problem from the beginning to the outcome. The agreement goes both ways.',
    head: [
      'Leadership delivers',
      'The team delivers'
    ],
    rows: [
      [
        'Context and the reason for each request',
        'Ownership from problem to outcome'
      ],
      [
        'Repertoire, pairing and rituals',
        'Smart use of AI and teaching the team'
      ],
      [
        'Accounts, credits and tools',
        'Returns measured in production'
      ],
      [
        'Time set aside for technical debt',
        'Sound architecture and simple code'
      ],
      [
        'Fast review and decisions',
        'Fast delivery at the right risk level'
      ],
      [
        'Room to find and fix errors',
        'Every error improves the system'
      ],
      [
        'Removing what does not work',
        'Honest feedback on tools and processes'
      ]
    ]
  },
  profile: {
    kicker: 'The profile that grows here',
    title: [
      'The bar rises.',
      'The team grows.'
    ],
    lead: 'Execution capacity has multiplied. We value the ability to turn that execution into a better product.',
    items: [
      [
        'Ownership',
        'Find the problem and take the solution all the way.'
      ],
      [
        'Technical judgment and taste',
        'Sound architecture, simple code and a beautiful product.'
      ],
      [
        'Measured quality',
        'Few regressions, few bugs and fast fixes.'
      ],
      [
        'Smart use of AI',
        'Ask big, challenge the answer and demand proof.'
      ],
      [
        'Business knowledge',
        'Understand the customer and your domain.'
      ],
      [
        'Teaching the team',
        'Bring back what works and be a multiplier for others.'
      ]
    ]
  },
  diagrams: {
    legend: [
      'Person decides',
      'Agent executes',
      'Check verifies'
    ],
    bottleneckCaption: 'Execution used to constrain delivery. Now decisions and verification must keep up with the capacity to build.',
    workflowCaption: 'Planning proves value. Hardening takes the approved scope to production. Every G is a person’s decision.',
    gateNames: [
      'Problem accepted',
      'Intent approved',
      'Ready for demo',
      'Demo proved value',
      'Technical plan approved',
      'PR ready to merge',
      'Delivered for real'
    ],
    planning: '01 · Prove the value',
    hardening: '02 · Build with rigor',
    workflowNodes: [
      'Problem',
      'Intent',
      'Grill',
      'Demo',
      'Spec and v1 scope',
      'Slices + implementation',
      'Review + PR',
      'Production + retro'
    ],
    workflowNotes: [
      'A real pain',
      'Outcome and limits',
      'You decide; AI interviews',
      'The user tries it',
      'The TL decides what stays',
      'One demonstrable delivery per slice',
      'Checks, bot and person',
      'Outcomes return to the system'
    ],
    valueGate: 'Proved value?',
    yes: 'Yes',
    retry: 'Not yet: return to the grill',
    small: [
      'Small problem',
      'Agent tries',
      'Does it work?'
    ],
    smallNotes: [
      'Screenshot and context',
      'A proportionate fix',
      'Verify the delivery'
    ],
    smallCaption: 'If the attempt reveals a bigger decision, return to planning. Rigor follows the problem.',
    cut: [
      'Broad demo',
      'v1 scope',
      'Hardening',
      'Production'
    ],
    cutNotes: [
      'Explore possibilities',
      'Choose what proved value',
      'Reuse or rewrite',
      'Only the approved scope'
    ],
    cutCaption: 'The demo can be broad. The production version is a deliberate cut, approved at G4.',
    risk: [
      'Verify',
      'Merge',
      'Observe and reverse'
    ],
    riskNotes: [
      'Tests, review and evidence',
      'A person decides',
      'Flags, monitoring and revert'
    ],
    riskCaption: 'Verification before. Observation after. A way back prepared from the start.'
  }
};
