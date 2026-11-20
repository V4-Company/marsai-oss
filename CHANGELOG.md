# Changelog

What changed for whoever uses the flow. One version covers everything public: the plugins, the installer and the site. How a version is published: [docs/RELEASING.md](docs/RELEASING.md).

## 5.8.0

**What is new**

- **`marsai-core:home-repo` sets up and keeps a team's Home Repo** (ADR 0019): the one repository where every agent session starts, with a pointer to each of the team's repositories, the shared docs, a wiki and the tools. It follows the four steps of Matt Pocock's [The Home Repo Pattern](https://www.aihero.dev/the-home-repo-pattern): it inventories the repositories, measuring activity by merged pull requests; inventories the skills, rules and agent instructions, finding copies by content; agrees with you where each one goes; and applies the plan, one pull request per repository. Its `LAYOUT.md` holds the conventions: the clones under one root, one worktree per piece of work, pointers grouped by area past about 20 repositories, and the settings that give every session the same plugins and guards.
- **The flow knows when the session runs in a Home Repo.** `marsai-mode` and `grill-with-docs` find the repositories through its pointers, `implement` gives each implementer a worktree in the right clone and has it read that repository's own instructions first, `code-review` and `open-pr` run in the worktree of each repository the work touched, and a term or decision no single repository owns goes into the Home Repo. `using-marsai` proposes one when the work spans several repositories, and records the team's setup there once.
- The glossary gains **Home repo** and **Pointer**, and the site gives the skill its page.

## 5.7.0

**What is new**

- **`sol-loop`, `full-send` and `full-stop`, in the optional extras**, adapted from Theo Browne's tstack. They load when you say their name in a message ("full stop", "sol loop"), and you can combine them in one sentence; the `/` menu also works.
  - `sol-loop`: a model from another provider, GPT Sol by default, reviews the change in up to three rounds. The agent fixes what is right with the smallest change, pushes back with evidence and declines what is out of scope. The pull request records the verdict, approved or not.
  - `full-stop`: the agent proves the change, runs the sol-loop, opens the pull request and follows it through CI, the bots and the comments without you watching, and calls you only when it is ready or blocked. It never merges.
  - `full-send`: the same work, and the agent merges by itself, but only a two-way door with green checks, a 5 from Hermes and the sol-loop approved (ADR 0018). A one-way door stops ready for you, as `full-stop` does.
- **ADR 0018** opens that exception to the human reading of ADRs 0008 and 0016. `babysit-pr` treats a "full send" as the authorisation to rebase and merge, and `marsai-mode` hands the steps after the pull request to the skill you named.

## 5.6.0

**What changes**

- **`/marsai-core:marsai-mode` is the single way into any work** (ADR 0017). Say what you want in one sentence, or bring a card, whether you are a developer or a product person. The agent reads what already exists and recommends the path: a feature goes through both phases, work whose only open question is how to build it starts at the spec, and a bug, a small adjustment, tech debt, a refactor or a measured slowdown takes the fast track. When it is unclear whether the work takes the fast track or needs a demo, one question settles it: can we tell the change is right from the code and the tests, or only when a user uses it? You confirm the path, and it goes on the session's task list with every gate marked as a stop. A step the work skips stays on the list with its reason. The agent then calls each step's skill in turn, stops at each gate and before anything that cannot be undone, and says so when the work turns out to be a different size. The idea comes from Lauren Tan's `poteto-mode`, in pstack.
- **`dev-start` and `pm-start` only say which command to type**: `/marsai-core:marsai-mode`, followed by what you wrote. The setup interview of `using-marsai` also ends by pointing to the mode.
- **`implement` asks for the evidence of each kind of change.** A bug is reproduced where it happens before the fix, and at the end the bug no longer happens with the original reproduction. A slowdown is measured before and after, the same way. A refactor keeps the existing tests unchanged and passing.
- The site shows `marsai-mode` at the start of the map, on its own page and in the decisions, in Portuguese and English. The README gives the owners of G1 and G5 in the same words as the site.

## 5.5.0

