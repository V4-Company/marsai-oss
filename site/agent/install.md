# Install MarsAI

These instructions are written for a coding agent. A person pasted a prompt that pointed you here and wants MarsAI installed. Follow the steps in order. Talk to the person in the language they wrote in.

## What you are installing

MarsAI is the development workflow V4 Company uses to build with AI agents, published as open source under the Apache 2.0 license. It is made of skills, agents and one guard hook, in two main plugins:

- `marsai-core`: the map of the flow, the grill (an interview that sharpens a plan), handoff, commits, pull requests and retro.
- `marsai-dev`: demo, spec, vertical slices, implementation with TDD and code review. It brings `marsai-core` with it.

Optional: `marsai-extras` contains Matt Pocock’s `teach`, `research`, the general-purpose `grill-me` and `writing-for-agents`, Lauren Tan’s `in-your-own-words`, Theo Browne’s `sol-loop`, `full-send` and `full-stop`, and `marsai-diagram`, adapted from Cathryn Lavery’s diagram-design. It is excluded from the main installation. Mention the optional pack and install it only if the person selects it: `claude plugin install marsai-extras@marsai-oss`, or `npx --yes github:{{repo}} install --target <codex|cursor|opencode> --group extras --yes`.

Source: https://github.com/{{repo}}

The install changes the configuration of the coding agent only: its plugins or skills folder. It does not touch the repository the person is working in. Ask before changing anything else.

## 1. Find out which agent you are

| You are running in | Go to |
| --- | --- |
| Claude Code | step 2 |
| Codex, Cursor or OpenCode | step 3 |
| Anything else | Tell the person that MarsAI installs in Claude Code, Codex, Cursor and OpenCode, and stop |

## 2. Claude Code

Run these two commands in a shell:

```bash
claude plugin marketplace add {{repo}}
claude plugin install marsai-dev@marsai-oss
```

If the `claude` command is not on the PATH, ask the person to type the same two commands inside Claude Code, as `/plugin marketplace add {{repo}}` and `/plugin install marsai-dev@marsai-oss`.

Done when `claude plugin details marsai-dev@marsai-oss` lists the skills. Go to step 4.

## 3. Codex, Cursor or OpenCode

This needs Node.js 18 or newer and Git. Check with `node --version` and `git --version`; if either is missing, tell the person and stop.

```bash
npx --yes github:{{repo}} install --target <codex|cursor|opencode> --group development --yes
```

Use the target that matches the agent you are. Done when this prints what was installed and where:

```bash
npx --yes github:{{repo}} status
```

## 4. Tell the person what changed

In a few lines, in their language:

- what was installed and where;
- that skills load when a session starts, so they need to open a new session;
- in Claude Code only: that a guard hook now routes `git commit` through `/marsai-core:commit` and `gh pr create` through `/marsai-core:pr`, and blocks merge commits. `MARSAI_LINEAR_HISTORY=off` switches the last rule off in a repository that uses merge commits;
- how to undo it: `claude plugin uninstall marsai-dev@marsai-oss` and `claude plugin uninstall marsai-core@marsai-oss` in Claude Code, or `npx --yes github:{{repo}} remove` for the other three.

## 5. Interview and adapt before the first task

Read {{site}}/onboarding.md and run that brief interview now: understand the person's role, whether the project is new or existing, team size, architecture and existing Standards. Inspect the repository for facts already documented. Show how MarsAI will use their architecture, reference code, implementation guides and checks. The onboarding instructions are the single source for this interview and its outputs.

Keep the installation's permission boundary: present the concrete project files you propose and ask before writing them, unless the person has already authorized the adaptation. Reuse an existing setup instead of interviewing again.

If the new skills require a fresh session, give the person `/marsai-core:using-marsai` as the entry point, along with the setup you already agreed on. It completes the adaptation and points to `/marsai-core:marsai-mode`, the single way into any work. Only then choose a first task that fits their project.

If the person works in a team spread across several repositories, mention the next step without running it: `/marsai-core:home-repo` sets up a Home Repo where every session starts, with a pointer to each repository and the team's skills and Standards in `.claude/`, updated with `git pull`. It is how V4 runs MarsAI today. One repository needs none of it.

Point them to two pages, in their language when it is Portuguese (`/pt/…`):

- the flow, step by step: {{site}}/map (Portuguese: {{site}}/pt/mapa)
- why it works this way: {{site}}/manifesto

## If something fails

| What you see | What it means |
| --- | --- |
| Repository not found, or a 404 | The repository name may have changed. Say so and point to {{site}} |
| A plugin fails to load after the install | Run `claude plugin validate` on it and show the person the output |
| The hook blocks a command the person needs | Say which rule fired. The rules are in the repository's `plugins/marsai-core/hooks/pre-tool-use.py` |

MarsAI is how V4 works, published as it is. The person can use it unchanged, add a plugin with their own team's rules, keep it in a Home Repo, or fork the repository: {{site}}/make-it-yours
