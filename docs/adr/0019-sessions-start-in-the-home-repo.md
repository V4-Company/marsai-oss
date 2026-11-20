---
status: accepted
date: 2026-11-12
deciders: [Guilherme Lippert]
---

# Sessions start in the team's Home Repo

## Decision

A team whose work spans several repositories keeps one Home Repo and starts every agent session there, whatever repository the work is in. The Home Repo holds what the team shares: the entry file every harness loads, a pointer to each repository (grouped by area once there are more than about 20), a wiki of the system, the team's tools, and the team's skills, agents, Standards and guards in `.claude/`. Each repository keeps only what is true of it alone: its code, the agent instructions about that code, how to build and test it, its glossary and its decisions.

What lives in the Home Repo's `.claude/` reaches every session started there with no install, and a `git pull` is the update. MarsAI itself can arrive two ways: as the public plugins, enabled by the Home Repo's settings and installed once per person, or copied into the same `.claude/`, next to the team's own skills.

`marsai-core:home-repo` sets up and keeps a Home Repo for any team. The idea and its first setup prompt come from Matt Pocock's [The Home Repo Pattern](https://www.aihero.dev/the-home-repo-pattern); the skill restates the setup for a team that uses MarsAI.

## Context

At V4 Company, about 40 people work across 80+ repositories. An agent started inside one of them knows that repository and nothing else: a feature that crosses three services is planned from a third of the picture, and the skills and rules the team relies on end up copied into each repository. A survey in November 2026 found the same nine skills and thirteen rule files repeated in six services, one of them already different in every copy, and about fifty repositories with no agent instructions at all.

V4 first shipped MarsAI as plugins that every person installed on every machine, plus a team pack for what was V4's alone. That worked for one repository at a time, and it left two ways to receive a skill: the plugin installer for the flow, and nothing at all for the knowledge that crossed repositories. V4 then moved to one Home Repo, Home MarsAI, where every session starts. It holds the pointers to every repository, a living wiki of the system, V4's Standards, and MarsAI's skills inside `.claude/` (and `.agents/skills` for Codex). A change to the flow or to a Standard reaches the whole team with the next `git pull`, with no installer involved.

## Accepted trade-off

A session started in the Home Repo does not load the settings, hooks, skills or instructions of the repositories it reaches. The entry file tells the agent to read a repository's own AGENTS.md before changing it, and the guards that matter move into the Home Repo's settings. The clones sit outside the Home Repo's folder, so each person grants the harness access to them once. The pointers and the wiki can drift from the repositories: a tool refreshes what can be measured and a check in CI fails when the rendered files drift, but the written notes are only as good as the last person who fixed them.

A team that copies MarsAI into its Home Repo has no MarsAI in a session started anywhere else, and takes upstream changes by hand, the way it bumps any other dependency.

Worth revisiting if sessions keep starting inside single repositories anyway, or if the wiki is found wrong more often than it helps.

## Rejected alternatives

- **A monorepo.** It would remove the problem, and fits a team that can have one. Repositories with separate deploys, owners or visibility usually cannot move.
- **Copies in every repository.** That is the situation the survey found: the copies drift, and nobody knows which one is right.
- **The user folder** (`~/.claude/skills`). Invisible to the team, it falls behind, and it is where each person keeps how they like to work, not how the team works.
- **Git submodules.** Fine for five to ten repositories; plain pointers do the same job without them.

## How to apply

- To try MarsAI on one repository, install the public plugins or run the installer from `V4-Company/marsai-oss`. Nothing here is required for that.
- To scale to a team, run `/marsai-core:home-repo`: it inventories the repositories and the shared material, agrees a plan with the person and applies it. Its `LAYOUT.md` holds the conventions (`<root>`, one clone per repository, one worktree per piece of work) and the optional step of keeping MarsAI itself inside the Home Repo.
- `marsai-core:marsai-mode`, `marsai-core:grill-with-docs` and `marsai-dev:implement` find the repositories through the Home Repo's pointers when the session runs in one.
- A term or a decision that no single repository owns goes into the Home Repo; one that a repository owns stays in that repository.
- The team's own setup, recorded by `marsai-core:using-marsai`, lives in the Home Repo instead of in each repository.
