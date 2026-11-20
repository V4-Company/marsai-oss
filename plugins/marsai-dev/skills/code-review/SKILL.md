---
name: code-review
description: "Reviews a branch diff on two axes: Standards (does the code follow the team's standards and the repository's?) and Spec (does it do what the ticket asked?). The reviewer fixes and commits what violates the standards and reports what needs a decision. Use when an implementation is finished, before opening the PR, or when someone asks for a branch to be reviewed."
argument-hint: "[base to compare against; default origin/main]"
---

# Code review

Two axes, reviewed separately so that one does not hide the other:

- **Standards**: does the code follow the documented standards? The reviewer fixes and commits.
- **Spec**: does the code do what the ticket asked, built the way the technical refinement designed it? A report comes out.

Code that follows every standard and implements the wrong thing passes the first and fails the second. The opposite happens too.

## 1. Fix the comparison point

The base is the one the person named; with none given, `origin/main`.

```bash
git fetch origin <base> --quiet
git diff origin/<base>...HEAD            # three dots: only what the branch changed
git log origin/<base>..HEAD --oneline
```

In a session that runs in a Home Repo, run these commands in the worktree of the repository under review (`git -C <worktree>`), not in the home.

If the diff is empty, stop and say so. If there is an uncommitted change that is part of the delivery, commit it first (`/marsai-core:commit`): the reviewer works on commits, and its fixes go in as separate commits.

A diff that is only documentation, formatting or generated files needs no review: say that you skipped it and why.

## 2. Find the spec

In this order: the ticket in the conversation; the Linear identifier in the branch name, in the commits or in the PR description; whatever the person points to. Read the issue and the technical refinement on the parent issue. Take from the refinement its program design: the pieces, their signatures and where they plug in. It is the standard of this delivery (ADR 0016). If there is no spec, the Spec axis is skipped and the report says so.

## 3. Gather the standards

- **The repository's**: `CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`, `CODING_STANDARDS.md`, `CONTEXT.md` and `docs/adr/`, whichever exist.
- **The team's, by the stack of the diff**: load every available skill whose description starts with "Standards extension". It belongs to the team pack and lists the standards files for each stack. With no such skill installed there are no team standards: say so in the report and review against the other two.
- **The baseline**: [SMELLS.md](SMELLS.md), which applies even where nothing is documented.
- **The delivery's**: the program design from step 2, when the refinement has one.

A documented repository rule overrides the team's standard, and the team's standard overrides the baseline. The program design decides the structure of this delivery; where it contradicts a documented rule, report it instead of choosing. What lint and typecheck already enforce is left out. A section a standards file marks as unverified is not applied.

A standards file that is listed and cannot be read is not replaced by memory: say that the standard could not be read.

## 4. Dispatch the two axes in parallel

In a single message:

**Standards**: the `marsai-dev:code-reviewer` agent. Pass the diff command, the commit list, the absolute path of each standards file from step 3, the program design as text and the repository's Check Command (the one script that runs lint, typecheck and tests; without one, the lint, typecheck and test scripts).

**Spec**: the `Explore` agent, read-only. Pass the diff command, the commit list, the content of the spec and this request: "Report (a) a spec requirement that is missing or half done; (b) behaviour in the diff that nobody asked for; (c) a requirement that looks implemented but is wrong; (d) structure that departs from the program design: a piece that is missing, a signature that differs, a call that takes another path. Quote the line of the spec in each finding. Up to 400 words."

## 5. Put the result together

Present the two reports under `## Standards` and `## Spec`, without mixing or reordering across axes.

- Under **Standards**: what was fixed, with the commits, and what is waiting for a decision.
- Under **Spec**: the findings. A missing or wrong requirement goes back to implementation; extra behaviour is the person's decision. Structure that departs from the program design goes back to implementation too, when the reviewer did not already bring it back. When the person asked for the change, the refinement is updated on the issue and approved by the tech lead before the PR is ready: say what has to be written.

When the diff changes an event, a route or another contract, check in the event catalog who consumes it (through its MCP, when one is connected) and take the result to the `blast_radius` dimension.

Then classify what **stayed open** in the six dimensions of the example review bot rubric, and calculate the predicted score, following [REVIEW-BOT.md](REVIEW-BOT.md). What the reviewer already fixed does not count.

Close with one line: how many findings per axis, the worst of each and the predicted score.
