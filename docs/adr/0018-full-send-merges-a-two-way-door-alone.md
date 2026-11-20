---
status: accepted
date: 2026-11-02
deciders: [Guilherme Lippert]
---

# Full send merges a two-way door without a human reading it

Opens one exception to [ADR 0008](0008-merge-danger-informs-approval-does-not-change.md) and to the human reading of [ADR 0016](0016-the-code-follows-the-agreed-design.md). Everything else about the human review stays.

## Decision

When the person says "full send", the agent takes the work to a merged pull request on its own (`marsai-extras:full-send`). It merges without a human reading the pull request only when every one of these holds on the latest commit: the Merge danger declares a two-way door, its own proof covers every change, the required checks are green, the review bot gives 5 where one scores the repository, the review by a model from another provider (`marsai-extras:sol-loop`) approved it, and no human review requests changes.

A one-way door, or a doubt between the two, never merges this way: the agent stops with the pull request ready, as `marsai-extras:full-stop` does. `full-stop` never merges, whatever the door.

The three skills live in `marsai-extras`, so only someone who installed the optional pack and asked for it explicitly gets this behaviour.

## Context

ADR 0008 described where we wanted to get to: a two-way door with green CI and a 5 from the review bot merges without human review. The human reading is still the bottleneck of the flow. Theo Browne's `full-send`, `full-stop` and `sol-loop` skills, in tstack (MIT), showed the path in practice: the agent proves the change, a model from another provider reviews it in a loop, and the person is called only when the work is blocked or ready.

## Accepted trade-off

ADR 0008 named two things still missing: evidence that the declared door matches what happens after the merge, and a step that follows the deploy. Neither exists yet. The agent's own proof and a second model's review stand in for the human reading, and after the merge the agent opens a revert when a check on the default branch fails because of the change. A wrong door costs a merged change nobody read.

Worth revisiting after a few weeks, comparing the doors declared in full-send pull requests with what happened after each merge, and sooner if one of them needed more than a revert.

## How to apply

- `marsai-extras:full-send` carries the merge gate, with the two-way door as its first line.
- `marsai-extras:full-stop` follows the same work and hands the pull request over unmerged.
- `marsai-extras:sol-loop` is the review by a model from another provider, GPT Sol by default.
- `marsai-core:babysit-pr` treats a "full send" request as the explicit authorisation to rebase and merge.
