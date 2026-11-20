# Predicted review bot score

A review bot comments on every PR: CodeRabbit, Greptile, GitHub Copilot Review, or one the team built (V4's is Hermes). This file is an example scoring rubric that any review bot or CI check can apply, and that the reviewer uses to predict the bot's score. The score goes from 1 to 5 and **is not an average**: it is the **minimum across six dimensions**, so one weak dimension brings down a PR that is perfect in the other five. Predicting the score before opening the PR saves a round of rework.

## The six dimensions

Every finding that stayed open goes in the dimension where it does the most damage.

| Dimension | Covers | Examples by severity |
| --- | --- | --- |
| `correctness` | Business rule, data flow, order of operations, context propagation | CRITICAL: charging before checking stock, wrong financial calculation. HIGH: unhandled error, lost transaction context. |
| `security` | Authentication, authorisation, secrets, personal data | CRITICAL: SQL injection, auth bypass, secret in the code. HIGH: personal data exposed, route that does not validate its input, authenticated route that does not check the token type. |
| `tests` | Coverage of what changed, edge cases, use of test doubles | HIGH: new behaviour with no test on the real path, error path with no test. MEDIUM: test that checks the test double and not the behaviour. |
| `nil_safety` | Null guard up to the point of use | CRITICAL: null access on a reachable path. HIGH: guard missing on a critical path. MEDIUM: guard on one branch and not on the other. |
| `blast_radius` | What breaks outside the diff: contract, callers, consumers | CRITICAL: auth guard or validation that stopped running. HIGH: API or event contract that its consumers cannot meet. |
| `maintainability` | Quality, naming, dead code, duplication | HIGH: significant dead code, exported function with no use. MEDIUM: duplication, obscure name. LOW: unused import, commented-out code. |

## Estimator

Pessimistic on purpose: a local "pass" has to be a safe bet on the PR.

```text
for each dimension:
    any CRITICAL       -> 1
    2 or more HIGH     -> 2
    1 HIGH             -> 3
    3 or more MEDIUM   -> 3
    1 or 2 MEDIUM      -> 4
    any LOW            -> 4
    no finding         -> 5

predicted score = lowest score among the six
if there is any CRITICAL: predicted score = at most 2
```

| Score | Meaning |
| --- | --- |
| 1 | 🔴 do not merge |
| 2 | 🟠 serious problems |
| 3 | 🟡 needs work |
| 4 | 🟢 details |
| 5 | ✅ safe to merge |

A 5 requires zero findings in the six dimensions. That is why a clean PR usually stops at 4: one unused import is enough.

## What the bot sees

It reads the full diff of the PR against the base and the PR description. It does not run the code and does not have the author's context. Context that exists only in the author's head becomes a finding; an explicit description and the Linear ticket cited in it reduce invented findings.

## How to present it

```markdown
## Predicted review bot score

| Dimension | Predicted | Findings (C/H/M/L) | What drives it |
| --- | --- | --- | --- |
| correctness | 5 | 0/0/0/0 | |
| security | 5 | 0/0/0/0 | |
| tests | 3 | 0/1/0/0 | `src/foo.ts:42` new branch with no test |
| nil_safety | 5 | 0/0/0/0 | |
| blast_radius | 5 | 0/0/0/0 | |
| maintainability | 4 | 0/0/0/1 | `src/bar.ts:7` unused import |

**Predicted score: 3 🟡** (set by `tests`)
```

The six rows always appear. Every dimension below 5 carries `file:line`. Say which dimension set the score: it is the only one worth fixing first.

The prediction is advisory. Opening the PR with a low predicted score is the decision of whoever opens it.
