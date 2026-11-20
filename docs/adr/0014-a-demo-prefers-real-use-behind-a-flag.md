---
status: accepted
date: 2026-10-13
deciders: [Guilherme Lippert]
---

# A demo prefers real use behind a flag

Replaces the environment rule of [ADR 0013](0013-demos-use-the-smallest-safe-environment.md). The safeguards of a production experiment, the two phases and the seven gates stay.

## Decision

Choose where a demo runs in this order:

1. **Production, behind a feature flag, for selected users.** The answer comes from real use, where the feature will live.
2. **Development, with the user using it directly.**
3. **A working demo outside the codebase.** The last resort: it tests the idea and says nothing about how it fits the system.

A demo ends in one of four decisions, and only one moves the work on: it fulfills the intent and goes to hardening. Otherwise another round is built from the feedback, the work goes back to the grill and then to another demo, or the idea is dropped.

## Context

ADR 0013 ranked the environments by size, smallest first. A demo is worth what the user's reaction is worth, and that reaction can be trusted most where the feature will really be used. The order now follows how much the answer can be trusted.

## Accepted trade-off

A flagged experiment in production costs more preparation than an isolated screen: approval, a restricted audience, protected data, a rollback and the safety checks for that exposure. A demo outside the codebase is cheap and its code is not reused: hardening builds the v1 from scratch, and the fit with the system is still unproven. Worth revisiting if flagged demos start reaching everyone before hardening.

## How to apply

- `marsai-dev:demo` proposes the highest option on the list that the feature allows, and records in the issue which one was used and why a higher one was not.
- A production experiment keeps every safeguard of ADR 0013: the owner's explicit approval, the flag off for everyone else, a restricted audience, protected data, an agreed rollback and the safety checks for that exposure. It still goes through the spec and hardening before general release.
- After a demo outside the codebase, `marsai-dev:to-spec` treats every part as rewritten and names the integration as a risk.
- Gate G3 records which decision was taken.
