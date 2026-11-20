---
name: open-pr
description: "Opens a reviewable pull request from the current branch and writes its description. Use when someone asks to open, create or push up a PR, and when they ask to improve or rewrite the description of a PR that already exists."
---

# Open PR

Open a PR the reviewer understands in one minute.

## Before opening

1. Identify the repository, the branch, the remote and the base branch. In a session that runs in a Home Repo, that is each repository the work touched, from its worktree: one pull request per repository.
2. **See whether a PR already exists for this branch.** If it does, the job is to update its description: follow the section "A PR that already exists".
3. **Read the whole diff** against an up-to-date `origin/<base>` and confirm that it delivers what was asked, and only that.
4. **Read the repository's PR template** and a few recently merged PRs, to follow the convention there.
5. If there is a change to commit, use `/marsai-core:commit`. Push the branch.

In production code, the PR comes after the review (`marsai-dev:code-review`). If it has not run on this branch yet, run it first. A draft PR is the exception: it opens with the work in progress, and the review runs before it leaves draft.

## Title

A PR title usually becomes a commit message: follow the repository's convention. It says why the change matters, in the language the repository already uses, with the type and the technical identifiers in the form in which they are already used.

- Bad, only names an area: `Hotfix/contracts`
- Bad, describes the mechanics: `refactor(opportunity): enhance active contracts API response parsing`
- Good, says the behaviour that was fixed: `fix(customers): company history link respects the opportunity type`

## Description

Write the body following [BODY.md](BODY.md): structure, writing rules, evidence, merge danger and diagrams. Read it before writing.

- If the repository has a PR template, the template's sections take precedence, and the BODY.md rules apply inside them. Delete the template instructions that are left unfilled.
- **Say that a check passed only if you saw it pass.** Separate what was validated locally from what still depends on CI.
- Include the Linear issue and the call or transcript references that are in the context, so the automated reviewers find the context. Do not invent a reference and do not expose sensitive transcript content.
- A draft PR gets a short description, with what it will deliver and what is still missing. The full body goes in when it leaves draft.

At the end of the description, after everything and outside the `<details>`, a note with the real model and harness of this session. If a value is not available, say so instead of guessing.

```text
---

Changes prepared with [MODEL] via [HARNESS].
```

If the agent only prepared the PR: `PR prepared with [MODEL] via [HARNESS].`

## Open and deliver

- An open PR, not a draft, so the automated reviewers run. A draft (`--draft`) only on request.
- Write the body to a file, never inline in the command, and mark the command, as the guard hook requires:

  ```bash
  MARSAI_PR_SKILL=1 gh pr create --base <base> --title "<title>" --body-file <file>
  ```

  In PowerShell, where Codex runs commands on Windows, the marker is a statement first: `$env:MARSAI_PR_SKILL=1;` before the same command.

- Return the URL and say what is still pending validation.
- If the harness has a tool to link the PR to the conversation, use it.
- The merge is the person's.

If you were also asked to follow the PR, continue with [babysit-pr](../babysit-pr/SKILL.md).

## A PR that already exists

To rewrite a description that has become a wall of text, or to complete it when the PR leaves draft:

1. Read the whole diff and the current description.
2. Write the new body following [BODY.md](BODY.md), to a file.
3. Publish with `gh api -X PATCH repos/<org>/<repo>/pulls/<n> -F body=@<file>`. `gh pr edit` rewrites other fields.
4. If the PR is in draft and the work is finished, take it out of draft with `gh pr ready <n>`.

Done when the verification at the end of BODY.md passes on the published description.
