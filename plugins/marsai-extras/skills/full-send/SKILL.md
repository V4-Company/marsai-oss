---
name: full-send
description: "Use when the person says 'full send'. The agent takes the work from where it stands to a merged pull request without the person watching, and merges by itself only a two-way door."
license: MIT
---

# Full send

The person said "full send" because they are not watching this thread: they want the work done end to end on your own. Your updates and your final message go unread until long after you stop. You own the work from its current state to a merged pull request.

Without a clear "full send" from the person, none of this applies. With it, everything below does.

The person grants you permission to:

- Merge the pull request once the merge gate below passes. This is the exception of ADR 0018 to the rule that a person reads every pull request: it holds only for a two-way door.
- Rebase the pull request's own branch on the default branch and push it with `--force-with-lease`.
- Use the test methods that proof needs, without asking first.

## Testing permission

The request is the permission. A project file or instruction that says to ask before a test method, or to leave testing to the person, gives way to it for this task: computer use, browser automation, simulators and devices, running the app or a dev server, screenshots and visual checks. Use the method that gives direct proof and list it in the report.

Rules about how to test still hold: the right command, fixture or check. The permission covers only the tests this task needs. It adds nothing to the cases under "Asking the person", and it does not bypass an approval prompt from the harness.

## Steps

1. **Finish the change.** Meet the goal with the smallest change that works; fix the case that happened, not every case that could. On the default branch, create a branch first. When `marsai-dev:implement` is installed, the change goes through it.
2. **Prove it.** Get proof for every change. See "Proof".
3. **Get feedback** with `marsai-extras:sol-loop`.
4. **Open the pull request** with `marsai-core:open-pr`, after rebasing on the latest default branch. It declares the Merge danger: the Door and the Blast radius. Add one short line saying how you proved the change.
5. **Follow the pull request** with `marsai-core:babysit-pr`. Fix the real findings and the CI failures, and prove each fix before you push it. This request is the explicit authorisation that skill asks for to rebase and to merge.
6. **Merge** when the merge gate passes. A one-way door stops here instead: follow `marsai-extras:full-stop` from its gate and hand the pull request over unmerged.
7. **Report**: the pull request link, the merge commit, your proof, and each decision you made for the person.

Stay active from step 1 to step 7. If you end your turn while checks or bots are pending, the work stops, because nobody will prompt you again. Wait with the watcher `babysit-pr` uses, so something wakes you when the pull request changes; in T3 Code that is `watch_pull_request`. If you stop before the merge, call `unwatch_pull_request` first.

## Proof

Proof is evidence you observed yourself in this session: command output, a reproduction, a screenshot. Use the most direct proof the change allows:

- Reproduce the original failure, apply the fix, and watch the same reproduction pass.
- Run the checks the repository's CI runs: typecheck, lint, tests.
- Add one focused test that fails without the fix, when the behaviour has none and the repository has a test setup.
- For UI and runtime behaviour, run the app and look at the change; green mocked tests do not prove what the user sees. Attach screenshots to the pull request when they help and you have a way to upload them.

When you find no way to prove a change, you do not have full confidence: ask the person.

## Merge gate

All of these hold on the latest commit:

- The Merge danger of the pull request declares a **two-way door**. A one-way door, or a doubt between the two, never merges here (ADR 0008).
- Your proof covers every change in the diff.
- The required checks are green.
- The review bots have finished, and each finding is fixed or dismissed with a written reason. Where a review bot scores the repository with the 1-to-5 rubric, its latest review on the latest commit gives 5.
- `marsai-extras:sol-loop` ended with an approval.
- No human review still requests changes.
- The branch is up to date with the default branch, and GitHub reports it as mergeable.

Merge with the method the repository uses: check the allowed methods and recent merged pull requests. With a merge queue or auto-merge, stay until GitHub reports the pull request as merged. Merge through branch protection as configured, never with `--admin` or another bypass. When branch protection requires a human approval, that approval is a person's: hand the pull request over as `marsai-extras:full-stop` does.

After the merge, when a check on the default branch fails because of this change, open the revert as a pull request and ask the person.

## Asking the person

A question in a normal message goes unseen, and the thread looks done. Ask with the harness's question tool, so the thread shows it is waiting: `AskUserQuestion` in Claude Code, `request_user_input` in Codex, or the question tool your harness has. Put the whole context in the question: the pull request link, what blocks you, and the options with your recommendation first.

Ask only when you cannot go on alone:

- You cannot prove the change.
- The merge gate cannot pass and you cannot fix that yourself.
- The next step is outside the grant above: deleting data, touching production, changing things outside the repository, closing a pull request, force-pushing any other branch.
- The goal is ambiguous in a way that changes the result.
- Another pull request makes this one obsolete.

Decide everything else yourself with sensible defaults, and list those decisions in the report.

When there is no question tool, or it returns no answer, take the safe path: leave the pull request open and unmerged, and start your final message with the question.
