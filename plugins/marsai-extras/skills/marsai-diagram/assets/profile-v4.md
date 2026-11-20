# V4 / MarsAI profile

Source: the public MarsAI site's `site/src/styles.css` at version 5.1, including its background, ink, amber accent and agent blue. This is the V4 MarsAI visual identity, not a claim that these are every corporate brand token. Derived light tokens are chosen for legibility. Default: dark, system fonts, no network font dependency.

| Role | Dark (default) | Light |
| --- | --- | --- |
| paper | #09090b | #fafafa |
| paper-2 | #17171b | #f0f0f2 |
| ink | #ededf0 | #18181b |
| ink-strong | #1b1303 | #18181b |
| muted | #a3a3ad | #52525b |
| soft | #a3a3ad | #52525b |
| rule-solid | #70707a | #71717a |
| accent | #f5b73d | #895900 |
| link | #82acff | #2754a3 |

Use amber on at most two focal elements. Status uses outline patterns and text, so it remains understandable without color. For chart series use patterns/labels as well as color, following the selected type's palette contract. Text meets at least 4.5:1 contrast against its immediate background; large text at least 3:1. Redetermine contrast for a client override or translucent layer.

| Typography role | System family | Size |
| --- | --- | --- |
| title | system-ui, sans-serif | 28-36 px |
| node-name | system-ui, sans-serif, weight 600 | 12-16 px |
| sublabel | ui-monospace, monospace | 10-12 px |
| eyebrow | ui-monospace, monospace | 9-10 px |
| arrow-label | ui-monospace, monospace | 9-11 px |
| note | system-ui, sans-serif | 10-12 px |

Scale up for slides. The frame width equals the selected preset's viewBox width; the SVG has that minimum width and scrolls on smaller screens. For `doc-wide`, set `--diagram-width: 1280px`. The HTML is usable offline with no imported stylesheet, font or remote image. Embed any authorized logo as inline SVG.
