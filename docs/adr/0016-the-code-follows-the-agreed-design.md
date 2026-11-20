---
status: accepted
date: 2026-10-13
deciders: [Guilherme Lippert]
---

# The code follows the agreed design; a change of course is written first

## Decision

What the technical refinement agreed is the standard of that delivery. Code that departs from it does not reach the pull request: the reviewer removes a local departure, and a structural one goes back to implementation.

When the course has to change, the refinement changes first: the new design is written on the issue and the tech lead approves it before the pull request is ready. The team's Standards change through the retro, never inside the pull request of a feature.

A person reads every pull request, whatever its risk: someone who took part in the refinement, when the delivery had one. The risk sets how deep the reading goes.

A pull request is kept small enough to read well. The threshold is 400 changed lines: above it, the work goes out as one pull request per slice, or the pull request says why it was not split. The threshold guides attention; it does not block a merge.

## Context

The session of [ADR 0015](0015-the-technical-plan-is-agreed-in-a-session.md) buys a short reading only if the code is what was agreed. A departure that stays in the code becomes the example the next agent copies. Declaring it in the pull request and letting the reader decide would turn every review back into a discussion of the design.

The human review used to follow the risk level alone, which left room for a low-risk change to be merged with no person having read it. That is the experiment the talk cited in ADR 0015 describes as failing three months in.

## Accepted trade-off

The reviewer does more, and a late change of mind costs a written update and an approval. Smaller pull requests mean more of them to open and follow. Worth revisiting if the written updates become routine, which would mean the session is deciding too early.

## How to apply

- `marsai-dev:code-review` gives the reviewer the program design next to the Standards, and the Spec axis reports structure that departs from it.
- `marsai-dev:implement-spec` and `marsai-dev:implement` stop a slice that cannot be built as agreed, and ask.
- `marsai-core:open-pr` states the size of the pull request and, when the design changed, links the approved update.
- `marsai-core:babysit-pr` treats the human review as required at gate G5.
