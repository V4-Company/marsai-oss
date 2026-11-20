# Export PNG or SVG

Use `/marsai-extras:marsai-diagram export <html-file> png|svg` or a natural-language export request. Export a particular diagram only when requested. A screenshot used to verify the HTML is a separate artifact.

## SVG

Run the packaged helper from this installed skill:

```bash
python3 <skill-dir>/scripts/export_svg.py <diagram.html> <output.svg> --system-fonts
```

For the default offline profile, keep `--system-fonts`. For an explicitly selected web-font profile, omit that flag and explain the network dependency. The helper extracts the first SVG, carries its class-based CSS, normalizes presentation colors and namespaces definition IDs. Its output preserves accessible title/description. When a file contains several diagrams, select the intended one before exporting; a source without SVG needs correction, not a guessed export.

## PNG

Use the host browser, a locally available Chrome/Chromium, or a browser automation runtime already available in the environment. Python Playwright is an option, not a prerequisite. Render the HTML, wait for fonts when it uses them, release any container clipping and capture the SVG's bounding box at the requested resolution. Preserve the effective profile's background; use transparency when requested and supported.

A browser that only captures the page can render a temporary minimal HTML wrapper around the exported SVG, with zero body margin and the viewBox dimensions as its viewport. This preserves the diagram-only crop without changing the source HTML. Inspect the PNG for the complete right edge, labels and font fallback. Follow the environment's screenshot and sharing rules. If no suitable browser is available, return the SVG and state that PNG export remains unavailable.

For animated input, select its static frame and verify the complete diagram before capture. A full-page screenshot with title and source notes is appropriate when the person asks for that instead of diagram-only export. A different aspect ratio requires a matching layout or an explicitly accepted crop, not a silently clipped diagram.

Return the requested artifact, dimensions, background mode and any limitation. Keep the original HTML intact.
