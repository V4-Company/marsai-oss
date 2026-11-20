# CONTEXT.md format

`CONTEXT.md` is the repository's glossary: the terms of the domain, the word chosen for each one and the ones to avoid. Terms only. Implementation detail, spec and decisions stay out.

## Structure

```md
# {Name of the context}

{One or two sentences: what this context is and why it exists.}

## Language

**Instalment**:
A planned charge of a contract, with an amount and a due date.
_Avoid_: payment, monthly fee, tranche

**Payment link**:
The address sent to the customer to pay one or more instalments.
_Avoid_: checkout, payment page
```

## Rules

- **Take a side.** When several words exist for the same concept, choose one and list the others under `_Avoid_`.
- **Short definition.** One or two sentences, saying what the thing is, not what it does.
- **Only terms of this context.** A general programming concept (timeout, error type, utility pattern) stays out, even if the project uses it a lot.
- **Group under subheadings** when the terms form natural groups. A flat list works too.
- **Write in the language the team uses to talk about the domain.** The name that is in the code appears in backticks when it is different.

## One context or several

Most repositories have a single context: one `CONTEXT.md` at the root.

When the repository holds distinct contexts, a `CONTEXT-MAP.md` at the root lists each one, where it lives and how they relate:

```md
# Context map

## Contexts

- [Billing](./src/billing/CONTEXT.md): generates instalments and tracks payments
- [Invoicing](./src/invoices/CONTEXT.md): issues the invoices

## Relationships

- **Billing → Invoicing**: Billing publishes `installment.paid`; Invoicing consumes it to issue the invoice
```

If `CONTEXT-MAP.md` exists, use it to find which context the subject belongs to. When in doubt, ask.
