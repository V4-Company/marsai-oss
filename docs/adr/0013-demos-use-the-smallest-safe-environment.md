---
status: superseded
date: 2026-10-10
deciders: [Guilherme Lippert]
superseded_by: ADR-0014
---

# Demos use the smallest safe environment

The order of preference below is replaced by [ADR 0014](0014-a-demo-prefers-real-use-behind-a-flag.md); the safeguards of a production experiment remain.

Amends the environment restriction of ADR 0010; retains its two phases and seven gates.

## Decision

Validate value before full technical refinement. The demo can be an isolated screen, a development preview or a protected production experiment. Choose the smallest environment that lets a real user test the hypothesis.

A production experiment needs the owner's explicit approval, a feature flag off for other users, a restricted audience, protected data, an agreed rollback and the safety checks required for that exposure. Production writes need explicit approval. A successful experiment still goes through the spec and hardening before general release.

## Context

The manifesto allows a demo in production behind a flag when the problem needs real use there. ADR 0010 and the demo skill previously prohibited every production experiment. This made the installed flow contradict the guidance.

## Accepted trade-off

A production experiment requires more preparation than an isolated demo. Use it when that exposure is necessary to answer the value question; keep the broader architecture and refinement work after validation.

## How to apply

`marsai-dev:demo` agrees the environment and boundaries with the owner. The issue records the audience, data safeguards, approval and rollback alongside the feedback and decision. `marsai-dev:to-spec` then cuts the v1 and plans its general release.
