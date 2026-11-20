# AGENTS.md

Guidance for agents working in this repository.

`CLAUDE.md` only imports this file (`@AGENTS.md`), so Claude Code, Codex, Cursor and OpenCode read the same text: edit `AGENTS.md`.

## What this repo is

MarsAI is the development workflow V4 Company uses to build with AI agents, published as open source. It is a plugin marketplace for Claude Code, also distributed to Codex, Cursor and OpenCode by the installer in `cli/`. The repo root is the marketplace; each plugin lives in `plugins/<name>/`. Plugins are markdown: Claude Code discovers `skills/`, `agents/` and `commands/` inside each plugin directory.

| Plugin | Path | What it holds |
| --- | --- | --- |
| `marsai-core` | `plugins/marsai-core/` | The process everyone shares: the single way into any work (`marsai-mode`), the flow map (`using-marsai`), the team's Home Repo (`home-repo`), `grill-with-docs`, `wayfinder`, `handoff`, `retro`, commits and pull requests, and the commit/PR guard hook |
| `marsai-dev` | `plugins/marsai-dev/` | Code: `demo`, `prototype`, `to-spec`, `to-tickets`, `implement-spec`, `implement`, `tdd`, `code-review`, and the implementer and reviewer agents |
| `marsai-extras` | `plugins/marsai-extras/` | Optional skills from Matt Pocock, Cathryn Lavery and Lauren Tan: learning, research, general interviews, restating the goal, writing for agents and `marsai-diagram`; selected separately from the main flow |

`marsai-dev` declares `dependencies: ["marsai-core"]`, so installing it brings the core along. Install and rollout: [docs/INSTALL.md](docs/INSTALL.md).

The words this repo uses (Implementer, Reviewer, Standards, Check, Gate, Demo, Vertical slice and the rest) are defined in [CONTEXT.md](CONTEXT.md), in English and in Brazilian Portuguese. The decisions behind the current design, and what each one replaced, are in [docs/adr/](docs/adr/). Read both before changing how the flow works.

## The flow these plugins implement

A feature goes through two phases, with seven gates (G0 to G6) where a person decides (ADR 0010). The technical plan is agreed in a session, down to the program design (ADR 0015), and the code of the delivery follows it (ADR 0016).

Planning: problem and intent → `grill-with-docs` → `demo`. Hardening: `to-spec` → `to-tickets` → `implement-spec` → `code-review` → `pr` → `babysit-pr` → production → `retro`.

A bug, a small adjustment and tech debt skip the first phase and go straight to `implement`, the same path for a single slice. A feature whose only open question is how to build it skips the demo and starts at `to-spec`. When the grill grows beyond one conversation, `wayfinder` keeps a decision map before the demo. `prototype` answers one design question inside a grill. The map with shortcuts is the `using-marsai` skill. A team whose work spans several repositories starts every session in its Home Repo, which points at all of them (`home-repo`, ADR 0019).

Four design rules shape every file in `marsai-core` and `marsai-dev`:

- **Standards are applied at review, not at implementation** (ADR 0001). Implementer agents make the ticket work and do not load the Standards. The reviewer reads them in full and fixes the diff. A rule added to an implementer's prompt is in the wrong place.
- **The person plans; the agent interviews** (ADR 0003). No skill hands design decisions to a planning agent.
- **Quality before token cost** (ADR 0009). Agents run on the most capable model, and work is split into subagents whenever that keeps context clean or adds a check. A skill does not tell the agent to avoid subagents to save tokens.
- **What is one team's alone lives in a team pack** (ADR 0012). The public plugins name no private system. A team extends the flow through names: a skill whose description starts with `Standards extension:` or `Implementation guide:`, an implementer agent whose description names its repositories, a hook of its own.

## Writing skills, agents and commands

These rules exist because of ADR 0006.

