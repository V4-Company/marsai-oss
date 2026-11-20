// Builds the site into site/dist, ready to deploy on Vercel:
//
//   index.html, map/index.html, …       the English edition, one document per page
//   pt/index.html, pt/mapa/index.html   the Portuguese edition
//   assets/                             the page script, the styles and one data file per language
//   install.md, llms.txt, flow.md       what a coding agent reads
//   robots.txt, sitemap.xml, 404.html   what a search engine and a lost reader get
//   vercel.json                         fallbacks, redirects and headers
//
// The output is static: no function, no key, nothing that runs on the server.
//
//   npm ci --prefix site    # once: the markdown renderer the pages bundle
//   node site/build.mjs
//   node site/dev.mjs       # local preview
//
// Every page is the same application; the documents differ in their head, so
// a link shared anywhere shows the right title, description and language.
//
// What the page teaches lives in content/<language>/. The skill and agent
// texts, the ADRs and the glossary are read from the repository, so the
// reference part is always what is installed.
//
//   MARSAI_REPO=owner/name   repository the page links to and installs from (default: package.json)
//   SITE_URL=https://…       public address of the site
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { LANGS, LEGACY_REDIRECTS, REPO_OPEN, ROUTES, SITE_URL } from './content/shared.mjs';

const SITE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.dirname(SITE);
const DIST = path.join(SITE, 'dist');

const read = (file) => fs.readFileSync(path.join(REPO, file), 'utf8').replace(/\r\n/g, '\n');
const pkg = JSON.parse(read('package.json'));
const REPO_SLUG = process.env.MARSAI_REPO || pkg.repository.url.replace(/^.*github\.com[/:]/, '').replace(/\.git$/, '');
const REPO_URL = `https://github.com/${REPO_SLUG}`;

/** Drops the `---` frontmatter of a skill or agent file. */
function body(markdown) {
  const match = markdown.match(/^---\n[\s\S]*?\n---\n?([\s\S]*)$/);
  return (match ? match[1] : markdown).trim();
}

/** `marsai-dev:to-spec` or `agent:code-reviewer` -> the files a reader can open. */
function sourceFiles(ref) {
  const [scope, name] = ref.split(':');
  if (scope === 'agent') {
    const file = `plugins/marsai-dev/agents/${name}.md`;
    return [{ name: `${name}.md`, path: file, body: body(read(file)) }];
  }
  const dir = `plugins/${scope}/skills/${name}`;
  const siblings = fs
    .readdirSync(path.join(REPO, dir))
    .filter((f) => f.endsWith('.md') && f !== 'SKILL.md')
    .sort();
  return [
    { name: 'SKILL.md', path: `${dir}/SKILL.md`, body: body(read(`${dir}/SKILL.md`)) },
    ...siblings.map((f) => ({ name: f, path: `${dir}/${f}`, body: read(`${dir}/${f}`).trim() })),
  ];
}

/** Read invocation permissions from the installed component, not editorial copy. */
function invocation(ref) {
  const [scope, name] = ref.split(':');
  if (scope === 'agent') return 'agent';
  const frontmatter = read(`plugins/${scope}/skills/${name}/SKILL.md`).match(/^---\n([\s\S]*?)\n---/)[1];
  if (/^user-invocable:\s*false\s*$/m.test(frontmatter)) return 'agent';
  if (/^disable-model-invocation:\s*true\s*$/m.test(frontmatter)) return 'user';
  return 'both';
}

/**
 * CONTEXT.md gives each term in English and in Portuguese:
 *
 *   **Brake** (pt-BR: **Freio**):
 *   English definition.
 *   _pt-BR_: Definição em português.
 *   _Avoid_: barrier
 *   _Evite_: barreira
 *
 * -> [{ title, terms: [{ name, other, text, avoid }] }], in the language asked for.
 */
