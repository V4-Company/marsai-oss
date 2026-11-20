# ADR format

An ADR is the short record of a decision: the intent at one moment of development, and what to do because of it. The code shows how things ended up; the ADR keeps why they ended up that way and what cannot be undone without thought.

It lives in the repository's `docs/adr/`, numbered in sequence: `0001-slug.md`, `0002-slug.md`. For the next number, take the highest that exists and add one.

## Template

```md
---
status: proposed | accepted | superseded
date: YYYY-MM-DD
deciders: [who decided]
superseded_by: ADR-NNNN        # only when the status is superseded
---

# {The decision, as a short statement}

## Decision

{What was decided, in the active voice. It comes first: whoever opens the file wants the rule before the story.}

## Context

{The situation that called for the decision and what was at stake.}

## Accepted trade-off

{What the decision gives up, and the sign that it is worth revisiting.}

## Rejected alternative

{The option that seemed natural, and why it was not chosen.}

## How to apply

{What changes in practice: in the schema, the code, the vocabulary, the process. It is the section that whoever implements and whoever reviews consult.}
```

**Decision** and **How to apply** always appear. The others go in when they have something to say. An ADR can fit in ten lines.

## When to write one

The three conditions together:

1. **Hard to undo**: changing your mind later is expensive.
2. **Surprising without context**: whoever reads the code will wonder why it was done this way.
3. **The result of a real trade-off**: there was a real alternative, and one was chosen for a reason.

A decision that is easy to revert does not need an ADR: revert it. Neither does a decision that surprises no one.

## What usually qualifies

- **A domain invariant another team has to respect**: "an instalment is never paid twice", "a cancelled subscription does not charge". It is the rule that someone from outside the context has no way of guessing.
- Shape of the architecture: "the write model is event-based, the read model is projected into Postgres".
- Integration between services: "billing and payments talk through events, never through synchronous HTTP".
- Technology that locks you in: database, broker, authentication provider.
- Boundary and scope: "customer data belongs to the customers service; the other services keep only the id". The explicit "no" is worth as much as the "yes".
- A deliberate departure from the obvious path, so that nobody "fixes" it later.
- A constraint the code does not show: compliance, a contract with a partner, a provider's limit.

## When the decision changes

Write a new ADR that replaces the old one, and mark the old one with `status: superseded` and `superseded_by`. The text of the old one stays as it is: the history of why people thought differently is information too.

## Making sure the ADR is read

An ADR is only worth something if it is read at the right time. The repository's `AGENTS.md` or `CLAUDE.md` lists, among what to read before touching the code, the ADRs relevant to the task. The spec, implementation and review skills do that reading, including in the repositories of another team that the change touches.
