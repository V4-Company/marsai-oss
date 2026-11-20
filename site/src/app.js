(function () {
  'use strict';
  const D = window.DATA, U = D.ui;
  const $ = (id) => document.getElementById(id);
  const main = $('main');

  /* ── Language ────────────────────────────────────────────── */
  // The page follows the reader: the language they chose, else the browser's.
  // Each language is its own document, so the right link preview is served
  // to whoever shares a page.
  const LANG_KEY = 'marsai-lang';
  const stored = (() => { try { return localStorage.getItem(LANG_KEY); } catch { return null; } })();
  const remember = (lang) => { try { localStorage.setItem(LANG_KEY, lang); } catch { /* private mode */ } };

  /** The route this path belongs to: { name, rest } where rest is what follows the route. */
  function routeOf(pathname, routes) {
    const path = pathname.replace(/\/+$/, '') || '/';
    let best = null;
    for (const [name, base] of Object.entries(routes)) {
      const clean = base.replace(/\/+$/, '') || '/';
      const inside = clean === '/' ? path === '/' : path === clean || path.startsWith(clean + '/');
      if (inside && (!best || clean.length > best.base.length)) best = { name, base: clean, rest: path.slice(clean.length) };
    }
    return best;
  }
  /** The same page in the other language. */
  function otherLangUrl() {
    const at = routeOf(location.pathname, D.routes);
    const base = at ? D.altRoutes[at.name] : D.altRoutes.home;
    return (base + (at ? at.rest : '')).replace(/\/+$/, '') + location.search + location.hash || '/';
  }
  const preferred = stored || (D.lang === 'en' && /^pt\b/i.test(navigator.language || '') ? 'pt' : D.lang);
  if (preferred !== D.lang && !/[?&]lang=keep\b/.test(location.search)) { location.replace(otherLangUrl() || '/'); return; }

  /* ── Helpers ─────────────────────────────────────────────── */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  const url = (name, rest) => D.routes[name] + (rest || '');
  const skillUrl = (slug) => url('skills', '/' + slug);
  const plain = (s) => String(s).replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, (m, slug, text) => text || slug).replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[`*]/g, '');
  const fold = (s) => plain(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  // A link or image in rendered markdown only keeps an address that cannot run code.
  const safeHref = (href) => {
    const value = String(href || '').trim();
    return /^(https?:|mailto:|\/|#|\.{0,2}\/)/i.test(value) || !/^[a-z][a-z0-9+.-]*:/i.test(value.replace(/[\u0000-\u0020]/g, '')) ? value : '';
  };
  if (window.marked) {
    marked.use({
      renderer: {
        link(href, title, text) {
          const safe = safeHref(href);
          if (!safe) return text;
          return `<a href="${esc(safe)}"${title ? ` title="${esc(title)}"` : ''}${/^https?:/i.test(safe) ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`;
        },
        image(href, title, text) {
          const safe = safeHref(href);
          return safe ? `<img src="${esc(safe)}" alt="${esc(text || '')}"${title ? ` title="${esc(title)}"` : ''}>` : esc(text || '');
        },
      },
    });
  }
  const md = (text) => (window.marked ? marked.parse(text) : '<pre>' + esc(text) + '</pre>');

  /** `code`, **bold**, [[slug]] and [[slug|text]] links to skill pages, [text](@route), [text](https://…). */
  function inline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, (m, slug, text) =>
        `<a href="${skillUrl(slug)}"${text ? '' : ' class="sk"'}>${text || slug}</a>`)
      .replace(/\[([^\]]+)\]\(@([a-z-]+)([^)]*)\)/g, (m, text, name, rest) => `<a href="${url(name, rest)}">${text}</a>`)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1 ↗</a>');
  }

  const ICONS = {
    play: '<path d="M8 5.5v13l10-6.5z"/>',
    compass: '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    map: '<path d="M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
    chat: '<path d="M4 5h12v8H9l-3 3v-3H4z"/><path d="M10 16.5h5l3 3v-3h2V9.5h-2"/>',
    doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
    layers: '<path d="M12 4 3 8.5l9 4.5 9-4.5z"/><path d="M3 12.5l9 4.5 9-4.5M3 16.5 12 21l9-4.5"/>',
    graph: '<circle cx="6" cy="12" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="18" cy="18" r="2.2"/><path d="M8 11l8-4M8 13l8 4"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    pr: '<circle cx="6" cy="6" r="2.2"/><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="18" r="2.2"/><path d="M6 8.2v7.6M18 15.8V10a4 4 0 0 0-4-4h-2.5M13.5 3.5 11 6l2.5 2.5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
    loop: '<path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.7L4 15.5M4 20v-4.5h4.5"/>',
    cube: '<path d="M12 3 4 7.5v9L12 21l8-4.5v-9z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>',
    swap: '<path d="M4 8h13M14 4.5 17.5 8 14 11.5M20 16H7M10 12.5 6.5 16 10 19.5"/>',
    brick: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8.5v7M8.5 12h7"/>',
    check: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.2l2.8 2.8L16 9.5"/>',
    bot: '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 8V4.5M9.5 13v1.5M14.5 13v1.5"/><circle cx="12" cy="3.6" r="1"/>',
    book: '<path d="M5 4.5h10a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10"/>',
    help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.7.4-1 .9-1 1.7M12 16.6v.2"/>',
    list: '<path d="M8 6.5h12M8 12h12M8 17.5h12M4 6.5h.2M4 12h.2M4 17.5h.2"/>',
    users: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.8a3 3 0 0 1 0 5.6M17.5 14a5.2 5.2 0 0 1 3 5"/>',
    shield: '<path d="M12 3.5 5 6v5.5c0 4.3 2.9 7.5 7 9 4.1-1.5 7-4.7 7-9V6z"/><path d="M9 12l2.2 2.2L15 10.3"/>',
    bulb: '<path d="M9 17.5h6M10 20.5h4M8.2 14.5A6 6 0 1 1 15.8 14.5c-.6.6-.8 1.2-.8 2H9c0-.8-.2-1.4-.8-2z"/>',
    copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/>',
    chev: '<path d="M9.5 6.5 15 12l-5.5 5.5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    flag: '<path d="M6 21V4M6 4.5h11l-2 4 2 4H6"/>',
    fork: '<circle cx="6" cy="5.5" r="2.2"/><circle cx="18" cy="5.5" r="2.2"/><circle cx="12" cy="18.5" r="2.2"/><path d="M6 7.7v2.3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7.7M12 13v3.3"/>',
    github: '<path d="M9 19c-4 1.2-4-2-5.5-2.5M14.5 21v-3.2a2.8 2.8 0 0 0-.8-2.2c2.6-.3 5.3-1.3 5.3-5.8a4.5 4.5 0 0 0-1.2-3.1 4.2 4.2 0 0 0-.1-3.1s-1-.3-3.2 1.2a11 11 0 0 0-5.8 0C6.500 3.300 5.500 3.600 5.500 3.600a4.200 4.200 0 0 0-.1 3.100A4.500 4.500 0 0 0 4.200 9.800c0 4.500 2.700 5.500 5.300 5.800a2.800 2.800 0 0 0-.8 2.200V21"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  };
  const icon = (name, size) => `<svg viewBox="0 0 24 24" width="${size || 18}" height="${size || 18}" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  function groupOf(slug) {
    for (let gi = 0; gi < D.groups.length; gi++) {
      const si = D.groups[gi].skills.indexOf(slug);
      if (si >= 0) return { group: D.groups[gi], gi, si, num: `${gi + 1}.${si + 1}` };
    }
    return null;
  }
  const order = D.groups.flatMap((g) => g.skills);
  const tile = (slug, small) => `<span class="tile ${small ? 'sm ' : ''}g-${groupOf(slug).group.id}">${icon(D.skills[slug].icon, small ? 18 : 24)}</span>`;
  const chip = (actor) => `<span class="chip ${actor}" title="${esc(D.actors[actor].hint)}">${esc(D.actors[actor].label)}</span>`;
  const shown = (skill) => (skill.kind === 'agent' ? skill.slug : '/' + skill.slug);
  const invocationBadge = (skill) => `<span class="invocation-badge inv-${skill.invocation}" title="${esc(U.skills.invocation[skill.invocation].description)}">${esc(U.skills.invocation[skill.invocation].label)}</span>`;

  /* ── Flow diagrams ───────────────────────────────────────── */
  const GATE = 13; // half the diagonal of a gate diamond

  function route(a, b, e, L) {
    const acx = a.x + a.w / 2, bcx = b.x + b.w / 2, acy = a.y + a.h / 2, bcy = b.y + b.h / 2;
    const ax = acx + (e.fromDx || 0), bx = bcx + (e.toDx || 0);
    const ay = acy + (e.fromDy || 0), by = bcy + (e.toDy || 0);
    const sameRow = Math.abs(acy - bcy) < 1, sameCol = Math.abs(acx - bcx) < 1;
    const kind = e.route || (sameRow ? (b.x > a.x ? 'h' : 'under') : sameCol ? 'v' : b.x > a.x ? 'hvh' : 'vhv');
    const down = b.y > a.y;
    // Explicit waypoints: the edge leaves one side of `a`, passes through them and reaches one side of `b`.
    if (e.via) {
      const start = e.side === 'left' ? [a.x, ay] : e.side === 'right' ? [a.x + a.w, ay] : [ax, a.y + a.h];
      const end = e.toSide === 'left' ? [b.x, by] : e.toSide === 'bottom' ? [bx, b.y + b.h] : [bx, b.y];
      return [start, ...e.via, end];
    }
    switch (kind) {
      case 'h': return [[a.x + a.w, ay], [b.x, by]];
      case 'v': return down ? [[ax, a.y + a.h], [bx, b.y]] : [[ax, a.y], [bx, b.y + b.h]];
      case 'hvh': { const mx = (a.x + a.w + b.x) / 2; return [[a.x + a.w, ay], [mx, ay], [mx, by], [b.x, by]]; }
      case 'vhv': {
        const my = e.midY ?? (down ? (a.y + a.h + b.y) / 2 : (a.y + b.y + b.h) / 2);
        return down ? [[ax, a.y + a.h], [ax, my], [bx, my], [bx, b.y]] : [[ax, a.y], [ax, my], [bx, my], [bx, b.y + b.h]];
      }
      case 'vh': return [[ax, down ? a.y + a.h : a.y], [ax, by], [bx > ax ? b.x : b.x + b.w, by]];
      case 'hv': return [[bx > ax ? a.x + a.w : a.x, ay], [bx, ay], [bx, down ? b.y : b.y + b.h]];
      case 'under': { const y = Math.max(a.y + a.h, b.y + b.h) + (e.depth || 18); return [[ax, a.y + a.h], [ax, y], [bx, y], [bx, b.y + b.h]]; }
      case 'over': { const y = Math.min(a.y, b.y) - (e.depth || 18); return [[ax, a.y], [ax, y], [bx, y], [bx, b.y]]; }
      case 'rail': { const x = e.railX ?? L.railX; return [[a.x, ay], [x, ay], [x, by], [b.x, by]]; }
      // The end of one band wraps to the start of the next, down the right edge.
      case 'wrap': return [[a.x + a.w, ay], [L.wrapX, ay], [L.wrapX, e.midY], [bx, e.midY], [bx, b.y]];
      case 'wrapin': return [[a.x + a.w, ay], [L.wrapX, ay], [L.wrapX, by], [b.x + b.w, by]];
      case 'wrapout': return [[a.x, ay], [bx, ay], [bx, b.y]];
    }
    return [[ax, ay], [bx, by]];
  }

  function pathOf(points, bare) {
    const pts = points.filter((p, i) => i === 0 || p[0] !== points[i - 1][0] || p[1] !== points[i - 1][1]);
    const n = pts.length;
    // Stop the stroke a little before the tip so the arrowhead stays sharp.
    const [lx, ly] = pts[n - 1], [px, py] = pts[n - 2];
    const len = Math.hypot(lx - px, ly - py) || 1;
    const end = bare ? [lx, ly] : [lx - ((lx - px) / len) * 4, ly - ((ly - py) / len) * 4];
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < n - 1; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      const d1 = Math.hypot(x1 - x0, y1 - y0), d2 = Math.hypot(x2 - x1, y2 - y1);
      const r = Math.min(9, d1 / 2, d2 / 2);
      d += ` L${(x1 - ((x1 - x0) / d1) * r).toFixed(1)},${(y1 - ((y1 - y0) / d1) * r).toFixed(1)}`;
      d += ` Q${x1},${y1} ${(x1 + ((x2 - x1) / d2) * r).toFixed(1)},${(y1 + ((y2 - y1) / d2) * r).toFixed(1)}`;
    }
    d += ` L${end[0].toFixed(1)},${end[1].toFixed(1)}`;
    const a = Math.atan2(ly - py, lx - px);
    const wing = (t) => `${(lx - 8.5 * Math.cos(a + t)).toFixed(1)},${(ly - 8.5 * Math.sin(a + t)).toFixed(1)}`;
    return { d, head: bare ? '' : `M${lx},${ly} L${wing(0.4)} L${wing(-0.4)} Z`, pts };
  }

  function labelOf(e, pts) {
    let best = 0, bestLen = -1;
    for (let i = 0; i < pts.length - 1; i++) {
      const len = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      if (len > bestLen) { bestLen = len; best = i; }
    }
    const tree = pts.length === 4 && pts[0][1] === pts[1][1] && pts[2][1] === pts[3][1] && pts[1][0] === pts[2][0];
    if (tree) best = 2;
    if (Number.isInteger(e.labelSegment)) best = Math.max(0, Math.min(pts.length - 2, e.labelSegment));
    const [x0, y0] = pts[best], [x1, y1] = pts[best + 1];
    const t = e.labelAt ?? 0.5;
    const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
    if (Math.abs(x1 - x0) < 1) return { x: x + 7, y: y + 3.5, anchor: 'start' };
    const below = e.labelBelow ?? e.route === 'under';
    return { x, y: below ? y + 13 : y - 6, anchor: 'middle' };
  }

  function flow(spec, opts) {
    opts = opts || {};
    const W = spec.nodeW || 168, H = spec.nodeH || 60, GX = spec.gapX ?? 44, GY = spec.gapY ?? 30;
    const PL = spec.padLeft ?? 6, PT = spec.colLabels ? 32 : 10;
    const N = {};
    for (const n of spec.nodes) {
      if (n.kind === 'gate') continue;
      N[n.id] = { ...n, x: PL + n.col * (W + GX), y: spec.rowY ? spec.rowY[n.row] : PT + n.row * (H + GY), w: W, h: H };
    }
    // A gate sits on the line: in the gap after a node, or at a point of a wrap connector.
    for (const n of spec.nodes) {
      if (n.kind !== 'gate') continue;
      const after = n.after && N[n.after];
      const cx = after ? after.x + after.w + GX / 2 : n.at.x, cy = after ? after.y + after.h / 2 : n.at.y;
      N[n.id] = { ...n, x: cx - GATE, y: cy - GATE, w: 2 * GATE, h: 2 * GATE };
    }
    const nodes = Object.values(N);
    const right = Math.max(...nodes.map((n) => n.x + n.w));
    const wraps = spec.edges.some((e) => /^wrap/.test(e.route || ''));
    let width = right + (wraps ? 28 : 8);
    let bottom = Math.max(...nodes.map((n) => n.y + n.h + (n.tag ? 18 : 0)));

    const edges = spec.edges.map((e) => {
      const p = pathOf(route(N[e.from], N[e.to], e, { railX: PL - 16, wrapX: right + 18 }), e.bare);
      const label = e.label ? labelOf(e, p.pts) : null;
      // A shortcut also carries its name along the line, so each path reads on its own.
      const note = e.note ? labelOf({ labelSegment: e.noteSegment, labelAt: e.noteAt, labelBelow: e.noteBelow }, p.pts) : null;
      for (const [x, y] of p.pts) { bottom = Math.max(bottom, y); width = Math.max(width, x + (spec.padRight ?? 8)); }
      if (label) bottom = Math.max(bottom, label.y + 4);
      return { e, p, label, note };
    });

    let out = '';
    for (const phase of spec.phases || []) {
      const top = spec.rowY[phase.rows[0]] - 34, last = spec.rowY[phase.rows[1]];
      const base = phase.rows[1] === spec.rowY.length - 1 ? bottom + 8 : last + H + 22;
      out += `<g class="fphase p-${phase.tone}"><rect x="2" y="${top}" width="${width - 4}" height="${base - top}" rx="14"/>`;
      out += `<text x="${phase.labelX ?? 16}" y="${top + 19}"><tspan class="pl">${esc(phase.label.toUpperCase())}</tspan><tspan class="pm" dx="10">${esc(phase.mode)}</tspan></text></g>`;
    }
    for (const { e, p, label, note } of edges) {
      const kinds = `${e.dashed ? ' dashed' : ''}${e.jump ? ' jump' : ''}${e.shortcut ? ` shortcut sc-${e.shortcut}` : ''}${N[e.from].kind === 'routing' ? ' fork' : ''}`;
      out += `<g class="fedge${kinds}" data-from="${e.from}" data-to="${e.to}">`;
      out += `<path class="line" d="${p.d}"/>${p.head ? `<path class="head" d="${p.head}"/>` : ''}`;
      if (label) out += `<text class="elabel" x="${label.x.toFixed(1)}" y="${label.y.toFixed(1)}" text-anchor="${label.anchor}">${esc(e.label)}</text>`;
      if (note) out += `<text class="elabel note" x="${note.x.toFixed(1)}" y="${note.y.toFixed(1)}" text-anchor="${note.anchor}">${esc(e.note)}</text>`;
      out += '</g>';
    }
    for (const [col, text] of Object.entries(spec.colLabels || {})) {
      out += `<text class="collabel" x="${PL + col * (W + GX) + W / 2}" y="14" text-anchor="middle">${esc(text)}</text>`;
    }
    for (const band of spec.bands || []) {
      out += `<text class="band" x="${width - 8}" y="${spec.rowY[band.row] - (band.row === 0 ? 44 : 16)}" text-anchor="end">${esc(band.label.toUpperCase())}</text>`;
    }
    for (const n of nodes) {
      const attrs = opts.interactive ? ' tabindex="0" role="button"' : '';
      if (n.kind === 'gate') {
        out += `<g class="fnode k-gate" data-id="${n.id}" transform="translate(${n.x},${n.y})"${attrs} aria-label="${esc(n.label)}">`;
        out += `<polygon class="box" points="${GATE},0 ${2 * GATE},${GATE} ${GATE},${2 * GATE} 0,${GATE}"/><text class="glabel" x="${GATE}" y="${GATE + 3.4}" text-anchor="middle">${esc(n.label)}</text></g>`;
        continue;
      }
      out += `<g class="fnode k-${n.kind || 'plain'}${n.optional ? ' opt' : ''}" data-id="${n.id}" transform="translate(${n.x},${n.y})"${attrs}>`;
      out += `<rect class="box" width="${W}" height="${H}" rx="11"/><rect class="bar" x="0" y="12" width="3" height="${H - 24}" rx="1.5"/>`;
      out += `<foreignObject x="13" y="0" width="${W - 20}" height="${H}"><div class="fn"><b>${esc(n.label)}</b>${n.sub ? `<span>${esc(n.sub)}</span>` : ''}</div></foreignObject>`;
      if (n.person) out += `<g class="pbadge" transform="translate(${W - 50},-8)"><rect width="44" height="16" rx="8"/><text x="22" y="11.3" text-anchor="middle">${esc(U.common.badge)}</text></g>`;
      if (n.tag) out += `<text class="ftag" x="${W / 2}" y="${H + 14}" text-anchor="middle">${esc(n.tag)}</text>`;
      out += '</g>';
    }
    const height = bottom + 12;
    const cls = `flow${opts.interactive ? ' interactive' : ''}`;
    const style = opts.interactive ? '' : ` style="max-width:${Math.round(width)}px"`;
    return `<svg class="${cls}" viewBox="0 0 ${Math.round(width)} ${Math.round(height)}"${style} role="img">${out}</svg>`;
  }

  /* ── Other diagrams ──────────────────────────────────────── */
  function cut(spec) {
    const C = U.guides.cut;
    const cols = `grid-template-columns: 150px repeat(${spec.repos.length}, minmax(0, 1fr))`;
    const repoCols = `grid-template-columns: repeat(${spec.repos.length}, minmax(0, 1fr))`;
    const heads = spec.repos.map((r) => `<span>${esc(r)}</span>`).join('');
    const rows = spec.slices.map((s, i) =>
      `<div class="cut-row" style="${cols}"><span class="cut-name">${i + 1}. ${esc(s.label)}</span>${s.spans.map((on) => `<span class="cut-cell${on ? ' fill' : ''}"></span>`).join('')}</div>`).join('');
    return `<div class="cut">
      <div class="cut-panel bad"><h4>${esc(C.byRepo)}</h4>
        <div class="cut-repos" style="${repoCols}">${heads}</div>
        <div class="cut-row" style="${repoCols}">${spec.repos.map((r) => `<span class="cut-cell fill bad">${esc(fmt(C.allOf, { repo: r }))}</span>`).join('')}</div>
        <p class="cut-note">${esc(C.byRepoNote)}</p></div>
      <div class="cut-panel good"><h4>${esc(C.byBehaviour)}</h4>
        <div class="cut-repos" style="${cols}"><span></span>${heads}</div>${rows}
        <p class="cut-note">${esc(C.byBehaviourNote)}</p></div></div>`;
  }

  function lanes(spec) {
    const rows = spec.lanes.map((lane) => {
      const bars = lane.bars.map((b) =>
        `<span class="lane-bar k-${b.kind}" style="left:calc(${(b.from / spec.cols) * 100}% + 2px);width:calc(${((b.to - b.from) / spec.cols) * 100}% - 4px)">${esc(b.text)}</span>`).join('');
      return `<div class="lane"><span class="lane-label">${esc(lane.label)}</span><div class="lane-track" style="--cols:${spec.cols}">${bars}</div></div>`;
    }).join('');
    return `<div class="lanes" style="grid-template-columns: 78px minmax(0, 1fr)">${rows}<div class="lanes-axis">${U.guides.lanes.map((t) => `<span>${esc(t)}</span>`).join('')}</div></div>`;
  }

  function danger() {
    const G = U.guides.danger;
    return `<div class="danger">
      <div class="door two"><h4><span class="arrows">⇄</span>${esc(G.twoWay)}</h4><p>${esc(G.twoWayText)}</p></div>
      <div class="door one"><h4><span class="arrows">→</span>${esc(G.oneWay)}</h4><p>${esc(G.oneWayText)}</p>
        <ul>${G.oneWayItems.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
      <div class="radius"><h4>${esc(G.radius)}</h4>
        <div class="radius-scale">${G.scale.map((s, i) => `<span style="background:rgba(248,113,113,${0.07 + i * 0.07})">${esc(s)}</span>`).join('')}</div></div></div>`;
  }

  function diagram(spec) {
    const body = spec.type === 'flow' ? flow(spec) : spec.type === 'cut' ? cut(spec) : spec.type === 'lanes' ? lanes(spec) : spec.type === 'danger' ? danger() : '';
    return `<figure class="diagram">${body}${spec.caption ? `<figcaption>${inline(spec.caption)}</figcaption>` : ''}</figure>`;
  }

  /* ── Examples ────────────────────────────────────────────── */
  function termLine(line) {
    const e = esc(line);
    if (line.startsWith('$')) return `<span class="cmdl">${e}</span>`;
    if (/✗|faltando|missing/.test(line)) return `<span class="no">${e}</span>`;
    if (/✓|✔|✅|corrigido|fixed|5\/5/.test(line)) return `<span class="ok">${e}</span>`;
    if (/^\s*\.\.\./.test(line)) return `<span class="dim">${e}</span>`;
    return e;
  }

  function exampleBody(ex) {
    if (ex.kind === 'chat') {
      return '<div class="chat">' + ex.lines.map(([who, text]) =>
        `<div class="bubble ${who}"><small>${who === 'pessoa' ? U.common.person : U.common.agent}</small>${esc(text)}</div>`).join('') + '</div>';
    }
    if (ex.kind === 'terminal') {
      return `<div class="termwrap"><div class="termbar"><i></i><i></i><i></i></div><pre class="term">${ex.lines.map(termLine).join('\n')}</pre></div>`;
    }
    if (ex.kind === 'doc') {
      return `<div class="doc"><header>${esc(ex.title)}</header>${ex.lines.map((l) => `<p>${esc(l)}</p>`).join('')}</div>`;
    }
    if (ex.kind === 'slices') {
      return `<table class="t"><tr>${U.skills.slices.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>${
        ex.lines.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table>`;
    }
    return '';
  }
  const exampleTag = (ex) => `<div class="extag">${esc(ex.note || U.common.illustrative + ' · ' + D.example.title)}</div>`;

  function table(head, rows) {
    return `<table class="t"><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>${
      rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</table>`;
  }
  const faqBlock = (items) => `<div class="faq">${items.map(([q, a]) => `<details><summary>${inline(q)}</summary><p>${inline(a)}</p></details>`).join('')}</div>`;
  const cmdBox = (text, plainCmd) => `<div class="cmd">${plainCmd ? '<span class="dollar">$</span>' : ''}<span class="text">${esc(text)}</span><button class="copy" data-copy="${esc(text)}" title="${esc(U.common.copy)}">${icon('copy', 15)}</button></div>`;

  /* The repository is private for now (REPO_OPEN in content/shared.mjs): a way into it shows "soon", and an action on it is left out. */
  const repoLink = (path, cls, inner, ext = '') => D.site.repoOpen
    ? `<a class="${cls}" href="${D.site.repoUrl}${path}" target="_blank" rel="noopener">${inner}${ext}</a>`
    : `<span class="${cls} soon" aria-disabled="true">${inner}<em>${esc(U.common.soon)}</em></span>`;
  const repoAction = (path, cls, inner, ext = '') => D.site.repoOpen ? repoLink(path, cls, inner, ext) : '';

  function footer() {
    const F = U.footer;
    return `<footer class="credits"><span>${esc(D.home.credits)} ${esc(F.license)}</span>
      <span class="creditlinks">${repoLink('', '', esc(F.links.repo), ' ↗')}
      ${repoAction('/issues/new/choose', '', esc(F.links.issues), ' ↗')}
      ${repoAction('/blob/main/CONTRIBUTING.md', '', esc(F.links.contributing), ' ↗')}
      <a href="https://github.com/mattpocock/skills" target="_blank" rel="noopener">${esc(F.links.matt)} ↗</a></span></footer>`;
  }

  /* ── Page: home ──────────────────────────────────────────── */
  function tryBlock() {
    const T = D.home.tryIt;
    return `<section class="tryit" id="try">
      <div class="tryhead"><div class="eyebrow">${esc(T.kicker)}</div><h2>${esc(T.title)}</h2><p>${inline(T.lead)}</p>
        <ol class="tryafter">${T.after.map((t) => `<li>${inline(t)}</li>`).join('')}</ol></div>
      <div class="trybox"><div class="trybar"><i></i><i></i><i></i><button class="btn primary" data-copy="${esc(T.prompt)}">${icon('copy', 15)} <span>${esc(T.copy)}</span></button></div>
        <pre class="tryprompt">${esc(T.prompt)}</pre>
        <p class="trynote">${inline(T.agentNote)}</p></div>
      <details class="trymanual"><summary>${esc(T.manualTitle)}</summary><div class="manualgrid">${T.manual.map((b) =>
        `<div><h3>${esc(b.title)}</h3><p>${inline(b.text)}</p>${b.commands.map((c) => cmdBox(c, true)).join('')}</div>`).join('')}</div></details>
    </section>`;
  }

  /** The Home Repo thesis: how V4 runs MarsAI today, and the two ways in. */
  function homeRepoBlock() {
    const R = D.home.homeRepo;
    const hrefs = ['#try', skillUrl('home-repo')];
    return `<section class="homeintro homerepo" id="home-repo"><div><div class="eyebrow">${esc(R.kicker)}</div><h2>${esc(R.title)}</h2></div>
      <div>${R.text.map((t) => `<p>${inline(t)}</p>`).join('')}
        <h3 class="homerepo-paths">${esc(R.pathsTitle)}</h3>
        <div class="govgrid">${R.paths.map((p, i) => `<div><h3>${esc(p.title)}</h3><p>${inline(p.text)}</p><a class="btn" href="${hrefs[i]}">${esc(p.cta)} ${icon('arrow', 16)}</a></div>`).join('')}</div>
        <p class="homerepo-link"><a href="${url('decisions')}">${esc(R.link)} →</a></p></div></section>`;
  }

  function pageHome() {
    const H = D.home;
    return `<div class="home">
      <section class="homehero">
        <div><div class="eyebrow"><b>${esc(H.hero.eyebrow[0])}</b> ${esc(H.hero.eyebrow[1])}</div>
          <h1>${esc(H.hero.title[0])}<br><span>${esc(H.hero.title[1])}</span></h1>
          <p class="homelead">${inline(H.hero.lead)}</p>
          <div class="homeactions"><a class="btn primary" href="#try">${esc(H.hero.primary)} ${icon('arrow', 16)}</a><a class="btn" href="${url('map')}">${esc(H.hero.secondary)}</a><a class="btn" href="${url('manifesto')}">${esc(U.nav.manifesto)}</a></div>
          <p class="homenote">${esc(H.hero.note)}</p>
        </div>
        <div class="homepreview"><div class="minilabel">${esc(H.steps.label)}</div>
          <ol>${H.steps.items.map(([n, title, text]) => `<li><span>${n}</span><div><h3>${esc(title)}</h3><p>${esc(text)}</p></div></li>`).join('')}</ol>
          <a href="${url('map')}">${esc(H.steps.link)} →</a>
        </div>
      </section>
      ${tryBlock()}
      ${homeRepoBlock()}
      <section class="homephases"><div class="eyebrow">${esc(H.phases.kicker)}</div><h2>${esc(H.phases.title)}</h2><p class="sectionlead">${inline(H.phases.lead)}</p>
        <div class="phasecards">${H.phases.cards.map((c) => `<div class="phasecard p-${c.tone}"><div class="phasetag">${esc(c.tag)}</div><h3>${esc(c.mode)}</h3>
          <ol>${c.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>`).join('<div class="phasearrow">→</div>')}</div>
        <a class="btn" href="${url('map')}">${esc(H.phases.cta)} ${icon('arrow', 16)}</a></section>
      <section class="homeintro"><div><div class="eyebrow">${esc(H.why.kicker)}</div><h2>${esc(H.why.title)}</h2></div>
        <div>${H.why.text.map((t) => `<p>${inline(t)}</p>`).join('')}
          <ul class="whylist">${H.why.principles.map((t, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span>${esc(t)}</li>`).join('')}</ul>
          <a class="btn" href="${url('manifesto')}">${esc(H.why.cta)} ${icon('arrow', 16)}</a></div></section>
      <section class="homepaths"><div class="eyebrow">${esc(H.paths.kicker)}</div><h2>${esc(H.paths.title)}</h2>
        ${H.paths.items.map((p, i) => `<a href="${url('map', '?from=' + p.scenario)}"><span class="pathnum">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div><span>${esc(H.paths.go)} →</span></a>`).join('')}
      </section>
      <section class="homeopen"><div><div class="eyebrow">${esc(H.open.kicker)}</div><h2>${esc(H.open.title)}</h2></div>
        <div>${H.open.text.map((t) => `<p>${inline(t)}</p>`).join('')}
          <div class="homeactions">${repoLink('/fork', 'btn primary', `${icon('fork', 16)} ${esc(H.open.actions.fork)}`)}
            <a class="btn" href="${url('fork')}">${esc(H.open.actions.guide)}</a>
            ${repoAction('/issues/new/choose', 'btn', esc(H.open.actions.issue))}
            ${repoAction('/blob/main/CONTRIBUTING.md', 'btn', esc(H.open.actions.contribute))}</div></div></section>
      <section class="homeorigin"><div class="eyebrow">${esc(H.origin.kicker)}</div><h2>${esc(H.origin.title)}</h2>${H.origin.text.map((t) => `<p>${inline(t)}</p>`).join('')}
        <a href="https://www.mattpocock.com/" target="_blank" rel="noopener">${esc(H.origin.link)} →</a></section>
      ${footer()}</div>`;
  }

  /* ── Page: the map ───────────────────────────────────────── */
  // BEGIN MAP PATH ENGINE (also exercised by the site flow tests).
  // The journey is a list of steps. It starts as the complete path, which goes
  // through every step, so Next always works. An answer at a decision or at a
  // gate only swaps what comes after it.
  function mapTrunk(map) { return map.scenarios.find(s => s.id === 'feature').path; }
  function mapChoices(map, id) { return map.gates[id]?.exits || map.details[id]?.choices?.options || []; }
  function mapTail(map, id) {
    const trunk = mapTrunk(map), from = (at) => trunk.slice(trunk.indexOf(at));
    if (id === 'wayfinder') return ['wayfinder', 'grill', ...from('d-how')];
    if (id === 'babysit') return ['babysit', ...from('ci')];
    if (id === 'implement') return ['implement', ...from('implementador')];
    return trunk.includes(id) ? from(id) : [id];
  }
  // Which named path the journey is on, from the turns it takes.
  function mapRoute(path) {
    const turns = (a, b) => path.some((id, i) => id === a && path[i + 1] === b);
    if (turns('comecar', 'babysit')) return 'pr';
    if (turns('comecar', 'implement-spec')) return 'slices';
    if (turns('d-small', 'implement')) return 'bug';
    if (turns('d-how', 'spec')) return 'how';
    if (path.includes('wayfinder')) return 'large';
    return 'feature';
  }
  // Steps of the complete path that the journey leaves out.
  function mapSkipped(map, path) { return mapTrunk(map).filter(id => !path.includes(id)); }
  function advanceMap(map, state, delta) {
    if (delta > 0 && state.closed) return false;
    const next = Math.max(0, Math.min(state.path.length - 1, state.step + delta));
    if (delta < 0 && state.closed) { state.closed = false; return true; }
    if (next === state.step) return false;
    state.step = next;
    return true;
  }
  function chooseMap(map, state, index) {
    const choice = mapChoices(map, state.path[state.step])[index];
    if (!choice) return false;
    // An exit with no destination ends the journey where it is.
    if (!choice.goto) { state.closed = true; return true; }
    state.closed = false;
    state.path = [...state.path.slice(0, state.step + 1), ...mapTail(map, choice.goto)];
    state.step += 1;
    return true;
  }
  // Rebuilds a journey from the steps it visited: each one is the next step or an answer.
  function replayMap(map, state, trail) {
    if (trail[0] !== state.path[0] || trail.length > 200) return state;
    for (const next of trail.slice(1)) {
      if (state.path[state.step + 1] === next) { state.step += 1; continue; }
      const index = mapChoices(map, state.path[state.step]).findIndex(o => o.goto === next);
      if (index < 0) break;
      chooseMap(map, state, index);
    }
    return state;
  }
  // END MAP PATH ENGINE
  const freshMap = () => ({ path: mapTrunk(D.map).slice(), step: 0, sel: null, closed: false });
  const mapState = { ...freshMap(), timer: null, full: false };
  // Links shared before the scenarios were renamed keep opening the right path.
  const SCENARIO_ALIAS = { ideia: 'feature', ver: 'feature', call: 'how', fatias: 'slices', wayfinder: 'large', grande: 'large', como: 'how' };
  const scenario = () => D.map.scenarios.find((s) => s.id === mapRoute(mapState.path));
  const currentMapNode = () => mapState.path[mapState.step];
  const mapNode = (id) => D.map.nodes.find((n) => n.id === id);

  function pageMap() {
    const M = U.map;
    const below = [['example', 'example'], ['decide', 'decide'], ['brakes', 'brakes'], ['manifesto', 'manifesto']].map(([key, to]) =>
      `<a class="tilecard" href="${url(to)}"><h3>${esc(M.below[key][0])}</h3><p>${esc(M.below[key][1])}</p><span class="go">${esc(M.below[key][2])}</span></a>`).join('');
    return `<div class="page wide">
      <div class="maphero"><div>
        <div class="eyebrow"><b>MarsAI ${esc(D.site.version)}</b> ${esc(M.eyebrow)}</div>
        <h1 class="title">${esc(M.title)}</h1>
      </div>
      <p class="lead">${esc(M.lead)}</p></div>
      <div class="mapgrid">
        <div class="mapcard">
          <div class="maptop"><span class="say" id="say"></span><button class="btn" id="mapview" aria-pressed="false">${esc(M.full)}</button></div>
          <div class="maplegend">${Object.keys(D.actors).map(chip).join('')}<span class="chip gate">${esc(M.gateLegend)}</span><span class="chip routing">${esc(M.routeLegend)}</span><span class="chip shortcut sc-small">${esc(M.shortcuts.small)}</span><span class="chip shortcut sc-how">${esc(M.shortcuts.how)}</span></div>
          <div id="mapsvg">${flow(D.map, { interactive: true })}</div>
          <div class="mapcontrols">
            <button class="btn" id="mprev">${esc(U.common.prev)}</button>
            <button class="btn" id="mnext">${esc(U.common.next)}</button>
            <button class="btn primary" id="mplay">${esc(M.play)}</button>
            <button class="btn" id="mreset">${esc(M.restart)}</button>
            <span class="hint">${esc(M.hint)}</span>
          </div>
        </div>
        <aside class="mappanel" id="mappanel" aria-live="polite" aria-atomic="true"></aside>
      </div>
      <p class="mapnote">${esc(M.simulation)}</p>
      <div class="below">${below}</div>${footer()}</div>`;
  }

  const choiceButtons = (options, active) => {
    const next = mapState.path[mapState.step + 1];
    return options.map((o, i) => {
      const going = active && !mapState.closed && o.goto && o.goto === next;
      return `<button class="btn choice${o.tone ? ' exit-' + o.tone : ''}${o.path ? ' sc-' + o.path : ''}${going ? ' going' : ''}" data-choice="${i}"${active ? '' : ' disabled'}${going ? ' aria-current="true"' : ''}>${esc(o.label)}${o.goto ? ' →' : ''}</button>`;
    }).join('');
  };

  function panelFor(id, inPath) {
    const node = mapNode(id), path = mapState.path, M = U.map;
    const active = id === currentMapNode();
    const dots = path.map((p, i) => `<i class="${i < mapState.step ? 'done' : i === mapState.step ? 'now' : ''}"></i>`).join('');
    const head = `<div class="pp-head"><span>${esc(M.journey)}</span><span>${inPath ? esc(fmt(M.stepOf, { n: mapState.step + 1, total: path.length })) : esc(M.inspect)}</span></div>
      <div class="pp-dots">${dots}</div>`;
    const nav = `<div class="pp-nav"><button class="btn" data-step="-1"${mapState.step === 0 ? ' disabled' : ''}>${esc(U.common.prev)}</button><button class="btn" data-step="1"${mapState.closed || mapState.step >= path.length - 1 ? ' disabled' : ''}>${esc(U.common.next)}</button></div>`;
    // The choices sit outside the scrolling body, so a decision never hides below the fold.
    const panel = (body, choices = '') => `${head}${!inPath ? `<button class="btn pp-resume" id="mresume">${esc(M.resume)}</button>` : ''}<div class="pp-body" tabindex="0" role="region" aria-labelledby="map-step-title">${body}</div>${choices}${nav}`;

    if (node.kind === 'gate') {
      const g = D.map.gates[id], L = D.map.gateLabels;
      return panel(`<div><span class="chip gate">${esc(M.gateChip)}</span></div>
        <h2 class="pp-title" id="map-step-title"><span class="gatenum">${esc(node.label)}</span>${esc(g.question)}</h2>
        <p class="pp-line"><span class="pp-k">${esc(L.who)}</span> ${esc(g.who)}</p>
        <div class="pp-sub">${esc(L.done)}</div><ul class="checks">${g.done.map((t) => `<li>${inline(t)}</li>`).join('')}</ul>
        <div class="pp-sub">${esc(L.out)}</div><div class="tags">${g.out.map((r) => `<span class="tagchip">${esc(r)}</span>`).join('')}</div>`,
        `<div class="routechoices"><p>${esc(L.exits)}</p>${choiceButtons(g.exits, active)}</div>`);
    }

    const det = D.map.details[id];
    const skill = node.skill ? D.skills[node.skill] : null;
    const title = det.title || (skill ? shown(skill) : node.label);
    const links = (det.links || (node.skill ? [node.skill] : [])).map((slug, i) =>
      `<a class="btn${i === 0 ? ' primary' : ''}" href="${skillUrl(slug)}"><span class="mono">${esc(shown(D.skills[slug]))}</span>${i === 0 ? ' →' : ''}</a>`).join('');
    return panel(`<div>${node.kind === 'routing' ? `<span class="chip routing">${esc(M.routeChip)}</span>` : chip(node.kind)}</div>
      <h2 class="pp-title" id="map-step-title">${esc(title)}</h2>
      <p class="pp-line">${inline(det.line)}</p>
      <ul class="pp-points">${det.points.map((p) => `<li>${inline(p)}</li>`).join('')}</ul>
      ${det.person ? `<div class="callout person"><span>${inline(det.person)}</span></div>` : ''}
      ${det.records ? `<div class="tags">${det.records.map((r) => `<span class="tagchip">${esc(r)}</span>`).join('')}</div>` : ''}
      <div class="pp-links">${links}</div>`,
      det.choices ? `<div class="routechoices">${det.choices.question ? `<p>${esc(det.choices.question)}</p>` : ''}${choiceButtons(det.choices.options, active)}</div>` : '');
  }

  function applyMap() {
    const scn = scenario(), path = mapState.path, M = U.map;
    const current = path[mapState.step];
    // Step by step, the map lights up to where the person is. The full view lights everything.
    const trail = path.slice(0, mapState.step + 1);
    const lit = new Set(mapState.full ? D.map.nodes.map(n => n.id) : trail);
    const skipped = new Set(mapSkipped(D.map, path));
    const pairs = new Set(trail.slice(1).map((to, i) => trail[i] + '>' + to));
    const box = $('mapsvg'), svg = box.querySelector('svg');
    svg.querySelectorAll('.fnode').forEach((g) => {
      const id = g.dataset.id;
      g.classList.toggle('off', !lit.has(id));
      g.classList.toggle('skipped', !mapState.full && skipped.has(id));
      g.classList.toggle('current', !mapState.sel && id === current);
      g.classList.toggle('sel', mapState.sel === id);
    });
    svg.querySelectorAll('.fedge').forEach((g) => {
      const on = pairs.has(g.dataset.from + '>' + g.dataset.to);
      g.classList.toggle('on', on);
      g.classList.toggle('offp', !on);
    });
    // On a narrow screen the map scrolls sideways, so it follows the step in focus.
    const focus = svg.querySelector('.fnode.sel, .fnode.current');
    if (focus && box.scrollWidth > box.clientWidth) {
      const node = focus.getBoundingClientRect(), view = box.getBoundingClientRect();
      box.scrollTo({ left: box.scrollLeft + node.left - view.left - (view.width - node.width) / 2 });
    }
    $('mapview').textContent = mapState.full ? M.stepwise : M.full;
    $('mapview').setAttribute('aria-pressed', String(mapState.full));
    $('say').innerHTML = mapState.closed ? esc(M.archived) : `<b>${esc(scn.label)}.</b> ${esc(scn.say)}`;
    $('say').dataset.route = scn.id;
    $('mappanel').innerHTML = panelFor(mapState.sel || current, !mapState.sel);
    const atEnd = mapState.closed || mapState.step >= path.length - 1;
    $('mprev').disabled = mapState.step === 0 && !mapState.closed;
    $('mnext').disabled = atEnd;
    $('mplay').textContent = mapState.timer ? M.pause : M.play;
    $('mplay').disabled = !mapState.timer && atEnd;
    $('mappanel').dataset.current = current;
    $('mapsvg').dataset.current = current;
    $('mapsvg').dataset.route = scn.id;
    const query = new URLSearchParams({ trail: trail.join(',') });
    const qaLanguage = new URLSearchParams(location.search).get('lang');
    if (qaLanguage) query.set('lang', qaLanguage);
    if (mapState.sel) query.set('inspect', mapState.sel);
    if (mapState.full) query.set('view', 'full');
    if (mapState.closed) query.set('closed', '1');
    history.replaceState({}, '', url('map', '?' + query));
  }

  function stopPlay() { clearInterval(mapState.timer); mapState.timer = null; }
  function stepBy(delta) {
    mapState.sel = null;
    advanceMap(D.map, mapState, delta);
    applyMap();
  }
  function selectNode(id) {
    stopPlay();
    // Inspecting a node leaves the journey untouched.
    mapState.sel = id === currentMapNode() ? null : id;
    applyMap();
  }
  function resetMap() {
    stopPlay();
    Object.assign(mapState, freshMap());
    applyMap();
  }
  function togglePlay() {
    if (mapState.timer) { stopPlay(); return applyMap(); }
    if (mapState.closed || mapState.step >= mapState.path.length - 1) return;
    mapState.sel = null;
    mapState.timer = setInterval(() => {
      if (mapState.closed || mapState.step >= mapState.path.length - 1) { stopPlay(); return applyMap(); }
      stepBy(1);
    }, 1700);
    applyMap();
  }

  /* ── Page: the manifesto ─────────────────────────────────── */
  const mf = { game: 0 };
  const two = (lines) => lines.map(esc).join('<br>');
  const mhead = (s) => `<div class="eyebrow">${esc(s.kicker)}</div><h2>${Array.isArray(s.title) ? `${esc(s.title[0])}<br><span>${esc(s.title[1])}</span>` : esc(s.title)}</h2>${s.lead ? `<p class="sectionlead">${inline(s.lead)}</p>` : ''}`;

  function principlePanel(index) {
    const P = D.manifesto.principles, p = P.items[index], n = String(index + 1).padStart(2, '0');
    return `<div class="bign">${n}</div><h3>${esc(p.title)}</h3><p class="why">${inline(p.why)}</p>
      <div class="cmp2"><div class="no"><div class="tagx">${icon('x', 14)}${esc(P.noLabel)}</div>${esc(p.no)}</div>
        <div class="ok"><div class="tagx">${icon('check', 14)}${esc(P.okLabel)}</div>${esc(p.ok)}</div></div>
      ${p.chain ? `<div class="hmh">${p.chain.map(([who, what], i) => `<span class="${i === 1 ? 'm' : 'h'}"><b>${esc(who)}</b><small>${esc(what)}</small></span>`).join('<i></i>')}</div>` : ''}
      ${p.bars ? `<div class="minibars">${p.bars.map(([label, w]) => `<div><span>${esc(label)}</span><i style="width:${w}%"></i></div>`).join('')}</div>` : ''}
      ${p.tags ? `<div class="tags">${p.tags.map((t) => `<span class="tagchip ok">${esc(t)}</span>`).join('')}</div>` : ''}
      ${p.note ? `<p class="pnote">${inline(p.note)}</p>` : ''}
      ${p.ex ? `<div class="pex"><b>${esc(P.exLabel)}</b>${esc(p.ex)}</div>` : ''}`;
  }

  function gamePanel() {
    const g = D.manifesto.multiply.games[mf.game], V = U.manifesto;
    const side = (s, cls) => `<div class="gside ${cls}"><div class="gres">${esc(s.result)}</div><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p></div>`;
    return `<div class="gscene">${esc(g.scene)}</div><h3>${esc(g.title)}</h3><p class="gq">${esc(g.question)}</p>
      <div class="gsides">${side(g.lose, 'lose')}${side(g.win, 'win')}</div>
      <div class="gscore"><span>${esc(g.score.lose[0])}</span><b class="lose">${g.score.lose[1]}</b><i>${esc(V.versus)}</i><b class="win">${g.score.win[1]}</b><span>${esc(g.score.win[0])}</span></div>
      <p class="gnote">${esc(g.score.note)}</p>
      <div class="gmap">${g.map.map(([game, work, tag], i) => `<div class="${i === 2 ? 'key' : ''}"><span>${esc(game)}</span><i>${esc(V.equals)}</i><b>${esc(work)}</b><small>${esc(tag)}</small></div>`).join('')}</div>
      <p class="gclose">${esc(g.close)}</p>`;
  }

  function pageManifesto() {
    const M = D.manifesto, E = M.essay, G = M.vision.diagrams, DG = window.MarsaiManifestoDiagrams;
    const first = E.chapters[0].id === 'preface' ? 0 : 1;
    const number = i => String(i + first).padStart(2, '0');
    const details = (label, body, id = '') => `<details class="m-appendix"${id ? ` id="${id}"` : ''}><summary>${esc(label)}</summary><div class="m-appendix-body">${body}</div></details>`;
    const gates = () => details(E.gates, `<div class="m-gate-ledger">${G.gateNames.map((name,i) => {
      const step = D.map.scenarios.find(s => s.id === 'feature').path.indexOf('g' + i) + 1;
      return `<a href="${url('map','?from=feature&step=' + step)}"><b>G${i}</b><span>${esc(name)}<small>${esc(D.map.gates['g' + i].who)}</small></span>${icon('arrow',14)}</a>`;
    }).join('')}</div>`);
    const principles = () => `<section id="principles" class="m-principles">${mhead(M.principles)}<p class="m-principles-hint">${esc(M.principles.hint)}</p><div class="m-principle-list">${M.principles.items.map((p,i)=>`<article class="pxstage" id="principle-${String(i+1).padStart(2,'0')}">${principlePanel(i)}</article>`).join('')}</div></section>`;
    const games = () => details(E.games, `<div class="gtabs" role="tablist" aria-label="${esc(M.multiply.gamesLabel)}">${M.multiply.games.map((g,i)=>`<button id="mf-game-${i}" class="scn${i===mf.game?' active':''}" data-game="${i}" role="tab" aria-selected="${i===mf.game}" aria-controls="gpanel">${esc(g.tab)}</button>`).join('')}</div><div class="gpanel" id="gpanel" role="tabpanel" aria-labelledby="mf-game-${mf.game}">${gamePanel()}</div><p class="gnote">${esc(M.multiply.gamesNote)}</p>`);
    const pact = () => {
      const P = M.vision.pact;
      return `<div class="m-ledger m-pact"><div class="m-ledger-head"><span>${esc(P.head[0])}</span><span>${esc(P.head[1])}</span></div>${P.rows.map(([a,b],i)=>`<div class="m-ledger-row"><span><small>${String(i+1).padStart(2,'0')}</small>${esc(a)}</span><span>${icon('arrow',16)}${esc(b)}</span></div>`).join('')}</div>`;
    };
    const block = b => {
      if (b.kind === 'p') return `<p class="m-prose">${inline(b.text)}</p>`;
      if (b.kind === 'source-note') return `<aside class="m-source-note">${inline(b.text)}</aside>`;
      if (b.kind === 'sub') return `<h3 class="m-essay-sub"${b.id ? ` id="${b.id}"` : ''}>${esc(b.text)}</h3>`;
      if (b.kind === 'case') return DG.chain('mf-case', E.case.labels, E.case.notes, ['human','agent','check','human'], E.case.caption);
      if (b.kind === 'delivery-timing') return DG.deliveryTiming(E.timing);
      if (b.kind === 'squads') return DG.squads(E.squads);
      if (b.kind === 'bottleneck') return DG.bottleneck(M.thesis, G.bottleneckCaption);
      if (b.kind === 'learning') return DG.learning(M.vision.learning);
      if (b.kind === 'workflow') return `<div class="m-diagram-legend">${G.legend.map((label,i)=>`<span class="${['human','agent','check'][i]}"><i></i>${esc(label)}</span>`).join('')}</div>${DG.workflow(G)}<a class="btn primary" href="${url('map')}">${esc(M.workflow.mapCta)}${icon('arrow',16)}</a>`;
      if (b.kind === 'video') return `<aside class="m-video"><div class="m-video-mark" aria-hidden="true">▶</div><div><div class="minilabel">${esc(E.video.label)}</div><h3><a href="${esc(E.video.url)}" target="_blank" rel="noopener">${esc(E.video.title)}${icon('arrow',18)}</a></h3><p class="m-video-by">${esc(E.video.author)}</p><p>${esc(E.video.text)}</p><a class="m-text-link" href="${esc(E.video.excerptUrl)}" target="_blank" rel="noopener">${esc(E.video.excerpt)}</a></div></aside>`;
      if (b.kind === 'games') return games();
      if (b.kind === 'gates') return gates();
      if (b.kind === 'pact') return pact();
      return '';
    };
    const hero = `<header class="mhero"><div class="m-hero-main"><div class="eyebrow">${esc(M.hero.eyebrow)}</div><h1>${esc(M.hero.title[0])}<br><span>${esc(M.hero.title[1])}</span></h1><p class="byline">${esc(M.hero.byline)}</p><p class="lead">${esc(M.hero.lead)}</p><a class="m-text-link" href="#${E.chapters[0].id}">${icon('arrow',20)}${esc(M.vision.opening.cta)}</a></div><aside class="m-hero-note"><span>${number(0)} - ${number(E.chapters.length - 1)}</span><p>${esc(E.note)}</p><small>${esc(E.reading)}</small></aside></header><nav class="m-chapters" aria-label="${esc(U.manifesto.nav)}">${E.chapters.map((c,i)=>`<a href="#${c.id}"><span>${number(i)}</span><b>${esc(c.nav)}</b><small>${esc(c.title.join(' '))}</small></a>`).join('')}</nav>`;
    const body = E.chapters.map((c,i)=>`<section id="${c.id}" class="m-essay-chapter"><div class="eyebrow">${number(i)} · ${esc(c.nav)}</div><h2>${esc(c.title[0])}<br><span>${esc(c.title[1])}</span></h2>${c.lead ? `<p class="sectionlead">${esc(c.lead)}</p>` : ''}${c.blocks.map(block).join('')}</section>${i === 0 ? principles() : ''}`).join('');
    const signature = `<div class="m-signature"><b>${esc(M.author.name)}</b><span>${esc(M.author.role)}</span>${repoAction('/issues/new/choose', 'm-text-link', `${icon('arrow',18)}${esc(M.author.cta)}`)}</div>`;
    return `<div class="page manifesto">${hero}${body}${signature}${footer()}</div>`;
  }

  /* ── Page: make it yours ─────────────────────────────────── */
  function pageFork() {
    const F = D.fork, O = D.home.open;
    return `<div class="page">${guideHead(F.eyebrow, esc(F.title), F.lead)}
      <div class="homeactions" style="margin-top:22px">${repoLink('/fork', 'btn primary', `${icon('fork', 16)} ${esc(O.actions.fork)}`)}
        ${repoAction('', 'btn', `${icon('github', 16)} ${esc(U.nav.repo)}`)}</div>
      <hr class="rule"><h2 class="sectiontitle">${esc(F.ways.title)}</h2>
      <div class="govgrid ways4">${F.ways.items.map(([t, d]) => `<div><h3>${esc(t)}</h3><p>${inline(d)}</p></div>`).join('')}</div>
      <hr class="rule"><h2 class="sectiontitle">${esc(F.ours.title)}</h2>${table(F.ours.head, F.ours.rows)}
      <hr class="rule"><h2 class="sectiontitle">${esc(F.pack.title)}</h2><p class="sectionlead">${inline(F.pack.lead)}</p>${table(['', ''], F.pack.rows)}
      <hr class="rule"><h2 class="sectiontitle">${esc(F.contribute.title)}</h2>
      <ul class="checks">${F.contribute.items.map((t) => `<li>${inline(t)}</li>`).join('')}</ul>
      <p class="sectionlead">${inline(F.contribute.note)}</p>
      ${D.site.repoOpen ? `<div class="homeactions">${repoLink('/issues/new/choose', 'btn', esc(O.actions.issue))}
        ${repoLink('/blob/main/CONTRIBUTING.md', 'btn', esc(O.actions.contribute))}</div>` : ''}${footer()}</div>`;
  }

  /* ── Page: skills overview ───────────────────────────────── */
  function pageSkills() {
    const S = U.skills;
    const nSkills = order.filter((s) => D.skills[s].kind !== 'agent').length;
    const nAgents = order.length - nSkills;
    const groups = D.groups.map((g, gi) => {
      const rows = g.skills.map((slug) => {
        const s = D.skills[slug];
        return `<a class="row" href="${skillUrl(slug)}">${tile(slug, true)}<span><span class="slash">${esc(s.call.split(' ')[0])}</span>
          <div class="rowtitle">${esc(shown(s))}</div>${invocationBadge(s)}<div class="rowdesc">${inline(s.tagline)}</div></span><span class="arrow">${icon('arrow', 16)}</span></a>`;
      }).join('');
      const first = D.skills[g.skills[0]];
      return `<div class="grp" id="${esc(g.id)}"><div><h3><small>0${gi + 1}</small>${esc(g.title)}</h3><p class="desc">${esc(g.desc)}</p>
        ${g.id === 'extras' ? `<div class="extras-install"><b>${esc(S.extras.title)}</b><p>${inline(S.extras.note)}</p>${cmdBox(`npx --yes github:${D.site.repo} install --group extras`, true)}<p>${esc(S.extras.claude)}</p>${cmdBox('claude plugin install marsai-extras@marsai-oss', true)}</div>` : `<div class="start">${esc(S.startWith)} <a href="${skillUrl(first.slug)}">${esc(shown(first))}</a></div>`}</div><div>${rows}</div></div>`;
    }).join('');
    const T = D.home.tryIt;
    return `<div class="page">
      <div class="hero2"><div>
        <div class="eyebrow"><b>MarsAI ${esc(D.site.version)}</b> ${esc(S.eyebrow)}</div>
        <h1 class="title">${two(S.title)}</h1>
        <p class="lead">${inline(S.lead)}</p>
        <div class="stats"><div><b>${nSkills}</b><span>${esc(S.stats[0])}</span></div><div><b>${nAgents}</b><span>${esc(S.stats[1])}</span></div><div><b>${D.decisions.length}</b><span>${esc(S.stats[2])}</span></div></div>
      </div>
      <div class="install"><div class="blk"><h3>${esc(T.title)}</h3><p>${inline(T.lead)}</p><button class="btn primary" data-copy="${esc(T.prompt)}">${icon('copy', 15)} <span>${esc(T.copy)}</span></button></div>
        ${T.manual.map((b) => `<div class="blk"><h3>${esc(b.title)}</h3><p>${inline(b.text)}</p>${b.commands.map((c) => cmdBox(c, true)).join('')}</div>`).join('')}
      </div></div>
      <div style="padding-top:44px"><h2 class="sectiontitle">${esc(S.section)}</h2><p class="sectionlead">${esc(S.sectionLead)}</p></div>
      <section class="invocation-legend" aria-label="${esc(S.invocation.title)}"><h3>${esc(S.invocation.title)}</h3><p>${esc(S.invocation.note)}</p><div>${['user','both','agent'].map((mode) => `<p>${invocationBadge({invocation:mode})}<span>${esc(S.invocation[mode].description)}</span></p>`).join('')}</div></section>
      ${groups}</div>`;
  }

  /* ── Page: one skill ─────────────────────────────────────── */
  let sourceTab = 0;
  function sourceBox(skill) {
    const file = skill.files[sourceTab] || skill.files[0];
    return `<div class="sourcetabs">${skill.files.map((f, i) => `<button class="sourcetab${i === sourceTab ? ' active' : ''}" data-tab="${i}">${esc(f.name)}</button>`).join('')}</div>
      <div class="sourcepath">${esc(file.path)}</div><div class="md" id="sourcemd">${md(file.body)}</div>
      <div class="sourcefoot"><button class="btn" id="sourcemore">${esc(U.skills.showAll)}</button></div>`;
  }

  function pageSkill(slug) {
    const s = D.skills[slug], pos = groupOf(slug), S = U.skills, X = S.sections;
    const i = order.indexOf(slug), prev = D.skills[order[i - 1]], next = D.skills[order[i + 1]];
    const isAgent = s.kind === 'agent';
    const sections = [];
    const add = (id, title, html) => sections.push({ id, title, html });

    add('what', X.what, s.what.map((p) => `<p>${inline(p)}</p>`).join('') + (s.gate ? `<div class="callout person"><span>${inline(s.gate)}</span></div>` : ''));
    if (s.when) add('when', isAgent ? X.whenAgent : X.whenSkill, table(s.when.head || S.whenHead, s.when.rows));
    if (s.steps.length || s.diagrams) {
      add('how', X.how,
        (s.steps.length ? `<ol class="steps">${s.steps.map((t) => `<li>${inline(t)}</li>`).join('')}</ol>` : '') + (s.diagrams || []).map(diagram).join(''));
    }
    for (const t of s.tables || []) add(t.id, t.title, (t.intro ? `<p class="sub">${inline(t.intro)}</p>` : '') + table(t.head, t.rows));
    if (s.stops) add('stops', s.stops.title, (s.stops.intro ? `<p class="sub">${inline(s.stops.intro)}</p>` : '') + `<ul class="plain">${s.stops.items.map((t) => `<li>${inline(t)}</li>`).join('')}</ul>`);
    if (s.returns) add('returns', X.returns, `<ul class="plain">${s.returns.map((t) => `<li>${inline(t)}</li>`).join('')}</ul>`);
    if (s.example) add('example', X.example, exampleTag(s.example) + exampleBody(s.example));
    if (s.records.length) add('records', X.records, `<div class="tags">${s.records.map((r) => `<span class="tagchip">${inline(r)}</span>`).join('')}</div>`);
    if (s.worksIf.length) add('works-if', X.worksIf, `<ul class="checks">${s.worksIf.map((t) => `<li>${inline(t)}</li>`).join('')}</ul>`);
    if (s.faq.length) add('faq', X.faq, faqBlock(s.faq));
    add('text', isAgent ? X.textAgent : X.textSkill,
      `<p class="sub">${esc(fmt(S.textNote, { files: s.files.length > 1 ? S.textFiles : '' }))}</p><div class="source" id="source">${sourceBox(s)}</div>`);

    const fits = D.groups.map((g) => `<li class="${g.id === pos.group.id ? 'active' : ''}"><a href="${skillUrl(g.skills[0])}">${esc(g.title)}</a></li>`).join('');
    return `<div class="page">
      <div class="skillhead">
        <div class="eyebrow"><b>${pos.num}</b> ${esc(pos.group.title)} ${chip(s.actor)}</div>
        <h1>${tile(slug)}<span>${esc(shown(s))}</span></h1>
        <p class="lead">${inline(s.tagline)}</p>
        <div class="headrow">
          <button class="btn" data-copy="${esc(location.origin + skillUrl(slug))}">${icon('copy', 15)} ${esc(U.common.copyLink)}</button>
          <span class="sp"></span>
          ${prev ? `<a class="btn" href="${skillUrl(prev.slug)}">${esc(U.common.prev)}</a>` : ''}
          ${next ? `<a class="btn" href="${skillUrl(next.slug)}">${esc(U.common.nextF)}</a>` : ''}
        </div>
        <div class="cmdwrap"><div class="minilabel">${esc(isAgent ? S.callAgent : S.callSkill)} ${invocationBadge(s)}</div>${cmdBox(s.call)}<p class="callnote">${esc(S.invocation[s.invocation].description)}</p>${isAgent ? '' : `<p class="callnote">${inline(s.callNote)}</p>`}</div>
      </div>
      <div class="twocol">
        <div class="article">${sections.map((x) => `<section id="${x.id}"><h2>${esc(x.title)}</h2>${x.html}</section>`).join('')}
          <div class="pager">${prev ? `<a href="${skillUrl(prev.slug)}"><small>${esc(U.common.prev)}</small><b>${esc(shown(prev))}</b></a>` : '<span></span>'}
            ${next ? `<a class="next" href="${skillUrl(next.slug)}"><small>${esc(U.common.nextF)}</small><b>${esc(shown(next))}</b></a>` : ''}</div>
        </div>
        <aside class="rail"><div class="raillabel">${esc(S.onThisPage)}</div><nav class="toc">${sections.map((x) => `<a href="#${x.id}">${esc(x.title)}</a>`).join('')}</nav>
          <div class="raillabel">${esc(S.whereItFits)}</div><ul class="fits">${fits}</ul></aside>
      </div></div>`;
  }

  /* ── Guides ──────────────────────────────────────────────── */
  const guideHead = (eyebrow, title, lead) => `<div class="eyebrow"><b>${esc(U.guides.label)}</b> ${esc(eyebrow)}</div><h1 class="title">${title}</h1><p class="lead">${inline(lead)}</p>`;

  function pageExample() {
    const G = U.guides.example;
    const stages = ['marsai-mode', 'grill-with-docs', 'demo', 'to-spec', 'to-tickets', 'implement-spec', 'code-review', 'open-pr', 'babysit-pr', 'retro'];
    const items = stages.filter((slug) => D.skills[slug] && D.skills[slug].example).map((slug) => {
      const s = D.skills[slug];
      return `<div class="tl-item"><span class="tl-num">${tile(slug, true)}</span><h3><a href="${skillUrl(slug)}">${esc(shown(s))}</a></h3>
        <p class="tl-sub">${inline(s.tagline)}</p>${s.example.note ? `<div class="extag">${esc(s.example.note)}</div>` : ''}${exampleBody(s.example)}</div>`;
    }).join('');
    return `<div class="page">${guideHead(G.eyebrow, esc(G.title), G.lead)}
      <div class="callout info" style="margin-top:26px;max-width:760px"><span><strong>${esc(D.example.title)}.</strong> ${inline(D.example.summary)} ${esc(G.note)}</span></div>
      <div class="timeline">${items}</div></div>`;
  }

  function pageDecide() {
    const G = U.guides.decide;
    const cards = D.decisionPoints.map(([stage, p, a]) => `<div class="dcard"><div class="stage">${esc(stage)}</div><div class="p">${inline(p)}</div><div class="a">${inline(a)}</div></div>`).join('');
    return `<div class="page">${guideHead(G.eyebrow, esc(G.title), G.lead)}
      <hr class="rule">
      <div class="dhead">${G.head.map((h) => `<span>${esc(h)}</span>`).join('')}</div>
      <div class="decide">${cards}</div>
      <hr class="rule">
      <h2 class="sectiontitle">${esc(G.stopsTitle)}</h2>
      <p class="sectionlead">${esc(G.stopsLead)}</p>
      <ul class="checks">${G.stops.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      <hr class="rule">
      <h2 class="sectiontitle">${esc(G.neverTitle)}</h2>
      <ul class="plain">${G.never.map((t) => `<li>${inline(t)}</li>`).join('')}</ul></div>`;
  }

  function pageBrakes() {
    const G = U.guides.brakes;
    const rungs = D.brakes.map((b, i) => `<div class="rung${i === D.brakes.length - 1 ? ' last' : ''}"><span class="n">${i + 1}</span><div><h3>${esc(b.title)}</h3><p>${esc(b.catches)}</p>
      <div class="meta"><span>${esc(b.where)}</span><span>${esc(G.cost)}: ${esc(b.cost)}</span></div><div class="costbar"><i style="width:${12 + i * 22}%"></i></div></div></div>`).join('');
    return `<div class="page">${guideHead(G.eyebrow, esc(G.title), G.lead)}
      <hr class="rule"><div class="ladder">${rungs}</div><hr class="rule">
      <h2 class="sectiontitle">${esc(G.repeatTitle)}</h2>
      <p class="sectionlead">${inline(G.repeatLead)}</p>
      ${diagram(D.skills.retro.diagrams[0])}
      <section id="review-bot"><hr class="rule"><h2 class="sectiontitle">${esc(G.reviewBot.title)}</h2>${G.reviewBot.paragraphs.map((p) => `<p class="sectionlead">${inline(p)}</p>`).join('')}</section>
      <hr class="rule"><h2 class="sectiontitle">${esc(G.botTitle)}</h2>
      <p class="sectionlead">${esc(G.botLead)}</p>
      ${table(G.botHead, D.botDimensions)}</div>`;
  }

  function pageDecisions() {
    const G = U.guides.decisions;
    const cards = D.decisions.map((d) => `<details class="adr"><summary><h3>${esc(d.title)}</h3><p>${inline(d.body)}</p><span class="more">${esc(G.more)}</span></summary><div class="md">${md(d.text)}</div></details>`).join('');
    return `<div class="page">${guideHead(G.eyebrow, esc(G.title), G.lead)}
      <hr class="rule">${cards}</div>`;
  }

  const termId = (name) => 'term-' + fold(name).replace(/[^a-z0-9]+/g, '-');
  function pageGlossary() {
    const G = U.glossary;
    const sections = D.glossary.map((sec) => `<h2 class="sectiontitle gsec" style="margin-top:34px;font-size:20px">${esc(sec.title)}</h2><div class="glossgrid">${
      sec.terms.map((t) => `<div class="term" id="${termId(t.name)}" data-text="${esc(fold(t.name + ' ' + t.other + ' ' + t.text))}"><h4>${esc(t.name)}</h4>
        ${t.other && t.other !== t.name ? `<div class="otherlang">${esc(G.other)}: ${esc(t.other)}</div>` : ''}<p>${inline(t.text)}</p>${t.avoid ? `<div class="avoid">${esc(G.avoid)}: ${esc(t.avoid)}</div>` : ''}</div>`).join('')}</div>`).join('');
    return `<div class="page"><div class="eyebrow"><b>${esc(U.nav.reference)}</b> ${esc(G.eyebrow)}</div><h1 class="title">${esc(G.title)}</h1>
      <p class="lead">${inline(G.lead)}</p>
      <input class="filter" id="glossfilter" type="text" placeholder="${esc(G.filter)}" autocomplete="off">${sections}</div>`;
  }

  /* ── Page: questions ─────────────────────────────────────── */
  function pageFaq() {
    const Q = U.questions;
    const groups = D.faq.map((g) => `<h2 class="qa-group">${esc(g.title)}</h2>${
      g.items.map(([q, a]) => `<details class="qrow"><summary>${inline(q)}<span class="chev">${icon('chev', 15)}</span></summary><p>${inline(a)}</p></details>`).join('')}`).join('');
    return `<div class="page"><div class="qa">
      <div class="qa-side"><div class="eyebrow"><b>${esc(U.nav.reference)}</b></div><h1 class="title">${esc(Q.title)}</h1>
        <p class="lead">${inline(Q.lead)}</p></div>
      <div class="qa-main">${groups}</div></div></div>`;
  }

  /* ── Top bar and sidebar ─────────────────────────────────── */
  function renderTopbar() {
    const N = U.nav;
    $('topbar').innerHTML = `
      <button class="iconbtn menubtn" id="menubtn" aria-label="${esc(N.menu)}">${icon('menu', 20)}</button>
      <a class="brand" href="${url('home')}"><img class="v4logo" src="${D.site.logo}" alt="V4 Company" width="100" height="26"><span class="brandname">MarsAI</span></a>
      <nav class="toplinks"><a href="${url('manifesto')}">${esc(N.manifesto)}</a><a href="${url('map')}">${esc(N.map)}</a><a href="${url('skills')}">${esc(N.skills)}</a><a href="${url('questions')}">${esc(N.questions)}</a></nav>
      <div class="topright">
        <button class="searchbtn" id="searchbtn">${icon('search', 15)}<span>${esc(N.search)}</span><kbd>Ctrl K</kbd></button>
        <div class="langs" role="group" aria-label="${esc(N.langLabel)}">${[['pt', 'PT'], ['en', 'EN']].map(([code, label]) =>
          `<button data-lang="${code}" class="${code === D.lang ? 'on' : ''}" aria-pressed="${code === D.lang}">${label}</button>`).join('')}</div>
        ${repoLink('', 'ghbtn', `${icon('github', 17)}<span>${esc(N.github)}</span>`)}
        <a class="cta" href="${url('home')}#try">${esc(N.try)}</a>
      </div>`;
  }

  const openGroups = new Set();
  function renderSidebar(routeInfo) {
    const N = U.nav, here = location.pathname.replace(/\/+$/, '') || '/';
    const item = (name, label, ic) => { const href = url(name); return `<a class="navitem${here === (href.replace(/\/+$/, '') || '/') ? ' active' : ''}" href="${href}">${ic ? icon(ic, 16) : ''}${esc(label)}</a>`; };
    const groups = D.groups.map((g, gi) => {
      const open = openGroups.has(g.id);
      const subs = open ? g.skills.map((slug, si) => `<a class="navskill${routeInfo.slug === slug ? ' active' : ''}" href="${skillUrl(slug)}"><span class="navnum">${gi + 1}.${si + 1}</span>${esc(shown(D.skills[slug]))}</a>`).join('') : '';
      return `<button class="navgroup${open ? ' open' : ''}" data-group="${g.id}"><span class="navnum">${gi + 1}</span>${esc(g.title)}<span class="chev">${icon('chev', 14)}</span></button>${subs}`;
    }).join('');
    const sections = routeInfo.manifesto ? `<div class="navsub">${D.manifesto.sections.map((s) => `<a class="navskill" href="#${s.id}">${esc(s.label)}</a>`).join('')}</div>` : '';
    $('sidebar').innerHTML = `
      <div class="navlabel">${esc(N.explore)}</div>
      ${item('home', N.home, 'compass')}
      ${item('manifesto', N.manifesto, 'flag')}${sections}
      ${item('map', N.map, 'map')}
      ${item('skills', N.skills, 'list')}
      <div class="navsub">${groups}</div>
      <div class="navlabel">${esc(N.guides)}</div>
      ${item('example', N.example, 'chat')}
      ${item('decide', N.decide, 'users')}
      ${item('brakes', N.brakes, 'shield')}
      ${item('decisions', N.decisions, 'bulb')}
      <div class="navlabel">${esc(N.reference)}</div>
      ${item('glossary', N.glossary, 'book')}
      ${item('questions', N.questions, 'help')}
      <div class="navlabel">${esc(N.project)}</div>
      ${item('fork', N.fork, 'fork')}
      ${repoLink('', 'navitem', `${icon('github', 16)}${esc(N.repo)}`, '<span class="ext">↗</span>')}
      <a class="navitem" href="https://github.com/mattpocock/skills" target="_blank" rel="noopener">${esc(N.matt)}<span class="ext">↗</span></a>`;
  }

  /* ── Router ──────────────────────────────────────────────── */
  let spy = null;
  const PAGES = {
    home: () => [pageHome(), null, { home: true }],
    manifesto: () => [pageManifesto(), U.meta.titles.manifesto, { manifesto: true }],
    skills: () => [pageSkills(), U.meta.titles.skills, {}],
    example: () => [pageExample(), U.meta.titles.example, {}],
    decide: () => [pageDecide(), U.meta.titles.decide, {}],
    brakes: () => [pageBrakes(), U.meta.titles.brakes, {}],
    decisions: () => [pageDecisions(), U.meta.titles.decisions, {}],
    glossary: () => [pageGlossary(), U.meta.titles.glossary, {}],
    questions: () => [pageFaq(), U.meta.titles.questions, {}],
    fork: () => [pageFork(), U.meta.titles.fork, {}],
  };

  function render() {
    stopPlay();
    if (spy) { spy.disconnect(); spy = null; }
    const query = new URLSearchParams(location.search);
    const at = routeOf(location.pathname, D.routes);
    const rest = at ? at.rest.replace(/^\//, '') : '';
    let html, title, info = { slug: null };

    if (at && at.name === 'skills' && rest && D.skills[rest]) {
      info.slug = rest; sourceTab = 0; openGroups.add(groupOf(rest).group.id);
      html = pageSkill(rest); title = shown(D.skills[rest]);
    } else if (at && (at.name === 'map' || (at.name === 'home' && (query.has('from') || query.has('de')))) && !rest) {
      stopPlay();
      Object.assign(mapState, freshMap());
      const wanted = query.get('from') || query.get('de');
      mapState.full = query.get('view') === 'full' || query.get('vista') === 'completo';
      const found = D.map.scenarios.find(s => s.id === (SCENARIO_ALIAS[wanted] || wanted));
      if (found) {
        mapState.path = found.path.slice();
        const turn = found.path.findIndex((id, i) => i > 0 && mapTrunk(D.map)[i] !== id);
        const asked = Math.floor(+(query.get('step') || query.get('passo')) || 0);
        // With no step asked for, a shortcut opens where it leaves the complete path.
        mapState.step = Math.max(0, Math.min(found.path.length - 1, asked ? asked - 1 : Math.max(0, turn - 1)));
      }
      const trail = (query.get('trail') || '').split(',').filter(Boolean);
      if (trail.length) replayMap(D.map, mapState, trail);
      if (query.get('closed') === '1') {
        const index = mapChoices(D.map, currentMapNode()).findIndex(o => !o.goto);
        if (index >= 0) chooseMap(D.map, mapState, index);
      }
      if (mapNode(query.get('inspect'))) mapState.sel = query.get('inspect');
      html = pageMap(); title = U.meta.titles.map; info.map = true;
    } else if (at && PAGES[at.name] && !rest) {
      [html, title, info] = PAGES[at.name](); info.slug = null;
    } else {
      html = `<div class="page"><h1>${esc(U.common.notFound)}</h1><p><a href="${url('home')}">${esc(U.common.backHome)}</a></p></div>`; title = U.meta.titles.notFound;
    }

    document.title = title ? `${title} · MarsAI` : U.meta.titles.home;
    document.body.classList.remove('menu');
    document.body.classList.toggle('home-view', !!info.home);
    main.innerHTML = html;
    renderSidebar(info);
    if (info.map) applyMap();
    if (info.slug || info.manifesto) watchSections(info.manifesto ? '.manifesto > section' : '.article section', info.manifesto ? '#sidebar .navsub a[href^="#"]' : '.toc a');

    const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) { revealTarget(target); target.scrollIntoView(); target.classList.add('hit'); } else window.scrollTo(0, 0);
  }

  function revealTarget(el) {
    for (let node = el; node; node = node.parentElement) if (node.tagName === 'DETAILS') node.open = true;
  }

  function watchSections(sectionSelector, linkSelector) {
    const links = [...document.querySelectorAll(linkSelector)];
    if (!links.length || !window.IntersectionObserver) return;
    spy = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
      }
    }, { rootMargin: '-80px 0px -65% 0px' });
    document.querySelectorAll(sectionSelector).forEach((s) => spy.observe(s));
  }

  function go(href) { history.pushState({}, '', href); render(); }

  document.addEventListener('click', (e) => {
    const lang = e.target.closest('[data-lang]');
    if (lang) { remember(lang.dataset.lang); if (lang.dataset.lang !== D.lang) location.assign(otherLangUrl()); return; }
    if (e.target.closest('#mapview')) { stopPlay(); mapState.full = !mapState.full; mapState.sel = null; return applyMap(); }
    if (e.target.closest('#mreset')) return resetMap();
    if (e.target.closest('#mresume')) { mapState.sel = null; return applyMap(); }
    const choice = e.target.closest('[data-choice]');
    if (choice) {
      stopPlay();
      if (mapState.sel && mapState.sel !== currentMapNode()) return;
      chooseMap(D.map, mapState, +choice.dataset.choice);
      mapState.sel = null;
      applyMap();
      const focus = document.querySelector('#mappanel [data-step="1"]:not(:disabled)') || document.querySelector('#mappanel .pp-body');
      focus?.focus({ preventScroll: true });
      return;
    }
    const game = e.target.closest('[data-game]');
    if (game) {
      mf.game = +game.dataset.game;
      $('gpanel').innerHTML = gamePanel();
      $('gpanel').setAttribute('aria-labelledby', 'mf-game-' + mf.game);
      document.querySelectorAll('.gtabs .scn').forEach((b, i) => { b.classList.toggle('active', i === mf.game); b.setAttribute('aria-selected', String(i === mf.game)); });
      return;
    }
    const copy = e.target.closest('[data-copy]');
    if (copy) {
      navigator.clipboard && navigator.clipboard.writeText(copy.dataset.copy);
      const label = copy.querySelector('span'), before = label && label.textContent;
      copy.classList.add('ok'); if (label) label.textContent = U.common.copied;
      setTimeout(() => { copy.classList.remove('ok'); if (label) label.textContent = before; }, 1400);
      return;
    }
    const step = e.target.closest('[data-step]');
    if (step) { stopPlay(); const delta = +step.dataset.step; stepBy(delta); document.querySelector(`[data-step="${delta}"]:not(:disabled)`)?.focus({ preventScroll: true }); return; }
    if (e.target.closest('#mprev')) { stopPlay(); return stepBy(-1); }
    if (e.target.closest('#mnext')) { stopPlay(); return stepBy(1); }
    if (e.target.closest('#mplay')) return togglePlay();
    const node = e.target.closest('svg.interactive .fnode');
    if (node) return selectNode(node.dataset.id);
    const group = e.target.closest('[data-group]');
    if (group) {
      const id = group.dataset.group;
      openGroups.has(id) ? openGroups.delete(id) : openGroups.add(id);
      const at = routeOf(location.pathname, D.routes);
      return renderSidebar({ slug: at && at.name === 'skills' ? at.rest.replace(/^\//, '') : null });
    }
    const tab = e.target.closest('[data-tab]');
    if (tab) { sourceTab = +tab.dataset.tab; $('source').innerHTML = sourceBox(D.skills[routeOf(location.pathname, D.routes).rest.replace(/^\//, '')]); return; }
    if (e.target.closest('#sourcemore')) { $('sourcemd').classList.add('open'); e.target.closest('#sourcemore').parentNode.remove(); return; }
    if (e.target.closest('#menubtn')) return document.body.classList.toggle('menu');
    if (e.target.closest('#scrim')) return document.body.classList.remove('menu');
    if (e.target.closest('#searchbtn')) return openSearch();
    if (e.target === $('searchwrap')) return closeSearch();

    const a = e.target.closest('a');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute('href');
    if (!href) return;
    const samePage = href.startsWith('#') || (href.includes('#') && href.split('#')[0] === location.pathname);
    if (samePage) {
      e.preventDefault();
      const el = document.getElementById(href.split('#')[1]);
      if (el) { revealTarget(el); el.scrollIntoView({ behavior: 'smooth' }); }
      history.replaceState({}, '', location.pathname + '#' + href.split('#')[1]);
      document.body.classList.remove('menu');
    } else if (href.startsWith('/') && !/\.(md|txt|png|svg)$/.test(href.split(/[?#]/)[0])) {
      e.preventDefault(); closeSearch(); go(href);
    }
  });

  document.addEventListener('input', (e) => {
    if (e.target.id === 'glossfilter') {
      const q = fold(e.target.value);
      document.querySelectorAll('.term').forEach((t) => { t.style.display = t.dataset.text.includes(q) ? '' : 'none'; });
    }
    if (e.target.id === 'searchinput') renderResults(e.target.value);
  });

  /* ── Search ──────────────────────────────────────────────── */
  const K = U.search.kinds;
  const index = [];
  for (const slug of order) {
    const s = D.skills[slug];
    index.push({ kind: s.kind === 'agent' ? K.agent : K.skill, top: s.kind !== 'agent', title: shown(s), sub: plain(s.tagline), href: skillUrl(slug), text: fold(slug + ' ' + s.tagline + ' ' + s.what.join(' ')) });
    for (const [q, a] of s.faq) index.push({ kind: K.question, title: plain(q), sub: shown(s), href: skillUrl(slug) + '#faq', text: fold(q + ' ' + a) });
  }
  for (const [name, [title, sub]] of Object.entries(U.search.guides)) index.push({ kind: K.guide, top: true, title, sub, href: url(name), text: fold(title + ' ' + sub) });
  D.manifesto.principles.items.forEach((p) => index.push({ kind: K.principle, title: p.title, sub: plain(p.why), href: url('manifesto', '#principles'), text: fold(p.title + ' ' + p.why + ' ' + p.ok) }));
  for (const c of D.manifesto.essay.chapters) {
    const title = c.title.join(' ');
    index.push({ kind: K.guide, title, sub: plain(c.lead), href: url('manifesto', '#' + c.id), text: fold(title + ' ' + c.lead + ' ' + c.blocks.map(b => b.text).join(' ')) });
  }
  for (const sec of D.glossary) for (const t of sec.terms) index.push({ kind: K.term, title: t.name, sub: plain(t.text), href: url('glossary', '#' + termId(t.name)), text: fold(t.name + ' ' + t.other + ' ' + t.text) });
  for (const g of D.faq) for (const [q, a] of g.items) index.push({ kind: K.question, title: plain(q), sub: g.title, href: url('questions'), text: fold(q + ' ' + a) });

  let results = [], active = 0;
  function renderResults(query) {
    const q = fold(query.trim());
    results = !q ? index.filter((x) => x.top)
      : index.filter((x) => x.text.includes(q)).sort((a, b) => fold(b.title).includes(q) - fold(a.title).includes(q));
    results = results.slice(0, 30);
    active = 0;
    $('searchresults').innerHTML = results.length
      ? results.map((r, i) => `<a class="sr${i === 0 ? ' active' : ''}" href="${r.href}"><span class="sr-kind">${esc(r.kind.toUpperCase())}</span><div><b>${esc(r.title)}</b><span>${esc(r.sub)}</span></div></a>`).join('')
      : `<div class="sr-empty">${esc(U.search.empty)}</div>`;
  }
  function openSearch() { $('searchwrap').hidden = false; $('searchinput').value = ''; renderResults(''); $('searchinput').focus(); }
  function closeSearch() { $('searchwrap').hidden = true; }

  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) { e.preventDefault(); return openSearch(); }
    if (!$('searchwrap').hidden) {
      if (e.key === 'Escape') return closeSearch();
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        active = Math.max(0, Math.min(results.length - 1, active + (e.key === 'ArrowDown' ? 1 : -1)));
        document.querySelectorAll('.sr').forEach((el, i) => { el.classList.toggle('active', i === active); if (i === active) el.scrollIntoView({ block: 'nearest' }); });
      }
      if (e.key === 'Enter' && results[active]) { closeSearch(); go(results[active].href); }
      return;
    }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    const gameTab = document.activeElement.closest('[data-game]');
    if (gameTab && ['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      const tabs = [...document.querySelectorAll('[data-game]')], current = +gameTab.dataset.game;
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (current + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].click(); tabs[next].focus(); return;
    }
    if (document.querySelector('#mapsvg')) {
      if (e.key === 'ArrowRight') { e.preventDefault(); stopPlay(); stepBy(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); stopPlay(); stepBy(-1); }
      if (e.key === 'Enter' && document.activeElement.classList.contains('fnode')) selectNode(document.activeElement.dataset.id);
    }
  });

  window.addEventListener('popstate', render);
  $('searchinput').placeholder = U.search.placeholder;
  renderTopbar();
  render();
  // ?search=review opens the search already filled in.
  const searched = new URLSearchParams(location.search).get('search') || new URLSearchParams(location.search).get('buscar');
  if (searched) { openSearch(); $('searchinput').value = searched; renderResults(searched); }
})();
