---
status: proposed
date: 2026-10-06
deciders: [Guilherme Lippert]
---

# Standards are applied at review, not at implementation

## Decision

The Implementer only makes the code work: it explores, writes and debugs. The Reviewer, which receives a finished diff and has context to spare, reads the Standards in full and fixes the diff.

## Context

The Implementer loaded `typescript.md` (3,037 lines) before writing code, and the Reviewer did not read that file. Whoever explores, writes and debugs already has a crowded context window, and too many rules there make the result worse.

There was also a basic defect: the Implementer fetched the Standards from a GitHub URL, but the MarsAI repository was internal and that URL returns 404 to anyone who is not authenticated, as is the case with the agent's fetch tool. The most emphasised step of the old design could never have worked.

## Accepted trade-off

The code that comes out of the Implementer may violate a Standard. That is expected and is fixed at review, so implementing without reviewing is no longer a valid path.

## Rejected alternative

Keep the Standards in both places. That is what was happening: in two internal pull requests, each new rule went into the standard, into the Implementer's list of prohibitions and into the review bot's prompt. Three copies to keep in sync.

## How to apply

- A rule about how code should be written goes into the Standards, never into an Implementer's prompt.
- A mechanical rule (a syntax pattern, a forbidden API, an import format) does not go into the Standards: it becomes a Check.
- The Reviewer reads the Standards from disk, from the installed plugin.
- In the backend, the shape of the code comes from the team's generator, which runs in every service built on the team's backend library, and from the team's reference code. That is what lets the Implementer get the structure right without reading the Standards: it comes out right because it was generated, not because a rule was read. Using the generator is optional until its corrected version is published. The generator and the reference code moved to the team pack with ADR 0012.
