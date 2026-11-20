---
status: proposed
date: 2026-10-06
deciders: [Guilherme Lippert]
---

# The person plans; the agent interviews

## Decision

There is no planning agent. The agent runs the Grill (it asks, fetches the facts from the code, recommends), and every design decision belongs to the developer.

## Context

`feature-flow` dispatched a planning agent (`Plan`) to write the plan of the feature, and `product-engineer-discovery` sent the open design questions to the same agent. Planning is the work that has to be done by the developer: it is the only step of the flow that is synchronous by nature, with the person in the conversation.

## How to apply

- The Grill and the evaluation of the Prototype are done with the person. From `to-spec` onwards the agent works alone and stops only at what depends on a decision.
- `product-engineer-discovery` is not discarded: it evolves, adding the Grill and the practices of Matt Pocock that it did not have yet, and stops sending questions to the planning agent. It becomes two skills, with Matt's names: `to-spec` (writes the Spec in the Parent issue) and `to-tickets` (cuts it into Vertical slices). With one skill, the agent rushes through the Spec to get to the issues sooner; with two, the work can be sliced again without redoing the Spec.
- `feature-flow`, which existed to dispatch the planner, goes away. The flow map takes its place.
