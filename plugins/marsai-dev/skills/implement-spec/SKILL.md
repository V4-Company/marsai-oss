---
name: implement-spec
description: "Implements a whole spec: walks the slices of the parent issue in blocker order, with one implementer per slice, and delivers one reviewed PR per repository. Use when a parent issue with slices exists and someone asks to implement the spec, the whole feature or all the slices. For a single slice or a small change, the skill is implement."
argument-hint: "[identifier of the parent issue in Linear]"
---

# Implement spec

Take a whole spec to reviewed code, without waiting for the person between one slice and the next. The result is reviewed pull requests: one per repository the spec touches when the whole delivery reads well in one, and one per slice when it would be too large (ADR 0016).

The slices are not a list of steps. They are a **graph**, with blockers between them: at any moment there is a **frontier**, the slices whose blockers have finished and that can start.

Say little to the subagents. Point to the spec, to the slice, to the exploration notes and to the earlier commits, instead of repeating what is already written there.

## 1. Read the spec and the slices

Read the parent issue, the technical refinement (contract, invariants, program design, deploy order) and the children, with their blockers (`list_issues` with `parentId`). Enough to see the graph and the repositories it touches.

- **The parent has no slices**: stop. The previous step is `/marsai-dev:to-tickets`.
- **A slice depends on a decision the spec did not make**: ask now, all at once. After this step the person is not needed again until the PR.

## 2. Explore once

Optional. If several slices depend on the same understanding of the code, dispatch an `Explore` agent to work it out and write the notes to a directory outside the repositories, where the implementers can read them. Each implementer spends its context implementing, not rediscovering.

## 3. Create the branch, per repository

Choose the shape of the delivery first, per repository. When the whole change should stay under about 400 changed lines, it goes out as **one PR**: one branch from the up-to-date base, and the PR opens in step 5, with the first slice integrated (GitHub only opens a PR from a branch that already has a commit). Above that threshold it goes out as **one PR per slice**, in blocker order: a slice with no blocker branches from the base, and a slice blocked by another branches from its blocker and says so in its PR. Tell the person which shape you chose and why; they can ask for the other. The threshold guides attention and does not block.

## 4. Implement the frontier

For each slice on the frontier:

1. Move the issue to the team's in-progress status.
2. Dispatch the implementer, in the background. The choice of implementer and what goes in the prompt follow `marsai-dev:implement`, steps 1 and 2. A slice that crosses repositories becomes one implementer per repository, with the same contract.
3. Each implementer works in its own worktree, on its own branch, and commits when it finishes: one commit per slice, with the slice identifier in the message, in the format of `marsai-core:git-commit`.

Slices on the frontier that do not block each other run at the same time.

## 5. Integrate what finished

When an implementer finishes:

1. **Check what it returns** against step 3 of `marsai-dev:implement`: the test failing and then passing, the repository's Check Command green and, on the backend, what the team's implementation guide had the implementer generate, when the task named one. If anything is missing, ask for it.
2. **Integrate into the PR branch** by rebase and fast-forward. History is linear here: `git rebase <PR branch>` in the slice's worktree, then `git merge --ff-only` on the PR branch. A conflict is resolved by the intent of each slice; if you cannot tell which one holds, stop that slice.
3. **Publish the PR branch.** On the first slice integrated in the repository, open the PR as a draft (`/marsai-core:pr draft`), citing the parent issue and the slices that go through it, so that Linear links them. While it is a draft, the review bot usually does not review it yet. On the following slices, the push is enough.
4. **Close the slice in Linear**: tick the acceptance criteria you saw pass and add a comment with what was delivered, with the commits. A criterion that was not verified stays unticked, with the reason.

With one PR per slice, the slice's own branch is its PR branch, so item 2 does not apply: open the PR when item 1 passes, review it following step 7 on its own, and rebase it onto the base when its blocker merges.

## 6. Recalculate the frontier

A finished slice releases the ones it was blocking. Dispatch the new ones and repeat steps 4 to 6 until the graph runs out.

## 7. Review the whole branch

With all the slices integrated, run `marsai-dev:code-review` on each PR branch. The reviewer applies the standards and commits the fixes; the Spec axis checks the diff against the parent issue, all the slices and the program design. What the Spec axis points to as missing or wrong goes to a single implementer to fix. Run the Check Command again.

## 8. Deliver

1. Complete the description of each PR with `marsai-core:open-pr`, which on a PR that is already open rewrites the body: evidence, merge danger and the deploy order between the repositories. Take the PR out of draft.
2. Leave a comment on the parent issue with the state of each slice (delivered, blocked and why, or not started), and move the delivered slices to the team's review status.
3. Remove the worktrees.
4. Tell the person which PRs were opened, in what order they go in and what is blocked. From here on, `marsai-core:babysit-pr` follows up.

## When to stop

Stop a slice, not the whole job, when:

- it depends on a decision the spec did not make;
- the Check Command does not go green after an honest attempt to fix it;
- implementing would require departing from the agreed contract, scope or program design. The change is written on the issue and approved by the tech lead before the slice goes on (ADR 0016).

The slices that do not depend on it carry on. The person is asked to decide, with the options, and the slice is marked as blocked in Linear, with the reason.
