---
name: handoff
description: "Writes a handoff document for another agent, another folder, another harness or another person to continue the work. Use when the work needs to travel: a detour in the middle of a step, such as building a prototype during the grill, a change of harness or of repository, or a handover to a colleague. To pass a PR to the team, the skill is issue-handoff."
argument-hint: "[what the next session is for]"
---

# Handoff

Write a document that lets a new agent continue the work without anyone explaining anything again. What the handoff buys is **portability**: a file that travels to where this conversation does not reach.

## When the work travels

- **A detour in the middle of a step**: a side task came up and you do not want to spend this conversation on it. This conversation stays open; a second agent takes the detour.
- **Another harness**: from Claude Code to Codex, for example. The new one does not see the old one's context.
- **Another folder or another repository**.
- **Another person**.

If nothing is going to travel, no handoff is needed: carry on in the conversation, or compact the context at the end of the step.

## The document

If the person said what the next session is for, write the document for that: what matters for that destination goes in, and the rest stays out.

```markdown
# Handoff: <what the next session is for>

## What to do
<The task of the next session, in one or two sentences. If it is a detour, the question to answer.>

## Where we are
<The thread of the conversation: what is in progress, why, and what comes next.>

## Decisions that apply here
<Only the ones that affect the destination, each with its reason. If it is already in an ADR, spec or issue, the link is enough.>

## Verified and assumed
<What was checked in this session, and how. What is an assumption, stated as an assumption.>

## Where things are
<Repositories and paths, branch, Linear issue, glossary (`CONTEXT.md`), ADRs.>

## Suggested skills
<The skills the next agent should load, by name.>

## What to return
<Only in a detour: the format of the answer this conversation expects back.>
```

Content rules:

- **Point, do not copy.** Spec, ADR, issue, commit and diff go in as a path or URL. The file stays small, and the detail stays in one place.
- **An assumption does not become a fact.** The next agent treats the document as a contract and does not check again. "X does not exist yet" goes under Verified only if you looked.
- **No secrets.** Remove keys, tokens, passwords and personal data before saving.
- **Use the words of the repository's glossary**, so the next agent speaks the same language.

The document is ready when someone can read it cold, without this conversation open, and know what to do.

## Where to save it and how to deliver it

1. Save it in the system's temporary directory, outside the repository: it is a document in transit, and it does not go into a commit.
2. Show the full path of the file.
3. Say how to start the other session: open the agent at the destination and ask it to read the file. Point to the file instead of pasting the text into a command, because text with a backtick or `$()` arrives truncated.
4. If the destination is another machine or another person, the local path is no use: show the content in the reply, to be pasted or attached.
5. If the harness has a tool to open another session or delegate to another agent, offer to use it, passing the file.

A temporary folder can be cleaned between sessions. If the other session does not start soon, say that the file should be copied to a place that lasts.

## There and back

In a detour, the handoff happens twice, and the original conversation stays intact in between.

The most common case is the prototype during the grill: a question comes up that can only be settled by seeing it work.

1. **Out.** Here: a handoff with the question, what has already been decided and `marsai-dev:prototype` as the suggested skill.
2. **There.** Another agent reads the file, builds the prototype and reaches a verdict.
3. **Back.** There: an answer handoff, with the verdict, the evidence and the branch where the prototype was left.
4. **Here.** This conversation reads the answer and picks up where it left off. While the detour runs, it continues with what does not depend on it.
