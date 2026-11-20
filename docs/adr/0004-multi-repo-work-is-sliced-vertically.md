---
status: proposed
date: 2026-10-06
deciders: [Guilherme Lippert]
---

# Work that crosses repositories is sliced vertically

## Decision

Planning maps, right at the start, which repositories the change touches. When there are several, the work is cut into Vertical slices (one behaviour working from end to end, across the repositories), not into one piece per repository.

## Context

At V4 a change often touches more than one repository, and AI skills in general assume a single one. When the work is cut by repository, the change can only be seen working once every piece is finished, and a mismatch between services shows up at the end.

A team had already worked this way on a recurring card payments feature: seven numbered child issues, each one a behaviour that crosses two services, with the blocking relations between them. Other teams cut by layer (`[Backend]`, `[Front]`); that is the shape this decision replaces.

## Accepted trade-off

A pull request fits in one repository only, so the behaviour of a Slice is spread across the pull requests of the repositories it touches. Whoever reviews needs the sibling pull requests to see the whole Slice, and the deploys must follow a set order.

## How to apply

- In Linear: Parent issue (the whole change, in product language) → one child issue per Slice, numbered in execution order and with the blocking relations between them.
- On GitHub: one pull request per repository the Spec touches, with the commits of each Slice identified, linked to the Parent issue and to the Slices that pass through it. A Slice implemented on its own opens its own pull request in each repository it touches.
- A sub-issue per repository only when another person or another team does that part.
- A change that goes into another team's repository respects the invariants there: the Spec lists the ADRs and the glossary of that repository that the change touches.
- Work in a single repository follows the flow without this extra step.
