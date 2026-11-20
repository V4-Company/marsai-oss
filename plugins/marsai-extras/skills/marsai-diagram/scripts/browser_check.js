// Evaluate in the rendered page. This checks actual CSS pixels after scaling.
(() => {
  const findings = [];
  for (const text of document.querySelectorAll('svg text')) {
    const matrix = text.getScreenCTM();
    if (!matrix) continue;
    const scale = Math.min(Math.hypot(matrix.a, matrix.b), Math.hypot(matrix.c, matrix.d));
    const size = parseFloat(getComputedStyle(text).fontSize) * scale;
    const box = text.getBoundingClientRect();
    const canvas = text.ownerSVGElement.getBoundingClientRect();
    if (!Number.isFinite(size) || size < 8.99)
      findings.push({ label: text.textContent, issue: 'font_below_9_css_px', size });
    if (box.left < canvas.left - 1 || box.right > canvas.right + 1 || box.top < canvas.top - 1 || box.bottom > canvas.bottom + 1)
      findings.push({ label: text.textContent, issue: 'text_outside_svg' });
  }
  return { checked: document.querySelectorAll('svg text').length, findings };
})()
