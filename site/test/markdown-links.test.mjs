import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';

// Run the markdown setup shipped to the browser, with the marked build the site bundles.
const require = createRequire(import.meta.url);
const markedSource = fs.readFileSync(require.resolve('marked/marked.min.js'), 'utf8');
const app = fs.readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const setup = app.split('// A link or image in rendered markdown')[1].split('const md = ')[0];
const esc = "const esc = (s) => String(s).replace(/[&<>\"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[c]));";

const context = {};
context.window = context;
vm.createContext(context);
vm.runInContext(markedSource, context);
vm.runInContext(`${esc}\n//${setup}`, context);
const render = (markdown) => vm.runInContext(`marked.parse(${JSON.stringify(markdown)})`, context);

test('links that could run code lose their address and keep their text', () => {
  for (const href of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'java\tscript:alert(1)', ' javascript:alert(1)', 'data:text/html;base64,PHNjcmlwdD4=', 'vbscript:msgbox(1)']) {
    const html = render(`[click](${href.includes(' ') || href.includes('\t') ? `<${href}>` : href})`);
    assert.doesNotMatch(html, /href=/i, `${JSON.stringify(href)} -> ${html}`);
    assert.match(html, /click/);
  }
});

test('images that could run code are dropped', () => {
  const html = render('![x](javascript:alert(1))');
  assert.doesNotMatch(html, /<img/i);
});

test('ordinary links keep working', () => {
  assert.match(render('[site](https://example.com/a?b=1)'), /<a href="https:\/\/example\.com\/a\?b=1" target="_blank" rel="noopener">site<\/a>/);
  assert.match(render('[mail](mailto:team@example.com)'), /href="mailto:team@example\.com"/);
  assert.match(render('[file](LAYOUT.md)'), /<a href="LAYOUT\.md">file<\/a>/);
  assert.match(render('[up](../README.md)'), /href="\.\.\/README\.md"/);
  assert.match(render('[part](#steps)'), /href="#steps"/);
});
