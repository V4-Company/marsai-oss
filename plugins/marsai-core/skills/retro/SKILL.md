---
name: retro
description: "Retrospective of a session, of a PR or of the week's PRs that proposes the check or the standard that would prevent the same mistake next time. Use when someone asks for a retro or when a human review repeats a comment that was made before."
---

# Retro

You are proposing improvements to the **environment** the agents work in, so that the next round comes out better than this one. The principle: no review comment should be written twice.

The retro only proposes. The person approves and applies.

## Steps

1. **Read the primary sources** of what the person pointed to. With nothing pointed to, use the current session.
   - Session: the conversation and its logs on this machine.
   - PR: `gh pr view <n> --comments`, the line comments (`gh api repos/<org>/<repo>/pulls/<n>/comments`), the score and the findings of the review bot, and the diff of the commits made after the first review. Note how long the human review took, from the request to the approval, and how many rounds of change it asked for: the refinement session exists to keep both small (ADR 0015).
   - Week: `gh pr list --state merged --search "merged:>=<date>"` and the same for each PR.

2. **Look for candidates** in these categories. Each one says when to look.
   - **Checks**: would an automatic check have caught the mistake? First read what the repository already runs (the repository's Check Command, the one script that runs lint, typecheck and tests; the lint and test scripts; the CI workflow): a check that exists but is switched off or broken is the finding. A repository with no check at pre-push or in CI is a finding too. What SonarQube or the review bot flags repeatedly on the PR is a candidate for a local lint rule: caught on the machine, it spends no tokens and does not send the work back through the pipeline. _When_: the agent or the developer got something wrong that a machine would detect.
   - **Standards**: did the reviewer let through something a human or the review bot caught? Classify before proposing. A **mechanical** mistake (syntax pattern, forbidden API, import format, file location) becomes a check: a rule in the repository's linter, a hook or a CI job, whichever is cheapest there. Only **judgement** (consistency between files, a name that reveals the intent, design) becomes a rule in the MarsAI standards. _When_: the same comment appeared in more than one review.
   - **Alignment**: did the reader meet a structure nobody had agreed, or ask for a change the refinement should have settled? The proposal says what the program design should have stated. _When_: the human review took a long time, or asked for more than one round.
   - **Navigation**: did the agent take long to find a file or a piece of information? Would a pointer in the repository's `CLAUDE.md` or `AGENTS.md` solve it? _When_: the session spent many searches before starting the work.
   - **Access to information**: did the agent lack data that exists (the server log, a read from an external service, the event catalog)? _When_: a decision was made in the dark.
   - **Tool economy**: was an expensive call repeated that could be a single command? _When_: the session got long for no apparent reason.
   - **Leftover instructions**: is there a line in `CLAUDE.md`, in a skill or in a standard that does not change the agent's behaviour, or that should be a check? _When_: the instruction files are large.

3. **Present the candidates**, from the most serious to the least. For each one: what happened, with the evidence (excerpt from the session, PR comment); the proposed change; and where it goes.

## Where each change goes

| Change | Place |
| --- | --- |
| New or re-enabled check | In the repository where the mistake happened: linter, hook or CI. If it applies to all services, in the shared rule they inherit |
| Judgement rule | The team's Standards: a pull request to the team pack that holds them (the skill whose description starts with "Standards extension" says where they live) |
| What the program design should have stated | The technical refinement template the team uses: in the tracker, when it has one there, or a pull request to the template of `marsai-dev:to-spec` |
| Navigation pointer | The repository's `CLAUDE.md` or `AGENTS.md`, one line |
| Missing term or decision | The repository's `CONTEXT.md` or `docs/adr/` |

## Why a standard goes to the reviewer

All work goes through two stages. Whoever implements explores, writes and debugs: it is the stage whose context window is fullest. Whoever reviews receives a finished diff and has context to spare. That is why a rule about how the code should be written goes into the standards the reviewer reads, and not into the instructions of whoever implements.
