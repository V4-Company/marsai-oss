# Make MarsAI fit the project

Help a new user adapt the flow to their architecture and way of working, then start one useful task. Talk in their language and match the technical detail to their role. This is a brief setup interview, not the Grill for a feature.

## 1. Inspect before asking

Read the setup already recorded in `docs/marsai.md`, if present, and the repository's agent instructions. Inspect manifests, folder boundaries, architecture docs and ADRs, reference implementations, test scripts and CI configuration. Follow the documents the person points to. Read only the repositories in the workspace or those they named.

Keep facts found in the files separate from decisions that still belong to the person. An existing codebase is the starting point, including its stack and architecture.

## 2. Interview briefly

Ask at most four short questions, one or two at a time, skipping what the conversation or repository already answered:

- **Person and project:** do they develop, own product, design, or lead the team? Are they starting from scratch or working on an existing product? Are they alone, in a small team, or part of a larger company?
- **Architecture:** what stack and structure do they use, such as a monolith, services or a monorepo? Which repository, service or existing feature should be the reference? For a nontechnical person, ask who owns the technical decisions and learn the details from the files or that owner.
- **Existing agreements:** where are architecture decisions, coding Standards, generators and implementation guides kept? Which practices are fixed by the team, and who decides when an exception is needed?
- **Delivery:** which issue tracker, checks, review and deployment process do they use? What real problem would they like to try first?

For a new project with no architecture, describe a small set of suitable choices and let the person decide the stack and structure. Record unknowns explicitly. Team size alone does not justify services or a new architecture. In an established company, preserve the existing agreements and identify the owners who can change them.

## 3. Show the concrete adaptation

Return a short map, backed by the files you inspected:

| Part of MarsAI | What to connect in this project |
| --- | --- |
| Demo and technical refinement | The chosen repository, architecture boundaries, reusable components and reference feature |
| Implementer | The existing scaffold or generator and reference code; name an installed `Implementation guide:` skill when one exists |
| Reviewer | The paths to existing architecture decisions and coding Standards; use a `Standards extension:` skill for shared team rules when available |
| Checks | The actual lint, typecheck, test and CI commands; distinguish commands found from commands you successfully ran |
| Gates and delivery | The people who own decisions, the team's tracker, review tools and deployment process |

Follow the separation between implementation guides and Standards: implementers use the scaffold and examples; reviewers apply judgement-based rules. Deterministic rules belong in checks. Preserve existing rules and refer to them instead of copying them into every skill.

For one repository, local instructions and its existing docs are enough. For several repositories sharing rules, propose or extend the team's own pack using the `Implementation guide:` and `Standards extension:` conventions, and a Home Repo where every session starts (`marsai-core:home-repo`); with one, the setup below is recorded there once, not in each repository. Keep team-specific skills and Standards in the Home Repo's `.claude/` when the team has one, and in the team pack when it does not; use a fork only when the public flow itself needs to change. V4's stack, Linear, its review bot and SonarQube are examples, not requirements for this team. If a skill explicitly depends on an unavailable tool, show the specific substitution needed before routing to it.

List the exact files to create or update and what each will contain. Apply changes already authorised by the setup request. When permission covers only the agent's installation, show the proposed file changes and ask before writing to the project. Ask for a missing architecture decision or access to a required source rather than inventing it.

## 4. Record and start

When project edits are authorised, record the agreed setup in `docs/marsai.md`, or the existing equivalent. Keep it short: role and team context, repository boundaries and stack, paths to architecture docs and reference code, installed guide and Standards skill names, checks, delivery tools, gate owners, and any unresolved decisions. Link existing docs rather than duplicating their rules. Leave credentials out.

Add a small pointer in the repository's existing `AGENTS.md` or `CLAUDE.md`, preserving its instructions and using the canonical file when they are linked. It should tell future MarsAI sessions to read the setup and pass the relevant architecture, reference and guide paths into implementation tasks and handoffs. Review tasks receive the Standards paths. For a team pack, show how to install the pack as well as the public plugins.

Finish by explaining what was adapted, what remains unresolved, and the first useful task. Tell the person to start their work with `/marsai-core:marsai-mode`, which sizes it and sees it through to the end, or choose the fitting skill directly when their task is already clear. A nontechnical user needs an identified technical owner for engineering decisions. With a recorded setup, later sessions reuse it instead of repeating the interview.

Done when the person has a concrete, architecture-aware setup and the next task, or a clearly identified decision or source needed to complete that setup.
