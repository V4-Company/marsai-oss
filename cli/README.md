# The MarsAI installer

One command presents MarsAI and opens the choice of apps and groups:

```bash
npx --yes github:V4-Company/marsai-oss
```

The `--yes` before the source belongs to **npx**. The choices of MarsAI stay interactive. It needs Node.js 18 or newer and access to the repository.

## Choices

The installer carries no list of groups, plugins or MCP servers in its code. It reads everything from the folder of each plugin, so `--help` and the wizard show exactly what the running installation has:

| What shows up | Where it comes from |
| --- | --- |
| Groups | `group` in the `.marsai-plugin.json` of each plugin; plugins with the same `group.id` form one group, and `group.aliases` gives the group other names for `--group` |
| Apps of each plugin | `targets` in the same file |
| Base | `marsai-core`, included because the other plugins declare it in `dependencies`, and shown in the summary |
| MCP servers, default address and access question | The plugin's `.marsai-dependencies.json` |

Select Claude Code, Codex, Cursor or OpenCode. The wizard configures only the chosen apps, uses the address each MCP server declares and offers the automatic update. The person logs in to the MCP servers through the app's own mechanism; the installer asks for no password and writes no token to the catalogue.

When a chosen plugin depends on an MCP server with restricted access (one that declares the `access` block), the wizard shows the notice and asks the question of that block:

- **Yes:** after configuring the connection, it starts the OAuth login through the Codex, OpenCode or Claude Code client that supports it. The person finishes the authorisation in the browser. In Cursor, it shows where to log in inside the app.
- **No:** it says to ask the contact declared in the block for access, without starting the login. The skill can stay installed while access is pending.

In an install by command, `--<id>-access yes|no` gives the answer explicitly, where `<id>` is the id of the MCP server; `--mcp-access <id>=yes|no` is the generic form. `--yes` alone does not authorise starting OAuth.

In a test folder (an alternative `--home`) and in simulations, no real login is started. Automatic updates do not open a login. The access answer is a statement of the person, not a verification of what they are allowed to read.

Groups organise plugins. The selection is kept per app. Updating a plugin also updates its skills; other groups and new plugins are not selected automatically.

`optional: true` in `.marsai-plugin.json` excludes a plugin from implicit default selection. It remains selectable by group or `--plugin`, and is included if a selected plugin requires it. The public `extras` group contains `marsai-extras`: Matt Pocock's `teach`, `research`, general `grill-me` and `writing-for-agents`, Cathryn Lavery's Diagram Design adapted as `marsai-diagram`, Lauren Tan's `in-your-own-words`, and Theo Browne's `sol-loop`, `full-send` and `full-stop`. Select it explicitly with `install --group extras`; the development group does not include it.

Installing an explicitly selected optional pack adds it to each chosen app's saved plugins and groups. Existing selections remain installed and continue updating. Installing extras alone does not add the main workflow rules to Codex.

## Commands

```bash
# Wizard
npx --yes github:V4-Company/marsai-oss

# Explicit install, useful for automation
npx --yes github:V4-Company/marsai-oss install --target codex --group development --no-auto-update

# Keeps the saved selection of each app
npx --yes github:V4-Company/marsai-oss update

# Brings what an earlier MarsAI installer left on the machine to this one
npx --yes github:V4-Company/marsai-oss migrate

# Inventory and diagnosis
npx --yes github:V4-Company/marsai-oss status
npx --yes github:V4-Company/marsai-oss doctor

# Removes only what the installer manages
npx --yes github:V4-Company/marsai-oss remove
```

Selection flags: `--target` and `--group` can be repeated; `--plugin` picks a plugin directly. `--group` and `--plugin` accept only what the loaded plugins declare; a name in `group.aliases` works too, so `--group development` selects the `desenvolvimento` group. A plugin reaches only the apps listed in its `targets`; the others say it was skipped. `--home` uses another folder for the install files. `--dry-run` shows the plan without writing configuration or scheduling an update. `--mcp skip` leaves the integrations out and says so in the diagnosis.

`--yes` **after** the command belongs to MarsAI and allows the non-interactive mode. For automation, name the groups and the apps instead of accepting implicit selections.

## Coming from an earlier installer

`migrate` is for a machine where another MarsAI installer ran before: an older version, or a distribution kept in another repository. It reads the same state file and what each app has registered, names no earlier distribution, and brings every app to the running installer in one run.

