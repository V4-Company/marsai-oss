---
name: refinement-doc
description: "Produces the technical refinement document of a ticket or feature as an HTML page in a standard structure (before × after, closed decisions, flow, entity-relationship, contracts, changes per repository, edge cases, rollout, rollback and verification), with the same visual semantics for new × existing in every diagram. Use when the person asks for a 'refinement document', 'put the technical plan together', 'refine PAY-XXX in HTML', 'implementation plan for the team', 'update the refinement', or pastes a ticket asking for the visual design of the solution. Skip when the request is to write or publish the issue in Linear (use marsai-dev:to-spec), for an ADR of a decision already made, an executable spec or code implementation."
---

# Refinement doc

Produces a technical refinement the team reads in five minutes and implements without an extra meeting. The document records **closed** decisions, with the real names from the code, and shows everywhere what is new against what already exists.

The standard is one of **structure and semantics**, not a template: the sections, the order, the minimum content of each one and the meaning of the colours are fixed; the HTML and the style are yours to build.

## When to use

- The team needs to see the solution drawn before implementing it: the flow between services, the schema and the contracts on a single page.
- A refinement that was already published changed a decision and needs to be republished.

## When to skip

- The deliverable is the spec in Linear (Job Story and Tech Refinement in the parent issue). Use `marsai-dev:to-spec`, which can link this document in the issue.
- The decision is already made and only needs recording: that is an ADR.
- The work is already designed and approved: implement it with `/marsai-dev:implement`.

## Rules that do not change

- **Facts come from the code.** Every class, table, column, event, route, flag and file mentioned was read in this session. A proposed name is marked as new, and the text says it is new.
- **Closed decisions only.** Discarded alternatives appear with the reason. Open questions are settled with the person before writing; what is left goes to the "Still open" section, never scattered through the text.
- **New × existing is visible in everything.** Diagrams, contracts and tables use the same colour semantics (below), and every figure has a legend.
- **Every refinement has an ER.** Even with no new table, it shows the entities read or written, the cardinality, which service each one lives in and how the services correlate.
- **Concrete values.** Real examples (amounts in cents, shortened ids, product names), never `foo`/`bar`. The Verification states the expected value.
- **Short, declarative sentences, in the language the repository already uses.** No "we will", "it would be interesting", "we could": the document states. No em dash in the text; use a colon, a full stop or `·`. Identifiers always inside `<code>`.

## Flow

1. **Scope.** Collect the ticket (through the Linear MCP, if connected; otherwise ask for the text), the affected repositories, the feature flag and the cut (e.g. V2 only, per tenant). If there is already a spec published by `marsai-dev:to-spec`, start from its decisions instead of reopening them.
2. **Investigation.** Read the current flow end to end in each repository: entry points, aggregates and tables touched, events published and consumed (with payload), existing flags and the closest pattern to copy. Before reading, check that each checkout is up to date (`git fetch`, and `git rev-list --count HEAD..origin/main` equal to 0); old code produces false names and a false `file:line`. With three or more repositories, use one `Explore` agent per repository in parallel. For the ER, read each service's schema (`schema.prisma` or the equivalent).
3. **Decisions.** List 4 to 6 decisions. For each one the code does not settle, ask the person, recommending an option. Do not write with a structural decision still open.
4. **Writing.** Build the HTML following "Document structure" and "Visual semantics". Save it as `<ticket>-<slug>.html` (in the scratchpad, if there is one).
5. **Check.** Go through the "Checklist before publishing" and fix what fails.
6. **Publication.** If the Artifact tool is available, publish through it; revisions use the same file to keep the URL. Otherwise, hand over the file. Answer with the link, the decisions in one line each and what was left open.

## Document structure

The beginning (1 to 3) and the end (10 to 14) have a fixed order. The middle (4 to 9) follows the order of reading: if the schema is the centre of the change, the ER comes before the flow; if the objection only makes sense after seeing the chain of events, "Why not" comes after the flow.