function glossary(lang) {
  const sections = [];
  let section = null;
  let term = null;
  for (const line of read('CONTEXT.md').split('\n')) {
    const heading = line.match(/^### (.+)$/);
    const name = line.match(/^\*\*(.+?)\*\* \(pt-BR: \*\*(.+?)\*\*\):\s*$/);
    const pt = line.match(/^_pt-BR_:\s*(.+)$/);
    const avoid = line.match(/^_Avoid_:\s*(.+)$/);
    const evite = line.match(/^_Evite_:\s*(.+)$/);
    if (heading) {
      section = { title: heading[1], terms: [] };
      sections.push(section);
      term = null;
    } else if (name && section) {
      term = { en: name[1], pt: name[2], textEn: '', textPt: '', avoidEn: '', avoidPt: '' };
      section.terms.push(term);
    } else if (pt && term) term.textPt = pt[1];
    else if (avoid && term) term.avoidEn = avoid[1];
    else if (evite && term) term.avoidPt = evite[1];
    else if (term && line.trim() && !line.startsWith('#')) term.textEn += (term.textEn ? ' ' : '') + line.trim();
  }
  const SECTION_PT = { 'Gates and brakes': 'Gates e freios', Roles: 'Papéis', Planning: 'Planejamento', 'Pull request': 'Pull request', 'Continuous improvement': 'Melhoria contínua' };
  return sections.filter((s) => s.terms.length > 0).map((s) => ({
    title: lang === 'pt' ? SECTION_PT[s.title] || s.title : s.title,
    terms: s.terms.map((t) => {
      if (!t.textPt) throw new Error(`CONTEXT.md: the term "${t.en}" has no _pt-BR_ line`);
      return lang === 'pt'
        ? { name: t.pt, other: t.en, text: t.textPt, avoid: t.avoidPt }
        : { name: t.en, other: t.pt, text: t.textEn, avoid: t.avoidEn };
    }),
  }));
}

/* ── The two editions must have the same shape ───────────── */
// Prose differs between the languages; everything else has to be equal, so the
// map, the links and the paths cannot drift apart.
const STRUCT_KEYS = new Set(['id', 'kind', 'col', 'row', 'route', 'from', 'to', 'skill', 'ref', 'icon', 'actor', 'type', 'adr', 'tone', 'scenario', 'goto', 'after', 'dir']);
const STRUCT_LISTS = new Set(['links', 'skills', 'path']);
function parity(a, b, where, key, inList, problems, proseOnly = false) {
  if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b) || (a === null) !== (b === null)) return problems.push(`${where}: different types`);
  if (Array.isArray(a)) {
    if (a.length !== b.length) return problems.push(`${where}: ${a.length} items in pt, ${b.length} in en`);
    // An item is structural only inside a list of slugs; the name of the list says nothing else about it.
    return a.forEach((item, i) => parity(item, b[i], `${where}[${i}]`, '', STRUCT_LISTS.has(key), problems, proseOnly));
  }
  if (a && typeof a === 'object') {
    const ka = Object.keys(a).join(','), kb = Object.keys(b).join(',');
    if (ka !== kb) return problems.push(`${where}: different keys (${ka} | ${kb})`);
    for (const k of Object.keys(a)) parity(a[k], b[k], `${where}.${k}`, k, false, problems, proseOnly);
    return;
  }
  if ((typeof a !== 'string' || (!proseOnly && (STRUCT_KEYS.has(key) || inList))) && a !== b) problems.push(`${where}: ${JSON.stringify(a)} in pt, ${JSON.stringify(b)} in en`);
}

/* ── One edition ─────────────────────────────────────────── */
const load = (lang, file) => import(pathToFileURL(path.join(SITE, 'content', lang, `${file}.mjs`)).href);
const raw = {};
for (const lang of Object.keys(LANGS)) {
  const [skills, map, manifesto, home, ui] = await Promise.all(['skills', 'map', 'manifesto', 'home', 'ui'].map((f) => load(lang, f)));
  raw[lang] = { ...skills, ...map, ...manifesto, ...home, ...ui };
}
const problems = [];
// In ui.mjs every string is prose, whatever its key is called.
for (const key of Object.keys(raw.pt)) parity(raw.pt[key], raw.en[key], key, '', false, problems, key === 'ui');
if (problems.length) throw new Error(`The two editions of the site differ:\n  ${problems.slice(0, 20).join('\n  ')}`);

