---
name: marsai-mode
description: "The single way into any work with MarsAI. From one sentence or a card, it reads what already exists, recommends the size of the work and its path, keeps the path as a visible checklist and leads the person through it to the end, stopping at each gate. Use to start a session, whatever the work: a feature, a bug, an adjustment, a question about the code, a delivery to check on or a pull request to look after."
argument-hint: "[what you want, or the issue identifier]"
disable-model-invocation: true
---

# MarsAI mode

Lead the person through the whole piece of work, from the first sentence to the last step of its path. You size the work, keep its path in view as a checklist and call the skill of each step in turn. The person decides at the gates; between gates you go on alone.

The mode lasts for the session. Every later message belongs to the same work until the person starts another piece of work; then begin again at step 1.

The idea of one front door, with the path as a visible checklist and a skipped step that keeps its reason, comes from Lauren Tan's `poteto-mode`, in pstack. MarsAI keeps its own rule on top: at every gate, a person decides.

When the person is trying MarsAI for the first time, or the project has no recorded setup, run the setup interview of `marsai-core:using-marsai` first and come back here with the agreed setup.

## 1. Read what already exists

Before asking anything, read what the person wrote, the current branch and whether it has an open pull request (`gh pr view`), the project's recorded setup, and the issue with its comments and children when you were given an identifier or the branch cites one. When the session runs in a Home Repo (`marsai-core:home-repo`), the branches and pull requests that count are those of the repositories the work touches: find the repositories through the home's pointers. A card that already exists is a valid start: say which parts of G0 and G1 it already answers, ask only for what is missing and write the answers back on the card.

Done when you can say in one sentence what the work is and where it stands.

## 2. Size the work and recommend the path

Recommend one path, with its reason in one sentence, and stop there: the work starts only once the person confirms the path or changes it. The paths are the ones on the map in [using-marsai](../using-marsai/SKILL.md).

| The work | Path | Starts at |
| --- | --- | --- |
| A new behaviour whose value nobody has proven yet | Feature: both phases | The problem and the intent, gates G0 and G1 |
| The value is decided and the only open question is how to build it | Hardening | `marsai-dev:to-spec` |
| A bug, a small adjustment, tech debt, a refactor or a measured slowdown, with the expected result already known | Fast track | `marsai-dev:implement` |
| An issue that already went through part of the flow | Where it left off | The first step it still lacks: a demo with its verdict goes to `marsai-dev:to-spec`, a technical refinement without slices to `marsai-dev:to-tickets`, slices to `marsai-dev:implement-spec`, one slice or a small issue with acceptance criteria to `marsai-dev:implement`, and a decision map to `marsai-core:wayfinder` |
| An open pull request | Follow-up | `marsai-core:babysit-pr` |
| A question about the code, or about how a delivery is going | Answer | No skill: see "Answers" below |

When you are unsure whether it is the fast track or a feature, one question settles it: **would we know the change is right by reading the code and running the tests, or only when a user uses it?** If only a user can tell, the work needs a demo. A change that alters what a user sees or does in a way nobody has tried, or that needs a product decision nobody has made, is a feature. A change to one behaviour, with no design decision open, is the fast track.

Ask only what decides the path. A question about the problem, the intent or the design belongs to the step that owns it.

Done when the person has confirmed the path.

## 3. Put the path on the checklist

Copy the checklist of the confirmed path, every line of it, into the session's task list: the harness's todo tool, or a checklist in your reply when there is none. Each `STOP` is a person's decision. Tick what is already done, saying where you saw it. A step this work will not go through stays on the list as `skip: <reason>`, so the person sees what was left out and why. The map in [using-marsai](../using-marsai/SKILL.md) explains each step and gives each gate's owner.

**Feature**