- **The technical plan is agreed in a session, down to the program design** (ADR 0015). Gate G4 is decided in up to 30 minutes with the tech lead, the PM and the developer responsible. The technical refinement gains the program design (the new pieces with their types and signatures, where they plug in, where the tests hook in), the slices with their order, and the record of the session, which also names who reads the pull requests. The intent and the verdict on the demo are decided with the people together too.
- **The code follows the agreed design** (ADR 0016). The review checks the code against the program design: the reviewer brings a local departure back, and a structural one returns to implementation. A change of course is written on the issue and approved by the tech lead first. A person reads every pull request, at the depth the risk asks for. Above about 400 changed lines a delivery goes out one slice per pull request, or says why not; the line guides attention and does not block.
- **A demo prefers real use behind a flag** (ADR 0014, replacing the order of ADR 0013). In order: production behind a feature flag for selected users, development with the user, and a demo outside the codebase as a last resort. Its verdict sends the work to hardening, back to the grill for another demo, or ends the idea.
- **A card is a valid start.** `dev-start` and `pm-start` take a card that already exists, say what it answers of G0 and G1 and ask only for what is missing.
- **The retro looks at the reading.** It notes how long the human reading took and how many rounds it asked for, and proposes what the program design should have stated.

## 5.4.0

**What is new**

