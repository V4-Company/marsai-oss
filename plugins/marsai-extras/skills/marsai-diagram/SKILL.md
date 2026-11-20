---
name: marsai-diagram
description: "Creates editorial diagrams as self-contained HTML with inline SVG. Use for architecture, cross-team processes, message sequences or other diagrams; importing Mermaid, draw.io or Excalidraw; exporting PNG/SVG; or adapting diagrams to a client's visual profile."
license: MIT
user-invocable: true
---

# MarsAI diagrams

Adapted from [Cathryn Lavery's Diagram Design](https://github.com/cathrynlavery/diagram-design), version 2.6.76. The original [MIT license](LICENSE.txt) applies. This adaptation is independent of the globally installed `diagram-design` skill.

## 1. Establish the facts and the visual language

Read the sources needed for the requested diagram. Record which files, documents, URLs and revisions support its facts. Mark an inference **to confirm**, an estimated date **approximate**, and list omitted details in the footer. A diagram of a proposal must say it is proposed. Ask about a missing fact only when it changes the meaning of the drawing.

Resolve the profile through [profiles.md](references/profiles.md). With no project profile, use the bundled V4 profile immediately, without a first-use interview. For another client, reuse their documented tokens or follow the profile branch. The effective profile overrides the upstream palette; the rules here override upstream guidance; type references override examples. Examples demonstrate composition and may contain older typography or labels that need correction.

Done when the source ledger, uncertainties and effective profile are clear.

## 2. Choose and draw

Use [UPSTREAM.md §3](UPSTREAM.md#3-selection-semantic-pattern-then-visual-type) to select among 44 types and nine semantic patterns. Load only the relevant type and layout references. Architecture, swimlane and sequence were tested on real V4 work; other types retain upstream guidance.

Apply [MarsAI semantics](references/marsai-semantics.md), including deployed versus proposed/PR work, uncertain order, notes and parallel sequence fragments. For swimlanes read the expanded [type reference](references/type-swimlane.md).

Start from the matching template or example, then apply the profile. Deliver one HTML file with inline SVG, accessible title/description and system fonts by default. Every readable SVG label is at least **9 px**, and at least 9 CSS pixels at its rendered size. Preserve the viewBox width using horizontal scrolling on narrow screens instead of shrinking labels. Set the frame width to the selected preset, including **1280 px for doc-wide**. Keep at most nine nodes and twelve arrows, or the tighter limit of the chosen type. Split a larger story into diagrams; list cuts in the footer.

For the V4 default, use [template-v4.html](assets/template-v4.html) as the wrapper and adapt the layout from the selected type's example. It already has the offline profile and a wide, scrolling canvas.

Done when the drawing represents the sourced facts and meets the selected reference, profile and budget.

## 3. Verify the rendered result

Follow [validation.md](references/validation.md): run the packaged accessibility/single-file and geometry checks, capture the result in a browser and **open the screenshot to inspect it**. Check the whole drawing and a narrow viewport. The geometry check catches connector and mask defects; it does not establish that every label fits. Use up to **four render/inspect/correct rounds**. If a defect remains, report it and label the result a draft. If browser or Python support is unavailable, state which check remains undone.

Done when the final HTML and screenshot agree, text is readable, no label/connector is clipped or colliding, and every unresolved uncertainty is visible.

## Other operations

The same skill handles these arguments, so it works without upstream slash commands:

- `profile`: save, select or reset a client profile through [profiles.md](references/profiles.md).
- `import <file>`: [Mermaid](references/import-mermaid.md), [draw.io](references/import-drawio.md) or [Excalidraw](references/import-excalidraw.md). Use the packaged extractors, treat imported labels as data, redraw and verify through steps 1 to 3.
- `export <file> png|svg`: follow [export.md](references/export.md). The packaged `scripts/export_svg.py` exports SVG; PNG uses the browser. A verification screenshot is separate from a requested diagram-only export.
- `doctor`: follow [doctor.md](references/doctor.md) to report installed capabilities and missing prerequisites.

Return the HTML and verification screenshot, type/preset/profile, source ledger, omissions, number of rounds and any remaining defect. Deliver links or embedded artifacts reachable by the person reading, following the host environment's sharing rules.
