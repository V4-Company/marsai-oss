---
name: home-repo
description: "Sets up and keeps a team's Home Repo: the one repository where every agent session starts, holding the shared steering files, docs and tools, with a pointer to each of the team's other repositories. Use when a team whose work spans several repositories has no Home Repo yet, when the same skills or agent instructions are copied across repositories, when someone asks for a home repo, or to add a repository, an area, a wiki page or a tool to one."
---

# Home repo

A Home Repo is one repository that holds what the team shares (the steering files, the docs, a wiki and the tools) and a navigation pointer to each of the team's other repositories. Every agent session starts there, so every session has the same setup and the whole picture, and one session can change several repositories. The code stays where it is: each repository keeps its history, checks, issues and pull requests.

The idea comes from Matt Pocock's article [The Home Repo Pattern](https://www.aihero.dev/the-home-repo-pattern) on AI Hero, which also offers a setup prompt. This skill keeps the same four-step arc in MarsAI's own words and adds what a team that uses MarsAI needs: activity measured from merged pull requests, a fifth bucket for what is personal, the team's skills and Standards inside the home, where every session started there loads them with no install and `git pull` updates them, worktrees kept beside the clones, and settings that give every session the same plugins and guards. The layout is in [LAYOUT.md](LAYOUT.md).

## How you work

- Gather the facts on your own from the file system, `git` and `gh`, and hand broad searches to subagents. What reaches the person is decisions, nothing else.
- Ask in rounds, in the format of `marsai-core:grill-with-docs`: number the questions, put your recommendation on each, and phrase it so a plain "yes" adopts it. Hold back any question whose answer hinges on another that is still unresolved; it belongs to a later round.
- Make no change before the person signs off on the plan (step 3). Up to then the work is read-only.
- Never open `.env` or any other file that holds secrets, and keep anything that resembles a credential out of your notes.

## 1. Inventory the repositories

Find every repository the team works in: the clones on disk and, for a team, those of its organisation (`gh repo list <org> --limit 1000`). For each, record its path, remote, visibility, default branch and activity: the pull requests merged in the last 30 days and by how many people (`gh search prs --owner <org> --merged-at <from>..<to>`, in windows small enough to stay under the search's 1,000 results; leave bots out). Activity is a better sign than the last push, which bots and archived repositories distort.

In the first round, ask:

- which repositories the home covers (suggest those with merged pull requests in the last 30 days, plus the libraries and infrastructure they depend on);
- where it lives (recommend a new private repository beside the others; an existing repository fits when it already holds the team's shared material, such as the repository its skills come from, and its entry file then becomes about the team's work);
- whether it belongs to one person or to the whole team;
- which entry file the team's harnesses read when a session opens, AGENTS.md, CLAUDE.md or the pair of them (suggest whichever the repositories use today).

Done when each repository on the list is either included or excluded, and the remaining three questions have answers.

## 2. Inventory the shared material

Go through the selected repositories and the user folders (`~/.claude/skills`, `~/.codex`) and collect the skills (any folder containing a `SKILL.md`), the agent entry files (AGENTS.md, CLAUDE.md), the rules folders (`.claude/rules`, `.cursor/rules`), the settings files with hooks or permissions, and the docs written for agents, such as Standards, glossaries and ADRs. Compare by content, not by name: the GitHub tree API gives each file's blob sha, and two equal shas are the same file.

Give each item exactly one of these labels:

- **shared**: applies to all of the repositories;
- **duplicate**: one item living in more than one place; diff the copies and flag the most recent;
- **repo-specific**: concerns a single repository's code, commands or domain;
- **installed**: from a published marketplace, such as MarsAI;
- **personal**: how one person works; it stays in their user folder.

Done when no item is left unlabelled and none carries two labels.

## 3. Agree the plan

Lay out a table with one row per item: its current location, its label and where it will go:

- **shared and duplicate**: one copy, the newest, in the home. A skill, an agent, a command or a hook goes into the home's `.claude/`, so that every session started there has it with no install; a Standard or an implementation guide is a skill there too, whose description starts with `Standards extension:` or `Implementation guide:`, and a rule a reviewer applies is a Standard (ADR 0001). A steering file, a doc or a tool goes to the home as well. When the team also needs them outside the home (sessions started in another folder, Cursor), a team pack carries them instead, through the installer.
- **repo-specific**: stays in its repository.
- **installed and personal**: stay where they are.

Under the table, show the home's entry file: a short intro, how a session reaches the repositories (the conventions in [LAYOUT.md](LAYOUT.md)), and an "Other repositories" section with one pointer per repository. Beyond roughly 20 repositories, split the pointers by business area, one file each, and let the entry file link to those area files.

Settle what is still open in further rounds. Done when the person approves the table and the entry file.

## 4. Apply the plan

1. Create the home, or its part inside the repository chosen in step 1, with the layout of [LAYOUT.md](LAYOUT.md): the entry file, the pointer files (written by hand at first), the settings that enable MarsAI and carry the guards in every session, and a check in CI that every pointer and link resolves.
2. Copy each shared item to its destination, keeping skill folders whole. What lives in the home needs no version: people receive it with `git pull`. A change to a team pack bumps its version.
3. In each repository that had a copy, on a new branch, remove the copies that moved, in one pull request per repository linked to the home's. Leave the repo-specific material in place.
4. Record the home's changes as commits and open its pull request with `marsai-core:open-pr`. Pushing the branches of the other repositories is the person's call.

Done when each row in the table has been carried out, or shows as skipped together with the reason. Report each row's outcome and the branches you created in each repository.

## Keeping it alive

- **A new repository** gets its pointer in the file of its area: what it is, its path, where to clone it from, and a hint when it needs one ("its ADRs live in `docs/decisions/`").
- **What a session learns** goes where it is true: about one repository, into that repository; across repositories, into the home's wiki; a skill or Standard everyone uses, into the home's `.claude/` (or the team pack, when the team keeps one).
- **What can be measured is refreshed by a tool**, on a schedule: status, activity, which repositories have agent docs. The person decides the rest.
- **A finding that repeats across repositories** becomes a line in the home, a check or a Standard, through `marsai-core:retro`.

## For a team

- Everyone starts sessions in the home: for a team, it is the thing everyone shares. Each person keeps their own preferences in their user folder.
- A session started in the home does not load what the repositories it reaches hold for agents; [LAYOUT.md](LAYOUT.md) says what carries their instructions and guards instead.
- Each area owns its pointer file and its wiki pages, and changes them by pull request, like code.
- The entry file is about the team's work. When the home is also the repository of something the team maintains, such as its fork of MarsAI, the rules for changing that go into a doc the entry file points at: a session that reads maintenance rules first takes every request for a change to the tool.
- When the team can have a monorepo, it does not need a home. The home is for when it cannot: public and private repositories side by side, or a team that will not move.
