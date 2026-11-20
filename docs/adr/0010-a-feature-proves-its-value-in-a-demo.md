---
status: superseded
date: 2026-10-08
deciders: [Guilherme Lippert]
superseded_by: ADR-0013
---

# A feature proves its value in a demo before any hardening

The environment restriction below is amended by [ADR 0013](0013-demos-use-the-smallest-safe-environment.md), and the order of preference between environments now follows [ADR 0014](0014-a-demo-prefers-real-use-behind-a-flag.md). The two phases and seven gates remain; explicitly approved, protected production experiments can precede hardening for general release.

## Decision

A feature goes through two phases. In the first, planning, it becomes a demo: a working first version inside the real codebase, on a demo branch, used by a real user. Only what the demo proved goes to the second phase, hardening, where the v1 is cut, specified, built with tests, reviewed and shipped. The demo itself never reaches production.

Seven gates mark the path, each with an owner and a definition of done: problem accepted (G0), intent approved (G1), ready for the demo (G2), the demo fulfills the intent (G3), technical plan approved (G4), pull request ready (G5), delivered for real (G6).

## Context

Until 4.1 the flow went from the grill straight to the spec, and `prototype` was an optional detour for a single design question. That put the engineering effort before the proof: the team found out at the end whether the user wanted what was built.

With agents, building a working version takes hours. What stays expensive is deciding what to build and making sure it is good. So the cheap thing is used to answer the expensive question first.

## Accepted trade-off

Part of the demo is thrown away, and the feature is built twice where the tech lead decides to rewrite. Worth revisiting if demos routinely take more than two days, or if they start reaching production without the cut.

## Rejected alternative

Keep the demo optional and let each team decide. The path that skips the proof is the one people take under pressure, which is when the proof matters most.

## How to apply

- `marsai-dev:demo` builds the demo after the grill. `marsai-dev:to-spec` cuts the v1 from it and records, part by part, what is reused and what is rewritten.
- The Standards and the review run in hardening, not in the demo. Four rules hold in both: nothing from a demo merges into the main branch, nothing writes to production, customer data stays in a controlled environment, and no secret goes into the code.
- A bug, a small adjustment and tech debt skip the first phase and enter at `marsai-dev:implement`. A feature whose only open question is how to build it also skips the first phase, entering at `marsai-dev:to-spec`.
- `marsai-dev:prototype` stays for one design question inside a grill: a rule, a screen, an exchange of events. It is not the demo.
- A gate is a person's decision. The automatic checks inside G5 are the Brakes.
