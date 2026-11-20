---
name: sol-loop
description: "Use when the person says 'sol loop'. A reviewer model from another provider, GPT Sol by default, reviews the change in a loop of up to three rounds before or after the pull request."
license: MIT
---

# Sol loop

You own the code; a reviewer from another provider reviews it. Fix what is right, push back on what is wrong, and stop when you agree or the budget ends. The goal is the smallest change that meets the intent: the reviews make it correct, not bigger.

The reviewer is the latest GPT Sol, unless the person names another model. A model trained by another provider finds what yours misses.

## Budget

- Three rounds by default. Round 1 is full; later rounds look only at the code that changed and the findings still open.
- Go up to five only for security, permissions, auth, data loss or state and concurrency, while a blocker or a should stays open with evidence, or when the person asks.
- Stop early when a round returns only nits. A declined nit, and a fix to a comment, a doc or formatting, needs no new round.
- One reviewer at a time. The reviewer starts no subagents and no reviewers of its own.
- Keep a ledger: id, severity, outcome, and usage when the harness returns it. Leave usage out rather than guess it.

## 1. Scope

Run `git status --short`. Leave unrelated changes where they are: no stash, no discard, nothing of them in the review. Limit the review to the paths of this change when they separate cleanly; when they do not, stop and ask.

Find the base after `git fetch origin`:

- **A pull request**: `gh pr view <n> --json baseRefName,headRefOid`. Check out its branch only when the working tree is clean, and confirm `HEAD` is the PR head, or ahead of it only by this change. Base: `git merge-base HEAD origin/<baseRefName>`.
- **Local work**: `git merge-base HEAD origin/<default-branch>`. With no remote, the base the person names, or `HEAD` for uncommitted changes.

The change is the base against the working tree in those paths, untracked files included. Use the same diff command every round. State the intent and what is out of scope in one or two sentences. Run the checks that cover the change and send only code those checks accept; note in the brief any check that is missing or was already failing.

Done when you have the base, the diff command, the intent and the check results.

## 2. Start the reviewer

- **T3 Code**: call `orchestrator_capabilities` and pick the latest Sol, or the model the person named, without hard-coding an id. Each round is a new `delegate_task` with `role: "review"`, `mode: "async"` and a new `clientRequestId`; save its `taskId`. Review goes only through `delegate_task`.
- **Claude Code**: a subagent that runs Sol, such as the Codex plugin's agent, or the `codex` CLI. Keep its id to follow up.
- **Elsewhere**: the harness's native subagent on Sol.

When no route runs the reviewer, report the blocker. Another model in its place is not this skill. Record the provider, the model and the effort only when the harness exposes them.

While the review runs, leave the scoped files untouched and wait for the notice that it ended, without polling and without a second reviewer. A timeout, an error or no reply is not an approval: cancel, confirm it stopped and start again with the ledger.

Round 1 brief (a delegated child gets no history):

```text
Review only. Do not edit, commit, push, comment on PRs, or start subagents.
Repo: <abs path> Base: <sha> Intent: <intent> Out of scope: <scope> Checks: <results>
See: git diff <base> [-- <paths>]; git status --short (read untracked).
Read surrounding code. Find bugs, broken callers, mismatch with intent.
Skip style unless it hides a bug. Hold to the smallest change. Flag code,
tests, or guards the intent does not need. Other paths, rare cases, small
perf, extra compat: nits.
blocker = intended case wrong. should = real bug callers will hit, in intent. nit = rest.
Reply:
VERDICT: APPROVE or CHANGES
S1 [blocker|should|nit] <file>:<line> <claim>. Fix: <suggestion> (stable ids)
```

Done when the reviewer replied with a verdict.

## 3. Answer the findings

Check each finding and its severity yourself. Another path, a rare case or a small cost is a nit, whatever label it came with.

- **Agree**: make the smallest fix. Prefer deleting or narrowing code over a new lock, cache, helper or option. Fix the case that happened. Add one focused test that fails without the fix when the intent needs it.
- **Disagree**: say why, with evidence: file and line, a test, an output.
- **Out of scope, or a nit**: decline in one line and list it as a follow-up.

Update the ledger, run the checks again and `git diff --shortstat <base>`. When the review grew the diff, cut first. Agree only with what you believe; ending the loop is not a reason.

Done when every finding has an outcome in the ledger.

## 4. Next round

Start one only when budget remains and a blocker or a should is open, behaviour code changed, or the approval does not cover the current diff. In T3 Code use a fresh `delegate_task`; elsewhere follow up the saved id. Send the round 1 brief, the ledger (`fixed:`, `disagree:`, `declined:`, each with its evidence), the same base diff and what changed since the last round. Ask the reviewer to look only at the open ids and the changed code, and to mark each old id `resolved` or `still open: <reason>`.

## 5. Stop and report

- **Agreed**: APPROVE on the current diff, no blocker or should open, and no concern of your own.
- **Stuck**: an item is still disputed after two replies, or the budget ended. Show both sides in two or three lines each; the person decides. The end of the budget is not an approval.

Push nothing during the loop. Push after agreement only when the person asked to push, ship or update the pull request. When you update a pull request, add this line to its description, before the line that names the model and the harness:

`Reviewed with sol-loop: <N> rounds with <model>. Verdict: <approved | not approved: what stayed open>`

Add `on <effort>` only when you verified the effort. Write the verdict as it was, approved or not.

Report: the rounds, the model, what the review changed, the diff size before and after, the fixed and the declined findings with their reasons, usage when exposed, and whether you pushed.
