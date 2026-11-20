---
status: proposed
date: 2026-10-06
deciders: [Guilherme Lippert]
---

# Skills and agents are written without a commanding tone

## Decision

`marsai-core` and `marsai-dev` are written with short, affirmative instructions. Every agent answers three questions: what it does, when it stops and asks, and what it returns. The discipline that used to be in the text moves to the Brakes: Checks and the Reviewer.

## Context

`CLAUDE.md` required every agent to have five sections in a commanding tone (MUST and FORBIDDEN, blocking criteria, severity calibration, resistance to pressure and a table of forbidden excuses).

- An internal audit in September 2026 had already classified that tone as noise with no effect.
- `using-marsai`, the skill "mandatory before any task", said to always delegate to an agent and, at the top, said to delegate in three cases only. The two instructions lived in the same file.
- That same skill had had a broken header since at least 16 September 2026 and loaded with no description. Nobody noticed a difference.
- Our skills equivalent to Matt Pocock's had close to 500 lines; his have close to 40.

## Rejected alternative

Rewrite only the files on the main path and leave the rest in the old tone. The team would be left with two styles and no rule for the next file.

## How to apply

- The writing rules are in `CLAUDE.md`, in the section "Writing skills, agents and commands".
- The data plugins, which are private, stay out: they are reference material for data, with other owners, and do not have this problem.
- Whoever wants to restore a MUST or a table of excuses to an agent first shows that the affirmative instruction failed.
