---
status: proposed
date: 2026-10-06
deciders: [Guilherme Lippert]
---

# The flow starts from Matt Pocock's skills, copied and adapted

## Decision

MarsAI's development flow follows Matt Pocock's design (grill-with-docs, handoff, prototype, to-spec, to-tickets, implement-spec, implement, code-review, retro). The skills are copied into MarsAI and adapted to our own setup: Linear, work across several repositories, the Design System, the backend standard and the house ADR format.

## Accepted trade-off

Improvements he publishes do not arrive on their own: bringing one in is our decision, by pull request.

## Rejected alternative

Ask the team to install his plugin alongside MarsAI. The adaptations do not fit in a third-party plugin, and we want a single installation.

## How to apply

- The copied skills keep the original name, so the team can use his videos and his documentation, and they are credited in `THIRD-PARTY-NOTICES.md` (his licence is MIT).
- Skills and commands are written in Brazilian Portuguese, as most of ours already are. Agents and Standards stay in English. Everything a person reads as a result (pull request, issue, message) comes out in Brazilian Portuguese by default. ADR 0011 replaced this language rule.
- Copying does not mean keeping it unchanged: each skill is read and adjusted by the team to its own way of working.
