# Releasing a version

One version covers everything public: `marsai-core`, `marsai-dev`, `marsai-extras`, the installer and the marketplace. It follows semantic versioning, read from the side of whoever uses the flow:

| Bump | When |
| --- | --- |
| Major (`5.0.0` → `6.0.0`) | Someone has to change what they do: a skill renamed or removed, a step of the flow that changed, a rule of the guard hook that now blocks something |
| Minor (`5.0.0` → `5.1.0`) | Something new that changes nothing for who does not use it: a skill, a step, an option |
| Patch (`5.0.0` → `5.0.1`) | A skill that behaves better with the same contract, a fix, a text |

A change that nobody needs to receive (a test, this document, the site) needs no version.

## Steps

**1. In the pull request that changes the content**, bump the version and say what changed:

```bash
node scripts/version.mjs bump 5.1.0
```

It writes the version in the public manifests that carry it and in the Homebrew formula, and opens the `## 5.1.0` entry in [CHANGELOG.md](../CHANGELOG.md). Write that entry for whoever uses the flow: what breaks, what is new, what was fixed. `node scripts/version.mjs check` runs on every pull request and fails when the places disagree or the entry is missing.

**2. Merge the pull request.** That is the release. The `release` workflow sees a version on `main` that has no tag yet and:

- creates the tag `v5.1.0`;
- creates `marsai-core--v5.1.0`, `marsai-dev--v5.1.0` and `marsai-extras--v5.1.0` on the same commit;
- publishes the GitHub Release, with the CHANGELOG entry as its notes.

**3. Confirm:**

```bash
git ls-remote --tags origin "v5.1.0"
brew update && brew info marsai
```

## Who reads which tag

| Tag | Who reads it |
| --- | --- |
| `v{version}` | The Homebrew formula and the `stable` channel of the installer, which registers the Claude Code marketplace pinned to it |
| `{plugin}--v{version}` | Claude Code, to resolve a dependency with a version range. A team pack that declares `{ "name": "marsai-dev", "version": "^5.0" }` installs the highest tag that satisfies it |

People on the `main` channel (`npx --yes github:…`) receive what is on `main`. Claude Code updates a plugin only when the `version` string of its `plugin.json` changes, which is why a change people should receive always comes with a bump.

## Tags do not move

The `v*` tags are protected by a GitHub ruleset (Settings, Rules, Rulesets, target "Tags", pattern `v*`) that blocks update and deletion. A published tag never points to another commit, for brew or for the Claude Code marketplace. A wrong release is fixed with a new patch version.

## The Homebrew formula

`Formula/marsai.rb` installs the tag of the current version, and `node scripts/version.mjs bump` keeps its `tag:` in step.

- **A wrapper instead of a symlink.** The `#!/usr/bin/env node` of `cli/bin/marsai.js` would pick the first `node` on the PATH, which changes between shells. The wrapper runs the `node` of brew.
- **`MARSAI_CHANNEL` in the wrapper.** It exports `MARSAI_CHANNEL=stable` when the variable is not set. That is what makes an install through brew the `stable` channel, with no flag.
- **No `revision`.** It would pin the sha of the tagged commit, but that commit contains the formula itself, and a commit cannot contain its own sha. What `revision` would protect is covered by tags that do not move.
- **No `head`.** The formula's test compares `--version` with the formula version, which does not hold for a build of `main`.
- **`npm ci` in `libexec`.** The dependencies are exactly the ones in the lockfile, and no package script runs at install.