| # | Section | Required |
| --- | --- | --- |
| 1 | Header | yes |
| 2 | Before × after | yes |
| 3 | Decisions closed in the refinement | yes |
| 4 | Why not X | when a "natural" alternative was discarded |
| 5 | Flow (flowchart or sequence) | yes |
| 6 | Entity-relationship | yes |
| 7 | Methods (routes) | when there is a new or changed route |
| 8 | Behaviour matrix | when the behaviour varies by type |
| 9 | Contracts | when there is a new payload |
| 10 | Changes per repository | yes |
| 11 | Edge cases | almost always |
| 12 | Still open | only if a non-structural question is left |
| 13 | Rollout, rollback and risks | yes |
| 14 | Verification | yes |

### 1. Header

- **Top label** (small, uppercase, monospace): `Linear PAY-XXX · Product · repo-a · repo-b · technical refinement`.
- **Title:** the result for whoever uses it, not the technical task. "Mentoring sold as a 6 or 12-month subscription", not "Add SubscriptionTerms".
- **Lede:** 2 to 4 sentences with what changes, what explicitly does not change, the flag and the cut. If a decision disarms the obvious objection ("nobody generates a new link"), it goes here.

### 2. Before × after

A strip with four cells side by side: two "today" and two "after". Each cell has a label (`Today · seller`, `After · 12m`), a highlighted value and a line of detail or source. "Today" in a neutral tone (struck through when the numbers are comparable); "after" in the colour for new. A note below explains the premise of the example.

### 3. Closed decisions

4 to 6 cards. The card title is the decision as a short, memorable statement ("Expose, do not generate", "Store ≠ show", "The rule lives in one place"). The body says what was decided, why and which alternative was left out. One decision per card. These almost always need to appear: where the business rule lives; what is a copy and what is a reference; where the flag acts (read, write or both); what stays untouched.

### 4. Why not X

A note on why the alternative looked natural, and one risk card per concrete coupling it would create, naming the class, the use case or the strategy that would have to change.

### 5. Flow

One SVG diagram. Choose by what matters:
- **Sequence with lanes** when the flow crosses services over HTTP and events: one dashed vertical lane per service, with the name in uppercase at the top; horizontal arrows labelled with the route or the event (and the relevant field in braces); boxes centred on the lane of whoever executes; the HTTP return as an arrow in the opposite direction, with the status.
- **Flowchart with a decision** when what matters is the condition (flag, product type): horizontal bands per stage; a diamond in the flag colour for each condition; the "yes" branch leading to the new flow and the "no" branch to the legacy one, marked "(current)".

The caption below says what already exists, what comes in and, when it matters, the latency.

### 6. Entity-relationship

- **Source:** each service's schema. Table and column names exactly as in the schema; read the uniqueness constraints, the `onDelete` and the optional columns.
- **Tables:** a box with a header. New: the colour for new, a thicker border, the label `NEW`. Existing: a neutral tone, the label `existing`, `existing + 1 column` or `existing · <role>`. A new column in an existing table gets a band in the colour for new.
- **Columns:** the prefixes `PK`, `FK`, `UQ`; only the relevant ones, with a faded `… (rest)`; the composite constraint on the last line (`UQ (order_id, instalment_number)`).
- **Relations:** the cardinality in the label (`1 : N · one per instalment`, `1 : 1`) with a crow's foot or a dash marker; `onDelete: Cascade` when it exists.
- **Services:** one region per service, separated by a dashed vertical line, with the name at the top. Correlation between services is never an FK: a dashed line in the colour for new, with a label for how the id travels ("orderId travels in the metadata: it is not an FK").
- **No new schema:** show the entities touched all the same, all neutral, highlighting only what changes role.
- **Caption:** say where each piece of data lives and what is a copy or a reference. If the schema stores master data, include below it a table with real example rows and the calculated columns marked `(calculated)`.

### 7. Methods

A table of Action / Route / Use case / Body and return. A coloured HTTP method badge for a new route and a neutral one for an existing route that gains a field (with "(existing)" beside it). A note before it says which route and auth convention was followed. Then, cards with the aggregate's invariants, the domain service (with the formula) and the new exceptions.

### 8. Behaviour matrix

A table of the axis that varies (payment method, product type, status) against the behaviour. Yes in the colour for new, no in the risk colour, "already exists" or out of scope faded. A note records the premise that supports the table.

### 9. Contracts