- **Say what to do.** Short, affirmative instructions. State the target behaviour instead of listing prohibitions, and give the reason when a rule is not obvious. Leave out instructions the model already follows by default.
- **One meaning, one place.** Before adding content, search for it (`grep -r "keyword" plugins`). If it exists, point to it.
- **Every agent answers three questions**: what it does, when it stops and asks, and what it returns.
- **Every step ends on something checkable**: the condition that tells the agent the step is done.
- **Keep the top of a skill for what every run needs.** Reference that only some runs need goes in a sibling file inside the skill folder, reached by a relative link.
- **Mechanical rules become checks.** A rule a linter, hook or CI job can enforce belongs there, not in a prompt or in the Standards.
- **Language** (ADR 0011): everything in this repository is written in English. At run time the agent talks to the person in the person's language and writes what stays behind (spec, ticket, pull request, commit) in the language the repository already uses. A skill says where the language comes from only when that default is not enough.
- **V4's own tools are named as V4's** (Linear, SonarQube): say what the tool does, and name the generic role ("the review bot") where any team's tool fits. Nothing that describes how a private system works goes into a public file.

### Frontmatter

Only these keys exist. Anything else is silently ignored.

| Component | Allowed keys |
| --- | --- |
| Skill | `name`, `description`, `version`, `allowed-tools`, `user-invocable`, `disable-model-invocation`, `argument-hint`, `license` |
| Agent | `name`, `description`, `model`, `tools`, `color`, `effort` |
| Command | `description`, `argument-hint`, `allowed-tools`, `disable-model-invocation` (the name comes from the filename) |

- **`name` is a bare slug equal to the folder name.** The plugin is the namespace (`marsai-dev:code-review`); a colon inside `name` makes the component fail to load.
- **`description` is what triggers a skill.** Put the "when to use" there: what the skill is, then one trigger per distinct situation.
- **Quote every `description`.** A colon followed by a space inside an unquoted description breaks the YAML, and the skill then loads with no metadata and never triggers. `using-marsai` sat in that state for weeks.
- **Do not declare `skills`, `agents` or `commands` paths in `plugin.json`.** Auto-discovery is what works.
- **Links stay inside the plugin.** A relative path that leaves the plugin root does not exist at runtime, because each plugin installs on its own. Refer to another plugin's component by name (`marsai-core:grill-with-docs`).

Skills are invocable from the `/` menu by name (`/marsai-dev:to-spec`), so a new skill does not need a wrapper command. The existing commands (`commit`, `pr`, `backend`, `frontend`) stay because people already type them. A command and a skill with the same name collide.

## Checks

`.github/workflows/check.yml` runs on every pull request:

```bash
python3 scripts/check_plugins.py     # frontmatter parses, allowed keys, name = folder, links resolve
for test in plugins/*/hooks/*.test.py; do python3 "$test"; done
node scripts/version.mjs check       # one version everywhere, with a CHANGELOG entry
npm ci && npm test                   # installer (Linux or macOS)
npm ci --prefix site && npm test --prefix site && node site/build.mjs   # the site, in both languages
```

Run them before opening a PR. They do not prove a component loads; this does:

```bash
claude plugin validate .
claude plugin validate ./plugins/<name>
claude plugin details <name>@marsai-oss     # the component appears in the inventory
```

## Working in this repo

| Task | How |
| --- | --- |
| Commit | `/marsai-core:commit`. It runs `MARSAI_COMMIT_SKILL=1 git commit …`; the guard hook rejects a `git commit` without the marker |
| Pull request | `/marsai-core:pr`. The guard hook rejects a bare `gh pr create` |
| Integrate a base branch | `git rebase <base>` and `git push --force-with-lease`. History is linear; the guard hook blocks merge commits and a `git pull` without `--rebase` or `--ff-only` |
| Add or change a skill | `plugins/<plugin>/skills/<name>/SKILL.md`, following the writing rules above. Contribution flow: [CONTRIBUTING.md](CONTRIBUTING.md) |
| Add a term or record a decision | `CONTEXT.md` and `docs/adr/`, in the formats of the `grill-with-docs` skill |
| Change the site | `site/`, with the text in `site/content/pt/` and `site/content/en/`. The build fails when the two editions differ in shape: [site/README.md](site/README.md) |

## Releases

One version covers all public plugins, the installer and the marketplace. People receive an update only when that string changes, so a change they should receive comes with `node scripts/version.mjs bump <version>` and its entry in `CHANGELOG.md`, in the same pull request. Merging it is the release. Details: [docs/RELEASING.md](docs/RELEASING.md).
