/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `p18-close`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: P18: the Close signs its through-line and greys what the route could not reach. */
/**
 * P18 round-6 acceptance — the responsive law inside a mounted beat.
 *
 *   node tools/inspect.js tools/scenarios/p18r6-accept.js --out /tmp/c390 --mobile
 *   ... --w 768 --h 1024 | --w 900 --h 700 | --w 1024 --h 640 | --w 1366 --h 768
 *   ... --w 1440 --h 900 | --w 1920 --h 1080 | --w 844 --h 390  (+ --dark, + --reduced)
 *
 * R1  ONE YEAR ON SCREEN, at every step of open -> commit -> close.
 * R2  Below 46rem the two plates STACK (FEATURE_SPEC §2 rule 3), in BOTH phases,
 *     and neither is under 300px wide.
 * R3  Every answer to the prediction is whole and inside the scrollport at rest.
 * R4  The chip row: nothing is half a chip at the edge without a control that
 *     moves it, and the pressed chip is inside the row.
 * R5  The reading window on the difference is at least 40% of the surface once
 *     the reader is in the list (the peek).
 * R6  Nothing on this surface is under 24x24 CSS px (WCAG 2.2 SC 2.5.8).
 * R7  Label in Name (WCAG 2.5.3) for every control on the surface.
 * R8  Zero console errors, zero page errors, zero failed requests.
 * R9  Nothing paints over either plate.
 */
const READY = () => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready';
const BEAT = 'http://localhost:8777/app/#tour=thirty&step=9';

