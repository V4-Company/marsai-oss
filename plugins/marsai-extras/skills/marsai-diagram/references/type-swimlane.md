# Swimlane

Use for a cross-functional process whose meaning is ownership and handoffs. Each horizontal lane has one actor; time or process phases progress left to right. For time-ordered calls and returns, use sequence instead.

## Structure

- Reserve a label column before placing nodes. Give it enough width for the longest lane name, wrap where needed, and keep every glyph inside the column with at least 12 px before its divider.
- Group steps into aligned phase columns when phases are meaningful. Put phase names above the drawing; vertical separators are lighter than lane boundaries.
- Rectangular steps belong entirely to their owner's lane. One step gets one responsible actor; a collaboration can use a handoff or an annotation.
- Use unequal lane step counts. Empty space makes ownership clearer than invented steps.
- A narrow status band may sit below the column headings: `deployed`, `PR #...`, `proposed` or `to confirm`, backed by the source ledger. It describes the phase or node group below it, not every system in the lane.

## Connectors and uncertainty

Prefer left-to-right orthogonal routing, ports centered on node edges and distinct rails for concurrent handoffs. Cross-lane arrows are the important relationships; use the accent on at most two focal steps or handoffs. Keep every edge under the connector rules in [primitives-core.md](primitives-core.md).

When a source does not establish ordering, place the related steps in one phase or group and label it **order to confirm**. An arrow asserts a sequence or dependency: draw it only when the source supports that relationship. A dashed node means proposed/PR work according to [MarsAI semantics](marsai-semantics.md); explain that in the legend.

## Budget and verification

Keep at most five lanes, nine steps and twelve arrows; split a larger process by phase or business question. Use at least 9 px for labels at rendered size. Let the wide layout scroll on mobile rather than shrink the text. Capture the full drawing and inspect lane-label boundaries, arrow crossings, phase headings, status-band alignment and footer. Run the checks in [validation.md](validation.md).

## Examples

See `assets/example-swimlane.html`, `assets/example-swimlane-dark.html` and `assets/example-swimlane-full.html` for composition. Apply the active profile and this reference before reusing their markup; historical example labels and font sizes are not authoritative.
