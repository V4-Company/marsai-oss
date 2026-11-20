---
status: accepted
date: 2026-10-15
deciders: [Guilherme Lippert]
---

# One entry point leads the work from start to finish, with its path as a checklist

## Decision

`marsai-core:marsai-mode` is the single way into any work. The person says what they want in one sentence, or brings a card, and the agent leads from there to the end: it reads what already exists, recommends the size of the work and its path, and the person confirms it.

The path goes on a visible checklist, taken from the map with its gates. A step the work will not go through stays on the list with its reason. The agent calls each step's skill in turn and goes on alone between gates. It stops at each gate for the person's decision, and before any action that cannot be undone.

The size is settled by one question: would we know the change is right by reading the code and running the tests, or only when a user uses it? If only a user can tell, the work needs a demo. When the work turns out to be a different size, the agent says so and the checklist is rewritten once the person agrees.

`dev-start` and `pm-start` now only say which command to type.

## Context

The flow had three entry points, two of them role-specific, and each one routed to a step and stopped there. The person had to know the map to go on, and choosing between the fast track and a demo was left to whoever started the work.

The front door that matches the work to a playbook, copies its steps into a visible list and keeps a skipped step with its reason comes from Lauren Tan's `poteto-mode`, in pstack (MIT). That mode leaves the design to the agent and asks the person only what no experiment can settle. MarsAI does the opposite where it matters: the person plans ([ADR 0003](0003-the-person-plans.md)), the plan is agreed in a session ([ADR 0015](0015-the-technical-plan-is-agreed-in-a-session.md)), and a person decides at every gate.

## Accepted trade-off

The agent recommends the size, and a wrong recommendation sends a feature down the fast track without a demo. The person's confirmation and the question about the user guard against that. The two old commands cost anyone who still types them a second step. Worth revisiting if people stop examining the path and just say yes.

## How to apply

- `marsai-core:marsai-mode` holds the paths, the sizing question and the checklist of each path, whose steps and gates follow the map in `marsai-core:using-marsai`.
- `marsai-dev:implement` sets the evidence according to the kind of change: a bug is reproduced where it happens before the fix, a slowdown is measured before and after, a refactor keeps the tests unchanged.
- The setup interview of `marsai-core:using-marsai` ends by pointing to the mode.
