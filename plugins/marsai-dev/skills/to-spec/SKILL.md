---
name: to-spec
description: "Turns what has already been decided into a spec published on the Linear parent issue, anchored in the current code. After a demo, it cuts the v1 from it. Use after a demo that proved its value, after a grill when the only open question is how to build, or when there is a call transcript with decisions, a feature to refine, or someone asks to write the issue, the job story or the tech refinement."
---

# To spec

Synthesise what has already been decided into a spec and publish it on the Linear parent issue. There is no interviewing here: a decision that is still open is settled with the person before writing.

## 1. Gather what already exists

- **There was a demo**: read its branch, and the feedback and decision on the issue. The spec describes the v1, which is smaller than the demo. Propose the cut and, part by part, what is reused from the demo and what is rewritten; the person confirms both with the tech lead before you write. A demo built outside the codebase gives the cut and nothing to reuse: every part is rewritten, and the fit with the system goes into the risks (ADR 0014).
- **There was a grill in this conversation**: the decisions are here. Use them.
- **You were given a Wayfinder map**: read the index and the resolutions of the relevant children in Linear. Use the decisions as the source of the spec and link the map. Design questions that are still open go back to the map before they become implementation slices.
- **The input is a transcript, an issue or a request**: extract the decisions, the constraints and the questions that remain. A question that changes what the spec needs to state goes to `marsai-core:grill-with-docs`, limited to those questions. A peripheral question becomes an open question, with an owner.
- Read the `CONTEXT.md` and the ADRs of the repositories touched and write with that vocabulary.

Done when every question has a destination: a decision, an acceptance criterion or an open question with an owner.

## 2. Read the current code

Every technical claim in the spec comes from code read in this session, with `file:line`. Memory and transcripts do not count: a transcript gets names wrong (in one real case, "be to be" was the enum `B2B`). Tell the person about each correction made relative to the source.

1. **List the repositories** the change touches. If the grill already listed them, use that; otherwise, find out and confirm.
2. **Check that each checkout is up to date** before reading:

   ```bash
   git fetch origin --quiet
   git rev-list --count HEAD..origin/main   # 0 = reliable
   git status --porcelain | wc -l           # 0 = safe to sync
   ```

   Behind, with a clean tree and on `main`: `git merge --ff-only origin/main`. On a branch with the person's work: do not switch branches, read with `git show origin/main:<path>`. A repository 115 commits behind once produced the conclusion "this service does not consume the event", with file and line, and it was false.
3. **One `Explore` agent per repository**, when there are two or more. Ask for what to map (entry point, aggregates, schema, events published and consumed, constraints), `file:line` evidence for each claim and the sync state of the checkout at the start of the report.
4. **Event catalog**: confirm who publishes and who consumes each event involved (through its MCP, when one is connected; without it, the shared events package and the handlers).
5. **Read for yourself** the lines of `schema.prisma` that will appear in the spec. The current model goes in verbatim.
6. **House rules of each repository**: read the `CONTEXT.md` and the ADRs in `docs/adr/` that touch the change, in each repository, including those of another team. Without the clone on the machine, read through `gh` (`gh api repos/<org>/<repo>/contents/docs/adr`). Note the invariants the change must respect: they are what someone from outside the context has no way of guessing.

7. **The call path of the change**: where it enters (route, handler, event, screen), what it calls down to storage, and which tests already cover that path, with `file:line`. The program design is written on top of it.

Done when each repository has its current state with evidence, the list of what changes in it, the invariants that apply there and the call path the change goes through.

## 3. Agree where to test

Say at which point the change will be tested and confirm with the person. Prefer the highest point that already exists: the use case with an in-memory repository for the rule; an integration test for the repository and the controller; an end-to-end test against the running service for the effect on the database. The fewer points, the better.

## 4. Write the spec

The spec lives on the **parent issue**, never in a local folder.

- **Description of the parent**: the product part. Job story, end-to-end acceptance criteria, out of scope. If the PM has already written it, the description is theirs: keep it.
- **Comment on the parent**: the technical refinement, following the template in [TECH-REFINEMENT.md](TECH-REFINEMENT.md). It is the single source of the contracts and of the decisions that apply to all the repositories.
- **Small work in one repository**: a single issue, following the template in [SIMPLE.md](SIMPLE.md).

Diagram, data model and contract decide; prose explains. The program design goes one level below them: the new pieces with their types and signatures, where each one plugs into the existing code, and where the tests hook in. Write it for the person who will read the pull requests, because it is what the code will be checked against (ADR 0015). List the slices and their order as a proposal; `marsai-dev:to-tickets` publishes them after the session. When cutting, cut prose first. For the order of the sections, follow the team's technical refinement template in the tracker, when there is one, and fill in only what reduces uncertainty for whoever implements.

In the end-to-end flow, mark **where it is broken today**: the edge that does not exist, the producer that is missing, the consumer that ignores the field. That is what turns an architecture drawing into the justification for the delivery.

### Making it render in Linear

Code blocks use the ` ```typescript ` fence (Prisma model in Prisma syntax inside it, HTTP contract as a type, event as a DTO). Only a diagram uses ` ```mermaid `.

In a Mermaid node label, these characters break the parser silently:

| Avoid in the label | Write |
| --- | --- |
| `:` and `/`, including in a route (`/companies/:id`) | `companies by id` |
| `=` | `equals`, `null` |
| `;`, `<`, `>`, `%%` | leave them out |
| `?` in a decision node `{}` | leave it out |
| `(` `)` inside `[]` | leave them out |

Node aliases from `A` to `Z`, with no hyphen. If a diagram does not render, find out which one: if the simple one renders and the one with a `subgraph` does not, the problem is the `subgraph`, not the characters.

## 5. Publish

1. **Search before creating** (`list_issues` on the team): if the parent already exists, the refinement goes in as a comment on it.
2. **Show the draft** (job story, decisions, corrections relative to the source) and ask in a single batch what only the person knows: title, TL and PM, team, and the risk level of the change. Offer options; do not invent.
3. **Publish** and leave the parent in the team's technical refinement status, if it has one (`list_issue_statuses` says).
4. **Prepare the session.** The plan is approved in a session of up to 30 minutes with the tech lead, the PM and the developer responsible for the delivery; the tech lead decides (ADR 0015). Give the person what to take to it: the link to the refinement, the decisions that have to be taken in the session and the questions still open. The session is theirs to hold. When they come back, record on the issue who attended, what changed, the tech lead's approval and who will read the pull requests. Done when that record is on the issue.
5. **A decision that is hard to undo** becomes an ADR in the owning repository, in the format of `marsai-core:grill-with-docs`.

Without the Linear MCP connected: hand over the title and body ready to paste and say that you did not publish.

## Afterwards

`/marsai-dev:to-tickets`, in the same conversation, once the technical plan is approved. If the team wants to see the designed solution on a page, `marsai-dev:refinement-doc` starts from this spec.
