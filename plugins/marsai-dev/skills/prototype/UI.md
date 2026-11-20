# Screen prototype

Generate **several radically different versions** of a screen on the same route, switchable through a floating bar. The person moves from one to the next in the browser, picks one (or takes pieces of each) and throws the rest away.

If the question is about a rule or state, the branch is [LOGIC.md](LOGIC.md).

## When it is the right shape

- "What should this page look like?"
- "I want to see a few options for this panel before I settle on one."
- Whenever someone would spend a day choosing between three vague ideas in their head.

## Where to build it

A screen prototype is much easier to judge **up against the rest of the app**: real header, real menu, real data, real density. An empty route is a vacuum, and every version looks good in a vacuum.

- **A page that already exists (preferred).** The versions go on the same route, behind a `?variant=` parameter. Data fetching, parameters and authentication stay as they are; only the rendering changes. A new section of an existing page falls here too.
- **A new page (last resort).** Only when no existing page can host it. Create a throwaway route that follows the project's routing convention, with `prototype` in the path. Same `?variant=` scheme.

## Process

### 1. Write the question and choose how many

Three versions by default; above five it becomes noise. Write the plan in one line at the top of the file:

> "Three versions of the instalments screen, on `?variant=`, on the `/deals/[id]` route that already exists."

### 2. Generate structurally different versions

Each version respects the purpose of the page and the data it has, and is built **only with components from the repository's component library**. If a version needs a component the library does not have, build the minimum in the file itself and note it as a finding for the team that owns the library: it is one of the things the prototype exists to discover.

Versions differ in layout, information hierarchy and main action, not in colour or copy. Three slightly adjusted card grids are not a prototype. If two come out alike, redo one with an explicit constraint ("no card grid").

Export each one with a clear name: `VariantA`, `VariantB`, `VariantC`.

### 3. Wire the versions

A single component on the route reads `?variant=` (default `A`) and renders the matching version, with the switcher bar on top.

### 4. The switcher bar

A small fixed bar at the bottom centre of the screen: an arrow to the previous one, the label of the current version (`B · Side menu`), an arrow to the next.

- Switching updates the URL parameter through the project's router, so the link can be shared and survives a reload.
- The keyboard arrows switch too, except when the focus is in a text field.
- It looks different from the page, so nobody thinks it is part of the design.
- It is hidden in a production build.

### 5. Hand it over

Send the URL and the `?variant=` keys. The most common answer is "I want the header from B with the menu from C", which is the design the person really wanted.

### 6. Keep the answer and clean up

Record which version won and why, as [SKILL.md](SKILL.md) says. The winner is rewritten properly in the real code: it was built without tests and without error handling. The losers and the switcher bar go to the prototype branch, not to `main`.

## What to leave out

- **Real mutation.** A screen prototype only reads. If a version needs to write, point it at a stub.
- **A layout shared between versions.** A shared `<Header>` is fine; a shared `<Layout>` stops the versions from disagreeing.