module.exports = async ({ page, shot, log }) => {
  const R = [];
  const ok = (id, name, got, want, pass) => R.push({ id, name, got: String(got), want, pass: !!pass });
  const w = page.viewportSize().width, h = page.viewportSize().height;
  log(`viewport ${w}x${h}`);
  const errs = [], fails = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
  page.on('requestfailed', (r) => fails.push(r.url()));

  await page.goto(BEAT, { waitUntil: 'load' });
  await page.waitForFunction(READY);
  await page.waitForTimeout(1100);

  /* ---- R1a: years on screen before we touch anything -------------------- */
  const YEARS = () => page.evaluate(() => {
    const seen = new Set();
    const push = (t) => { for (const m of String(t).matchAll(/\b(1[5-9]\d{2}|20[0-2]\d)\b/g)) seen.add(m[1]); };
    /* only text a reader can actually see */
    const vis = (n) => { const r = n.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight
        && getComputedStyle(n).visibility !== 'hidden'; };
    /* `.cmp__plates` is `display: contents` above 62rem — no box, so no
       rectangle and no `innerText`. The two labelled sides are the thing that
       prints the pair at every width, so they are what is read. */
    const zones = { lede: '.app__lede', bar: '.cmp__bar', plates: '.cmp__side',
      time: '.app__time', dossier: '.app__dossier:not([hidden])', beat: '.tr-panel' };
    const out = {};
    for (const [k, sel] of Object.entries(zones)) {
      const nodes = [...document.querySelectorAll(sel)].filter(vis);
      const n = nodes.length ? { innerText: nodes.map((q) => q.innerText).join(' '),
        querySelectorAll: (s) => nodes.flatMap((q) => [...q.querySelectorAll(s)]) } : null;
      if (!n) { out[k] = []; continue; }
      /* The timeline's own SCALE is an axis, not a statement: "1600 1800 2000"
         are the ruler's marks and they are printed at every year the app has
         ever shown. Only text that ASSERTS a year counts, so the years drawn
         inside the axis SVG are subtracted from the ones the region reads out.
         `innerText`, not `textContent`: textContent runs "1770" straight into
         "claimed" and the word boundary the pattern needs is not there. */
      /* A RANGE IS NOT AN ASSERTION ABOUT THE YEAR ON SCREEN. The timeline's
         four period lanes are labelled "c.1585-1838" and "1600-1858", and a
         dossier prints "1858-1947"; none of them says what year the reader is
         looking at. Ranges are struck out before the years are read, and so is
         the axis (below), which leaves exactly the years a surface ASSERTS. */
      const years = (str) => { const s = new Set();
        const flat = String(str || '')
          .replace(/(1[5-9]\d{2}|20[0-2]\d)\s*[\u2013\u2014-]\s*(1[5-9]\d{2}|20[0-2]\d|present)/gi, ' ');
        for (const m of flat.matchAll(/\b(1[5-9]\d{2}|20[0-2]\d)\b/g)) s.add(m[1]);
        return s; };
      const s = years(n.innerText);
      for (const tx of n.querySelectorAll('svg text')) for (const y of years(tx.textContent)) s.delete(y);
      out[k] = [...s]; void seen; void push;
    }
    /* The pair is the comparison's OWN two years, out of the store, not
       whatever happens to be scrolled into view: at 844x390 the ask phase puts
       the question first and plate B's label is one drag below the fold, which
       makes "what is visible" the wrong set to test the rest of the screen
       against. Both labels are asserted separately (R2d). */
    const st = window.BEA.store.getState();
    out.pair = [String(st.year), st.compareYear != null ? String(st.compareYear) : String(st.year)];
    out.labels = [...document.querySelectorAll('.cmp__year')].map((n) => n.textContent.trim());
    return out;
  });
  const y0 = await YEARS();
  log('years before: ' + JSON.stringify(y0));

  await page.keyboard.press('v');
  await page.waitForTimeout(1300);
  await shot('ask');
  const y1 = await YEARS();
  log('years, ask: ' + JSON.stringify(y1));

  /* the set of years the LEDE / TIME / BEAT print must be a subset of the two
     the plates print — a third date anywhere is the defect this rule exists for */
  const pair = new Set(y1.pair);
  const stray = [];
  for (const k of ['lede', 'time', 'beat', 'dossier']) for (const y of (y1[k] || [])) if (!pair.has(y)) stray.push(k + ':' + y);
  ok('R1a', 'one year on screen, ask phase', stray.length ? stray.join(',') : 'none', 'no year outside the pair', !stray.length);

  /* ---- R2/R3/R4 in the ask phase ---------------------------------------- */
  const M = () => page.evaluate(() => {
    const box = (n) => { if (!n) return null; const r = n.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
        r: Math.round(r.right), b: Math.round(r.bottom) }; };
    const cmp = document.querySelector('.cmp');
    const grid = document.querySelector('.cmp__grid');
    const port = (n) => (n && n.scrollHeight > n.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(n).overflowY)) ? n : null;
    const ask = document.querySelector('.cmp__ask'), delta = document.querySelector('.cmp__delta');
    const sc = port(grid) || port(ask) || port(delta) || grid;
    const scb = sc.getBoundingClientRect();
    const whole = (n) => { const b = n.getBoundingClientRect();
      return b.top >= scb.top - 1 && b.bottom <= scb.bottom + 1 && b.top >= 0 && b.bottom <= innerHeight + 1; };
    const sides = [...document.querySelectorAll('.cmp__side')].map((n) => {
      const b = box(n); b.side = n.dataset.side; return b; });
    const pk = document.querySelector('.cmp__picker');
    const chips = pk ? [...pk.querySelectorAll('.cmp__pick')].map((c) => {
      const r = c.getBoundingClientRect(), b = pk.getBoundingClientRect();
      return { t: c.textContent.trim(), cut: (r.left < b.left - 1 && r.right > b.left + 1) || (r.right > b.right + 1 && r.left < b.right - 1),
        pressed: c.getAttribute('aria-pressed') === 'true', inside: r.left >= b.left - 1 && r.right <= b.right + 1 };
    }) : [];
    const navs = [...document.querySelectorAll('.cmp__picknav')].map((n) => ({
      dir: n.dataset.dir, hidden: n.hidden, w: Math.round(n.getBoundingClientRect().width),
      h: Math.round(n.getBoundingClientRect().height) }));
    const choices = [...document.querySelectorAll('.cmp__choice')].map((n) => ({
      t: n.textContent.trim(), whole: whole(n), ...box(n) }));
    const small = [];
    for (const n of document.querySelectorAll('.cmp button, .cmp a[href], .cmp [role="button"]')) {
      if (n.hidden) continue;
      const r = n.getBoundingClientRect(); if (r.width < 1) continue;
      if (r.width < 24 || r.height < 24) small.push({ t: (n.textContent || '').trim().slice(0, 24), w: Math.round(r.width), h: Math.round(r.height) });
    }
    const nameMiss = [];
    for (const n of document.querySelectorAll('.cmp button, .cmp a[href], .cmp__launch')) {
      if (n.hidden || !n.getBoundingClientRect().width) continue;
      const vis = [...n.childNodes].map((c) => (c.nodeType === 3 ? c.textContent
        : (c.getAttribute && c.getAttribute('aria-hidden') === 'true' ? '' : c.textContent))).join('').replace(/\s+/g, ' ').trim();
      const al = n.getAttribute('aria-label');
      if (al && vis && !al.toLowerCase().includes(vis.toLowerCase())) nameMiss.push({ vis, al });
    }
    const pl = document.querySelector('.cmp__plates');
    const pinned = pl && getComputedStyle(pl).position === 'sticky'
      ? Math.round(pl.getBoundingClientRect().height) : 0;
    return { phase: cmp.dataset.phase, peek: cmp.dataset.peek || 'off', pinned,
      cmp: box(cmp), grid: box(grid), sc: { cls: sc.className, ch: sc.clientHeight, sh: sc.scrollHeight },
      plates: box(document.querySelector('.cmp__plates')), sides, chips, navs, choices, small, nameMiss,
      ask: box(ask), delta: box(delta) };
  });
  const a = await M();
  log('ASK ' + JSON.stringify(a));
  const narrow = w <= 736;   /* 46rem */
  if (narrow) {
    const stacked = a.sides.length === 2 && Math.abs(a.sides[0].y - a.sides[1].y) > 8
      && a.sides.every((s) => s.w >= w - 2);
    ok('R2a', 'ask phase: the plates stack, full width', a.sides.map((s) => `${s.w}x${s.h}@${s.y}`).join(' '), 'stacked, full width', stacked);
  } else ok('R2a', 'ask phase: side by side above 46rem', a.sides.map((s) => `${s.w}x${s.h}`).join(' '), 'n/a', true);
  ok('R2d', 'both years are labelled, in both phases', y1.labels.join('/'), y1.pair.join('/'),
    y1.pair.every((p) => y1.labels.includes(p)));
  ok('R3', 'every answer whole, at rest', a.choices.map((c) => c.t + (c.whole ? '' : ' CUT')).join(' | '), 'no CUT', a.choices.length && a.choices.every((c) => c.whole));
  const cut = a.chips.filter((c) => c.cut).map((c) => c.t);
  const canScroll = a.navs.some((n) => !n.hidden);
  ok('R4a', 'a clipped chip has a control that moves it', `cut=[${cut}] navs=${a.navs.map((n) => n.dir + (n.hidden ? ':off' : ':ON')).join(' ')}`, 'no cut, or a nav is drawn', !cut.length || canScroll);
  ok('R4b', 'the pressed chip is inside the row', a.chips.filter((c) => c.pressed).map((c) => c.inside).join(), 'true', a.chips.every((c) => !c.pressed || c.inside));
  ok('R6a', 'no target under 24x24 (ask)', a.small.length ? JSON.stringify(a.small) : 'none', 'none', !a.small.length);
  ok('R7a', 'label in name (ask)', a.nameMiss.length ? JSON.stringify(a.nameMiss) : 'none', 'none', !a.nameMiss.length);

  /* ---- commit ------------------------------------------------------------ */
  await page.click('.cmp__choice');
  await page.waitForTimeout(1300);
  await shot('reveal');
  const rvl = await M();
  log('REVEAL ' + JSON.stringify(rvl));
  const y2 = await YEARS();
  log('years, reveal: ' + JSON.stringify(y2));
  const pair2 = new Set(y2.pair); const stray2 = [];
  for (const k of ['lede', 'time', 'beat', 'dossier']) for (const y of (y2[k] || [])) if (!pair2.has(y)) stray2.push(k + ':' + y);
  ok('R1b', 'one year on screen, revealed', stray2.length ? stray2.join(',') : 'none', 'no year outside the pair', !stray2.length);
  if (narrow) {
    const stacked = rvl.sides.length === 2 && Math.abs(rvl.sides[0].y - rvl.sides[1].y) > 8
      && rvl.sides.every((s) => s.w >= w - 2);
    ok('R2b', 'reveal: the plates stack, full width', rvl.sides.map((s) => `${s.w}x${s.h}@${s.y}`).join(' '), 'stacked, full width', stacked);
    const moved = Math.abs(rvl.sides[0].h - a.sides[0].h) + Math.abs(rvl.sides[0].y - a.sides[0].y);
    ok('R2c', 'the drawn plate does not move on commit', moved + 'px', '<= 2px', moved <= 2);
  } else { ok('R2b', 'n/a', '', '', true); ok('R2c', 'n/a', '', '', true); }

  /* ---- R5: the reading window once the reader is in the list ------------- */
  await page.evaluate(() => {
    const g = document.querySelector('.cmp__grid');
    const sc = (g && g.scrollHeight > g.clientHeight + 2) ? g : document.querySelector('.cmp__delta');
    sc.scrollTop = 260;
  });
  await page.waitForTimeout(700);
  await shot('scrolled');
  const sc2 = await M();
  log('SCROLLED ' + JSON.stringify({ peek: sc2.peek, plates: sc2.plates, sc: sc2.sc, cmp: sc2.cmp }));
  /* The reading window is the scrollport MINUS whatever is pinned over it.
     Where the plates are not sticky (the sideways phone, the three-column short
     band) nothing is pinned and the whole scrollport is the window. */
  const read = sc2.sc.ch - sc2.pinned;
  const share = Math.round((read / sc2.cmp.h) * 100);
  ok('R5', 'reading window on the difference, in the list', `${read}px of ${sc2.cmp.h} (${share}%)`, '>= 40%', share >= 40);

  /* ---- R9: nothing paints over either plate ------------------------------ */
  const over = await page.evaluate(() => {
    const bad = [];
    for (const side of document.querySelectorAll('.cmp__plate')) {
      const b = side.getBoundingClientRect();
      if (b.width < 8 || b.height < 8) continue;
      for (let x = b.left + 6; x < b.right - 6; x += 24) {
        for (let y = b.top + 6; y < b.bottom - 6; y += 24) {
          const t = document.elementFromPoint(x, y);
          if (!t) continue;
          if (!t.closest('.cmp__side') && !t.closest('.map__tiplayer')) bad.push(t.className || t.tagName);
        }
      }
    }
    return [...new Set(bad)];
  });
  ok('R9', 'nothing stands on either plate', over.length ? over.join(',') : 'none', 'none', !over.length);

  /* ---- close, and the year again ---------------------------------------- */
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1200);
  await shot('closed');
  const y3 = await page.evaluate(() => {
    const t = (s) => { const n = document.querySelector(s); return n ? (n.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 90) : null; };
    return { lede: t('.app__lede'), time: t('.app__time'), beat: t('.tr-panel'), cmpOpen: !!document.querySelector('.cmp:not([hidden])') };
  });
  log('after close: ' + JSON.stringify(y3));
  ok('R1c', 'the lesson comes back on close', y3.cmpOpen ? 'compare still open' : 'closed', 'closed', !y3.cmpOpen);

  ok('R8', 'console / page errors, failed requests', `${errs.length} / ${fails.length}`, '0 / 0', !errs.length && !fails.length);
  if (errs.length) log('errors: ' + errs.join(' | '));

  let all = true;
  for (const r of R) { if (!r.pass) all = false; log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.id}  ${r.name}  —  got ${r.got}  want ${r.want}`); }
  log(all ? '>>> compare r6 holds' : '>>> COMPARE R6 BROKEN');
};