| What | How `migrate` decides |
| --- | --- |
| Apps | The ones in the saved state plus the ones found on the machine, or the ones named with `--target` |
| Selection of an app | The saved plugins this installer carries, every plugin of the saved groups and every plugin of the groups those plugins belong to now, so a plugin that is new in a group comes along. `--group` and `--plugin` add to it |
| An app with nothing saved | The groups given with `--group`, or every group that is not optional |
| A plugin this installer does not carry | Left out and listed in the report. It is not an error here, as it is for `update`. In Codex, Cursor and OpenCode its content is removed with the rest of the earlier install |
| Claude Code | A marketplace of the same name registered from another place is registered again from this one. The plugins installed from it count as what the app had: the ones this installer carries are installed again, the others are reported |
| Daily update | When it was on, the task is written again so that it runs this installer. `--no-auto-update` turns it off |

`--dry-run` prints the plan and changes nothing. In a terminal the plan is shown and confirmed once; `--yes` skips the question. Outside a terminal, without `--yes`, the command prints the plan and asks to be run again with `--yes`.

The run ends with a report per app: what it had, what it has now, what came along and what is not carried here. An app that fails does not stop the others, and the command ends with an error that names it. A second run finds nothing left to do and changes nothing. From then on `update` keeps the selection, as always.

## Language

The installer speaks English and Brazilian Portuguese. English is the default; Portuguese comes in when the environment asks for it, in this order:

1. `--lang <en|pt-BR>`, anywhere on the command line;
2. the `MARSAI_LANG` variable (`pt-BR`, `pt` or `en`);
3. the system language: the first one set among `LC_ALL`, `LC_MESSAGES` and `LANG`, when it starts with `pt`.

The language applies to everything the installer writes to the terminal: help, wizard, summary, `status`, `doctor` and errors. The names and descriptions of the groups and the access questions of an MCP server come from the plugins, which declare each text in both languages. Yes and no are accepted in either (`s`, `sim`, `y`, `yes`, `n`, `não`, `no`). What goes into the apps does not change with the language: the skills are copied as they are, and what the installer writes itself (the Codex rules file, the adapter note on each command for Cursor and OpenCode) is in English.

## MCP servers

Dependencies are declared in `.marsai-dependencies.json`, in the plugin root or next to each skill. The installer reads only the skills of the chosen plugins. It does not guess integrations by searching for words in Markdown.

