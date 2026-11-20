# Security

## Reporting a problem

Report a security problem in private, through GitHub: on the repository page, open **Security**, then **Report a vulnerability**. Please do not open a public issue for it.

Say what you found, how to reproduce it and what it allows. A maintainer at V4 Company reads every report.

## What is in scope

- The installer in `cli/`: what it writes to disk, what it runs, how it handles the configuration of the coding agents.
- The guard hook in `plugins/marsai-core/hooks/`.
- A skill, agent or command whose instructions lead an agent to leak a secret, to run something destructive without asking, or to act on text it should treat as data.
- The site and its question endpoint.

## What the plugins do on your machine

MarsAI is text that a coding agent reads, plus one hook. The hook runs before each shell command of the agent and can only deny it. The installer copies files into the configuration folders of the agents you choose and registers a marketplace in Claude Code; `npx … status` shows what it placed, and `npx … remove` takes it out.

The skills tell the agent to ask before irreversible actions and never to write a secret into a file, a commit or a handoff. They are instructions, not a sandbox: the permissions of your coding agent are still what decides what it can do.
