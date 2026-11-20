# The site

<https://marsai.v4company.com>, in English, and <https://marsai.v4company.com/pt>, in Brazilian Portuguese: the home with the prompt that installs MarsAI through a coding agent, the manifesto, the interactive map, one page per skill, the guides, the glossary, the questions and the search (⌘K or Ctrl+K).

```bash
npm ci --prefix site                    # the pinned markdown renderer the pages bundle
node site/build.mjs                     # writes site/dist
node site/dev.mjs                       # http://localhost:4792
```

## Where things are

| Path | What it holds |
| --- | --- |
| `content/pt/`, `content/en/` | What the pages teach, one folder per language: `home.mjs`, `manifesto.mjs`, `map.mjs`, `skills.mjs` and `ui.mjs` (navigation, buttons, labels) |
| `content/shared.mjs` | The routes of each language, the address of the site, and `REPO_OPEN`: when false, links to the repository show "soon" |
| `src/app.js`, `src/styles.css`, `src/template.html` | The application: one script, one stylesheet, one document |
| `agent/` | What a coding agent reads: `install.md` and `llms.txt` |

The text of the skills, the agents, the decision records and the glossary is read from the repository at build time, so the reference part is always what is installed.

## Two languages

English lives at the root (`/map`) and Portuguese under `/pt` (`/pt/mapa`). Each page of each language is its own document, with its own title, description and preview image, so a link shared anywhere shows the right language. On arrival the page follows the reader: the language they chose in the selector, else the language of the browser.

The two editions must have the same shape. The build compares them and stops when one has a key, an item or a path the other lacks. So a change to a page is made in both folders: the prose is translated, and everything else (ids, routes, positions on the map, links) is copied.

The map is a hand-laid diagram in `map.mjs`. One complete path goes through every step, from the problem to the retro, with the seven gates on it. Two routing decisions sit on that path: a small task leaves it for `implement`, and work whose only open question is how to build it skips the demo and goes to the spec. Each shortcut is a line of its own colour, always drawn, with its name written along it. Work already under way enters where it stopped: an issue with spec and slices at `implement-spec`, an open PR at `babysit-pr`.

Next and playback always work: with no answer they follow the complete path, so every step can be walked. An answer at a decision, a gate exit or a feedback branch only swaps what comes after it, and the steps a shortcut leaves out are dimmed. Inspecting a node leaves the journey untouched. Checks, CI, bot findings, human change requests and demos to adjust or rethink loop back to the appropriate step. An exit with no destination (a problem archived at G0, an idea dropped at G3) ends the journey where it is.

Shared URLs record the steps visited with `?trail=comecar,problema,...`; reload replays them. A named path opens with `/map?from=bug` (also `how`, `slices`, `pr`, `large`, `feature`), at the decision where it leaves the complete path, or at `&step=3`. `&view=full` lights the whole map. The map teaches the flow; it does not execute work, approve real changes or monitor running agents. Run `node --test site/test/map-flow.test.mjs` to check the paths, the shortcuts and the feedback loops in both languages.

## For agents

`/install.md` is what the prompt on the home page points to: plain instructions an agent follows to install MarsAI and show the first step. `/llms.txt` indexes what an agent can read, including `/flow.md` (the `using-marsai` skill) and `/glossary.md`.

## Static by design

`site/dist` is plain files: one document per page in each language, hashed assets, `robots.txt`, `sitemap.xml` with both editions of every page and the agent files, and `404.html`. Nothing runs on a server, so the site needs no key and costs nothing to serve. The search runs in the page, over the skills, the guides, the glossary and the questions. The markdown renderer (`marked`) is pinned in `package.json` and bundled into `assets/` at build time; the page loads no script from a CDN, and a link in rendered markdown keeps only an `http`, `https`, `mailto` or relative address.

`vercel.json` serves a missing page as the application in its language and a missing file (anything with an extension) as `404.html`.

## Building for another address

| Variable | What it changes |
| --- | --- |
| `MARSAI_REPO=owner/name` | The repository the pages link to and install from. Default: the one in `package.json` |
| `SITE_URL=https://…` | The public address, used in the previews and in what agents read |

## Publishing

`site/dist` deploys as-is to any static host. With Vercel:

```bash
node site/build.mjs
cd site/dist
npx vercel link       # first time only: pick your own team and project
npx vercel deploy --prod
```

The V4 logo in `src/assets/v4-company.svg` comes from V4's official brand book. The favicon uses its square V4 symbol and a content-hashed URL so updates bypass the immutable asset cache. The preview images (`og-en.png`, `og-pt.png`) are screenshots of a 1200 by 630 page with the headline.
