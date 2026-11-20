---
status: proposed
date: 2026-10-06
deciders: [Guilherme Lippert]
---

# Merge danger informs; the approval rule does not change

## Decision

Every pull request declares the Merge danger: the Door (one-way or two-way) and the Blast radius. For now this only guides how much attention the Human review gives. The approval rule stays the same, and every pull request is still reviewed by a person.

## Context

The bottleneck of the flow is the Human review. Not every pull request needs the same attention: a change that can be undone without loss is different from a migration that deletes data.

## Rejected alternative

Lighten the Human review right away for a Two-way door pull request with a small Blast radius. We do not know yet whether the classification made by the agent can be trusted.

## Where we want to get to

- **Two-way door**, with green CI and a 5 from the review bot: merge without Human review. The deploy is monitored through observability and, if it goes wrong, the agent reverts and goes back to fixing.
- **One-way door**: review by the Tech Lead before the merge.

[ADR 0018](0018-full-send-merges-a-two-way-door-alone.md) opens the first case, only under an explicit "full send". Two things are still missing for the rest: evidence that the declared Door matches what happens after the merge, and a step that follows the deploy.

## How to apply

- The section stays visible in the pull request, outside `<details>`. When in doubt between the two doors, declare one-way.
- Reassess after a few weeks of use, comparing the declared Door with what actually happened after the merge.
