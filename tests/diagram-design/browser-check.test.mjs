import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const script = fs.readFileSync(new URL('../../plugins/marsai-extras/skills/marsai-diagram/scripts/browser_check.js', import.meta.url), 'utf8');
function inspect({ font = 9, scale = 1, box = { left: 10, right: 60, top: 10, bottom: 30 }, rotation = false } = {}) {
  const text = {
    textContent: 'Label',
    getScreenCTM: () => rotation ? { a: 0, b: scale, c: -scale, d: 0 } : { a: scale, b: 0, c: 0, d: scale },
    getBoundingClientRect: () => box,
    ownerSVGElement: { getBoundingClientRect: () => ({ left: 0, right: 100, top: 0, bottom: 100 }) },
  };
  return vm.runInNewContext(script, {
    document: { querySelectorAll: () => [text] },
    getComputedStyle: () => ({ fontSize: String(font) + 'px' }),
  });
}

test('a readable 9px label inside its canvas passes', () => {
  assert.equal(inspect().findings.length, 0);
});
test('an 8px example label fails even without canvas clipping', () => {
  assert.equal(inspect({ font: 8 }).findings[0].issue, 'font_below_9_css_px');
});
test('mobile SVG shrinking cannot hide an unreadable rendered font', () => {
  assert.equal(inspect({ font: 12, scale: 0.5 }).findings[0].size, 6);
});
test('screen scale measures rotated labels correctly', () => {
  assert.equal(inspect({ font: 18, scale: 0.5, rotation: true }).findings.length, 0);
});
test('labels extending outside the SVG canvas fail', () => {
  assert.equal(inspect({ box: { left: 10, right: 110, top: 10, bottom: 30 } }).findings[0].issue, 'text_outside_svg');
});
