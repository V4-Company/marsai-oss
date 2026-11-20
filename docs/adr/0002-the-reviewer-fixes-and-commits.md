---
status: proposed
date: 2026-10-06
deciders: [Guilherme Lippert]
---

# The Reviewer fixes and commits; it comments only when in doubt

## Decision

The Reviewer applies the fixes and commits them. It leaves a comment only when the fix depends on a person's decision.

## Context

The rule in force was "Reviewers REPORT, Agents FIX": the Reviewer could not edit files or run tests, it only returned a report. A report becomes work for the human (read, decide, dispatch again); a commit hands the Human review a diff that is already better.

## How to apply

- The Reviewer can edit files and run the Check Command.
- The fixes go into commits separate from those of the implementation, so what the review changed can be seen.
- The review bot still comments on the pull request. Having the bot fix as well is a separate decision.
