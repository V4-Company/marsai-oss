---
name: wayfinder
description: "Organises planning that has grown beyond one conversation into a decision map in Linear. Use after the grill when there are still many dependent questions, or to resume an existing map."
argument-hint: "[grill context or URL of the map in Linear]"
disable-model-invocation: true
---

# Wayfinder

Turn the grill's context into a decision map that survives several sessions. The person decides; the agent investigates, organises and records. Adapted from [Matt Pocock](https://github.com/mattpocock/skills/tree/main/skills/engineering/wayfinder).

## When to use it

A small change, easy to review and redo, goes on to `marsai-dev:implement`. A larger change starts in `marsai-core:grill-with-docs`. Use Wayfinder when that alignment reveals more questions and dependencies than can be resolved in one conversation. If the path has already become clear, there is no need for a map: the grill closes and the work moves on.

The map resolves decisions. The implementation slices come later, with `marsai-dev:to-tickets`. An operational task fits here when it unblocks a decision, such as getting access to investigate an API.

## Create the map

1. Read the grill and the existing documents. Reuse the decisions made and the evidence, without repeating the interview.
2. Confirm the **destination** with the person: what has to be decided by the end, the scope and how to recognise that the path has become clear. Use the interview format of `marsai-core:grill-with-docs` for the open questions.
3. Find the Linear team and project from the current work. If access or destination is missing, ask only for what is needed and keep the draft in the conversation until you can publish.
4. Create a map issue in Linear, identified as `wayfinder:map`, with the sections **Destination**, **Context and preferences**, **Decisions made**, **What we cannot specify yet** and **Out of scope**. Reuse the existing label; create it if necessary. Decisions already recorded go in by name and link.
5. Create child issues only for questions you can already formulate. Each one should fit in one session and state the question, the evidence needed and the type: **research**, **prototype**, **grill** or **task that unblocks a decision**. After creating them, record the blocking relations with Linear's native relations and real links.
6. Present the map, the first unblocked questions and what remains undefined. Creation ends here; the person can resume from the URL in another session.

The map is an index: it summarises each decision in one line and points to the issue that holds the answer. Uncertainty that has not yet become a question stays in **What we cannot specify yet**; excluded work stays in **Out of scope**.

## Resume the map

1. Read the map issue and query its open children. The **frontier** is the children that are unblocked and unassigned. Load details only for the chosen question and for the decisions it depends on.
2. Use the question the person indicated, or propose the first one on the frontier that brings the destination closer. Assign it to the person leading the session, check that it is still available and mark it in progress before working. Preserve work already taken by another session.
3. Resolve one question per session: research brings facts and sources; prototype uses `marsai-dev:prototype` and receives the person's verdict; grill uses `marsai-core:grill-with-docs`; task records the result that unblocks the decision. Facts can be fetched by subagents; design decisions stay with the person.
4. Record the answer and its evidence in a comment on the child. Close it when the criterion is met and the decision that depended on the person has been confirmed. Update the map's index with name, link and summary. Durable terms and decisions follow the grill's glossary and ADR formats.
5. Query the current state again before editing the map, to preserve updates from other sessions. Reassess blocking relations and uncertainties: questions that can now be formulated become children; invalidated decisions are corrected; excluded work is closed with a reason and a link in **Out of scope**.

## When to stop and what to return

Stop when a decision from the person, the access needed or the evidence to resolve the question is missing. Return the concrete blocker and keep the child open.

At the end of the session, return the named links to the map and to the question, the decision recorded, what it unblocked and the next question. The map ends when the destination has been reached, the relevant children are resolved and no uncertainty needed for execution is left. For a feature, the next step is `marsai-dev:demo`, which tests the hypotheses the map settled on; the spec comes after it. When the only open question is how to build, the next step is `marsai-dev:to-spec`, taking the map as the source, and then `marsai-dev:to-tickets`.
