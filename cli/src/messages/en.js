/**
 * Installer texts in English, the default language. `pt-BR.js` has the same keys.
 * A text is a string, or a function of the values it shows.
 */
const KINDS = {
  skills: ["skill", "skills"],
  agents: ["agent", "agents"],
  commands: ["command", "commands"],
  commandSkills: ["command", "commands"],
  rules: ["rules file", "rules files"],
};

export default {
  // Shared
  "yes.no": "[Yes/No]",
  warning: ({ text }) => `warning: ${text}`,
  "lang.invalid": ({ value, valid }) =>
    `unknown language: ${value}. Valid: ${valid}`,

  // Channel
  "channel.invalid": ({ label, value, valid }) =>
    `${label} is not valid: ${value}. Valid: ${valid}`,

  // Roots
  "roots.notRoot": ({ dir }) =>
    `${dir} is not a MarsAI root: it needs .claude-plugin/marketplace.json with a "name" and the plugins/ folder.`,
  "roots.extra": "extra root",
  "roots.sameMarketplace": ({ dir, name, other }) =>
    `${dir} uses the marketplace name '${name}', which already belongs to ${other}. Each root needs its own name in .claude-plugin/marketplace.json.`,

  // Catalog
  "catalog.schemaVersion": "schemaVersion has to be 1",
  "catalog.optional": "optional has to be a boolean",
  "catalog.targets": ({ targets }) =>
    `targets has to list at least one of: ${targets}`,
  "catalog.group":
    "group needs an id in kebab-case; aliases, when present, are kebab-case names; label and description are texts",
  "catalog.legacySkills": "legacySkills has to be a list of skill names",
  "catalog.invalidJson": "invalid JSON",
  "catalog.noManifest": ({ name, file }) =>
    `${name}: no ${file}; the installer does not distribute this plugin.`,
  "catalog.badManifest": ({ name, file, problem }) =>
    `${name}: invalid ${file} (${problem}); plugin left out.`,
  "catalog.badName": ({ name }) =>
    `${name}: invalid plugin name; plugin left out.`,
  "catalog.duplicate": ({ name, first, second }) =>
    `${name}: already exists in ${first}; the copy in ${second} was left out.`,

  // Content the copy targets could not place
  "skip.skill": ({ name }) =>
    `skill ${name} (already exists and is not from MarsAI)`,
  "skip.rules": ({ name }) =>
    `rules ${name} (already exists and is not from MarsAI)`,
  "skip.agent": ({ name }) =>
    `agent ${name} (already exists and is not from MarsAI)`,
  "skip.command": ({ name }) =>
    `command ${name} (already exists and is not from MarsAI)`,
  "skip.cursorAgent": ({ name }) => `agent ${name} (already exists)`,
  "skip.cursorCommand": ({ name, skill }) =>
    `command ${name} (skill ${skill} already exists)`,

  // MCP configuration
  "mcp.badPluginName": "Invalid plugin name in the MCP manifest.",
  "mcp.badManifest": "Invalid MCP manifest.",
  "mcp.badDependency": "Invalid MCP dependency, or a provider nobody declares.",
  "mcp.unreadableManifest":
    "Could not read the MCP manifest; no secret was recorded.",
  "mcp.badTarget": "MCP is not supported for this target.",
  "mcp.badConfig": "The MCP configuration is invalid or ambiguous; file kept.",
  "mcp.unreadableConfig": "Could not read the MCP configuration; file kept.",
  "mcp.badUrlRules":
    "Invalid MCP URL: use HTTPS with no credentials, query or fragment; HTTP only for localhost.",
  "mcp.badUrl": "Invalid MCP URL.",
  "mcp.auth.command": ({ command }) => `Log in through the client: ${command}.`,
  "mcp.auth.claude": "Open /mcp in Claude Code and authenticate the server.",
  "mcp.auth.cursor":
    "Open Settings > Tools & MCP in Cursor and authenticate the server.",
  "mcp.symlinkAdd":
    "The configuration is a symbolic link; kept. Add the server through the client.",
  "mcp.symlink": "The configuration is a symbolic link; kept.",
  "mcp.changed": "The configuration changed during the install; try again.",
  "mcp.unsupported": "MCP dependency not supported.",
  "mcp.skipped": "MCP skipped by --mcp skip.",
  "mcp.existingKept":
    "Existing configuration kept; connection not verified yet.",
  "mcp.existingInvalid":
    "The existing entry is invalid or disabled; kept for review.",
  "mcp.giveUrl": ({ id }) => `Pass --${id}-url <instance-URL>.`,
  "mcp.dryRunAdd": "Dry run: would add the official MCP.",
  "mcp.added": "Official MCP configured; login and connection pending.",
  "mcp.addFailed":
    "Could not add the MCP safely; existing configuration kept.",
  "mcp.probe.stdio":
    "stdio server kept; check it in the client. Doctor does not run existing local commands.",
  "mcp.probe.insecure":
    "The existing endpoint is not safe HTTP for a verification.",
  "mcp.probe.needsHttps": "Doctor needs HTTPS or localhost.",
  "mcp.probe.auth":
    "The endpoint asks for authentication. Doctor does not read the client's private OAuth tokens.",
  "mcp.probe.badInitialize":
    "initialize is invalid, or the MCP has no tools capability.",
  "mcp.probe.sessionAuth": "The session asks for authentication.",
  "mcp.probe.notification":
    "The MCP did not accept the initialized notification.",
  "mcp.probe.listAuth": "tools/list asks for authentication.",
  "mcp.probe.badList": "tools/list is invalid or has no authorised tools.",
  "mcp.probe.verified":
    "initialize + tools/list verified in this run; no tool or SQL was executed. Read and write permissions not tested.",
  "mcp.probe.network":
    "Network failure, timeout or invalid MCP answer; connection not verified.",
  "mcp.remove.preexisting":
    "Connection existed before, or has no ownership record: kept.",
  "mcp.remove.gone": "The managed entry is already gone.",
  "mcp.remove.edited":
    "Connection edited after the install: kept, with its credentials.",
  "mcp.remove.reformatted": "The TOML block was reformatted or edited: kept.",
  "mcp.remove.removed":
    "Connection created by MarsAI removed. The client's private credentials were not read.",
  "mcp.remove.failed":
    "Could not remove the MCP entry safely; configuration kept.",
  "mcp.loginUnavailable":
    "MCP configuration missing, invalid or disabled; login not started.",

  // Login through the client app
  "login.cancelled":
    "Input ended. Install cancelled before any file was changed.",
  "login.answer": "Answer Yes or No.",
  "login.notOnUpdate": "The automatic update does not start a login.",
  "login.askContact": ({ contact }) => `Ask ${contact} for access.`,
  "login.askAdmin": "Ask whoever runs the service for access.",
  "login.isolated": "Login not done in this test.",
  "login.unknown": ({ id }) =>
    `Access not stated. Use --${id}-access yes to start the login, or no to be told who grants access.`,
  "login.notConfigured":
    "Login not started: finish the MCP configuration first.",
  "login.cursor": ({ name }) =>
    `Open Settings > Tools & MCP in Cursor and authenticate ${name}.`,
  "login.clientMissing": ({ target }) =>
    `The ${target} CLI was not found. Install the app to go on with the login.`,
  "login.claude": ({ name }) =>
    `Open /mcp in Claude Code and choose Authenticate for ${name}.`,
  "login.success":
    "Login completed by the app. Query permissions not verified.",
  "login.failed": ({ code }) =>
    `The app did not complete the login${code === undefined ? "" : ` (code ${code})`}. Try again in the client.`,

  // Summary of an install
  "present.count": ({ kind, n }) => `${n} ${KINDS[kind][n === 1 ? 0 : 1]}`,
  "present.installed": ({ parts }) => `✓ ${parts} installed`,
  "present.nothing": "No new content installed.",
  "present.optional": " (optional)",
  "present.loginDone": "✓ Login completed by the app.",
  "present.permissions": "Query permissions not verified.",
  "present.unverified": ({ message }) =>
    `Verification without the client's credentials: ${message}`,
  "present.accessPending": ({ name }) => `! Access to ${name} pending.`,
  "present.state.verified": "✓ Connection verified; tools available.",
  "present.state.auth-pending": "! MCP configured; login pending.",
  "present.state.configured": "! MCP configured; connection not verified yet.",
  "present.state.missing": "! MCP not configured.",
  "present.state.missingDryRun":
    "Add the MCP configuration. A login will be needed.",
  "present.state.error":
    "✗ Could not finish the configuration or the verification.",
  "present.state.skipped": "Configuration skipped by --mcp skip.",
  "present.state.unknown": "State not recognised; see status.",
  "present.nextStep": "Next step:",
  "present.action.claude": "Open /mcp in Claude Code and choose Authenticate.",
  "present.action.cursor":
    "Open Settings > Tools & MCP in Cursor and authenticate.",
  "present.action.other": "Open the integration in the app and log in.",
  "present.autoUpdate": ({ status }) =>
    `Automatic update: ${
      {
        enabled: "on, daily",
        prepared: "prepared, not switched on",
        disabled: "off",
        unsupported: "not available on this system",
        missing: "task not found",
        error: "could not be set up",
        "dry-run": "simulation, nothing changed",
      }[status] || "not set up"
    }.`,

  // Claude Code marketplace
  "claude.settings.unreadable": "could not read valid JSON",
  "claude.settings.noEntry": ({ name }) =>
    `extraKnownMarketplaces.${name} is missing`,
  "claude.settings.writeFailed": "could not write",
  "claude.settings.warn": ({ why, file, name, enabled }) =>
    `warning: ${why} in ${file}; autoUpdate of the marketplace '${name}' was not turned ${enabled ? "on" : "off"} (set it in /plugin > Marketplaces)`,
  "claude.addFailed": ({ output }) => `marketplace add failed:\n${output}`,
  "claude.updateAfterAddFailed": ({ name, output }) =>
    `marketplace '${name}' already existed and the update failed:\n${output}`,
  "claude.ref.tag": ({ ref }) => `tag ${ref}`,
  "claude.github.following": ({ name, repo }) =>
    `marketplace '${name}' from GitHub ${repo}; Claude updates it on start`,
  "claude.github.pinned": ({ name, repo, ref }) =>
    `marketplace '${name}' from GitHub ${repo}, pinned to ${ref}; Claude does not update it by itself`,
  "claude.recovery.removed": ({ name, plugins }) =>
    `marketplace '${name}' was removed and could not be registered again. Plugins that were installed: ${plugins || "none"}.`,
  "claude.recovery.how": "To recover, with access to GitHub:",
  "claude.local": ({ why, name, version, pinned }) =>
    `${why}: marketplace '${name}' from the bundled local checkout${version ? ` of version ${version}` : ""}. ${pinned ? "It stays on this version until the next `marsai update`." : "Updates come with the scheduled update, not when Claude opens."}`,
  "claude.noRepository": "no GitHub repository declared",
  "claude.noAccess": ({ repo }) => `no access to GitHub ${repo}`,
  "claude.noAccessKept": ({ repo }) =>
    `no access to GitHub ${repo} right now; GitHub marketplace kept (not going back to the local checkout)`,
  "claude.staysAt": ({ current, wanted }) =>
    `marketplace stays on ${current}; run \`marsai update\` with access to move to ${wanted}`,
  "claude.updateFailed": ({ name, output }) =>
    `marketplace '${name}' update failed:\n${output}`,
  "claude.tagMissing": ({ ref }) => `tag ${ref} not published yet`,
  "claude.pinStays": ({ why, current }) => `${why}; the pin stays on ${current}`,
  "claude.removeFailed": ({ name, source, wanted, output }) =>
    `marketplace '${name}' (${source}) could not be removed to move to ${wanted} on GitHub:\n${output}`,
  "claude.githubAddFailed": ({ wanted, output }) =>
    `marketplace add from GitHub on ${wanted} failed (${output})`,
  "claude.restored": ({ why }) => `${why}; previous marketplace restored`,
  "claude.installFailed": ({ output }) => `plugin install failed:\n${output}`,
  "claude.updated": ({ plugin }) =>
    `${plugin} was already there. updated to the latest version`,
  "claude.pluginUpdateFailed": ({ plugin, output }) =>
    `${plugin} was already there and the update failed:\n${output}`,
  "claude.installed": ({ plugin }) =>
    `${plugin} installed from the native marketplace`,
  "claude.uninstalled": ({ plugin }) => `${plugin} removed`,
  "claude.notInstalled": ({ plugin }) => `${plugin} was not installed`,
  "claude.uninstallFailed": ({ output }) => `uninstall failed:\n${output}`,

  // Daily update
  "auto.unsupported": "Automatic update not available on this system.",
  "auto.dryRun": ({ enabled }) =>
    `Automatic update: ${enabled ? "prepare the daily task" : "turn off"}`,
  "auto.disableFailed": "Could not turn the task off; files kept.",
  "auto.disabled": "Automatic update turned off.",
  "auto.disabledLater":
    "Automatic update turned off; the task already loaded goes away at the next login.",
  "auto.noRepository":
    "Automatic update not available: the package declares no GitHub repository in package.json.",
  "auto.preparedIsolated":
    "Task prepared; services are not switched on in this run.",
  "auto.noNpx": "npx not found next to Node. Task prepared, not switched on.",
  "auto.enabled":
    "Daily update switched on; it needs npm, Git and access to GitHub to run.",
  "auto.activationFailed":
    "Task prepared, switching it on failed. See status.",

  // Wizard
  "wizard.needsTerminal": ({ group, plugin }) =>
    `The wizard needs an interactive terminal. Use install --target codex ${group ? `--group ${group} --yes (or --plugin ${plugin})` : `--plugin ${plugin} --yes`}.`,
  "wizard.choose": ({ prompt, options, defaults }) =>
    `\n${prompt}\n\n${options}\n\nChoose numbers separated by commas${defaults ? ` [${defaults}]` : ""}: `,
  "wizard.invalid": "Invalid selection. Choose at least one option of the list.",
  "wizard.banner": ({ owner }) =>
    `\nMarsAI${owner ? ` | ${owner}` : ""}\nSkills, agents and commands for your AI assistant.\nThe MarsAI base is required: orchestration, review and Git.\n\n`,
  "wizard.where": "Where to install?",
  "wizard.detected": " (detected)",
  "wizard.groups": "Which groups do you want?",
  "wizard.existing": ({ name }) =>
    `\n${name}\nExisting connection found. Its configuration will be kept.\n`,
  "wizard.new": ({ name, url }) =>
    `\n${name}\n${url ? `${url}\n` : ""}The login happens in the app you chose.\nExisting connections will be kept.\n`,
  "wizard.cancelled": "Install cancelled.",
  "wizard.autoUpdate":
    "\nAutomatic updates\n\nLooks for updates on GitHub once a day and keeps your choices.\nNeeds Node, npm, Git and an internet connection.\n\n",
  "wizard.autoUpdateQuestion": "Turn on the daily update? [y/N]: ",

  // Command line
  "cli.stableAutoUpdate":
    "The daily update does not apply to the stable channel; use brew upgrade marsai && marsai update.",
  "cli.usage.access": ({ id }) =>
    `  --${id}-access <yes|no> says whether you have access; yes starts the login in the app`,
  "cli.usage.url": ({ id, url }) =>
    `  --${id}-url <url> replaces the ${url ? `default URL (${url})` : "URL"} for new connections`,
  "cli.usage": ({ run, owner, groups, mcpFlags, plugins, targets, list }) =>
    `
MarsAI installer | plugin marketplace${owner ? ` of ${owner}` : ""} for Claude Code, Codex, Cursor and OpenCode.

Usage:
  ${run}             opens the selection wizard
  ${run} install [options]   installs explicit choices; with no selection opens the wizard
  ${run} update [options]    applies the running version again, keeping the choices
  ${run} migrate [options]   brings what an earlier installer left on this machine to this one
  ${run} doctor   checks the MCP connections without keeping credentials
  ${run} status              shows what is installed and where
  ${run} remove              removes everything the installer placed

Options:
  --group <name>      ${groups || "no group declared"}; repeatable
  --auto-update       schedules the daily update (opt-in)
  --no-auto-update    turns the daily update off
  --channel <name>    stable (pinned to the tag v<version>) | main (follows main); default: MARSAI_CHANNEL, then the saved one, then main
  --mcp <auto|skip>    configures the MCP dependencies (default auto)
${[
  ...mcpFlags,
  "  --mcp-access <id>=<yes|no> the same as --<id>-access, for any MCP",
  "  --mcp-url <id>=<url> the same as --<id>-url, for any MCP",
].join("\n")}
  --plugin <name>     only this plugin (${plugins}); repeatable
  --target <name>     only this target (${targets}); repeatable
  --home <dir>        writes to another home (default: $HOME; overrides MARSAI_HOME)
  --lang <en|pt-BR>   language of the messages (default: MARSAI_LANG, then the system's, then en)
  --yes               asks nothing (accepts the prompts)
  --dry-run           shows what it would do, writing nothing
  --version           version of the installer
  --help              this help

Plugins:
${list}
`.trim(),
  "cli.yesNo": ({ flag }) => `${flag} has to be yes or no`,
  "cli.pairAccess": ({ flag, id }) =>
    `${flag} ${id}=<value>: the value has to be yes or no`,
  "cli.pair": ({ flag, known }) =>
    `${flag} expects <id>=<value>. Known MCPs: ${known || "none"}`,
  "cli.valueRequired": ({ flag }) => `${flag} needs a value`,
  "cli.unknownFlag": ({ flag }) => `unknown flag: ${flag}`,
  "cli.unknownGroup": ({ group, valid }) =>
    `unknown group: ${group}. Valid: ${valid || "none"}`,
  "cli.mcpMode": "--mcp has to be auto or skip",
  "cli.unknownPlugin": ({ plugin, valid }) =>
    `unknown plugin: ${plugin}. Valid: ${valid}`,
  "cli.unknownTarget": ({ target, valid }) =>
    `unknown target: ${target}. Valid: ${valid}`,
  "cli.oneCommand": "Use only one command per run.",
  "cli.noTarget":
    "No target detected (claude, ~/.codex, ~/.cursor, ~/.config/opencode). Use --target to force one.",
  "cli.unsupportedTarget": ({ target }) => `target not supported: ${target}`,
  "cli.claude.missing": ({ manual }) =>
    `~/.claude exists but the 'claude' CLI is not in the PATH. The native marketplace cannot be set up automatically. Install the Claude CLI${manual ? `, or run: ${manual}` : ""}`,
  "cli.claude.planLocal": ({ checkout, plugins }) =>
    `local checkout ${checkout} + install ${plugins}`,
  "cli.claude.planPinned": ({ repo, ref }) =>
    `GitHub marketplace ${repo}#${ref} (no Claude auto-update)`,
  "cli.claude.planFollowing": ({ repo }) =>
    `GitHub marketplace ${repo} (auto-update when Claude opens)`,
  "cli.claude.planEither": ({ github, local }) =>
    `${github} if there is access, otherwise ${local}`,
  "cli.claude.moved": ({ plugin, before, now }) =>
    `${plugin} moved from the marketplace '${before}' to '${now}'`,
  "cli.claude.movedKept": ({ plugin, before, now }) =>
    `${plugin} now comes from the marketplace '${now}', but the copy from '${before}' could not be removed: run claude plugin uninstall ${plugin}@${before}`,
  "cli.claude.notCarried": ({ plugins, name }) =>
    `${plugins}: installed from the marketplace '${name}' as it was registered before and not carried by this one; not installed again.`,
  "cli.plan.codex": ({ plugins }) =>
    `skills -> ~/.agents/skills/, rules -> ~/.codex/marsai-AGENTS.md (${plugins})`,
  "cli.plan.cursor": ({ plugins }) =>
    `skills -> ~/.agents/skills/, agents -> ~/.cursor/agents/, commands -> \`marsai-*\` skills in ~/.cursor/skills/ (${plugins})`,
  "cli.plan.opencode": ({ plugins }) =>
    `skills/agents/commands -> ~/.config/opencode/ (${plugins})`,
  "cli.summary.rules": ({ list }) => `rules: ${list}`,
  "cli.summary.skipped": ({ list }) => `skipped (already existed): ${list}`,
  "cli.summary.nothing": "nothing to install",
  "cli.notDistributed": ({ plugins, app }) =>
    `${plugins}: not distributed to ${app}; skipped.`,
  "cli.install.title": ({ version }) => `\nMarsAI · Install · v${version}`,
  "cli.testMode": "Test mode: installing into an alternative folder.",
  "cli.baseIncluded": "The MarsAI base is included in the choices.",
  "cli.simulation": "\nSimulation: nothing will be changed.",
  "cli.wouldInstall": ({ n }) =>
    `Install ${n} selected ${n === 1 ? "package" : "packages"}.`,
  "cli.pluginsInstalled": ({ n }) =>
    `✓ ${n} ${n === 1 ? "plugin" : "plugins"} installed`,
  "cli.skippedItems": ({ n }) =>
    `  ! ${n} ${n === 1 ? "item" : "items"} skipped to keep existing content.\n    See status for details.`,
  "cli.installFailed": ({ targets }) =>
    `Install failed: ${targets}. Targets with an error were not recorded as done.`,
  "cli.install.done":
    "\nInstall finished. What is pending for the integrations is shown above.",
  "cli.install.untouched":
    "No configuration of the main installation was changed.",
  "cli.install.newSession":
    "Open a new session of the app to load the content.",
  "cli.install.more": "Details: status  •  Check the connections again: doctor\n",
  "cli.startingLogin": ({ name }) =>
    `  Starting the ${name} login in the app...`,
  "cli.stable.wouldDisable":
    "Automatic update: the active daily update would be turned off; it does not apply to the stable channel.",
  "cli.stable.disableFailed": ({ message }) =>
    `warning: could not turn off the daily update, which does not apply to the stable channel. ${message}`,
  "cli.stable.disabled":
    "warning: daily update turned off; it does not apply to the stable channel. Use brew upgrade marsai && marsai update.",
  "cli.stable.scheduledIgnored":
    "Scheduled run ignored: on the stable channel the update comes from brew (brew upgrade marsai && marsai update).",
  "cli.stable.fromState": ({ file, ref }) =>
    `warning: stable channel saved in the state (${file}); with brew, update with \`brew upgrade marsai && marsai update\`; to go back to main, use \`--channel main\`. This installer pins Claude Code to ${ref}.`,
  "cli.update.nothing":
    "Nothing installed by this installer yet. Run `install` first.",
  "cli.update.unknownTarget": ({ target }) =>
    `Target ${target} is not recorded. Use install first.`,
  "cli.update.unavailable": ({ app, plugins }) =>
    `The saved selection of ${app} has plugins this installer does not distribute: ${plugins}. Nothing was changed. Run the installer that distributes those plugins, or choose again with \`install\`.`,
  "cli.update.title": ({ version }) => `\nMarsAI · Update · v${version}`,
  "cli.update.reapplying": "Applying this version to the saved choices again.",
  "cli.update.simulated": "\nSimulation finished. Nothing was changed.\n",
  "cli.update.done":
    "\nUpdate finished. What is pending for the integrations is shown above.\n",
  "cli.migrate.title": ({ version }) => `\nMarsAI · Migration · v${version}`,
  "cli.migrate.intro": ({ source }) =>
    `Brings what an earlier MarsAI installer left in each app to this version${source ? `, from ${source}` : ""}.`,
  "cli.migrate.plan": "\nPlan",
  "cli.migrate.report": "\nReport",
  "cli.migrate.had": ({ plugins }) => `had: ${plugins}`,
  "cli.migrate.hadNothing": "had: nothing recorded",
  "cli.migrate.willHave": ({ plugins }) => `will have: ${plugins}`,
  "cli.migrate.hasNow": ({ plugins }) => `has now: ${plugins}`,
  "cli.migrate.added": ({ plugins }) =>
    `added (new in its groups, required or asked for): ${plugins}`,
  "cli.migrate.notCarried": ({ plugins }) =>
    `not carried here: ${plugins}. Left out, and what was installed for it is removed from this app; get it from the distribution that carries it.`,
  "cli.migrate.notCarriedClaude": ({ plugins }) =>
    `not carried here: ${plugins}. Left out, and not installed again when its marketplace moves; get it from the distribution that carries it.`,
  "cli.migrate.market": ({ name, from, to }) =>
    `marketplace '${name}': registered from ${from}, moves to ${to}`,
  "cli.migrate.done": ({ plugins }) => `already on this version: ${plugins}`,
  "cli.migrate.failedApp": "not migrated: see the messages above",
  "cli.migrate.task.register":
    "Daily update: the task is written again, so it runs this installer.",
  "cli.migrate.task.off": "Daily update: turned off.",
  "cli.migrate.task.same": "Daily update: already runs this installer.",
  "cli.migrate.task.none": "Daily update: it was off and stays off.",
  "cli.migrate.confirm": "\nApply this plan? [y/N]: ",
  "cli.migrate.cancelled": "Migration cancelled. Nothing was changed.",
  "cli.migrate.needsYes":
    "\nNothing was changed. Run again with --yes to apply this plan.",
  "cli.migrate.nothing": "\nNothing left to migrate. Nothing was changed.",
  "cli.migrate.applying": "\nApplying the plan",
  "cli.migrate.failed": ({ targets }) =>
    `Migration incomplete: ${targets}. What the report shows as migrated was migrated; fix what is shown above and run migrate again.`,
  "cli.migrate.finished": "\nMigration finished.",
  "cli.missing.collision": ({ item }) => `collision kept: ${item}`,
  "cli.missing.registry": "Claude native registry",
  "cli.missing.badRegistry": "invalid Claude native registry",
  "cli.missing.noMarker": ({ file }) => `no MarsAI marker: ${file}`,
  "cli.status.nothing": "nothing installed by this installer",
  "cli.status.installedAt": ({ when }) => `installed at: ${when}`,
  "cli.status.channel": ({ channel }) => `channel: ${channel}`,
  "cli.status.autoUpdate": ({ status }) =>
    `auto-update: ${status} (file checked; whether the service runs was not checked)`,
  "cli.status.unavailable": ({ plugins }) =>
    `  plugins this installer does not distribute: ${plugins}`,
  "cli.status.failed": ({ plugins }) => `  plugins that failed: ${plugins}`,
  "cli.status.files": ({ state }) => `  files: ${state}`,
  "cli.status.filesMissing": ({ list }) => `missing: ${list}`,
  "cli.status.filesClaude": "native registry present; loading not verified",
  "cli.status.filesPresent": "present",
  "cli.status.checkout": ({ path }) =>
    `\nmarketplace checkout (claude): ${path || "not found"}`,
  "cli.status.checkoutOf": ({ name, path }) =>
    `marketplace checkout ${name} (claude): ${path}`,
  "cli.market.gone": ({ label }) =>
    `  ${label}: removed and not registered again; run \`marsai update\``,
  "cli.market.on": "on",
  "cli.market.off": "off",
  "cli.market.unknown": "unknown",
  "cli.market.local": ({ version }) => `local checkout v${version || "?"}`,
  "cli.market.line": ({ label, where, autoUpdate }) =>
    `  ${label}: ${where} | Claude auto-update: ${autoUpdate}`,
  "cli.market.drift": ({ expected }) =>
    `  ! behind the stable channel (${expected}): run \`marsai update\``,
  "cli.remove.nothing": "nothing to remove",
  "cli.remove.wouldRemove": ({ targets }) => `would remove targets: ${targets}`,
  "cli.remove.target": ({ target }) => `\n==> removing [${target}]`,
  "cli.remove.mcpFailed":
    "Could not remove a managed MCP connection. State kept for another try.",
  "cli.remove.claudeFailed":
    "The Claude removal failed; state kept for another try.",
  "cli.remove.codexSkills": ({ list }) =>
    `  ✓ skills removed: ${list || "none"}`,
  "cli.remove.codexRules": ({ list }) => `  ✓ rules removed: ${list}`,
  "cli.remove.none": "none",
  "cli.remove.done":
    "\n✓ MarsAI content and the unchanged managed MCP connections removed. MCP connections that existed before or were edited, and credentials, were kept.",
  "cli.doctor.title": "\nMarsAI · Check",
  "cli.doctor.testMode": "Test mode: checking the alternative folder.",
  "cli.doctor.nothing": "No installation recorded.",
  "cli.doctor.filesPending": ({ n }) =>
    `  ! ${n} pending ${n === 1 ? "item" : "items"} in the files. See status.`,
  "cli.doctor.filesOk": "  ✓ Installed content present.",
  "cli.doctor.failed": ({ targets }) =>
    `Check pending or failed: ${targets}. See the states above.`,
  "cli.unknownCommand": ({ command }) =>
    `unknown command: ${command}. Use install | update | migrate | status | doctor | remove.`,
};