```text
Problem: who is affected, the evidence and the impact          the person, on the issue
STOP G0  Is the problem accepted?
Intent: problem, expected result, how success is measured, what is out of scope   the person, on the issue
STOP G1  Is the intent approved?
Grill: the hypotheses the demo will test and who will use it   marsai-core:grill-with-docs
STOP G2  Ready for the demo?
Demo in the hands of a real user                               marsai-dev:demo
STOP G3  Does the demo fulfill the intent?
Spec: the v1, the technical refinement and the program design  marsai-dev:to-spec
STOP G4  Is the technical plan approved?
Slices in the tracker                                          marsai-dev:to-tickets
Implementation, checks and review, slice by slice              marsai-dev:implement-spec
Open the pull request                                          marsai-core:pr
CI, the review bot, then a person reads it                     marsai-core:babysit-pr
STOP G5  Is the pull request ready?
STOP     Merge, by a person
Production
STOP G6  Delivered for real?
Retro                                                          marsai-core:retro
```

A grill that outgrows one conversation adds `marsai-core:wayfinder` before G2, and a design question that only seeing it work can settle adds `marsai-dev:prototype` inside the grill. At G3, "another round" or "back to the grill" sends the list back to that step, and "drop the idea" ends it.

**Hardening**: the feature checklist, with `skip: G2, the demo and G3. The value is decided and the only open question is how to build it` in place of those three lines. When the decisions came from a call or a document, tick the problem, the intent and the grill from it; `marsai-dev:to-spec` asks the grill only for what it left open.

**Fast track**

```text
The problem in one sentence, with the expected result          the person
Reproduce the bug where it happens, or measure the slowdown    marsai-dev:implement
Implementation, checks and review                              marsai-dev:implement
Open the pull request                                          marsai-core:pr
CI, the review bot, then a person reads it                     marsai-core:babysit-pr
STOP G5  Is the pull request ready?
STOP     Merge, by a person
Production
STOP G6  Delivered for real?
Retro                                                          marsai-core:retro
skip: G0 to G4, with the intent, grill, demo, spec and slices. <why this work is the fast track>
```

A refactor or tech debt has nothing to reproduce: that line becomes `skip: <reason>`.

**Where it left off**: the feature or hardening checklist, with the steps the issue already went through ticked. **Follow-up on an open pull request**: the fast track from "CI, the review bot, then a person reads it" on.

Done when the list shows the whole path, from the current step to the last.

## 4. Lead, step by step

For each step, say in one sentence which skill runs it and why, call it, and tick the step when that skill's own done condition is met. Then go to the next one. A skill that only the person can start, such as `marsai-core:wayfinder`, is the exception: tell them what to type.

- **At a gate, stop.** Say what the gate asks, show what is ready for it and wait for the decision. G1, G3 and G4 are decided with everyone in the room (ADR 0015): leave the material ready for that conversation and record the decision on the issue once the person tells you.
- **Between gates, go on alone.** Stop only when a design decision is missing, a check does not go green or the work would depart from what was agreed.
- **An action that cannot be undone waits for the person**: a merge, a deploy, deleting data, force-pushing a shared branch, writing to a customer. When the person says "full send" or "full stop", the skill of that name says how far you go after the pull request is open (ADR 0018).
- **When the size changes, say so.** A fix that turns out to change what users rely on moves to the feature path; a feature whose only open question turns out to be how to build it moves to hardening. Propose the new path and rewrite the checklist once the person agrees.
- **When the session ends before the path does**, record where it left off with `marsai-core:handoff`. The next session starts in this mode, with the identifier.

Done when every step of the path is ticked or skipped with its reason, or the idea was dropped at G3.

## Answers

- **A question about the code**: read only, change nothing, and answer with the file and line behind each point.
- **How a delivery is going**: read the parent issue, its slices and the pull requests linked to them, and answer what already works, what is in progress, what is blocked and why, and what is waiting for a decision from the person.

## How you work in this mode

- **Find out what can be found out.** Before asking, decide whose question it is. A fact you can observe by reading the code, running it or measuring it is yours: find it out and show it. A call on product, priority or taste is the person's: ask, with your recommendation. A design question that only seeing it work can settle goes to `marsai-dev:prototype`.
- **Say where each claim comes from**: measured, read (in the code, the issue or a log), deduced, or a guess.
- **No is a valid answer.** When an idea, an addition to the scope or an approach does not pay off, say so and why.
- **Speak to the person in front of you.** With a product person, talk about what changes for whoever uses the product, and explain a technical term when one is needed.
