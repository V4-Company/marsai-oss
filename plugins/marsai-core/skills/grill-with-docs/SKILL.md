---
name: grill-with-docs
description: "Interview that sharpens a plan or design until no implicit decision is left, recording the glossary and the decisions in the repository. Use when someone wants to plan a change, test an idea or asks for a grill, and when another skill finds open decisions."
---

# Grill with docs

Interview the person until you reach a shared understanding, and write the language and the decisions into the repository as they come up. You ask, fetch the facts and recommend. The person decides: planning is their job.

## The intent comes first

Before the tree, confirm the intent in the words of whoever had the idea: the problem, the expected result, how success is measured and what is out of scope. When the issue already has it, say it back in one line each and confirm. What is missing is the first round.

## The interview

Treat the plan as a **decision tree**: each decision opens the ones that depend on it. Work in **rounds**. The **frontier** is the decisions whose prerequisites are already resolved, the questions you can ask now without guessing answers you have not heard yet. Ask the whole frontier at once, numbered, with your recommendation on each question, and wait for the answers.

```
❓ **Q1 - <title>**: <the question, with the options when there are any>

➡️ <your recommendation and why>

---

❓ **Q2 - <title>**: ...
```

Each answer redraws the tree: recompute the frontier and run the next round. A question that depends on another still open waits for the following round.

The grill ends when the frontier is empty: every branch visited, nothing silently assumed. Summarise the decisions and move on only after the person confirms the summary.

## Facts are yours

Ask only what is a decision. Before each round, fetch the facts the questions depend on:

- **Code**: what counts is what was read in this session, with file and line, from an up-to-date checkout (`git fetch` and `git rev-list --count HEAD..origin/main` equal to 0). A broad search goes to the `Explore` agent.
- **Linear**: if the work starts from an issue, read the issue and the comments before asking.
- **Event catalog**: who publishes and who consumes each event. Use the event catalog (through its MCP, when one is connected); without it, read the shared events package and the handlers.
- **Call transcript**: the decisions the call already made go in as resolved branches, and the grill covers what was left open. Check every technical name it cites against the code, because a transcript gets names wrong.

A search in progress does not hold up the round: only the questions that depend on it wait.

## Repositories come first

The first fact of the tree is the list of repositories and services the change touches. Find it from the code and the event catalog, and from the pointers and the wiki when the session runs in a Home Repo; show the list and confirm it with the person. If there is more than one, also record the deploy order and the contract that links each pair: that is what `/marsai-dev:to-tickets` uses to cut the work into vertical slices.

## Docs as you talk

- **A resolved term** goes into `CONTEXT.md` right away, in the format of [CONTEXT-FORMAT.md](CONTEXT-FORMAT.md). When the person uses a vague word or one with two meanings, propose the canonical word. When their word contradicts the glossary, point it out right away. When they say how something works, check it in the code and show the contradiction, if there is one.
- **A decision** becomes an ADR in `docs/adr/` when it is hard to undo, surprising without context and the result of a real trade-off. If one of the three is missing, it is not an ADR. Format in [ADR-FORMAT.md](ADR-FORMAT.md).
- **An invariant** another team has to respect ("an instalment is never paid twice") is an ADR: it is the rule that someone from outside the context has no way of guessing.
- Create the files only when there is something to write. In work that crosses repositories, the term and the decision live in the repository that owns the concept; one that no single repository owns, such as a contract between services or a rule of the whole system, lives in the team's Home Repo.

## A question that calls for a prototype

When a question can only be settled by seeing it work, do not spend this conversation building the prototype. With the person's OK, write a handoff (`marsai-core:handoff`) for another agent to build it with `marsai-dev:prototype`, and carry on with the questions that do not depend on the answer. The branch stays open until the answer comes back.

## Afterwards

If the tree reveals more questions and dependencies than can be resolved in this conversation, propose `/marsai-core:wayfinder`. Take the decisions made and the open branches to the map in Linear; the person decides whether to open that path. A bug, a small adjustment or tech debt goes straight to `marsai-dev:implement`.

For a feature, the summary also lists the hypotheses the demo will test, who will use it and what counts as success. With the summary confirmed, the next step is `/marsai-dev:demo`. When the only open question is how to build it, the next step is `/marsai-dev:to-spec`, in the same conversation.
