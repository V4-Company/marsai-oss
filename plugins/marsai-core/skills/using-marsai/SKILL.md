---
name: using-marsai
description: "Introduces MarsAI with a brief interview and adapts it to the person's project, architecture and team. Also maps the development flow from the problem to production. Use for first-time setup, adapting MarsAI, or choosing the next skill."
---

# The flow

Work follows one path, from the problem to production. Each step is a skill, and at each gate a person decides whether the work moves on.

Whoever prefers to be led calls `/marsai-core:marsai-mode` with what they want to do: it sizes the work, puts its path from this map on a checklist and sees it through to the end, stopping at each gate.

## First use or adapting MarsAI

When the person is trying MarsAI for the first time, calls it to get started, or asks to adapt it, follow [ONBOARDING.md](ONBOARDING.md) before routing work. Interview briefly, inspect the project, and connect the flow to its existing architecture, reference code and checks. A returning user with a recorded setup goes straight to their task; revisit only what changed.

A team whose work spans several repositories starts every session in its Home Repo, which points at all of them and holds what the team shares. `marsai-core:home-repo` sets one up.

## Main path

Choose the size of the path before starting. A feature goes through both phases. A bug, a small adjustment and tech debt skip the first phase and go straight to `marsai-dev:implement`, with checks and review. A feature whose only open question is how to build it skips the demo and starts at `marsai-dev:to-spec`.

**Phase 1, planning: total freedom.** It finds out whether the idea is worth building.

1. **The problem and the intent** are the person's, written in the issue before any solution: who is affected and with what impact (gate G0), then the problem, the expected result, how success is measured and what is out of scope (gate G1). A card that already exists in the tracker is a valid start: read it, say which parts of G0 and G1 it already answers, and ask only for what is missing.
2. **`/marsai-core:grill-with-docs`** sharpens the idea by interview. The agent asks and fetches the facts; the person decides. Along the way the repository's glossary (`CONTEXT.md`) and decisions (`docs/adr/`) are recorded. It ends with the hypotheses the demo will test and who will use it (gate G2). When the grill reveals too many questions for one conversation, `/marsai-core:wayfinder` keeps a decision map in Linear and picks them up session by session. One design question that can only be settled by seeing it work goes to `/marsai-dev:prototype`, in another agent, through `/marsai-core:handoff`.
3. **`/marsai-dev:demo`** builds a first version that works. A real user uses it and the person gives the verdict (gate G3). It runs, in order of preference, in production behind a feature flag for selected users, in development with the user, or outside the codebase as a last resort (ADR 0014). The verdict sends it to hardening, back to the grill for another demo, or ends the idea. General release waits for hardening.

**Phase 2, hardening: maximum quality.** Only what the demo proved gets here.

4. **`/marsai-dev:to-spec`** cuts the v1 from the demo, reads the current code and publishes the spec in the Linear parent issue, with what is reused, what is rewritten and the risk level. It does not interview: it synthesises what has already been decided. The plan goes down to the program design and is approved in a session of up to 30 minutes with the tech lead, the PM and the developer responsible; the tech lead decides (gate G4, ADR 0015).
5. **`/marsai-dev:to-tickets`** maps the repositories touched and cuts the spec into vertical slices in Linear, with the blocking relations between them.
6. **`/marsai-dev:implement-spec`** takes the whole spec to reviewed code: it goes through the slices of the parent issue in blocking order, with one implementer per slice, verifies the checks, goes through the review and delivers one PR per repository, or one per slice when the whole would be too large to read well. It runs alone, and keeps the issues updated.
7. **`/marsai-dev:code-review`** is the reviewer: it applies the standards, checks against the ticket and the program design, fixes and commits. `implement-spec` and `implement` already call it; use it on its own to review a branch.
8. **`/marsai-core:pr`** opens the PR with evidence and merge danger.
9. **`marsai-core:babysit-pr`** monitors CI, SonarQube, the review bot and the PR comments until the PR is ready: bots first, then a person, who reads every PR at the depth the risk asks for (gate G5, ADR 0016). The merge is a person's, except under an explicit "full send" on a two-way door (ADR 0018).
10. **`/marsai-core:retro`** looks back once the change is in production and its metric is being measured (gate G6), and proposes the check or the standard that prevents the same mistake next time. What was learned comes back as a new problem, at step 1.

Keep steps 4 and 5 in the same conversation when they fit in it. With Wayfinder, the map carries the decisions between sessions. Each slice is implemented from the ticket, by an implementer with fresh context.

## With the person or alone

- **With the person, question by question**: the grill, the verdict on the demo and the refinement session. It is where their time pays off most.
- **Alone, stopping only for a decision**: the code of the demo, spec, tickets, implementation, review, PR and follow-up. The agent stops when a design decision is missing, when a check does not go green or when the work would depart from what was agreed.

## From the cheapest brake to the most expensive

Each brake catches what the previous one let through. A mistake caught late sends the work back through the whole pipeline, so what can be caught earlier is caught earlier.

1. **Repository checks**, on the machine: lint, types, tests. They spend no tokens.
2. **Review**, before the PR: standards and spec, with fixes.
3. **CI on the PR**: the same checks, plus SonarQube, which blocks through the quality gate and only runs there.
4. **Review bot**, on the PR: a score from 1 to 5.
5. **Person**: reads every PR, with the attention the merge danger asks for.

A finding that repeats at an expensive brake is a signal for the `retro`: it should become a check at a cheaper brake.

## Subagents

Split the work into subagents whenever that keeps this conversation clean or adds a verification: one implementer per slice, the review in a separate agent, the broad search across several files and the independent items in parallel. A conversation that overflows the context loses the thread, and the mistake comes back as rework, which costs more than the subagent's tokens.

## Shortcuts

- **A single slice, an adjustment or a small change**: `/marsai-dev:implement`. It is the same path of implementer, checks and review, for one thing only.
- **Bug**: `/marsai-dev:implement`, which reproduces it where it happens and writes the failing test (`marsai-dev:tdd`) before the fix.
- **A refined issue already exists**: `/marsai-dev:to-tickets` with the identifier, `/marsai-dev:implement-spec` if it already has the slices, or `/marsai-dev:implement` if it is a single slice.
- **The decisions came from a call and the only question is how to build it**: `/marsai-dev:to-spec` with the transcript. It calls the grill only for what the call left open.

## Off the main path

- `/marsai-core:commit` organises the working directory into atomic commits.
- `/marsai-core:handoff` takes the context to another agent, another folder, another harness or another person.
- `marsai-core:issue-handoff` passes a PR to the team to take over.
- `marsai-dev:tdd` is the testing reference the implementer follows.
- `marsai-dev:refinement-doc` draws the spec as a visual page.
