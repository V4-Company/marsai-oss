# Technical refinement on the parent issue

It goes as a **comment** on the parent issue (`save_comment`), not in the description: the description is the product part, the PM's. It is the single source of what applies to all the slices; each slice points to this comment instead of repeating the contract.

The end-to-end flow and the contract come first, before the decisions.

```markdown
## 🛠️ Tech Refinement: shared contract and decisions

### 🗺️ Repositories
| repository | what changes | deploy |
| -- | -- | -- |
| `payments` | [one line] | 1st |
| `billing` | [one line] | 2nd |

### ✂️ V1 cut
[When a demo came first: which parts of the demo are in the v1 and what stays out. Part by
part: reused from the demo, or rewritten.]

### 🔁 End-to-end flow
[flowchart TB, one subgraph per service. Shows the direction of the data and the
boundary of each service, from the trigger to the final effect.]

**Where it is broken today:** [the edge that does not exist, the producer that is
missing, the consumer that ignores the field.]

### 📡 Contracts
[New or changed event in the shared events package: DTO in a typescript block,
with `// NEW` and `// legacy`, and the routing key in a comment. Current version of
the package and the version pinned in each consumer that needs to move up.]

[New or changed route: method, route, request and response as a type, permission.]

### 🔀 Who consumes what
[When there are two or more consumers: flowchart LR, event → services → what
each one writes.]

### 🗃️ Data model
[Per repository: the current model, verbatim, and the target with `// NEW`. Prisma
syntax inside a typescript block. Migration in one line.]

### 🧩 Program design
[One level below the architecture, for whoever will read the pull requests. The new
pieces: each module, use case, component or handler with its type and signature, in a
typescript block, marked `// NEW` or `// CHANGED`. Where each one plugs in: the call
path from the entry point to storage, as a short list or a sequence diagram, with
`file:line` for what already exists. Where each test hooks in.]

### 🔒 Invariants to respect
[Per repository: the rule that cannot be violated and where it comes from (ADR, glossary,
aggregate test). In another team's repository, who there confirmed it.]

### ⚖️ Decisions
1. [Short statement and the reason.] [ADR, if any.]

### 🧪 Where to test
- [Agreed test point, and what it proves.]

### 🪜 Slices and order
[The vertical slices proposed, in delivery order, one line each with what starts
working. `to-tickets` publishes them once the session approves.]

### ❓ Open questions
| question | owner | resolve by |
| -- | -- | -- |

### 🚦 Risk level
[Standard or high, in one line, with what makes it so. It tells the human review
how much attention the pull requests ask for.]

### 🚩 Risks
- [What crosses services: data loss, silent failure, deploy order.]

### 🔭 Out of scope
- [What was discussed and is left for later.]

### 🤝 Session
[Filled in after the refinement session: the date, who attended, what changed, the
tech lead's approval and who reads the pull requests.]
```

A section with no content is left out.
