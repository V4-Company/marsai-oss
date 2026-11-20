---
name: full-stop
description: "Use when the person says 'full stop', even as a closing 'Full stop.' that reads like emphasis. The agent does all the work of full send without the person watching, and stops with the pull request ready for the person to merge."
license: MIT
---

# Full stop

Do the same work as [full-send](../full-send/SKILL.md), and stop with the pull request ready for the person to merge. You never merge it.

Read full-send and follow its steps, proof, review and follow-up of the pull request. A "full stop" request authorises that work on its own, testing permission included: use the test methods proof needs directly, even when a project file says to ask first. Its merge permission does not apply, and the rules below take precedence.

## No merging

You may commit, push, rebase, fix conflicts and use `--force-with-lease` on this task's branch. You never merge, enable auto-merge, enter a merge queue, push to the default branch, bypass branch protection, or ask anyone else to do those for you.

Before the work begins, turn off any auto-merge and take the pull request out of any merge queue; check again before each push, and report what you changed. When you cannot prevent an automatic merge, report the blocker before going on.

## Stop at the gate

Full-send's merge gate is the readiness check, without its two-way door line: here the Door only tells the person how much attention to give. Its merge and its final report are replaced by a hand-over. Proof and review cover the final diff; check behaviour changes and meaningful conflict fixes again before the hand-over.

Fetch the target branch and check the live pull request: head, base, checks, reviews and mergeability. Confirm it is open, not a draft, and not set to merge without the person. If someone else merged it, report that instead.

- **Ready to merge**: the gate passes. Leave the pull request open and unmerged.
- **Waiting for a required approval**: only a human approval is left. Confirm that it really is the only thing left.
- **Blocked**: say what prevents readiness, what you tried and what is needed, following full-send's rules for asking the person.

In T3 Code, call `unwatch_pull_request` before the hand-over or a question. Report the pull request link, the final head, the verdict, the proof, the reviewers' outcome and the risks that remain, and state that the pull request is still open and unmerged.