- **`migrate`, for a machine an earlier installer set up.** `npx --yes github:V4-Company/marsai-oss migrate` brings every app to the running installer in one run, whether the earlier one was an older version or a distribution kept in another repository. Each app keeps what it had that this installer carries and receives the plugins that are new in its groups. An app found on the machine with nothing saved gets the groups that are not optional. What this installer does not carry is left out and listed in the report, instead of stopping the command as it does for `update`. In Claude Code, a marketplace of the same name registered from another repository is registered again from this one. The daily update, when it was on, is pointed to this installer. `--dry-run` shows the plan and changes nothing; a second run finds nothing left to do. Details: [cli/README.md](cli/README.md#coming-from-an-earlier-installer).

**What was fixed**

- **Claude Code on Windows.** The installer finds `claude` from cmd and PowerShell, as a program or as the `.cmd` file npm writes, and starts it with its arguments intact. Before, the Claude Code target was reported as missing. `git` and the app that logs in to an MCP server start the same way.
- **Taking over a marketplace from another repository no longer fails the install.** A plugin that was installed from the earlier registration and that this marketplace does not have is reported and skipped. It used to be tried, and its failure marked the whole app as failed.

## 5.3.0

- **Optional `in-your-own-words`.** `/marsai-extras:in-your-own-words` asks the agent to restate, in its own words, what it thinks your goals are and what problem you are trying to solve, and to stop there until you confirm or correct it. Adapted from Lauren Tan's MIT-licensed pstack 0.15.23. Only the person calls it, and it comes with the optional extras pack.

## 5.2.0

- **Routing decisions inside the flow map.** The map shows one complete path that goes through every step, and the shortcuts that leave it: a small task goes straight to implementation, and work whose only open doubt is how to build it skips the demo. Each shortcut has its own colour and its name on the line. Next walks the whole path with no answer required; an answer at a decision or a gate only changes what comes after it. Work already under way enters where it stopped, at `implement-spec` or `babysit-pr`. The seven delivery gates retain their definitions. Portuguese and English share the same paths.

- **Optional editorial diagrams.** `marsai-extras:marsai-diagram` adapts Cathryn Lavery's MIT-licensed Diagram Design 2.6.76 with bundled references, examples, import/export helpers and geometry checks. It supports user and agent invocation, coexists with the original skill, starts with a V4/MarsAI profile and keeps client profiles separately. Labels are at least 9 px, references take precedence over historical examples, doc-wide frames support 1280 px, and screenshots are inspected with up to four correction rounds. Diagrams distinguish deployed and proposed work, mark uncertainties and carry sources and omissions. PT/EN skill pages explain the optional install and prerequisites.

- **The site no longer has a forum.** The community page, its endpoint, its database code and the CI database are removed. The build now starts from an empty output folder, so a page or an endpoint that was removed is not deployed again.

## 5.1.0

- **Protected demo environments** (ADR 0013). Validate in an isolated screen, development preview or explicitly approved production experiment with a restricted audience, feature flag, protected data and rollback. Full hardening remains required before general release.

- **Optional Matt Pocock extras.** `marsai-extras` adds `teach`, `research`, the general `grill-me` interview and `writing-for-agents`, with their supporting references and MIT attribution. Choose the extras group or plugin explicitly; default installations and the development group exclude it. Adding the optional pack preserves each app's saved selection; installing it alone adds no main workflow rules to Codex.
- **Invocation permissions are visible.** The skills index and each component page distinguish user-only, user-or-agent and agent-only invocation, derived from the installed frontmatter. Portuguese and English explain the difference between who invokes a skill and who does the work.

## 5.0.1

- **First-use setup through `using-marsai`.** A brief interview identifies the person's role, whether the project is new or existing, team size and architecture agreements. It connects MarsAI to the repository's reference code, implementation guides, Standards, checks and delivery process instead of assuming V4's setup.
- **Development and product entry points reuse the agreed setup.** New users are routed to the setup interview first. Later sessions carry the architecture and guide references into tasks and handoffs without repeating the interview.
- **The installation prompt and site explain the adaptation.** The agent reads the same onboarding instructions as the installed skill and proposes concrete project files before writing outside an installation-only request.

## 5.0.0

The first open source version. The flow gains a demo before any engineering, the skills are now in English, and what was V4's alone moved out to a private pack.

**What breaks**

- **The skills, commands and decision records are in English.** The agent still talks to you in your language and writes specs, tickets and pull requests in the language the repository already uses (ADR 0011).
- **`/marsai-dev:dev-comecar` is now `/marsai-dev:dev-start`, and `/marsai-dev:pm-comecar` is now `/marsai-dev:pm-start`.**
- **The Standards left `marsai-dev`.** The review applies the rules of the repository, the Standards a team pack offers and a baseline. Without a team pack there are no team Standards, and the report says so (ADR 0012).
- **The implementers are generic.** `backend-engineer-typescript` and `frontend-engineer` follow the examples the repository has and load a team's implementation guide when the task names one. They no longer scaffold with a generator of their own.
- **The guard hook checks a marker, not a trailer.** A commit goes through `/marsai-core:commit`, which runs `MARSAI_COMMIT_SKILL=1 git commit …`. A team that requires a trailer adds it with its own guard.
- **One version number for everything.** `marsai-core`, `marsai-dev`, the installer and the marketplace now move together.

**What is new**

- **Demo before hardening** (ADR 0010). A feature goes through two phases: planning, where a demo proves the value in the hands of a real user, and hardening, where only the v1 cut from the demo is specified, built and reviewed. Seven gates, G0 to G6, mark where a person decides.
- **`/marsai-dev:demo`**, the skill that builds the demo on a demo branch and records the verdict.
- **`/marsai-dev:to-spec` cuts the v1** from the demo, records what is reused and what is rewritten, and asks for the risk level.
- **`/marsai-core:grill-with-docs` confirms the intent first** and ends, for a feature, with the hypotheses the demo will test.
- **Team packs.** A plugin of your own extends the flow by the start of a description: `Standards extension:` for your rules, `Implementation guide:` for what your repositories share, and implementer agents for your repositories.
- **`MARSAI_LINEAR_HISTORY=off`** switches off the rule that blocks merge commits, for a repository that merges.
- **The installer reads what each plugin declares** (`.marsai-plugin.json`), speaks English and Brazilian Portuguese, and accepts plugins from more than one marketplace.
- **The site** has two languages, the manifesto, the gates on the map, and a prompt you paste into your agent to install everything.

**What was fixed**

- The guard hook no longer blocks a command that only mentions `git commit` in a string, such as `echo "git commit"` or a `grep`.
- A commit message that contains `;` or `&&` is no longer read as a second command.
