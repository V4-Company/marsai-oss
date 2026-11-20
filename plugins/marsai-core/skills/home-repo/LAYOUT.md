# The layout of a Home Repo

What a Home Repo holds and the conventions that let every session, on every machine, reach the same repositories the same way. Use the names the team prefers; keep the conventions.

## What it holds

| Path | What it holds |
| --- | --- |
| `AGENTS.md`, and `CLAUDE.md` holding `@AGENTS.md` | The entry file: what the home is, how a piece of work goes, how a session reaches a repository, where what is learned goes, and the "Other repositories" section. Both are real files: a symbolic link checks out on Windows as a plain file holding the target's name |
| `repos/<area>.md` | One pointer per repository of an area, once the home points at more than about 20 |
| `catalog.json` | The facts behind the pointers, one entry per repository: area, what it is, status, activity, agent docs. The pointer files are rendered from it |
| `wiki/` | What the team learned about its systems: one page per area and per service, the pages that cross them (events, front ends, delivery) and a log |
| `tools/` | The command line the agent and the people use: where a repository is, clone it, open a worktree, search the wiki, list open pull requests, refresh the catalog, check |
| `.claude/skills/`, `.claude/agents/`, `.claude/commands/`, `.claude/hooks/` | The team's skills (Standards and implementation guides among them), agents, commands and hooks. Every session started here loads them, with no install and no version. Codex and OpenCode read `.agents/skills`: link it to `.claude/skills` on each machine |
| `.claude/settings.json` | The plugins, the guards and the permissions every session started here gets |
| `.codex/`, `.mcp.json` | What Codex reads besides the skills (agents, guards, MCP servers), and the MCP servers for Claude Code |

When the home is also the repository of something the team maintains, such as its fork of MarsAI, the entry file stays about the team's work and points at a separate doc for changing it.

## A pointer

One line per repository, naming it, saying what it is, where it lives and where to clone it from, with a hint when it needs one:

```md
- **payments-api** (payments: links, webhooks, refunds): `<root>/payments-api`. If it is missing, clone `acme/payments-api` there. Read its AGENTS.md before changing it. Its ADRs live in `docs/decisions/`.
```

Once the home covers more than roughly 20 repositories, the entry file stops listing them and links to a file for each business area instead; each of those lists the repositories of its area. Past a few hundred, the shared skills have so many consumers that a marketplace, such as the team pack, carries them better than one home.

## Where the clones and worktrees live

- **`<root>`** is the folder that holds the home's main checkout. Every pointer path starts there, so the pointers read the same on every machine. Compute it from `git rev-parse --git-common-dir`, not from the current folder, so it is right from any worktree of the home, including the ones a harness creates per thread.
- **One clone per repository**, at `<root>/<name>`. When the path exists, the session works there; when it is missing, it clones it there, with that path as the target. A clone that already exists elsewhere is linked into `<root>` instead of cloned again.
- **One worktree per piece of work**, a worktree of that clone at `<root>/.worktrees/<name>/<branch>`, created from the up-to-date default branch. It sits beside the clone, not inside its folder, so the clone's status stays clean; several agents can work in one repository at once, and the main clone stays on its default branch.

## What a session started here loads

The harness loads the home's own files and settings, not those of the repositories the session reaches:

- **Instructions**: the entry file tells the agent to read a repository's AGENTS.md or CLAUDE.md before changing it.
- **Guards**: a permission or a hook a repository's settings hold does not run from the home. The ones everyone needs go into the home's settings and `.claude/hooks/`, which run in every session started there, in whatever repository it works.
- **Access**: the clones sit outside the home's folder. In Claude Code, `permissions.additionalDirectories` in each person's `.claude/settings.local.json` (not versioned) lets the session read and edit them; in Codex, `--add-dir`.

## Settings that give everyone the same setup

The home's `.claude/settings.json` registers the marketplaces and enables the plugins for every session started there:

```json
{
  "extraKnownMarketplaces": {
    "marsai-oss": { "source": { "source": "github", "repo": "V4-Company/marsai-oss" } },
    "<team marketplace>": { "source": { "source": "github", "repo": "<owner>/<team pack repository>" } }
  },
  "enabledPlugins": {
    "marsai-core@marsai-oss": true,
    "marsai-dev@marsai-oss": true,
    "<team pack>@<team marketplace>": true
  }
}
```

A team that forks MarsAI points `marsai-oss` at its fork instead.

A plugin enabled by the project is not installed by it: each person installs once, with the MarsAI installer or `claude plugin install`. Until then, `/plugin` lists it under Errors. The skills, agents and commands in `.claude/` need no entry here; the same file wires the guards (`hooks`) and the `permissions`.

Codex reads the skills from `.agents/skills`, the agents from `.codex/agents/`, and the same guards from `.codex/hooks.json`, once the person trusts the folder and approves them with `/hooks`. MCP servers go in `.mcp.json` for Claude Code and `.codex/config.toml` for Codex.

## MarsAI inside the home (optional)

A team can go one step further and keep MarsAI itself in the home, as V4 does: the skills, agents, commands and the guard hook of `marsai-core` and `marsai-dev` copied into `.claude/`, next to the team's own. Then a session started in the home has the whole flow with no install, and `git pull` is the update.

- **Copy whole folders** from a tagged release of the MarsAI repository: `plugins/<plugin>/skills/<name>/` into `.claude/skills/<name>/`, the agents into `.claude/agents/`, the commands into `.claude/commands/`, and the hook into `.claude/hooks/`, wired in `settings.json`. Keep the license and `THIRD-PARTY-NOTICES.md` beside them.
- **Drop the plugin prefix** in the copied text (`marsai-core:grill-with-docs` becomes `grill-with-docs`). Claude Code ships a `code-review` of its own, so rename that one (V4 uses `branch-review`).
- **Take upstream changes on purpose**: compare the new release with your copy in a pull request, like any other dependency bump.
- **The price**: a session started outside the home has no MarsAI, and a person who never starts there never receives it. Teams that cannot keep everyone in the home stay with the plugins.

## The catalog and the wiki

- **Start with pointer files written by hand.** When they outgrow that, keep the facts in a catalog and let a small tool render the pointer files and the generated block at the top of each wiki page from it, with a check in CI that fails when they drift. Facts a machine can measure (status, activity, which agent docs exist) are refreshed by the tool; the curated fields (area, what it is, the hint) are edited by hand.
- **A wiki page has two parts**: the generated block, and the notes below it, where the team writes what an agent would trip on. Each claim says where it came from: read in the code, seen in production, or inferred.
- **A log** keeps one line per change, newest first.

## In CI

- On every pull request to the home: the catalog is valid, the rendered files match it and every link resolves.
- In a software factory, the home goes into the sandbox, and the agent clones the repositories it needs from the pointers.
