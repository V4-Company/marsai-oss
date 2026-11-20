# Verification of generated diagrams

`<skill-dir>` is this skill's installed folder, not an upstream repository. Python 3.10+ runs the packaged checks using only the standard library. Resolve the local interpreter (`python3`, `python` or Windows `py -3`); a Windows agent may use an available WSL interpreter with translated paths.

```bash
python3 <skill-dir>/scripts/self_check.py --offline <diagram.html>
python3 <skill-dir>/scripts/verify-geometry.py <diagram.html>
```

The first check validates accessible SVG, single-file safety and basic motion rules. The second detects diagonal or stacked connectors, crowded ports, corner attachments and masks clipped by later nodes. It uses heuristics and cannot prove text fit or general visual quality. For a quantitative type or motion, use its packaged `verify-<type>.py` when present. `doctor` lists what is actually installed; upstream repository maintenance tests are outside this distribution.

## Render, inspect, correct

When the host can evaluate JavaScript, evaluate [browser_check.js](../scripts/browser_check.js) on the rendered page. It checks the 9 CSS pixel minimum and text outside the SVG. It complements geometry checks and screenshot inspection; it cannot establish text fit inside every node.

Prefer the host's browser tools and its rules for availability and ownership. Otherwise use a locally available Chrome/Chromium in headless mode:

```bash
chrome --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1400,1000 --virtual-time-budget=6000 \
  --screenshot=<absolute-output.png> <file-url-of-diagram>
```

Resolve the actual executable and quote paths containing spaces. Use a viewport at least the viewBox width plus the wrapper margins; adjust its height to frame the entire drawing. Open the PNG with the host's image inspection tool. Check text boundaries, node fit, label masks, connector crossings, lane dividers, legends, accent count and empty space. Change the HTML and take a new screenshot after each correction, up to four rounds. Also check a narrow viewport (around 390 px): readable text must remain at least 9 CSS pixels; a wide diagram may scroll horizontally. Avoid remote fonts for this default offline output.

Where browser evaluation is available, inspect every SVG text element's computed font size multiplied by its screen scale, and its rendered bounding box. Expand a box or wrap/reword the label when it fails. A screenshot and a person-like visual inspection are still required, even after all scripts pass. Report the last capture, round count and any check that could not run.