- **An MCP server declared by a plugin:** the dependency entry carries the `provider` block (name, documentation, default address in `url`, route in `path`) and, when access is restricted, the `access` block. The default address is used without asking for a URL during the install. `--<id>-url <url>` gives another address for a new connection, and `--mcp-url <id>=<url>` is the generic form; when the address does not end in an accepted route, the installer appends the route of the provider. An existing configuration is kept. The full format is in [CONTRIBUTING.md](../CONTRIBUTING.md#what-a-plugin-tells-the-installer).
- **Linear:** built into the installer, so a plugin depends on it by `id` alone. It is optional for `to-spec`, `to-tickets`, `implement-spec`, `implement` and `code-review`, which read and publish issues when the work goes through Linear. Not being logged in does not stop the rest of the flow.

Do not mix up the states: a file configured, a server answering and an authenticated access are three different verifications. The protocol test uses the initialisation and tool discovery operations, and creates nothing. Tools being present does not prove permission to everything behind them.

On install, the terminal shows a summary per app, the state of each integration and the next steps. In test mode (`--home`), it says the configuration is isolated.

`status` shows the inventory and the configuration. `doctor` repeats the verifications available and points to a pending login, a server that is down or a missing capability. Tokens kept by the app itself may not be reachable by the installer's diagnosis.

## Automatic update

On the `main` channel, the wizard offers `--auto-update`; `--no-auto-update` keeps the update manual. On the `stable` channel the update comes from `brew upgrade` (see [Channels](#channels)). The scheduler is set up only on the systems that support it, and says whether it is active, only prepared or unavailable. An install in an alternative `--home` never switches on a service in the real account.

The update uses the GitHub source and applies the saved selection per app again. It adds no new group and replaces no MCP server already configured. It needs Node and npx, access to GitHub and, for a private repository, the user's usual credentials.

Running an old local binary with `update` does not download new code by itself. Use the distribution command above or the scheduler. The mechanism does not depend on the automatic update of the native Claude marketplace.

## Channels

The installer has two channels, which decide where the Claude Code content comes from and whether it updates itself:

| Channel | Claude Code | Daily update |
| --- | --- | --- |
| `main` (default) | GitHub marketplace on `main`, `autoUpdate` on | Offered by the wizard and by `--auto-update` |
| `stable` | GitHub marketplace pinned to the tag `v<package version>`, `autoUpdate` off | Does not apply; `--auto-update` answers to use `brew upgrade marsai && marsai update`, and an existing daily task is switched off |

Codex, Cursor and OpenCode always receive the content of the version of the running installer, on both channels.

The channel is resolved in this order: `--channel <stable|main>`, the `MARSAI_CHANNEL` variable, the channel saved in `~/.marsai-installer.json`, and finally `main`. An invalid value in `--channel` or in `MARSAI_CHANNEL` stops the command before any change. The wrapper of the Homebrew formula exports `MARSAI_CHANNEL=stable`, so whoever installs through brew is on `stable` without passing anything.

The channel used is saved in the state. If the state says `stable` and someone runs through npx without `--channel`, the installer stays on `stable`, says so and pins Claude Code to the version of that installer; `--channel main` changes the channel.

The daily task runs `update --scheduled`. If the resolved channel is `stable`, that run changes nothing, says that on stable the update comes from brew and switches its own task off.

Changing the channel, or the version on `stable`, moves the pin of the marketplace: the installer removes the marketplace, adds it again at the right reference and reinstalls the plugins that were installed. Before removing, it checks on GitHub that the tag exists; if it was not published yet, nothing is removed and the pin stays where it was. The auto-update of Claude follows the reference that was registered: on with no reference (main), off with a tag.

An existing GitHub marketplace is never swapped for the local checkout. If the new `add` fails after the removal, the previous one is restored; if the restore fails too, the command ends with an error and shows the plugins that were installed and the commands to recover by hand (`claude plugin marketplace add ...` and `claude plugin install <plugin>@marsai-oss`). The local checkout copied from the package is used only when there was no GitHub marketplace: with no access to GitHub, or with the tag not published yet in a new install.

Plugins that fail to reinstall are recorded in the state and show up in `status`.

`status` shows the channel, the reference of the Claude Code marketplace and its auto-update, and points out when `stable` fell behind the installed version.

## Targets and state

| App | What it receives |
| --- | --- |
| Claude Code | Plugins in the native marketplace |
| Codex | Skills in `~/.agents/skills`, rules in `~/.codex` |
| Cursor | Shared skills in `~/.agents/skills`, agents and commands in `~/.cursor` |
| OpenCode | Skills, agents and commands in `~/.config/opencode` |

Codex and Cursor share the skills folder, and the verifications and the removal respect that. What was already there from someone else does not belong to the installer.

The inventory lives in `~/.marsai-installer.json`, or in the folder given by `--home`. It keeps choices and managed resources, with no MCP credentials. An app may need a new session to load skills and integrations.

## Extra roots

A root is a folder with `.claude-plugin/marketplace.json` and `plugins/`. The installer always reads the root it comes in and can read others, for a pack that brings plugins of its own on top of these. There are two ways to pass an extra root:

- the `MARSAI_EXTRA_ROOTS` variable, with the folders separated as in `PATH`;
- by code, when the pack has its own executable, which calls the installer with the pack's folder:

  ```js
  #!/usr/bin/env node
  import { fileURLToPath } from "node:url";
  import { run } from "@v4company/marsai/cli/src/cli.js";

  run(process.argv.slice(2), { extraRoots: [fileURLToPath(new URL("..", import.meta.url))] });
  ```

Plugins, groups and MCP servers of every root show up together in `--help`, in the wizard and in the flags. The roots are read in order, the installer's first. A repeated plugin name stays with the first root, and the other copy produces a warning. A group declared in more than one root keeps the name and the description of the first. A plugin of another root can join a group of this one, declaring only the `group.id`, and depend on `marsai-core`.

In Codex, Cursor and OpenCode the content is copied as always. In Claude Code each root is a marketplace of its own: the name comes from its `marketplace.json` and the repository from its `package.json`. So two roots cannot use the same marketplace name, and the command stops before changing anything when that happens. On the `stable` channel, each marketplace is pinned to the tag `v<version>` of its own root. A root with no GitHub repository in its `package.json` is always registered from the local copy. A plugin that changed root is installed from the new marketplace and removed from the old one. `status` shows one line per marketplace.

The daily update runs the distribution that installed again: the pack that called `run()` with its own root, or the installer. The roots that came from `MARSAI_EXTRA_ROOTS` are written into the task, so it sees the same plugins. Run without a root that brought installed plugins, `update` refuses the saved selection and changes nothing, instead of deleting what it does not know.

## Development and local test

```bash
npm ci
npm test
node cli/bin/marsai.js --help
node cli/bin/marsai.js install --target codex --group development --home ./work/test-home --mcp skip --no-auto-update
node cli/bin/marsai.js doctor --home ./work/test-home
```

The tests use temporary folders and simulated clients, and call none of the real CLIs of the machine. The plugins and MCP servers of the tests are invented (`cli/test/helpers/fixtures.js`), so no test depends on a specific plugin existing; `real-root.test.js` checks, from the data, the groups and MCP servers the repository has. Testing an authenticated integration with a real service is a separate verification. The suite gives true results on Linux and macOS; on Windows, run it in WSL.
