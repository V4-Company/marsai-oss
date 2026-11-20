# Status, uncertainty and sequence extensions

## Existing versus proposed

Use a solid node outline for deployed work. Use a dashed outline for proposed work or an open PR, with `PR #123` as a secondary label only when a read source gives that number. Verify the PR state before calling it deployed. Explain these outlines in the legend. Connector dash patterns retain their type-specific meaning; in a sequence a dashed return is still a return, not a proposed component.

## Uncertainty

Use `to confirm` for an inferred relationship or unverified order and `approximate` beside an estimated date. A dated source is evidence of what it reported at that time, not automatic evidence of today's state. Keep a footer with sources/revisions and cuts; splitting the diagram preserves the same ledger. Numeric values and dates come from the read sources. A qualitative relationship without measured data stays qualitative.

## Sequence notes and PAR

A note is a small paper-filled rectangle beside its lifeline, with text at least 9 px. It is annotation, not an actor or message. Reserve its space before routing arrows.

For independent branches, use a combined fragment labeled `PAR`, spanning only the participating lifelines. Separate its regions with a horizontal dashed divider. Time flows downward within each region; relative ordering between regions is unspecified. Keep the sequence limit of five lifelines and twelve messages, maximum one level of nesting, and list omitted messages in the footer.

Masks inside a fragment use the **composited local background**. For example, ink `#2d3142` at 2% over paper `#f5f5f5` becomes approximately `#f1f1f1`; a mask filled with `#f5f5f5` creates a visible patch there. Compute the color for the effective profile and every containing layer, or give the fragment an explicit solid fill and reuse it for the mask. A mask clears its text and stays clear of later-painted nodes.
