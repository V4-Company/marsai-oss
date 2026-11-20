---
status: proposed
date: 2026-10-08
deciders: [Guilherme Lippert]
---

# The flow is open source; what is V4's alone lives in a team pack

> Amended by [ADR 0019](0019-sessions-start-in-the-home-repo.md): a team that keeps a Home Repo holds its own skills and Standards in the Home Repo's `.claude/` instead of a team pack. V4 does so today. The rule that the public side names no private system still holds.

## Decision

`marsai-core`, `marsai-dev`, the installer and the site are public, under the Apache 2.0 license, in their own repository. Everything that only makes sense inside V4, or that describes how V4's systems work, lives in plugins of a private marketplace: the V4 pack and the data plugins. A private plugin depends on the public core; the public side never names a private file.

The public repository starts from a clean history. The private one keeps the old history.

## Context

The repository was internal and mixed three things: the flow, which is worth sharing; V4's own conventions, which are useful as an example; and material that describes how production systems work. The history and the pull request discussions carry that third kind too, and deleting a folder does not remove it from history.

## Accepted trade-off

Two repositories to maintain, and someone at V4 installs from both. A rule that used to be one edit can now be two pull requests. Worth revisiting if the private pack starts to duplicate what the public side should own.

## Rejected alternative

Make the existing repository public after deleting the internal folders. The history, 33 branches and 37 pull requests would go public with it.

## How to apply

- A public file contains no internal address, no person's email and no description of how a V4 production system works. A reviewer checks this on every pull request.
- V4's own tools stay in the public text as what they are: the example of one team. The text says what the tool does and that another team can replace it with its own (Linear, V4's review bot, SonarQube).
- A team pack extends the public flow through names, never through paths: an implementer agent whose description says which repositories it covers, a skill whose description starts with "Standards extension", a hook with the team's own guard.
- The installer reads what each plugin declares about itself (`.marsai-plugin.json`, `.marsai-dependencies.json`), so removing a plugin folder removes every trace of it.
- A version is one number for everything public. See [RELEASING.md](../RELEASING.md).
