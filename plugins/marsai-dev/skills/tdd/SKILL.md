---
name: tdd
description: "Test-first reference: what a good test is, where it lives and the rules of the red and green cycle. Use when implementing a feature or fixing a bug, and when someone mentions TDD, red-green or integration tests."
---

# TDD

TDD is the red → green cycle. This skill is the reference that makes the cycle produce tests worth keeping. Everything here applies in every cycle.

Read the repository's `CONTEXT.md`, if there is one, so the test names use the language of the domain.

## What a good test is

A good test verifies behaviour through the public interface, not an implementation detail. The code can change completely on the inside and the test still holds. It reads as a specification: "cancelling a recurring deal ends the subscription" says which capability exists.

Examples in [tests.md](tests.md). When and how to replace a dependency, in [mocking.md](mocking.md).

## Where the test lives

Test at the point agreed in the spec or in the ticket. If there is none, write down which points you will test before writing any test, and confirm with whoever asked. You cannot test everything: agreeing on the points is what puts the effort on the critical path.

In the team's services:

| What you want to prove | Where |
| --- | --- |
| Domain rule and invariant | spec of the aggregate, the entity or the value object |
| Orchestration, error paths, idempotency | spec of the use case, the service or the event handler, with the ports replaced |
| Query, filter, ordering | integration test of the repository, against a real database |
| Route, permission, effect on the database | integration, or an end-to-end test against the running service |

Repository, mapper, controller and DI configuration get no unit test: a test with the database replaced proves the substitute, not the query. If the project has no integration setup, leave the repository without a test and report the gap.

## What to avoid

- **Tied to the implementation**: it replaces an internal collaborator, tests a private method or checks from outside the interface. The sign: the test breaks when you refactor without changing behaviour.
- **Tautological**: the expected value is calculated the same way the code calculates it (`expect(sum(a, b)).toBe(a + b)`, a constant compared with itself). It passes by construction and never disagrees with the code. The expected value comes from an independent source: a known literal, an example worked out by hand, the spec.
- **Unable to fail**: the dependency was replaced by something that always responds correctly, so the real error never shows up.
- **In a batch**: all the tests first, all the implementation afterwards. The tests verify an imagined behaviour. Work in slices: one test, one implementation, and the next test responds to what the previous one taught.

## Rules of the cycle

- **Red before green.** Write the test, run it and watch it fail for the right reason. The failure output, pasted, is the proof. Then write only the code that makes it pass.
- **One slice at a time.** One point, one test, one minimal implementation per cycle.
- **A bug starts with a test that reproduces the bug.**
- **Refactoring is not part of the cycle.** It belongs to the review.