const routesOf = (lang) => Object.fromEntries(Object.entries(ROUTES).map(([name, paths]) => [name, paths[lang]]));
const other = (lang) => (lang === 'en' ? 'pt' : 'en');
/** {{site}} and {{repo}} in the content become the real addresses. */
const fill = (value) => JSON.parse(JSON.stringify(value).replace(/\{\{site\}\}/g, SITE_URL).replace(/\{\{repo\}\}/g, REPO_SLUG));

function edition(lang) {
  const c = fill(raw[lang]);
  const slugs = c.groups.flatMap((g) => g.skills);
  // Every slug a group lists must have content, and every [[link]] must resolve.
  for (const slug of slugs) if (!c.skills[slug]) throw new Error(`${lang}/skills.mjs: no content for the skill "${slug}"`);
  for (const [, slug] of JSON.stringify(c).matchAll(/\[\[([a-z0-9-]+)(?:\|[^\]]*)?\]\]/g)) {
    if (!c.skills[slug]) throw new Error(`${lang}: the link [[${slug}]] points to a skill that does not exist`);
  }
  for (const [, name] of JSON.stringify(c).matchAll(/\]\(@([a-z-]+)/g)) {
    if (!ROUTES[name]) throw new Error(`${lang}: the link (@${name}) points to a page that does not exist`);
  }
  for (const node of c.map.nodes) {
    if (node.kind === 'gate' ? !c.map.gates[node.id] : !c.map.details[node.id]) throw new Error(`${lang}/map.mjs: no detail for the node "${node.id}"`);
  }
  return {
    lang,
    ui: c.ui,
    routes: routesOf(lang),
    altRoutes: routesOf(other(lang)),
    site: { version: pkg.version.split('.').slice(0, 2).join('.'), repo: REPO_SLUG, repoUrl: REPO_URL, repoOpen: REPO_OPEN, siteUrl: SITE_URL, logo: '/assets/v4-company.svg' },
    example: c.example,
    actors: c.actors,
    groups: c.groups,
    skills: Object.fromEntries(slugs.map((slug) => [slug, { ...c.skills[slug], slug, invocation: invocation(c.skills[slug].ref), files: sourceFiles(c.skills[slug].ref) }])),
    map: c.map,
    brakes: c.brakes,
    botDimensions: c.botDimensions,
    decisionPoints: c.decisionPoints,
    decisions: c.decisions.map((d) => ({ ...d, text: body(read(`docs/adr/${d.adr}`)) })),
    faq: c.faq,
    glossary: glossary(lang),
    manifesto: c.manifesto,
    home: c.home,
    fork: c.fork,
  };
}

/* ── Text helpers ────────────────────────────────────────── */
const plain = (s) =>
  String(s)
    .replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, (m, slug, text) => text || slug)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*/g, '');
const shown = (skill) => (skill.kind === 'agent' ? skill.slug : '/' + skill.slug);

/* ── Output ──────────────────────────────────────────────── */
// A syntax error in the page script leaves the whole site blank; stop the build instead.
for (const script of ['src/manifesto-diagrams.js', 'src/app.js']) {
  execSync(`node --check "${path.join(SITE, script)}"`, { stdio: 'inherit' });
}

// Start from an empty folder, so a page that was removed is not deployed again.
// The Vercel link and the packages of the local preview stay.
for (const name of fs.existsSync(DIST) ? fs.readdirSync(DIST) : []) {
  if (name !== '.vercel' && name !== 'node_modules') fs.rmSync(path.join(DIST, name), { recursive: true, force: true });
}
fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });

