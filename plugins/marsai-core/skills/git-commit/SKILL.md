---
name: git-commit
description: "Organises the working directory into atomic, signed commits in the conventional commits format. Use when someone asks to commit, or at the end of a task that needs to go into the history."
argument-hint: "[message]"
---

# Git commit

Turn the working directory into atomic, coherent commits.

## 1. See what changed

```bash
git status
git diff
git diff --cached
git log --oneline -10      # the repository's message style
```

If a merge is in progress, stop and say so: history is linear here, and integration is done with `git rebase <base>` and `git push --force-with-lease`.

## 2. Group

One commit per logical change:

- implementation together with its tests;
- dependencies (`package.json` and lockfile) in their own commit;
- refactoring with no change in behaviour, separate from features and fixes;
- documentation last, describing the final state.

Order them so the history makes sense read from top to bottom: dependencies, then the core, then what consumes it.

If the person passed a message as an argument, it is a single commit, with that message.

## 3. Show the plan and confirm

List the proposed commits, each with its message and files, and ask with `AskUserQuestion`: run the plan, put everything in one commit, or adjust. When the caller has already defined the grouping (`implement-spec`, with one commit per slice), go ahead without asking.

## 4. Commit

Message in the format the repository already uses. With no visible format, conventional commits: `<type>(<scope>): <subject>`, subject in the imperative and up to 50 characters; optional body explaining the reason.

```bash
git add <files of this commit>
MARSAI_COMMIT_SKILL=1 git commit -S \
  -m "<type>(<scope>): <subject>" \
  -m "<body, if needed>"
```

- **The marker goes in front of the command.** The guard hook checks for `MARSAI_COMMIT_SKILL=1` before `git commit`. In PowerShell, where Codex runs commands on Windows, set it as a statement first: `$env:MARSAI_COMMIT_SKILL=1; git commit ...`.
- **A trailer the team requires** goes in its own `--trailer` argument, after every `-m`. A team guard that rejects the commit says which one is missing.
- **No tool signature** in the message: no "Generated with", `Co-Authored-By`, emoji or hashtag.
- **`-S` signs the commit.** If no key is configured (`git config user.signingkey`), commit without `-S` and say so.
- **The pre-commit hooks run.** If one fails, fix the cause.

## 5. Verify

```bash
git log --oneline -<n>
git status
```

Ask whether the person wants to push. On a branch with no upstream: `git push -u origin <branch>`.
