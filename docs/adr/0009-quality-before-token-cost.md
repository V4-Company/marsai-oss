---
status: proposed
date: 2026-10-07
deciders: [Guilherme Lippert]
---

# Quality before token cost

## Decision

Every step runs on the most capable model available, and the work is split into subagents whenever that keeps the context clean or adds a check: one Implementer per Slice, the review in a separate agent, the broad search and the independent items in parallel. Token cost is not a criterion for choosing a model or for avoiding a subagent.

## Context

Between April and September 2026 MarsAI was trimmed to spend fewer tokens, and the most recent rule said to delegate in three cases only, because delegating too much blew up the cost. Skills told the agent not to use a subagent.

The cost this avoids is small next to what shows up on the other side. A conversation that overflows the context and is compacted loses the thread and makes mistakes, and the mistake comes back as rework. And the token cost of a feature is small next to the value it delivers when the plan is right.

## Accepted trade-off

Token spend per task goes up. Worth revisiting if the cost per feature stops being small next to the value delivered, or if a measurement shows that a smaller model delivers the same result in a step.

## Rejected alternative

An Implementer on a cheaper model, with smaller tasks. A smaller model goes round in circles until the result is accepted, and the extra turns cost more than the difference in price.

## How to apply

- The agents declare `model: opus`.
- No skill tells the agent to avoid a subagent because of cost.
- The size of the task still matters, for another reason: each Slice fits in a new implementation conversation.
- Spending well is still different from wasting: an error caught by a Check spends no tokens at all, and an error caught at review spends less than an error caught in CI or after the merge.
