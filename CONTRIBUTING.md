# Contributing

MarsAI is how V4 Company builds with AI agents, published as it is. Issues and pull requests are welcome. V4 maintains the repository and decides what goes in.

Before you start, decide where the change belongs:

| The change | Where it goes |
| --- | --- |
| Fixes a mistake, or makes a step of the flow work better for everyone | A pull request here |
| Is a rule, a tool or a convention of your team | A team pack: a plugin of your own (see the [README](README.md#make-it-yours)) |
| Changes the flow in a way V4 does not work | A fork. Tell us what you learned: that is how this one improves |

A bug or an idea you are not going to implement is an issue. A security problem goes through [SECURITY.md](SECURITY.md), not through an issue.

## How the repository is organised

Each plugin lives in `plugins/<name>/`, and Claude Code discovers `skills/`, `agents/` and `commands/` inside it. A skill is `plugins/<plugin>/skills/<name>/SKILL.md`. The plugin is the namespace: the skill `to-spec` of `marsai-dev` is called as `/marsai-dev:to-spec`.

A skill outside `plugins/`, or in a plugin that is not listed in `.claude-plugin/marketplace.json`, cannot be installed or called.

The words the flow uses are defined in [CONTEXT.md](CONTEXT.md), and the decisions behind the design are in [docs/adr/](docs/adr/). Read both before changing how the flow works.

## Writing a skill

The writing rules are in [CLAUDE.md](CLAUDE.md), section "Writing skills, agents and commands": short and affirmative instructions, one meaning in one place, every step ending on something checkable, and a mechanical rule becoming a check instead of text. Skills, agents and documents are written in English.

```markdown
---
name: my-skill
description: "What it does. Use when <a concrete situation>, and when <another one>."
---

# My skill

<instructions>
```

What breaks a skill when ignored:

- `name` equals the folder name, in kebab-case, with no `:`. A colon in the name makes the component fail to load.
- `description` is inside double quotes. A colon followed by a space in an unquoted description breaks the YAML, and the skill then loads with no metadata and never triggers.
- The description is what triggers the skill. Put the "when to use" there.
- Only these frontmatter keys exist: `name`, `description`, `version`, `allowed-tools`, `user-invocable`, `disable-model-invocation`, `argument-hint`, `license`. Any other is ignored in silence.
- `plugin.json` does not declare `skills`, `agents` or `commands`. Discovery is automatic.
- A relative link stays inside the plugin. Each plugin installs on its own, so a path that leaves its root does not exist at run time. Refer to a component of another plugin by name (`marsai-core:grill-with-docs`).

## What a plugin tells the installer

The installer in `cli/` reads two files inside each plugin folder. Removing the folder removes every trace of the plugin.

`.marsai-plugin.json` says which apps receive the plugin and which group of the wizard it belongs to:

An optional pack sets `optional: true` in this manifest. Default selection excludes it; users can select its group or plugin explicitly. Required dependencies are still included. `marsai-extras` is the public example.

```json
{
  "schemaVersion": 1,
  "targets": ["claude", "codex", "opencode"],
  "group": {
    "id": "desenvolvimento",
    "label": { "en": "Development", "pt-BR": "Desenvolvimento" },
    "description": { "en": "Engineering and TDD", "pt-BR": "Engenharia e TDD" }
  }
}
```

Plugins that declare the same `group.id` form one group. Its label and description come from the first plugin that states them, in order of plugin name with the installer's own root first, so a plugin that joins an existing group declares the `id` alone. `targets` is enforced: the plugin is not installed into an app it does not list. A plugin folder with no `.marsai-plugin.json` is not distributed by the installer, and `scripts/check_plugins.py` fails on it.

`.marsai-dependencies.json`, in the plugin root or in a skill folder, declares the MCP servers the skills use. `required: false` documents an optional one:

```json
{
  "schemaVersion": 1,
  "mcp": [{ "id": "linear", "skills": ["to-spec", "to-tickets"], "required": false }]
}
```

Linear is built into the installer, so the `id` is enough. Any other server is described in the same entry: a `provider` block with its `name`, its default `url`, and the `path` the installer appends when the address does not end in one of `acceptedPaths`; and, when access is restricted, an `access` block with the `question` the wizard asks, an optional `notice` shown before it and the `contact` who grants access. A text is a string, or one string per language (`en`, `pt-BR`). The first plugin that declares the `provider` of an `id` defines it for every plugin, and each `id` gets its own flags, `--<id>-url` and `--<id>-access`.

Never put a credential, a URL with a token or a command built from free text in either file.

## Before opening the pull request

```bash
python3 scripts/check_plugins.py     # frontmatter, names, links
node scripts/version.mjs check       # the version agrees everywhere and has a CHANGELOG entry
for test in plugins/*/hooks/*.test.py; do python3 "$test"; done
npm ci && npm test                   # the installer (on Linux or macOS)
```

These do not prove that a component loads. This does:

```bash
claude plugin validate .
claude plugin validate ./plugins/<plugin>
claude --plugin-dir ./plugins/marsai-core --plugin-dir ./plugins/marsai-dev    # try it in a session
```

A change to a skill of the main path is tested by running that step on a real task, and the pull request says what was run.

A change that people should receive needs a new version. `node scripts/version.mjs bump <version>` writes it everywhere and opens the entry in [CHANGELOG.md](CHANGELOG.md); you write what changed, for whoever uses the flow. More in [docs/RELEASING.md](docs/RELEASING.md).

## Pull request checklist

- [ ] The change is for everyone, not for one team
- [ ] `name` equals the folder name; `description` is quoted and says when to use the skill
- [ ] The checks above pass
- [ ] The pull request says what was run to try the change
- [ ] The version was bumped and the CHANGELOG entry written, when people should receive the change
- [ ] A decision that is hard to undo has an ADR in `docs/adr/`

By contributing you agree that your contribution is licensed under the [Apache License 2.0](LICENSE), like the rest of the repository.
