# Logic prototype

A single, self-contained HTML file that lets anyone drive a state model by clicking buttons. Use it when the question is about **a business rule, a state transition or the shape of the data**: the kind of thing that looks reasonable on paper and only bothers you when it goes through real cases.

Because it is a file with nothing to install, you can send it to the PM, to the operations team or to whoever knows the domain, and let them get a feel for the model. That is why it speaks the language of the business, not the language of the code.

## When it is the right shape

- "I am not sure this state machine holds up in the case where X happens after Y."
- "Can this model represent the contract that changes plan in the middle of the cycle?"
- "I want to get a feel for how the cancellation rule behaves before I write it."

If the question is "what should this look like", the branch is [UI.md](UI.md). If it is about messages between services, it is [FLOW.md](FLOW.md).

## Process

### 1. Write the question

Before the code, write which model and which question the prototype answers: one paragraph, visible at the top of the page. A prototype that answers the wrong question is pure waste.

### 2. Isolate the logic in a portable module

The logic that answers the question lives in a single `<script>` block, written as a small, pure module that can be taken to the real code later. The page around it is throwaway; the module is not.

Give it the shape of the team's domain: an aggregate with its states, one method per transition and the invariants each method protects. Money in cents. The names come from the repository's `CONTEXT.md`. Keep it pure: no DOM, no `document`, no button handler inside it. The page calls the module; nothing goes back the other way. That is what leaves the module ready to become the real aggregate once the question is answered.

### 3. Build the page

Plain HTML, CSS and JS, all in the same file: no framework, no bundler, no server. From top to bottom:

1. **Title and one line** saying what there is to explore (the question from step 1).
2. **Current state**: the full state, in a readable panel with labelled fields, redrawn on every click, highlighting what has just changed.
3. **Free buttons**: one per action, always available, to work the model in any order. An invalid action shows as refused, with the reason, instead of disappearing.
4. **Guided scripts**: one scenario per tab. Each tab has the description of the situation in plain language and, below it, the buttons to press in order. Starting a script goes back to the known initial state.

Choose scenarios that show the awkward cases: the happy path, a hard edge and an attempt to do something that should be forbidden.

Good-looking and restrained: clean typography, generous spacing, one accent colour. Nothing that competes for attention with the state and the buttons.

### 4. Hand it over

Send the file or the link. The moments that matter are "wait, that should not be possible" and "I thought X would be different": they are the flaws in the idea, which is what you set out to find. If they ask for a new action or scenario, add it.

### 5. Keep the answer

Record the verdict and the question it closed, as [SKILL.md](SKILL.md) says. The validated module becomes the real aggregate; the HTML shell goes with it to the prototype branch.