Code blocks in a grid, each with a `service · contract` header and the file on the right. Existing fields in grey, new fields in the colour for new, comments in faded italics. Include a real JSON example when the format is not obvious. Typical order: the upstream event or response, an example, the inputs, the downstream domain and persistence, the downstream response, the use in the frontend.

### 10. Changes per repository

One card per repository, in deploy order. In the header, a badge with the name of the flag when the repository reads the gate, or `additive · no flag` / `no change`. Items with real file and class names; the last one is always "Tests: …". The repositories with no change share one card explaining why nothing changes.

### 11. Edge cases

A table of Case / Handling. Cover: redelivery and idempotency, an unexpected state of the aggregate, missing data, the flag off on one side only, the legacy flow next to the new one, and a failure in the asynchronous chain.

### 12. Still open

One dashed card in the flag colour per question, with who decides, by when and the default if nobody decides.

### 13. Rollout, rollback and risks

Two cards. **Rollout order**, numbered, with each step inert until the next: first the additive part, then whoever produces data, then the frontend, and last turning the flag on per tenant (including the steps that register data). **Rollback and risks:** the first item is always `Rollback:` (ideally "turn the flag off", and what happens to what was already written); then the operational risks and `Out of scope:`.

### 14. Verification

An objective list: the CI gate per repository (the repository's Check Command, the one script that runs lint, typecheck and tests); one scenario per repository with the exact expected value; one end-to-end scenario with a measurable criterion; and the regression of the legacy flow.

## Visual semantics

The exact colours are free; the **roles** are not. Define them as CSS variables on `:root`, with a variant for the dark theme, and always use `var(--…)` inside the SVG, never hex.

| Role | Use | Suggestion (light / dark) |
| --- | --- | --- |
| `--accent` + `--accent-soft` | new: boxes, columns, arrows of the new flow, new fields | `#3346d3` `#e7eafc` / `#93a2ff` `#232a52` |
| `--legacy` + `--legacy-soft` | existing and unchanged, today's state | `#6b7186` `#eceef3` / `#a3a8bb` `#23273a` |
| `--flag` + `--flag-soft` | decision by flag or condition, flag badge, still open | `#a15c00` `#fbefdc` / `#f0b25c` `#3a2a12` |
| `--bad` + `--bad-soft` | risk, discarded alternative, "never" in the matrix | `#b3261e` `#fbe4e2` / `#ff8a80` `#3d1a17` |
| `--muted` | ordinary arrows, labels, notes | `#5b6178` / `#9aa0b8` |

Dashed lines mean one of two things: out of scope or read-only (neutral), and correlation without an FK (in the colour for new). Do not use dashed lines for anything else.

Layout: a single column of up to ~1000px; spaced sections; cards in a responsive grid; tables and SVGs inside a container with horizontal scrolling, with the SVG at a minimum width of ~760px and a minimum font size of 10px. A sans font for text and a monospace font for identifiers, arrow labels and ER columns.

## Checklist before publishing

- [ ] The required sections are present, the beginning and the end in order, with no placeholder.
- [ ] The title states the result for the user; the lede mentions the flag and what does not change.
- [ ] Every name mentioned exists in the code that was read or is marked as new.
- [ ] The ER matches the schema (table, column, unique, cascade), marks as NEW only what the migration creates and has the cardinality on every relation.
- [ ] Every figure has `role="img"`, an `aria-label` that describes the whole diagram, a colour legend and a caption.
- [ ] No fixed colour (hex) inside an SVG; the dark theme stays readable.
- [ ] No em dash in the text.
- [ ] The rollout leaves each step inert until the flag; the rollback is the first item of the risks.
- [ ] The Verification has concrete expected values and covers the regression.

## Examples

**"Refine ORD-42: SUBSCRIPTION item on POST /orders/items"**
Linear → read `AddOrderItem`, `OrderItem`, the mapper and the product catalog → ask whether the copy of the options stays on the item → a document with before × after in values, the ER of `OrderItems` with the new column highlighted, the response contract and cards for orders and the frontend.

**"Update the refinement of the first instalment link: we decided not to do the optional status branch"**
Read the existing artifact → remove the optional item from the cards and the related edge case → checklist → republish at the same URL.
