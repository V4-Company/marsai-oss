---
status: accepted
date: 2026-10-13
deciders: [Guilherme Lippert]
---

# The technical plan is agreed in a session, down to the program design

## Decision

Gate G4 is decided in a session of up to 30 minutes with the tech lead, the PM and the developer responsible for the delivery. The tech lead decides. The agent prepares the material before the session, and the people leave it knowing what will be built.

The technical refinement goes one level below architecture. Besides the flow, the contracts and the data model, it states the **program design**: the new pieces with their types and signatures, where they plug into the existing code and who calls whom, and where each test hooks in. It also lists the slices and their order. The session names who will read the pull requests.

The intent (G1) and the verdict on the demo (G3) are also decided with everyone in the room. The other gates are decided in writing, on the issue.

## Context

A person still reads the code an agent writes. The argument, from Dex Horthy's talk "Why software factories fail" (AI Engineer, 2026), is that coding models are rewarded for making a task pass and nothing in that reward penalises poor structure, whose cost shows up months later; so they get better at solving the task and no better at keeping a codebase maintainable. It is an argument from one team's experience, not a measurement.

What makes that reading short is alignment before the build: the reader recognises what was agreed. Until now the agent wrote the refinement and the tech lead approved it on the issue, with no conversation, and the refinement stopped at architecture. The reader met the structure for the first time in the pull request.

## Accepted trade-off

Three points in a delivery need people at the same time. A session that does not fit in 30 minutes is a sign the feature is larger than one refinement. Worth revisiting if the retro shows the review did not get shorter.

## Rejected alternative

Keep the approval in writing and only add the program design to the template. The document would exist, and the reader would still meet the structure in the pull request.

## How to apply

- `marsai-dev:to-spec` reads the code down to the call path, writes the program design and the slices in the technical refinement, and prepares the session. It records on the issue who attended, the approval and who reads the pull requests.
- `marsai-dev:to-tickets` publishes the slices the session approved.
- The implementers receive the program design with the slice, and `marsai-dev:code-review` checks the code against it ([ADR 0016](0016-the-code-follows-the-agreed-design.md)).
- `marsai-core:retro` records how long the human review took and how many rounds of rework the pull request needed.
