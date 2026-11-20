# Single issue

For small work in one repository: an endpoint, a use case, a model adjustment with a known flow. Everything in the issue description, in about one screen. The sequence diagram is the centre; a change of status or of field appears in it as a `Note`.

```markdown
# 📖 Job Story

> **When** [situation],
> **I want to** [action or capability],
> **so that** [outcome].

## ✅ Acceptance criteria
- [ ] [objective, verifiable criterion]

---

# 🛠️ [Name of the delivery]

**Source:** [call or issue, if any] · **TL:** [name] | **PM:** [name]

## 1. 📌 What will be done
[One or two sentences: what and why.]

## 2. 🔍 How it is today
[Two to four lines, with `file:line` of the code read.]

## 3. 🗃️ Model changes
[Target model in Prisma syntax inside a typescript block, with `// NEW` and
`// legacy` on the changed fields. Migration in one line.]

## 4. 🔁 Flow
[sequenceDiagram starting from the request at the controller: DTO → use case →
repository → response and events. Error path with `alt`.]

## 5. 🔌 Contract
- Method and route
- Request (zod) and response as a type
- Permission: `@Auth(<resource>, <action>)` and the token types accepted

## 6. 📡 Events
- Publishes: `EventX` (when), DTO in a typescript block
- Consumes: `EventY`

## 7. 🧪 Where to test
- [Agreed test point.]

## 8. 🚧 Out of scope and open questions
- Out of scope: ...
- Open: [question], [owner]
```

A section with no content is left out. In Mermaid, the label precautions in [SKILL.md](SKILL.md) apply.
