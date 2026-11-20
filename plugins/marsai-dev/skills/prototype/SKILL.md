---
name: prototype
description: "Builds a throwaway prototype to answer a design question. Use when someone wants to get a feel for whether a business rule or a state machine is right, compare options for a screen, or see what happens in an exchange of events between services when something goes wrong."
---

# Prototype

A prototype is **throwaway code that answers a question**. The question decides the shape.

It answers one design question, usually in the middle of a grill. A whole feature that has to prove its value to a real user is a `marsai-dev:demo`.

## Choose the branch

Identify the question from the request, from the surrounding code, or by asking:

- **"Is this rule or this state model right?"** → [LOGIC.md](LOGIC.md). A single HTML file, with free buttons and guided scripts, that pushes the rule through the cases that are hard to imagine on paper and that someone from product can click through alone.
- **"What should this screen look like?"** → [UI.md](UI.md). Several radically different versions on the same route, built with the repository's component library, switchable through a URL parameter.
- **"What happens between the services when an event arrives twice, out of order, or the provider fails?"** → [FLOW.md](FLOW.md). A single HTML file in which each service is an actor and each event is a message that you deliver, repeat, hold or drop.

The branches produce very different things, so a mistake here wastes the prototype. If the question is ambiguous and the person is not around, choose based on the surrounding code (aggregate or use case → logic; page or component → screen; event handler → flow) and write the assumption at the top of the prototype.

## Rules for the three branches

1. **Throwaway from day one, and it looks throwaway.** Keep the prototype close to where the real code will live, with `prototype` in the name of the file or the route, so nobody mistakes it for production.
2. **Trivial to run.** A screen prototype starts with the dev command the project already has. A logic or flow prototype is an HTML file that opens with a double click.
3. **No persistence.** State lives in memory. If the question is about the database, use a scratch database with a name that says it can be deleted.
4. **No polish.** No tests, no error handling beyond what it takes to run, no abstraction. The goal is to learn fast.
5. **State in view.** After each action, show the full state that matters, so the person sees what changed.
6. **Keep the answer and the prototype.** The validated decision goes into the spec (or into an ADR, if it is hard to undo) and then into the real code. The prototype goes to a `prototype/<name>` branch, outside `main`, with the link in the Linear issue. If the team has a prototyping status in Linear, the issue stays in it while the prototype is being evaluated. If the prototype came from a handoff, return the answer the same way (`marsai-core:handoff`), so the conversation it came from can continue.
