---
name: demo
description: "Builds a working demo of a feature so a real user can use it before any hardening: behind a feature flag for selected users when possible, in development otherwise, outside the codebase as a last resort. Use after a grill, when a feature has to prove its value before the technical plan, or when someone asks to see the whole idea working."
argument-hint: "[issue identifier, or what to demo]"
---

# Demo

A demo is a first version that works, inside the real codebase whenever it can be: ugly inside, real outside. It answers one thing in half a day to two days: is this what the user wanted? Full engineering refinement goes into what proved its value. After the demo, `marsai-dev:to-spec` cuts the v1 and hardening prepares it for general release.

A feature goes through a demo. These do not:

| The work is | Go to |
| --- | --- |
| A bug, a small adjustment or tech debt | `marsai-dev:implement` |
| A feature whose only open question is how to build it | `marsai-dev:to-spec` |
| One design question: a rule, a screen, an exchange of events | `marsai-dev:prototype`, which costs less |

## 1. Start from the grill

Read the grill summary and the issue. The demo needs four things from them:

- the **intent**: the problem, the expected result, how success is measured and what is out of scope;
- the **business rules** that are already settled;
- the **hypotheses** the demo exists to test;
- **who will use it**, by name or role.

What is missing goes back to `marsai-core:grill-with-docs`, limited to those points.

Done when you can say, in one line each, what the demo tests, who uses it and what counts as success.

## 2. Size it

A demo takes from half a day to two days of work. If it does not fit, the problem is too big for one demo: show the person two or three smaller demos that each test one hypothesis, and let them choose.

## 3. Build it on a demo branch

In each repository the demo touches, create `demo/<name>` from the up-to-date base branch. A demo outside the codebase lives in a folder of its own, away from the repositories.

Build for speed. Reuse what the codebase already has (components, endpoints, fixtures) and take the shortcut wherever the user will not notice it. The Standards and the review belong to hardening, so they do not run here. Write a test only where it makes you faster.

For the code, dispatch implementers as `marsai-dev:implement` does in its step 2, and say in each prompt that this is a demo: it must work from end to end for the hypotheses of step 1, and nothing else matters yet.

Agree with the person where the demo runs, taking the highest option the feature allows (ADR 0014):

1. **Production, behind a feature flag, for selected users.** The owner explicitly approves the deployment, the audience, the data boundaries and the rollback. Keep the flag off for everyone else and run the safety checks that exposure needs before deploying.
2. **Development, with the user using it directly**: local, a preview or the development environment.
3. **Outside the codebase**, when neither fits: a working demo built separately. It tests the idea and says nothing about how it fits the system, so none of its code is reused.

Say which option you took and why a higher one was not possible. No option replaces hardening before general release.

Four rules are the same in a demo and in production code, because breaking one of them costs the same in both:

1. Keep the demo on its branch unless the owner approves a protected production experiment.
2. Use isolated data. Production writes require explicit approval and an agreed rollback.
3. Customer data stays inside a controlled environment.
4. No secret goes into the code.

Done when the demo runs from end to end and you have used it yourself for every hypothesis.

## 4. Put it in front of the user

Seeing a demo is not using it. Give the person what they need to hand it to the user from step 1:

- where it runs and how to open it;
- a short script: what to try, one item per hypothesis;
- a video or GIF of the main path, for whoever was not there.

Then wait. This step is the person's, and the answer comes from real use.

## 5. Record the verdict

Write in the issue: the demo branch and where it runs, which of the three options of step 3 it used and why a higher one was not possible, the video or GIF, what the user did and said, and the decision. The decision is the person's, with whoever asked for the feature:

| The demo | Next |
| --- | --- |
| Fulfills the intent | `/marsai-dev:to-spec`, which cuts the v1 and writes the technical plan |
| Is close | Another round of this skill, with the feedback as the new hypotheses |
| Raised something the grill did not settle | Back to `/marsai-core:grill-with-docs` with what the user showed, and then another demo |
| Does not fulfill it | Drop the idea, and record why |

Only the first row goes to hardening.

Done when the issue holds the decision and the evidence behind it.
