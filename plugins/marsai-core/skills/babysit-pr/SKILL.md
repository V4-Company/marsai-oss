---
name: babysit-pr
description: "Follows a pull request through CI, the review bot and the comments, until it is ready, blocked or obsolete. Use when someone asks to monitor, follow or look after a PR."
---

# Babysit PR

Follow the PR until it is ready, blocked, obsolete or waiting for a decision from the person.

## Protect the original goal

Before acting, identify the goal of the PR from the title, the description, the ticket and the diff, and keep it. A review suggestion is actionable only when it fixes a real problem inside that goal, or is needed for the change to work safely. Unrelated refactoring, opportunistic clean-up, a new feature and speculative protection go to another PR.

## What you do

- Read the PR, the code, the reviews, the checks and the related changes.
- Fix a valid finding that is in scope, fix a CI failure and push.
- Reply to the comments and resolve them after fixing or after rejecting in writing.
- Merge, close and rebase only with explicit authorisation. A "full send" from the person authorises the rebase and the merge (ADR 0018).

When you start, record: repository, PR number, current commit, goal, ticket, required checks, required approvals, who reads the PR and the state of the review bot's review.

## Loop

Use the harness's PR monitoring tool, if there is one. Without it, query the PR at regular intervals.

After each push, the new commit is the new baseline: act only on reviews, comments and checks created after it. What came before is context.

With nothing new, stay quiet.

## Review findings

For each finding, from a bot or from a person:

1. Check it against the current code and against the goal of the PR.
2. Classify it: valid, false positive, already fixed or out of scope.
3. Fix what is valid and in scope.
4. Reject a false positive with a short reason, in writing.
5. Explain what is out of scope and suggest another PR when that makes sense.
6. Wait for the next review after the push.

When replying on the person's behalf:

```text
[MODEL] REPLYING ON BEHALF OF THE USER

[the reply]
```

## A comment from a person calls for a retro

When a human reviewer points out something the automated review should have caught, or repeats a comment that already appeared in another PR, suggest `/marsai-core:retro` for this PR when you report. That is how the same comment stops coming back.

## Review bot

The review bot (CodeRabbit, Greptile, GitHub Copilot Review or the team's own) informs the merge; it does not decide it. A person's merge does not wait on its score alone. Under a "full send", its 5 on the latest commit is one of the conditions `marsai-extras:full-send` checks before merging a two-way door (ADR 0018).

Where it scores with the example rubric of `marsai-dev:code-review`, record, for the latest review on the latest commit: the overall score, the scores for `correctness`, `security`, `tests`, `nil_safety`, `blast_radius` and `maintainability`, the findings and whether it says `safe to merge`.

A 5 says the bot found no problem in that review. It does not override a failing required check, an open valid finding, a missing approval, the human review or a newer push not yet reviewed. A score below 5 calls for triage of the findings, using the same process as above.

## CI

- Separate required checks from optional and skipped ones.
- SonarQube runs in the PR's CI and blocks through the quality gate. Treat it as a required check: read what it flagged in the job log or in the PR comment and fix it within scope.
- A failing required check blocks the PR.
- Separate a failure of the repository from infrastructure instability. Re-run only when it is safe and allowed.

## Changes on `main`

If the branch has fallen behind or may conflict, state the impact and ask before the rebase. After an authorised rebase, start again from the new commit.

## Obsolete PR

If another PR makes this one obsolete, stop, say which one replaces it and why, and ask before closing.

## When to stop

- **Ready**: required checks green on the latest commit, no open valid finding, the required approvals, the PR read by a person (someone from the refinement session, when the delivery had one; ADR 0016), and the latest review bot review at 5 or with no blocking finding. Say it is ready. The merge is the person's, except under a "full send" on a two-way door, where `marsai-extras:full-send` merges once its gate passes (ADR 0018).
- **Blocked**: a failure, a missing approval, an ambiguity or a decision only the person makes.
- **Obsolete** or replaced.
