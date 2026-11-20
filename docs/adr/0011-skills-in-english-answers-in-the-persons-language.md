---
status: proposed
date: 2026-10-08
deciders: [Guilherme Lippert]
---

# Skills are written in English and answer in the person's language

## Decision

Every skill, command, agent, standard and document in this repository is written in English. At run time the agent talks to the person in the language the person writes in, and writes what stays behind (spec, ticket, pull request, commit, glossary, ADR) in the language the repository already uses.

This replaces the language rule recorded in ADR 0005, which had skills and commands in Brazilian Portuguese.

## Context

The flow became open source (ADR 0012). A skill written in Portuguese can be used by an agent anywhere, but it cannot be read, reviewed or improved by most of the people who would contribute to it. Agents and Standards were already in English, so the repository had two languages and a rule for which file took which.

## Accepted trade-off

The V4 team reads its own process in a second language. The site carries the explanation in Portuguese, and the agent keeps answering in Portuguese, so the cost falls on whoever edits a skill. Worth revisiting if contributions from the team drop because of it.

## Rejected alternative

Keep two copies of each skill, one per language. Two copies drift apart, and the agent would follow whichever one was installed, so the same skill would behave differently in two places.

## How to apply

- New and changed files in `plugins/`, `docs/` and the repository root are in English.
- `CONTEXT.md` gives each term in English and its Brazilian Portuguese equivalent, so the agent uses the team's word when it speaks Portuguese.
- A skill that writes something a person reads says where the language comes from only when the default is not enough. The default is: conversation in the person's language, artifacts in the repository's language.
- The site is published in English and in Brazilian Portuguese. The skill text it shows is the English source.
