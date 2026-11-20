// Native, accessible diagrams for the manifesto, with separate narrow layouts.
(() => {
  const esc = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const colors = { human: '#f5b73d', agent: '#82acff', check: '#4fdc8b', muted: '#70707a' };
  function text(value, x, y, limit = 22, cls = 'mdg-label', anchor = 'middle') {
    if (!String(value).trim()) return '';
    const lines = [];
    for (const word of String(value).split(' ')) {
      if (!lines.length || (lines.at(-1) + ' ' + word).length > limit) lines.push(word);
      else lines[lines.length - 1] += ' ' + word;
    }
    return `<text class="${cls}" text-anchor="${anchor}" x="${x}" y="${y}">${lines.map((line, i) => `<tspan x="${x}" dy="${i ? 18 : 0}">${esc(line)}</tspan>`).join('')}</text>`;
  }
  function node(label, note, x, y, w, tone = 'agent', number = '') {
    const labelLines = String(label).length > Math.floor(w / 8) ? 2 : 1;
    return `<g class="mdg-node ${tone}"><rect x="${x}" y="${y}" width="${w}" height="88" rx="5"/>
      ${number ? text(number, x + 15, y + 23, 9, 'mdg-number', 'start') : ''}
      ${text(label, x + w / 2, y + 25, Math.floor(w / 8))}
      ${text(note, x + w / 2, y + 25 + labelLines * 17 + 4, Math.floor(w / 7), 'mdg-note')}</g>`;
  }
  const edge = (d, id, cls = '') => `<path class="mdg-edge ${cls}" d="${d}" marker-end="url(#${id})"/>`;
  function svg(id, w, h, body, caption, cls, description = caption) {
    return `<svg class="mdg-svg ${cls}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${id}-title ${id}-desc">
      <title id="${id}-title">${esc(caption)}</title><desc id="${id}-desc">${esc(description)}</desc>
      <defs><marker id="${id}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#a3a3ad" stroke="none"/></marker></defs>${body}</svg>`;
  }
  const figure = (body, caption, cls = '') => `<figure class="m-diagram ${cls}">${body}<figcaption>${esc(caption)}</figcaption></figure>`;
  function chain(id, labels, notes, tones, caption, cycle = false) {
    const n = labels.length, gap = 44, width = (920 - gap * (n - 1)) / n;
    let desktop = '', mobile = '';
    labels.forEach((label, i) => {
      const x = 20 + i * (width + gap), y = 12 + i * 122;
      desktop += node(label, notes[i], x, 20, width, tones[i]);
      mobile += node(label, notes[i], 24, y, 282, tones[i]);
      if (i < n - 1) {
        desktop += edge(`M${x + width + 3} 64H${x + width + gap - 5}`, id + '-d');
        mobile += edge(`M165 ${y + 91}V${y + 116}`, id + '-m');
      }
    });
    if (cycle) {
      desktop += edge('M940 80V146H20V115', id + '-d', 'feedback');
      mobile += edge(`M306 ${12 + (n - 1) * 122 + 44}H334V56H312`, id + '-m', 'feedback');
    }
    const description = labels.map((label, i) => `${label}: ${notes[i]}`).join(' → ');
    return figure(svg(id + '-d', 960, cycle ? 166 : 134, desktop, caption, 'mdg-desktop', description) +
      svg(id + '-m', 360, n * 122, mobile, caption, 'mdg-mobile', description), caption);
  }
  function bottleneck(T, caption) {
    const row = (state, index) => {
      let body = text(state.label, 20, 25, 30, 'mdg-phase', 'start');
      const tall = (i) => state.narrow.includes(i) ? 28 : 70;
      T.stages.forEach((stage, i) => {
        const x = 20 + i * 180, h = tall(i), nextH = tall(Math.min(i + 1, 2));
        const tone = ['human','agent','check'][i], color = colors[tone];
        body += `<path d="M${x} ${120 - h}L${x + 135} ${120 - h}C${x + 157} ${120 - h} ${x + 157} ${120 - nextH} ${x + 180} ${120 - nextH}L${x + 180} ${120 + nextH}C${x + 157} ${120 + nextH} ${x + 157} ${120 + h} ${x + 135} ${120 + h}H${x}Z" fill="${color}" fill-opacity=".12" stroke="${color}" stroke-width="1.8"/>`;
        body += text(stage, x + 76, 234, 22, 'mdg-note');
        body += text(state.narrow.includes(i) ? T.narrowTag : (i === 1 && state.note ? state.note : ''), x + 76, 124, 16, 'mdg-pipe-tag');
      });
      return svg('mf-bottleneck-' + index, 580, 284, body, state.label + ': ' + caption, '', T.stages.map((s,i)=>s+(state.narrow.includes(i)?' ('+T.narrowTag+')':'')).join(' → '));
    };
    return figure(`<div class="mdg-pipes">${row(T.before, 0)}${row(T.now, 1)}</div>`, caption, 'mdg-bottleneck');
  }
  function learning(L) {
    const id = 'mf-learning', centers = L.loop.map((_,i) => {
      const angle = -Math.PI / 2 + i * Math.PI * 2 / 5;
      return { x: 300 + 218 * Math.cos(angle), y: 292 + 218 * Math.sin(angle), angle };
    });
    let body = '';
    centers.forEach((p, i) => {
      const a = p.angle + .37, b = p.angle + 2 * Math.PI / 5 - .37;
      const x1 = 300 + 218 * Math.cos(a), y1 = 292 + 218 * Math.sin(a);
      const x2 = 300 + 218 * Math.cos(b), y2 = 292 + 218 * Math.sin(b);
      body += edge(`M${x1} ${y1}A218 218 0 0 1 ${x2} ${y2}`, id + '-ring');
      body += node(L.loop[i], L.loopNotes[i], p.x - 82, p.y - 44, 164, ['human','agent','check','agent','human'][i]);
    });
    body += `<circle cx="300" cy="292" r="94" class="mdg-center"/>` + text(L.loopCenter.join(' '), 300, 285, 24, 'mdg-center-label');
    const mobile = chain('mf-learning-chain', L.loop, L.loopNotes, ['human','agent','check','agent','human'], L.loopCaption, true);
    return figure(svg(id + '-ring', 600, 558, body, L.loopCaption, 'mdg-desktop') + `<div class="mdg-mobile">${mobile}</div>`, L.loopCaption, 'mdg-learning');
  }
  function workflow(D) {
    const id = 'mf-workflow';
    const gate = (n, x, y) => `<g class="mdg-gate"><title>G${n}: ${esc(D.gateNames[n])}</title><path d="M${x} ${y - 17}L${x + 17} ${y}L${x} ${y + 17}L${x - 17} ${y}Z"/>${text('G' + n, x, y + 4, 5, 'mdg-gate-label')}</g>`;
    let body = text(D.planning, 20, 27, 40, 'mdg-phase', 'start');
    const xs = [20, 260, 500, 740], tones = ['human','human','human','agent','agent','agent','check','human'];
    D.workflowNodes.forEach((label, i) => {
      const x = xs[i % 4], y = i < 4 ? 55 : 325;
      body += node(label, D.workflowNotes[i], x, y, 184, tones[i]);
      if (i % 4 < 3) {
        const n = i < 3 ? i : i === 4 ? 4 : i === 6 ? 5 : null;
        if (n === null) body += edge(`M${x + 187} ${y + 44}H${x + 235}`, id + '-d');
        else body += edge(`M${x + 186} ${y + 44}H${x + 192}`, id + '-d') + gate(n, x + 212, y + 44) + edge(`M${x + 232} ${y + 44}H${x + 236}`, id + '-d');
      }
    });
    body += edge('M840 146V230H659', id + '-d') + gate(3, 640, 230);
    body += text(D.valueGate, 640, 267, 30, 'mdg-label');
    body += edge('M620 230H120V319', id + '-d') + text(D.yes, 382, 220, 20, 'mdg-note');
    body += edge('M640 210V173H600V149', id + '-d', 'retry') + text(D.retry, 784, 180, 34, 'mdg-note mdg-retry-label');
    body += text(D.hardening, 20, 305, 40, 'mdg-phase', 'start');
    body += edge('M840 416V450', id + '-d') + gate(6, 840, 473) + text(D.gateNames[6], 720, 477, 26, 'mdg-note');
    body += edge('M840 493V526H7V99H16', id + '-d', 'feedback');
    let mobile = '';
    D.workflowNodes.forEach((label, i) => {
      const y = 42 + i * 132 + (i >= 4 ? 28 : 0);
      if (i === 0 || i === 4) mobile += text(i === 0 ? D.planning : D.hardening, 20, y - 18, 40, 'mdg-phase', 'start');
      mobile += node(label, D.workflowNotes[i], 20, y, 286, tones[i]);
      const n = [0,1,2,3,4,null,5,6][i];
      const next = y + 132 + (i === 3 ? 28 : 0);
      if (n === null) mobile += edge(`M163 ${y + 91}V${next - 5}`, id + '-m');
      else mobile += `<path class="mdg-edge" d="M163 ${y + 91}V${y + 94}"/>` + gate(n, 163, y + 110, true) +
        (i < 7 ? edge(`M163 ${y + 128}V${next - 4}`, id + '-m') : '') + text(D.gateNames[n], 194, y + 108, 22, 'mdg-gate-note', 'start');
    });
    mobile += edge('M183 548H334V350H310', id + '-m', 'retry');
    mobile += edge('M163 1125V1145H8V86H16', id + '-m', 'feedback');
    const description = D.workflowNodes.map((s,i)=>`${s}: ${D.workflowNotes[i]}`).join(' → ') + '. ' + D.gateNames.map((s,i)=>`G${i}: ${s}`).join('. ');
    return figure(svg(id + '-d', 960, 554, body, D.workflowCaption, 'mdg-desktop', description) + svg(id + '-m', 360, 1172, mobile, D.workflowCaption, 'mdg-mobile', description), D.workflowCaption, 'mdg-workflow');
  }
  function deliveryTiming(T) {
    const band = (label, x, y, w, tone, mobile = false) =>
      `<g class="mdg-node ${tone}"><rect x="${x}" y="${y}" width="${w}" height="60" rx="5"/>${text(label, x + w / 2, y + 35, mobile ? 34 : Math.floor(w / 8))}</g>`;
    let desktop = text(T.late, 20, 24, 40, 'mdg-phase', 'start');
    desktop += band(T.build + ' · ' + T.seven, 20, 45, 920, 'muted');
    desktop += text(T.validate, 940, 129, 35, 'mdg-note', 'end') + text(T.lateResult, 20, 153, 55, 'mdg-note mdg-retry-label', 'start');
    desktop += text(T.early, 20, 193, 40, 'mdg-phase', 'start');
    desktop += band(T.demo + ' · ' + T.one, 20, 217, 132, 'agent');
    desktop += band(T.harden + ' · ' + T.six, 172, 217, 768, 'check');
    desktop += `<path class="mdg-edge" d="M162 209V285"/>` + text(T.validate, 162, 304, 30, 'mdg-note');
    desktop += text(T.earlyResult, 940, 304, 55, 'mdg-note', 'end');
    desktop += text(T.stop, 20, 352, 70, 'mdg-label mdg-retry-label', 'start');
    let mobile = text(T.late, 20, 24, 40, 'mdg-phase', 'start');
    mobile += band(T.build + ' · ' + T.seven, 20, 45, 320, 'muted', true);
    mobile += text(T.validate, 340, 129, 35, 'mdg-note', 'end') + text(T.lateResult, 20, 156, 42, 'mdg-note mdg-retry-label', 'start');
    mobile += text(T.early, 20, 212, 40, 'mdg-phase', 'start');
    mobile += band(T.demo + ' · ' + T.one, 20, 233, 320, 'agent', true);
    mobile += text(T.validate, 180, 325, 35, 'mdg-note') + edge('M180 335V350', 'mf-timing-m');
    mobile += band(T.harden + ' · ' + T.six, 20, 363, 320, 'check', true);
    mobile += text(T.earlyResult, 20, 451, 42, 'mdg-note', 'start');
    mobile += text(T.stop, 20, 505, 35, 'mdg-label mdg-retry-label', 'start');
    const description = [T.late, T.build, T.seven, T.validate, T.lateResult, T.early, T.demo, T.one, T.validate, T.harden, T.six, T.earlyResult, T.stop].join('. ');
    return figure(svg('mf-timing-d', 960, 382, desktop, T.caption, 'mdg-desktop', description) + svg('mf-timing-m', 360, 553, mobile, T.caption, 'mdg-mobile', description), T.caption, 'mdg-timing');
  }
  function squads(S) {
    const card = (layer, x, y, w) => `<g class="mdg-node human"><rect x="${x}" y="${y}" width="${w}" height="168" rx="5"/>${text(layer, x + w / 2, y + 32, 30)}${text(S.team, x + w / 2, y + 68, 32, 'mdg-note')}${text(S.scope, x + w / 2, y + 125, 34, 'mdg-note')}</g>`;
    const desktop = S.layers.map((layer, i) => card(layer, 20 + i * 312, 20, 296)).join('');
    const mobile = S.layers.map((layer, i) => card(layer, 20, 20 + i * 194, 320)).join('');
    const description = S.layers.map(layer => `${layer}: ${S.team}. ${S.scope}.`).join(' ');
    return figure(svg('mf-squads-d', 960, 208, desktop, S.caption, 'mdg-desktop', description) + svg('mf-squads-m', 360, 596, mobile, S.caption, 'mdg-mobile', description), S.caption, 'mdg-squads');
  }
  window.MarsaiManifestoDiagrams = { chain, bottleneck, learning, workflow, deliveryTiming, squads };
})();