const write = (file, content) => {
  const target = path.join(DIST, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
};
/** Writes a file whose name carries a hash of its content, so it can be cached forever. */
const asset = (name, ext, content) => {
  const file = `assets/${name}.${crypto.createHash('sha256').update(content).digest('hex').slice(0, 10)}.${ext}`;
  write(file, content);
  return '/' + file;
};

const css = asset('styles', 'css', fs.readFileSync(path.join(SITE, 'src/styles.css'), 'utf8'));
const favicon = asset('favicon', 'svg', fs.readFileSync(path.join(SITE, 'src/assets/favicon.svg'), 'utf8'));
// The markdown renderer is pinned in site/package.json and served from the site itself, not from a CDN.
const markedFile = createRequire(path.join(SITE, 'package.json')).resolve('marked/marked.min.js');
const markedJs = asset('marked', 'js', fs.readFileSync(markedFile, 'utf8'));
const js = asset('app', 'js', ['src/manifesto-diagrams.js', 'src/app.js'].map(file => fs.readFileSync(path.join(SITE, file), 'utf8')).join('\n'));
for (const file of fs.readdirSync(path.join(SITE, 'src/assets'))) fs.copyFileSync(path.join(SITE, 'src/assets', file), path.join(DIST, 'assets', file));

const template = fs.readFileSync(path.join(SITE, 'src/template.html'), 'utf8');
const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const abs = (p) => SITE_URL + (p === '/' ? '' : p) || SITE_URL;

const editions = {};
let pages = 0;
/** Every page, for the sitemap: [english path, portuguese path]. */
const sitemap = [];
for (const lang of Object.keys(LANGS)) {
  const data = edition(lang);
  editions[lang] = data;
  const dataFile = asset(`data.${lang}`, 'js', `window.DATA = ${JSON.stringify(data).replace(/</g, '\\u003c')};`);
  const meta = data.ui.meta, og = `${SITE_URL}/assets/og-${lang}.png`;
  const noscript = `<div style="padding:40px;max-width:720px"><h1>${attr(meta.titles.home)}</h1><p>${attr(meta.descriptions.home)}</p><p><a href="/install.md">install.md</a> · <a href="/llms.txt">llms.txt</a>${REPO_OPEN ? ` · <a href="${REPO_URL}">GitHub</a>` : ''}</p></div>`;

  const page = (enPath, ptPath, title, description) => {
    const here = lang === 'en' ? enPath : ptPath;
    const html = template
      .replace(/\{\{htmlLang\}\}/g, LANGS[lang].htmlLang)
      .replace(/\{\{title\}\}/g, () => attr(title))
      .replace(/\{\{description\}\}/g, () => attr(description))
      .replace(/\{\{canonical\}\}/g, abs(here))
      .replace(/\{\{altEn\}\}/g, abs(enPath))
      .replace(/\{\{altPt\}\}/g, abs(ptPath))
      .replace(/\{\{siteUrl\}\}/g, SITE_URL)
      .replace(/\{\{ogImage\}\}/g, og)
      .replace(/\{\{ogLocale\}\}/g, LANGS[lang].ogLocale)
      .replace(/\{\{css\}\}/g, css)
      .replace(/\{\{favicon\}\}/g, favicon)
      .replace(/\{\{marked\}\}/g, markedJs)
      .replace(/\{\{data\}\}/g, dataFile)
      .replace(/\{\{js\}\}/g, js)
      .replace(/\{\{noscript\}\}/g, () => noscript);
    write(path.join(here.replace(/^\//, ''), 'index.html'), html);
    pages += 1;
    if (lang === 'en') sitemap.push([enPath, ptPath]);
  };

  for (const [name, paths] of Object.entries(ROUTES)) {
    const title = name === 'home' ? meta.titles.home : `${meta.titles[name]} · MarsAI`;
    page(paths.en, paths.pt, title, meta.descriptions[name] || meta.descriptions.home);
  }
  for (const [slug, s] of Object.entries(data.skills)) {
    page(`${ROUTES.skills.en}/${slug}`, `${ROUTES.skills.pt}/${slug}`, `${shown(s)} · MarsAI`, plain(s.tagline));
  }
}

// What a coding agent reads: plain markdown, no application.
const en = editions.en;
const tokens = (text) => text.replace(/\{\{site\}\}/g, SITE_URL).replace(/\{\{repo\}\}/g, REPO_SLUG);
const skillList = Object.values(en.skills).map((s) => `- [${shown(s)}](${REPO_URL}/blob/main/${s.files[0].path}): ${plain(s.tagline)}`).join('\n');
write('install.md', tokens(fs.readFileSync(path.join(SITE, 'agent/install.md'), 'utf8')));
write('llms.txt', tokens(fs.readFileSync(path.join(SITE, 'agent/llms.txt'), 'utf8')).replace('{{skills}}', skillList));
write('flow.md', body(read('plugins/marsai-core/skills/using-marsai/SKILL.md')).replace('(ONBOARDING.md)', '(onboarding.md)') + '\n');
write('onboarding.md', read('plugins/marsai-core/skills/using-marsai/ONBOARDING.md'));
write('glossary.md', read('CONTEXT.md'));

// For search engines: everything is public, and the sitemap lists both editions of every page.
const AGENT_FILES = ['install.md', 'llms.txt', 'flow.md', 'onboarding.md', 'glossary.md'];
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const alternates = (enPath, ptPath) =>
  [['en', enPath], ['pt-BR', ptPath], ['x-default', enPath]].map(([hreflang, p]) => `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${xml(abs(p))}"/>`).join('\n');
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[
  ...sitemap.flatMap(([enPath, ptPath]) => [enPath, ptPath].map((p) => `  <url>\n    <loc>${xml(abs(p))}</loc>\n${alternates(enPath, ptPath)}\n  </url>`)),
  ...AGENT_FILES.map((file) => `  <url>\n    <loc>${xml(`${SITE_URL}/${file}`)}</loc>\n  </url>`),
].join('\n')}
</urlset>
`);

// A path that is neither a page nor a file: a real 404, in both languages, with no application.
write('404.html', `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>${attr(editions.en.ui.meta.titles.notFound)} · MarsAI</title>
<link rel="icon" href="${favicon}" type="image/svg+xml">
<link rel="stylesheet" href="${css}">
</head>
<body>
<main class="page" style="padding:64px 24px;max-width:720px;margin:0 auto">
<h1>${attr(editions.en.ui.common.notFound)}</h1>
<p><a href="/">${attr(editions.en.ui.common.backHome)}</a></p>
<h1 lang="pt-BR">${attr(editions.pt.ui.common.notFound)}</h1>
<p lang="pt-BR"><a href="/pt">${attr(editions.pt.ui.common.backHome)}</a></p>
</main>
</body>
</html>
`);

write('.vercelignore', '.env*\n.agents/\nsite/\nnode_modules/\n');
// A path with no document of its own is still the application, in its language, unless it names
// a file (robots.txt, sitemap.xml, favicon.ico, llms.txt, any .md): a missing file gets 404.html.
write('vercel.json', JSON.stringify({
  redirects: LEGACY_REDIRECTS.map((r) => ({ ...r, permanent: false })),
  rewrites: [
    { source: '/pt', destination: '/pt/index.html' },
    { source: '/pt/((?!.*\\.[a-zA-Z0-9]+$).*)', destination: '/pt/index.html' },
    { source: '/((?!assets/|pt/|pt$|.*\\.[a-zA-Z0-9]+$).*)', destination: '/index.html' },
  ],
  headers: [
    { source: '/assets/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    { source: '/(.*)\\.md', headers: [{ key: 'Content-Type', value: 'text/markdown; charset=utf-8' }] },
    { source: '/llms.txt', headers: [{ key: 'Content-Type', value: 'text/plain; charset=utf-8' }] },
    { source: '/robots.txt', headers: [{ key: 'Content-Type', value: 'text/plain; charset=utf-8' }] },
    { source: '/sitemap.xml', headers: [{ key: 'Content-Type', value: 'application/xml; charset=utf-8' }] },
  ],
}, null, 2) + '\n');

const terms = en.glossary.reduce((n, s) => n + s.terms.length, 0);
console.log(`site/dist: ${pages} pages in 2 languages · ${Object.keys(en.skills).length} skills and agents · ${terms} terms · ${en.decisions.length} decisions · ${sitemap.length * 2} sitemap pages · ${REPO_SLUG}`);
