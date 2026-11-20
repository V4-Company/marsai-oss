# Optional extras

Skills adapted from Matt Pocock, Cathryn Lavery, Lauren Tan and Theo Browne, selected separately from the main MarsAI flow.

| Skill | Invocation | Purpose |
| --- | --- | --- |
| teach | User only | Guided learning with a mission and learning record |
| research | User or agent | Primary-source research recorded in Markdown |
| grill-me | User only | A general interview to sharpen a plan, design or idea |
| in-your-own-words | User only | The agent restates what it understood of your goal and of the problem |
| writing-for-agents | User or agent | Instructions, context pointers and information hierarchy for agents |
| marsai-diagram | User or agent | Editorial HTML/SVG diagrams, V4 defaults, client profiles and visual verification |
| sol-loop | Phrase "sol loop" or `/` | A model from another provider, GPT Sol by default, reviews the change in up to three rounds |
| full-send | Phrase "full send" or `/` | Takes the work to a merged pull request without the person watching; merges by itself only a two-way door (ADR 0018) |
| full-stop | Phrase "full stop" or `/` | The work of full-send, stopping with the pull request ready for the person to merge |

These are Claude Code invocation permissions; other targets may expose them differently. The general grill has no dependency on MarsAI’s planning records or ticket pipeline.

Install with `npx --yes github:V4-Company/marsai-oss install --group extras`, or `claude plugin install marsai-extras@marsai-oss` after registering the marketplace. The main installation excludes this pack.

Source and license: [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

`/marsai-extras:marsai-diagram` adapts Cathryn Lavery's Diagram Design with a ready V4/MarsAI profile, at least 9 px labels, deployed/proposed status, source notes and a required screenshot inspection loop. `profile`, `doctor`, `import` and `export` are arguments to that skill. It includes the type references, templates, import/export helpers and geometry checks. Its separate name and profile library let it coexist with the upstream global plugin. Python 3.10+ runs the checks; screenshots need the host browser or local Chrome/Chromium.
