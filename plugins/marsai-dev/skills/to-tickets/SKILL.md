---
name: to-tickets
description: "Cuts a spec into vertical slices in Linear, each with the repositories it touches and the blockers between them. Use after to-spec, or when someone asks to break an issue or a plan into tasks."
---

# To tickets

Cut the spec into **vertical slices** and publish each one as a child issue of the parent issue, with the blockers between them.

## 1. Start from the spec

Use the spec that is in the conversation. When the technical refinement lists the slices the session approved, start from that list: this skill details and publishes it, and a change to it goes back to the person. If the person passed a Linear identifier, read the whole issue, with the comments. If you do not yet know the code involved, read it before slicing, with the reading precautions of `marsai-dev:to-spec`.

## 2. List the repositories

Confirm which repositories the change touches, the deploy order between them and the contract that links each pair. It comes from the spec; if the spec does not say, find out and confirm with the person.

A single repository: the slices cut through its layers, and the rest of this section does not apply.

## 3. Draw the slices

A slice is **one behaviour working end to end**: it cuts through all the layers and all the repositories needed, and can be demonstrated on its own.

- **Cut by behaviour, not by repository or by layer.** "Cancelling the deal ends the subscription at the provider" is a slice. "Everything in `payments`" and "the backend" are not: you can only see them working when all the pieces are finished, and a mismatch between services shows up at the end.
- **Each slice fits in a fresh implementation conversation.** If it does not fit, it is more than one.
- **Each slice reads well as one pull request.** Past about 400 changed lines a pull request is hard to read, and the delivery goes out one slice per pull request (ADR 0016). A slice that would cross that line on its own is more than one.
- **Preparation comes first.** If a refactoring makes the change easy, it is slice 1, and the others are blocked by it.
- **Each slice declares its blockers**: the slices that must finish before it starts. With no blocker, it can start right away.
- **A slice that crosses repositories** says which ones it touches and in what order they deploy. General rule: the consumer of the event deploys before the producer. It goes into the PR of each repository it touches, all linked to the same issue.
- **A slice that creates or changes an event** includes, in its acceptance criteria, the new version of the shared events package and the repository's entry in the event catalog updated in the same PR.

A mechanical change that spreads across the whole codebase (renaming a column, swapping a shared type) does not fit in a vertical slice. Do it in three stages: add the new form next to the old one; migrate the uses in batches, each batch a slice blocked by the first; remove the old form in a slice blocked by all the batches.

## 4. Confirm with the person

Show the numbered list in execution order. For each slice: title, blocked by, repositories and what it delivers. Ask:

- Is the size right, or is any slice too thick or too thin?
- Are the blockers right: does each slice depend only on what actually holds it up?
- Does any part belong to another person or another team?

Adjust until the person approves.

## 5. Publish to Linear

In dependency order, so that the blockers point to real identifiers:

- **One issue per slice**, a child of the parent (`parentId`), with the title `N. <the behaviour>` and the body in the template below.
- **Blockers** as a native relation (`blocks` and `blockedBy`).
- **Labels and status** of the team: find them with `list_issue_labels` and `list_issue_statuses`, and leave each slice in the ready-for-development status, if the team has one.
- **Sub-issue per repository** only when another person or another team does that part. In that case create the sub-issue in the owning team, related to the slice, with what that team needs to decide without a meeting: what is being asked, the contract, the invariants of their repository that you read and the question "did we miss any rule of yours?".
- The description of the parent stays as it is.

```markdown
## What it delivers
[The behaviour that starts working end to end, from the point of view of whoever uses it.]

## Acceptance criteria
- [ ] [verifiable criterion]

## Repositories and deploy order
1. `repository`: [what changes in it]

## Contract
[Link to the technical refinement comment on the parent issue. Do not repeat the contract here.]

## Blocked by
- [identifier], or "nothing: can start"
```

Without the Linear MCP connected: write one file per slice in `.scratch/<feature>/issues/NN-<slug>.md`, numbered in dependency order, and say that you did not publish.

## Afterwards

`/marsai-dev:implement-spec <parent issue identifier>` walks the slices on its own, in blocker order, with a fresh implementer for each one, and delivers reviewed pull requests: one per repository, or one per slice when the whole would be too large to read well. For a single slice, `/marsai-dev:implement <slice identifier>`.
