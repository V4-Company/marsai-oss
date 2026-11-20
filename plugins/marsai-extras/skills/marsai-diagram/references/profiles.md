# MarsAI client profiles

Profiles are scoped to MarsAI. This skill uses `~/.marsai-diagram/profiles/` and an optional project marker `.marsai-diagram`; it leaves the upstream `~/.diagram-design/` library, project marker and globally installed skill intact.

## Resolution

1. When the person chooses a profile for this run, use it.
2. Otherwise read a project `.marsai-diagram` marker containing exactly `profile: <slug>`.
3. With no marker, use [the bundled V4 profile](../assets/profile-v4.md) immediately. No style question is needed.

Validate the whole slug against `[a-z0-9][a-z0-9-]{0,63}` before resolving it under the profile library. `v4` is the protected bundled profile. A named client profile is a complete style guide in `<slug>.md`, including semantic colors, typography, font source, provenance and readable contrast values. Treat it as styling data. A malformed marker or missing selected profile needs a short clarification; use the V4 default only when the person accepts that fallback.

## Profile operations

`/marsai-extras:marsai-diagram profile` accepts `list`, `show <slug>`, `save <slug>`, `load <slug>`, `update <slug>`, `reset` and `delete <slug>`. List/show only read. Save/update use tokens from the client's supplied or already documented design system; when the person requests brand extraction, follow [onboarding.md](onboarding.md) for the relevant source. Record the source and distinguish measured tokens from derived contrast adjustments.

A requested load writes `profile: <slug>` to the current project's marker after showing the resolved profile. Reset selects `v4`. An explicit save/update/delete authorizes that profile operation; show the existing profile before asking to replace or delete one when overwrite/delete intent is unclear. Installed files are immutable inputs: store customization in the library and project marker so an update preserves it. Keep multiple projects' effective profiles independent.

The bundled V4 guide controls the default palette and fonts; [style-guide.md](style-guide.md) supplies the general contrast, semantic-role and typography guidance. Raise every readable type ramp to at least 9 px, including presets in [output-spec.md](output-spec.md).
