---
status: proposed
date: 2026-10-06
deciders: [Guilherme Lippert]
---

# MarsAI is the single source of the Standards

## Decision

The source of the coding Standards is MarsAI, because that is what the Reviewer reads. One set applies to every repository; the other sources now point to it.

## Context

The Standards had four sources: `typescript.md` and `frontend.md` in MarsAI, the coding standards pages of the internal documentation site, the guides of the team's generator and a server template document in the old, discontinued marketplace. The texts had already diverged.

## Rejected alternative

One standards file per repository, as Matt Pocock suggests. With 80+ repositories, many of them on the same architecture, that would be a lot to maintain, and the bar would no longer be the same for everyone.

## How to apply

- A rule specific to one repository can still exist in that repository's documents (`CLAUDE.md`, `AGENTS.md`, ADRs), and it wins over the general Standard.
- The guide command of the team's generator fetches the document from MarsAI.
- The standards pages of the internal documentation site get a notice pointing to MarsAI.
- The official folder names are those of the server template (`dtos/`, `usecases/`). The generator follows the folders the repository already uses, so it does not create a second set beside them.
- The review bot should read the same Standards, so the bar on the pull request is the bar of the review.

Since ADR 0012 the V4 Standards live in the V4 pack; the rule that they have one source stands.
