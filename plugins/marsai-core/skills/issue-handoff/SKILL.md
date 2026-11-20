---
name: issue-handoff
description: "Passes a PR (or work in progress) to the team to take over. Creates a Linear issue with the full context (problem, what the PR does, real state, what is left out, the author's intent and the deadline) and drafts a short message for the team chat pointing to it. Use when the user asks for a 'PR handoff', to 'pass it to the team', to 'open an issue for this PR', to 'put it in Linear and tell people', or wants someone else to take a PR to merge."
argument-hint: "[pr-url]"
---

# Issue handoff

Transfers ownership of a PR to the team. The **Linear issue** is the source of truth (everything someone needs to take over without talking to the author). The **chat message** is only the pointer to the issue.

## When to use

- The author opened a PR and wants someone else to test it, adjust it and take it to merge.
- The author solved a problem that came up in real use, but will not carry on with the PR.
- The user asks to "put it in Linear" and "tell people" about a PR.

## When to skip

- The PR already has an owner and is in normal review → use `marsai-core:babysit-pr`.
- There is no PR or branch with code yet → open the PR first (`/marsai-core:pr`).

## Principle: real state, nothing invented

Whoever takes over will trust what is written. A false "tested" costs more than an "I did not test".

- Write that a check, test or validation passed only if you **saw** the result (CI on GitHub, command output in this session).
- Say explicitly what was **not** done (e.g. "I did not test in the browser").
- Limitations and known cases go into the issue; they do not stay hidden in the PR.
- Intent and deadline are the author's. If they are not in the context, **ask**: never invent them.

## Step 1: gather the context

Run in parallel and read the result:

```bash
gh pr view <pr> --json number,title,url,body,headRefName,baseRefName,state,mergeable,reviewDecision,statusCheckRollup
gh pr diff <pr> --name-only
gh pr view <pr> --comments          # reviews from bots (the review bot, SonarQube) and from people
```

Extract:

| Item | Where it comes from |
| --- | --- |
| Problem | PR description, conversation with the user |
| What the PR does | Description + diff (behaviour, not an inventory of files) |
| Real state | Checks on the latest commit, count of tests you saw run, latest review bot score and open findings, unresolved threads |
| Manual validation | Only what was really done (where and with which data) |
| Left out | Notes and follow-ups of the PR, known limitations |
| Open decisions | Choices the next owner has to make |
| Author's intent | Why this PR exists: the real use that motivated it |
| Deadline | From the author; default "Undefined" if they say it is not urgent |

If **intent** or **deadline** is missing, ask with `AskUserQuestion` before creating the issue.

If the PR already references a Linear issue, **update or comment on that issue** instead of creating a duplicate.

## Step 2: create the issue in Linear

Use the Linear tools available (the Linear MCP). Ask for the Linear **team** if it cannot be inferred from the repository or from issues already linked.

- **Title:** the problem or the result, not "Handoff of PR #123". E.g. `Chat: send several messages in parallel without cancelling replies`.
- **Assignee:** nobody: whoever picks it up assigns themselves. Do not assign it to anyone unless the user asks.
- **Priority:** consistent with the deadline (no urgency → low or no priority).
- **Link:** attach the PR URL to the issue.

Issue body, in the language the repository already uses, in this order:

```markdown
**PR:** <PR url>

## The problem
<1 to 3 concrete bullets: what the user tries to do and what happens>

## What the PR does
<1 to 3 behaviour bullets; say what did NOT change if it is relevant (e.g. "front end only; the backend stays the same")>

## Real state
- CI: <green/red on the latest commit>; <N> tests passing <(which ones, if relevant)>
- Review bot: <score>/5, <open findings or "no open finding">
- Manual validation: <what was done, where, with which data>
- ⚠️ <what was NOT tested / what is missing>

## Left out
<limitations and known cases the PR does not solve>

## Open decisions
<only if there are any; each one with the author's recommendation>

## Author's intent
<why the PR exists, in the author's words>

## How to take over
From here on it is the team's. It is not to be reviewed and handed back to the author: whoever picks it up takes over, tests, adjusts and takes it to merge, in their own time. If someone has a better or more efficient solution, they can discard this PR without regret: what matters is that the problem gets solved, not this code.

**Deadline:** <deadline or "Undefined (not urgent)">
```

Omit empty sections (e.g. no open decisions). Keep each bullet short.

## Step 3: link the issue in the PR

Add the issue to the PR so the automated reviewers find the context: edit the description (`gh pr edit <pr> --body-file ...`), adding `**Linear:** <issue url>` at the end and preserving the rest of the body.

## Step 4: message for the chat

Short: whoever reads it decides in 10 seconds whether to pick it up. The detail is in the issue.

```text
Hi all, I opened an issue for someone to take over: <issue title>
<issue url>

<1 sentence: the problem and what the PR already does.>
<1 sentence: what is missing (e.g. manual test on the preview) and the state (e.g. CI green).>

Whoever picks it up takes over and takes it to merge: you can adjust or discard the PR if you have a better solution. Deadline: <deadline>.
```

**Do not send the message on your own.** Sending a message on the user's behalf requires explicit confirmation. Deliver the text ready to paste; if a chat tool is connected, ask before sending.

## Without access to Linear

If the Linear MCP is not available or not authenticated:

1. Tell the user so, and how to authorise it (claude.ai connectors, or `/mcp` in an interactive session).
2. Deliver the issue title and body ready to paste (and save them in a `.md` file).
3. Deliver the chat message with `<issue url>` as a placeholder.
4. **Never** say the issue was created.

## Anti-patterns

| Wrong | Why | Right |
| --- | --- | --- |
| "Tests passing" without having seen the result | Whoever takes over trusts it and skips validation | Cite only checks and tests you saw; say what did not run |
| Hiding limitations so the PR looks ready | The next owner finds out in production | An explicit "Left out" section |
| Pasting the whole issue into the chat | Nobody reads it; the chat becomes a duplicate source | Short message + link |
| Inventing intent or deadline | It is the author's decision | Ask |
| Assigning the issue to someone on your own initiative | A handoff is an invitation, not an imposed delegation | Leave it unassigned |
| Creating a new issue when the PR already has one | Fragmented context | Update the existing issue |
