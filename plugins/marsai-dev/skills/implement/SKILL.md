---
name: implement
description: "Implements a single slice or a small change: dispatches the right implementer, verifies the repository's checks, closes with the review and updates the issue in Linear. Use for an isolated ticket, an adjustment or a bug, whenever the work is writing or changing production code, before writing the first line. For a whole spec with slices, the skill is implement-spec."
argument-hint: "[identifier of the slice in Linear, or what to implement]"
---

# Implement

Take a slice from the ticket to reviewed code. You lead; the implementer writes the code, in a conversation of its own.

This is the path for small things: an isolated ticket, an adjustment, a bug. A spec with several slices goes through `marsai-dev:implement-spec`, which walks all of them in blocker order.

## 1. Understand the slice

- **You were given a Linear identifier**: read the issue, the comments and the technical refinement on the parent issue, which holds the contract, the invariants to respect and the program design to follow. Move the issue to the team's in-progress status (`list_issue_statuses` says which one it is).
- **The identifier belongs to a parent issue with slices**: the skill is `marsai-dev:implement-spec`.
- **No identifier was given**: the task is what was asked or agreed in this conversation.
- **Acceptance criteria are missing and the request can be read more than one way**: ask before dispatching.

A question about the code, the investigation of a bug whose fix is not yet known and a change that is only docs or config are not implementation: handle them directly, without dispatching.

The kind of change sets the evidence the slice ends with:

- **A bug**: reproduce it yourself where it happens before dispatching, and pass the reproduction to the implementer. The test that fails first reproduces the bug, and at the end the bug no longer happens with the original reproduction.
- **A measured slowdown**: measure before the change with a command you can repeat, and again the same way after it. Report both numbers and what limits them.
- **A refactor**: no behaviour changes. The existing tests pass before and after, unchanged.

## 2. Dispatch the implementer

| The slice touches | Implementer |
| --- | --- |
| API, endpoint, use case, service, repository, entity, migration, event, worker | `marsai-dev:backend-engineer-typescript` |
| Component, page, App Router route, form, table, screen state | `marsai-dev:frontend-engineer` |

A team pack can add implementers of its own: when the description of one names the repository or the kind of work, it wins over the two above.

Each implementer works in one repository. A slice that crosses repositories becomes one dispatch per repository, in the slice's deploy order, all with the same contract. When the session runs in a Home Repo, give each implementer the path of a worktree in the clone the home points to, and tell it to read that repository's AGENTS.md or CLAUDE.md first: a session started in the home does not load it. Those that do not depend on each other go out in parallel, in a single message.

Pass in the prompt: what to deliver, the acceptance criteria, where to test, the contract (payload, route, event), the repository invariants the change touches, the program design from the refinement (the pieces, their signatures and where they plug in), the existing code that serves as an example and the constraints already agreed. Point to the issue and to the spec instead of copying their text. When a skill whose description starts with "Implementation guide" covers the stack or the repository, name it in the prompt and tell the implementer to load it before writing code.

Dispatching gives the slice a clean conversation and leaves this one free to lead and review.

## 3. Check the implementer's report

The implementer's report includes the output of the test failing and then passing (for a refactor, the existing tests passing before and after), and the output of the repository's Check Command (the one script that runs lint, typecheck and tests; without one, lint, typecheck and tests in turn). In a backend slice that creates a module, entity or use case, the report also says what the team's implementation guide had the implementer generate, when the task named one, or why nothing was generated. If anything is missing, ask for it.

SonarQube only runs in the PR's CI and blocks through its quality gate. What static analysis usually flags (an overly complex function, a duplicated block, new behaviour with no test) is cheaper to fix now: the review looks for it before the PR exists.

A question or blocker the implementer reports goes to the person. A design decision is theirs. When the slice cannot be built as the refinement designed it, stop: the design changes on the issue, with the tech lead's approval, before the code does (ADR 0016).

## 4. Commit and review

1. `/marsai-core:commit` records the implementation, with the slice identifier in the message.
2. `marsai-dev:code-review` on the branch. The reviewer applies the standards and commits the fixes in separate commits, so you can see what the review changed.
3. If the review points to a ticket requirement that is missing or wrong, or to structure that departs from the program design, go back to step 2 with the finding.

An implementation is only done after the review: the standards are applied there, not before.

## 5. Close the slice

1. **On the Linear issue**: tick the acceptance criteria you saw pass and leave a short comment with what was delivered, what the review fixed, the commits and what stayed open. A criterion that was not verified stays unticked, with the reason.
2. **Status**: the issue goes to the team's review status when the PR opens. With no PR yet, it stays in progress.
3. **Tell the person** what was delivered, with the evidence its kind of change calls for, and what stayed open. The next step is `/marsai-core:pr`.
