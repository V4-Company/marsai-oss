# Installing MarsAI

Four ways, from the shortest to the one a whole organisation cannot switch off.

## 1. Through your coding agent

Paste the prompt from the [home page of the site](https://marsai.v4company.com) into Claude Code, Codex, Cursor or OpenCode. The agent reads [install.md](https://marsai.v4company.com/install.md), installs and follows the [brief setup interview](../plugins/marsai-core/skills/using-marsai/ONBOARDING.md) to adapt MarsAI to your role, team and existing architecture.

In a new session, call `/marsai-core:using-marsai` to complete the adaptation before the first task. It reuses the repository's architecture docs, reference code and checks, connects existing Standards to review, and proposes project-specific setup files. It asks before writing project files when the original request authorised only installation. Later sessions reuse the recorded setup.

## 2. By hand

One command opens the wizard, which asks for the apps, the groups and the automatic update:

```bash
npx --yes github:V4-Company/marsai-oss
```

Or through Homebrew:

```bash
brew tap V4-Company/marsai-oss https://github.com/V4-Company/marsai-oss.git
brew install marsai && marsai
```

The two are different channels:

| | brew (`stable`) | npx (`main`) |
| --- | --- | --- |
| Version | The one of the package, shown by `brew list --versions marsai` | Whatever is on `main` |
| Claude Code | Marketplace pinned to the tag `v<version>`, auto-update off | Marketplace on `main`, auto-update when it opens |
| Codex, Cursor, OpenCode | Content of the package version | Content of `main` at the time of the command |
| Update | `brew upgrade marsai && marsai update` | `npx --yes github:V4-Company/marsai-oss update`, or the daily update |
| Freeze | `brew pin marsai` | Does not apply |

`marsai update` after `brew upgrade` is what moves the Claude Code pin to the new version. The channel is saved in the state; pass `--channel main` or `--channel stable` to change it. See [RELEASING.md](RELEASING.md).

The installer answers in English, and in Brazilian Portuguese when the environment asks for it: `--lang pt-BR`, `MARSAI_LANG=pt-BR`, or a system locale that starts with `pt`.

The state lives in `~/.marsai-installer.json`. `update` keeps the selection of each app and `remove` takes out what the installer placed. The development group lists Linear as an optional integration of the spec, tickets, implementation and review skills. Configuring an integration is not logging in to it: the summary and `doctor` show what is pending. Every option: [cli/README.md](../cli/README.md).

Claude Code only, with no installer:

```bash
claude plugin marketplace add V4-Company/marsai-oss
claude plugin install marsai-dev@marsai-oss      # brings marsai-core as a dependency
```

Open a new session afterwards.

## 3. Per project, committed to the repository

Commit this as `.claude/settings.json` in the project. Whoever opens the repository in Claude Code gets the plugins without running anything:

```json
{
  "extraKnownMarketplaces": {
    "marsai-oss": {
      "source": { "source": "github", "repo": "V4-Company/marsai-oss" }
    }
  },
  "enabledPlugins": {
    "marsai-core@marsai-oss": true,
    "marsai-dev@marsai-oss": true
  }
}
```

Enabling a plugin enables its dependencies.

## 4. Required for an organisation (managed settings)

This is the only way in which a person cannot disable the plugin. Managed settings have the highest precedence and are fetched at login and every hour during a session.

Set it in the Claude admin console, under Admin Settings, Claude Code, Managed settings (it needs an Owner):

```json
{
  "extraKnownMarketplaces": {
    "marsai-oss": {
      "source": { "source": "github", "repo": "V4-Company/marsai-oss" }
    }
  },
  "enabledPlugins": {
    "marsai-core@marsai-oss": true
  }
}
```

Keep only `marsai-core` here and leave the others opt-in.

By file, when you manage the machines:

| OS | Path |
| --- | --- |
| macOS | `/Library/Application Support/ClaudeCode/managed-settings.json` |
| Linux, WSL | `/etc/claude-code/managed-settings.json` |
| Windows | `C:\Program Files\ClaudeCode\managed-settings.json` |

## Automatic update

The wizard offers to set up a scheduler of the user on the systems that support it, and says whether it is active or only prepared. A test folder passed with `--home` never switches on a service in the real account. The update uses the GitHub source and keeps the saved selection; it does not add new groups.

This is separate from the update of marketplaces inside Claude Code, so the other apps do not depend on it. To see what is installed, run `npx --yes github:V4-Company/marsai-oss doctor`. Without the scheduler, the update is by hand:

```bash
npx --yes github:V4-Company/marsai-oss update
```

## Coming from an earlier installer

A machine where an older MarsAI installer ran, or one of a distribution kept in another repository, moves to this one with a single command:

```bash
npx --yes github:V4-Company/marsai-oss migrate --dry-run     # the plan, changing nothing
npx --yes github:V4-Company/marsai-oss migrate
```

It keeps, in each app, what the app had that this installer carries, adds the plugins that are new in the groups the app had, registers the Claude Code marketplace again from this repository and, when the daily update was on, points it here. What this installer does not carry is left out and listed in the report. Details: [cli/README.md](../cli/README.md#coming-from-an-earlier-installer).

## Check that it worked

```bash
claude plugin list
claude plugin details marsai-core@marsai-oss
claude plugin details marsai-dev@marsai-oss
```

`details` shows the real inventory of components. A skill or agent with a count of zero is not loading, and `claude plugin validate` alone does not catch that.

## A team pack on top

A team that keeps its own Standards and guides in a private plugin installs that plugin after these. Its marketplace allows the dependency on this one with `"allowCrossMarketplaceDependenciesOn": ["marsai-oss"]`, and its plugins declare `{ "name": "marsai-dev", "marketplace": "marsai-oss" }`. See [Make it yours](../README.md#make-it-yours).

The installer takes the pack as an extra root, so the pack's plugins, groups and MCP servers show up next to these and reach Codex, Cursor and OpenCode too. Set `MARSAI_EXTRA_ROOTS` to the pack's folder, or give the pack a bin that calls the installer with its own folder as a root. In Claude Code each root is registered as its own marketplace, under its own name and repository. Details: [cli/README.md](../cli/README.md#raízes-extras).

## Optional extras

`marsai-extras` contains Matt Pocock's `teach`, `research`, general `grill-me` and `writing-for-agents`, plus `marsai-diagram`, adapted from Cathryn Lavery's Diagram Design, `in-your-own-words`, adapted from Lauren Tan's pstack, and `sol-loop`, `full-send` and `full-stop`, adapted from Theo Browne's tstack. It is excluded from default selection and the development group. Choose the extras group in the wizard, or install it explicitly:

```bash
npx --yes github:V4-Company/marsai-oss install --group extras
# Claude Code, after registering the marketplace:
claude plugin install marsai-extras@marsai-oss
```

`teach`, `grill-me` and `in-your-own-words` are user-invoked. `research`, `writing-for-agents` and `marsai-diagram` support user and agent invocation. `sol-loop`, `full-send` and `full-stop` load when the person says their name in a message, and through the `/` menu; `full-send` merges by itself only a two-way door (ADR 0018). These permissions come from Claude Code frontmatter; other apps may enforce them differently. See the original sources and MIT notices in `plugins/marsai-extras/THIRD-PARTY-NOTICES.md`.

Invoke `/marsai-extras:marsai-diagram` for a diagram, adding `profile`, `doctor`, `import <file>` or `export <file> png|svg` when needed. The V4/MarsAI profile is ready on first use; client profiles live separately under `~/.marsai-diagram/profiles/`. It coexists with upstream `diagram-design`, including in hosts that flatten skill names. Python 3.10+ runs packaged accessibility and geometry checks; browser screenshots complete visual verification.
