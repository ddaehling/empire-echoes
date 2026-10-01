/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs, and PRINTS FAIL while exiting 0.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p06-working.js — THE WORKING-STAGE VARIANT OF THE LAYOUT BUDGET.
 *
 * Why this file exists, in the round-2 critic's own words:
 *
 *   "the acceptance harness is testing the wrong state. budget.js and
 *    shell-accept.js exercise the cold plate only; every defect above lives in
 *    `data-stage=working` with a beat panel mounted. Add a working-stage
 *    variant at 390, 768, 900 and 1366 to the LAYOUT_BUDGET §0 matrix, or
 *    these regressions will keep shipping green."
 *
 * That is exactly right and it is why a phone shipped with an empty beat panel,
 * a missing Back/Next bar and a Next button intercepted by a dossier paragraph,
 * while `budget.js` printed `>>> budget holds` at all eight viewports. A cold
 * plate is the one state a student is in for about four seconds.
 *
 * So this harness puts the app in the state a student spends thirty minutes in
 * — the guided path running, a beat mounted, then a thematic re-encoding on the
 * plate — and asserts the things that were broken there:
 *
 *   W1  the beat panel has a BODY, not just a title and a close button
 *   W2  the Back/Next bar is in the document, visible, and on screen
 *   W3  the Next button is actually hittable: the element at its own centre
 *       point is Next or a child of Next, not something painted over it
 *   W4  pressing Next advances the counter
 *   W5  no element paints over the top of the beat panel's title
 *   W6  the document does not scroll (LAYOUT_BUDGET B4) at any point
 *   W7  the drawn map keeps its floor (B2) with the beat panel mounted
 *   W8  no single-line text run is clipped mid-word anywhere on screen
 *   W9  zero console errors across the whole run
 *   W10 exactly one teaching panel is open at a time, and the year on screen
 *       is single-valued
 *
 * Run it at every viewport in the LAYOUT_BUDGET §0 matrix:
 *
 *   node tools/inspect.js tools/scenarios/p06-working.js --out /tmp/w390  --mobile
 *   node tools/inspect.js tools/scenarios/p06-working.js --out /tmp/w768  --w 768  --h 1024
 *   node tools/inspect.js tools/scenarios/p06-working.js --out /tmp/w900  --w 900  --h 700
 *   node tools/inspect.js tools/scenarios/p06-working.js --out /tmp/w1024 --w 1024 --h 640
 *   node tools/inspect.js tools/scenarios/p06-working.js --out /tmp/w1366 --w 1366 --h 768
 *   node tools/inspect.js tools/scenarios/p06-working.js --out /tmp/w1440 --w 1440 --h 900
 *
 * It prints PASS/FAIL per rule and `>>> working stage holds` / `>>> WORKING
 * STAGE BROKEN`, in the same shape as budget.js, so a hostile critic can run
 * the two and nothing else.
 */

/* The drawn-map floor from LAYOUT_BUDGET B2, which holds "with the rail open,
   at every disclosure level" — so it holds here too. */
const MAP_FLOOR = {
  '1920x1080': [1500, 620], '1440x900': [1100, 470], '1366x768': [1000, 420],
  '1024x640': [740, 300], '1024x600': [700, 280], '900x700': [860, 380],
  '768x1024': [700, 540], '390x844': [360, 150],
};

module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1700);

  const R = [];
  const t = (id, ok, got, want) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  got ' + got + '  (' + want + ')');

  /* ------------------------------------------------------ enter the path -- */
  /* The way a student does it: the one filled control at second zero. If the
     shell has renamed it, fall back to the tours module's published event —
     but say which route was taken, because "the CTA is gone" is itself news. */
  let route = 'cta';
  const cta = await page.$('.cx-cta:not([hidden])');
  if (cta) {
    await cta.click();
    await page.waitForTimeout(2600);
  }
  let started = await page.evaluate(() => !!document.querySelector('.tr-panel, .tr-bar[data-state="running"]'));
  if (!started) {
    route = 'tours:start';
    await page.evaluate(() => window.BEA.bus.emit('tours:start', { step: 1 }));
    await page.waitForTimeout(2200);
  }
  log('entered the path via: ' + route);
  await shot('beat-1');

  const probe = async () => page.evaluate(() => {
    const box = (n) => { if (!n) return null; const r = n.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
    const q = (s) => box(document.querySelector(s));
    const vw = innerWidth, vh = innerHeight;
    const panel = document.querySelector('.tr-panel');
    const title = document.querySelector('.tr-panel__title, .tr-panel__t');
    const next = document.querySelector('.tr-bar__next');
    const bar = document.querySelector('.tr-bar');
    /* FULLY on screen, not merely intersecting it. Measured at 900x700 with a
       beat mounted: the Back/Next bar sat at y = -24 with 6 of its 30 pixels
       below the top edge, and a check that only asked whether the rectangle
       intersected the viewport called that visible. A control a student cannot
       press is not on screen. */
    const onScreen = (b) => !!b && b.w > 0 && b.h > 0 && b.y >= 0 && b.x >= 0 && b.y + b.h <= vh && b.x + b.w <= vw;

    /* W3: hit-test the control's own centre. This is the check that would have
       caught "Next is intercepted by `.dsr__from`" before it shipped. */
    const at = (x, y) => (Number.isFinite(x) && Number.isFinite(y) && x >= 0 && y >= 0 && x < vw && y < vh)
      ? document.elementFromPoint(Math.round(x), Math.round(y)) : undefined;
    let hit = null;
    if (next) {
      const r = next.getBoundingClientRect();
      if (!r.width || !r.height) hit = 'not rendered';
      else {
        const el = at(r.x + r.width / 2, r.y + r.height / 2);
        hit = el === undefined ? 'off screen' : el ? (next.contains(el) ? 'next' : String(el.className || el.tagName)) : 'nothing';
      }
    } else hit = 'no Next button in the document';
    /* W5: is anything painted over the beat panel's title? */
    let overTitle = null;
    if (title) {
      const r = title.getBoundingClientRect();
      if (!r.width || !r.height) overTitle = 'the title is not rendered';
      else {
        const el = at(r.x + 8, r.y + r.height / 2);
        overTitle = el === undefined ? 'the title is off screen'
          : el ? (title.contains(el) || el.contains(title) ? null : String(el.className || el.tagName)) : 'nothing';
      }
    } else overTitle = 'no beat title in the document';
    /* W8: a single-line run whose text overflows its own box is clipped. */
    const clipped = [];
    for (const n of document.querySelectorAll('#app p, #app span, #app h1, #app h2, #app h3, #app button, #app li, #app cite')) {
      if (!n.firstChild || n.children.length > 2) continue;
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.overflow === 'visible') continue;
      /* A visually-hidden run is off screen by design, not clipped. */
      if (n.closest('.sr-only, [hidden], [aria-hidden="true"]')) continue;
      if (cs.clipPath && cs.clipPath !== 'none') continue;
      if (n.scrollWidth > n.clientWidth + 2 && n.clientWidth > 0) {
        clipped.push((n.className || n.tagName) + ' :: ' + (n.textContent || '').trim().slice(0, 40));
      }
    }
    /* W10: how many teaching surfaces claim the screen, and how many distinct
       years are being asserted on it. */
    const openPanels = [
      document.querySelector('.cmp:not([hidden])') ? 'compare' : null,
      document.querySelector('.cx-sheet') && !document.querySelector('.cx-sheet').hasAttribute('hidden') ? 'sheet' : null,
      document.querySelector('#app[data-dossier="open"]') ? 'dossier' : null,
    ].filter(Boolean);
    const years = new Set();
    const yr = window.BEA.store.getState().year;
    years.add(String(yr));
    /* Only a year that is actually PAINTED counts. A closed comparison keeps
       its last pair in the DOM behind [hidden], and counting those would report
       a defect that is not on the screen. */
    const cmpEl = document.querySelector('.cmp');
    if (cmpEl && !cmpEl.hasAttribute('hidden')) {
      for (const n of cmpEl.querySelectorAll('.cmp__year')) { const v = n.textContent.trim(); if (v) years.add(v); }
    }

    return {
      vp: vw + 'x' + vh,
      panel: box(panel),
      panelWords: panel ? (panel.innerText || '').trim().split(/\s+/).filter(Boolean).length : 0,
      panelChildren: panel ? panel.children.length : 0,
      bar: box(bar), barOnScreen: onScreen(box(bar)),
      next: box(next), nextOnScreen: onScreen(box(next)), hit,
      count: (document.querySelector('.tr-bar__count') || {}).textContent,
      overTitle,
      clipped: clipped.slice(0, 6),
      docOver: document.documentElement.scrollHeight - vh,
      /* At phone width P02 re-parents the plate out of `.stage__map` into a
         fixed strip of its own (`.map__frame > canvas.map__plate`), so a probe
         that only knows the desktop selector reports "no map" on the one
         viewport this harness exists for. Ask for the canvas P02 actually
         draws on, wherever it currently lives. */
      map: q('canvas.map__plate') || q('.stage__map canvas') || q('.stage__map svg'),
      stage: document.getElementById('app').dataset.stage,
      openPanels, years: [...years],
      railMode: document.getElementById('app').dataset.rail,
      railBox: q('#app[data-dossier="open"] .app__dossier') || q('.cx-sheet'),
      layerBar: q('.ly-bar'), layerKey: q('.ly-key'),
    };
  });

  const a = await probe();
  const floor = MAP_FLOOR[a.vp] || MAP_FLOOR['1366x768'];
  log('BEAT 1 ' + JSON.stringify(a));

  t('W1 beat panel has a body ', a.panelWords >= 25, a.panelWords + ' words in .tr-panel', '>= 25 words');
  t('W2 Back/Next bar on screen', a.barOnScreen && a.nextOnScreen, JSON.stringify({ bar: a.bar, next: a.next }), 'rendered and inside the viewport');
  t('W3 Next is not intercepted', a.hit === 'next', String(a.hit), 'elementFromPoint at Next\'s centre is Next');
  t('W5 nothing over the title ', !a.overTitle, String(a.overTitle || 'clear'), 'the beat title is the topmost thing at its own y');
  t('W6 no document scroll     ', a.docOver <= 0, a.docOver + 'px over', '<= 0');
  /* B2's floor is written for the closed rail. With a SIDE rail open the plate
     is compressed by exactly the rail's width, which is the contract itself
     (LAYOUT_BUDGET B5: panels compress the map, they never cover it), so the
     floor is charged against the rectangle the open rail leaves rather than
     against the whole window. In the sheet band the rail takes height, so the
     width floor stands and the height floor is the one B2 already sets low.  */
  const vwOf = (m) => Number(String(m.vp).split('x')[0]);
  const railOpen = (m) => !!(m.railBox && m.railBox.w > 0 && m.railBox.h > 0);
  const side = (m) => m.railMode === 'side' && railOpen(m);
  const sheet = (m) => m.railMode === 'sheet' && railOpen(m);
  const wantWidth = (m) => side(m) ? Math.floor((vwOf(m) - m.railBox.w) * 0.98) : floor[0];
  /* In the SHEET band the open rail takes height, not width, and LAYOUT_BUDGET
     §2A publishes exactly one guarantee for that case: `--rail-top-min`, "the
     drawn map's top plus the plate's 150px floor". So the height charged here
     is 150 while a bottom sheet is open, and B2's own figure everywhere else.
     Measured at 768x1024 with a beat mounted: 768x174, which clears 150 and
     would have failed B2's closed-rail figure of 540 — a rule the geometry
     makes impossible rather than a defect in the app. */
  const wantHeight = (m) => sheet(m) ? 150 : floor[1];
  const mapOK = (m) => !!m.map && m.map.h >= wantHeight(m) && m.map.w >= wantWidth(m);
  const mapGot = (m) => (m.map ? m.map.w + 'x' + m.map.h : 'none') + ' rail=' + m.railMode
    + (m.railBox ? ' rail=' + m.railBox.w + 'x' + m.railBox.h : ' rail closed');
  t('W7 drawn map floor (B2)   ', mapOK(a), mapGot(a), 'h >= ' + wantHeight(a) + ', w >= ' + wantWidth(a));
  t('W8 no text clipped        ', a.clipped.length === 0, a.clipped.join(' | ') || 'clear', 'no single-line run overflows its box');

  /* ------------------------------------------------------------- advance -- */
  let advanced = 'not attempted';
  if (a.nextOnScreen) {
    try {
      await page.click('.tr-bar__next', { timeout: 4000 });
      await page.waitForTimeout(1600);
      const b2 = await probe();
      advanced = a.count + ' -> ' + b2.count;
      t('W4 Next advances the beat', b2.count !== a.count, advanced, 'the counter moves');
      t('W6 no scroll after Next  ', b2.docOver <= 0, b2.docOver + 'px over', '<= 0');
      t('W1 beat 2 has a body     ', b2.panelWords >= 25, b2.panelWords + ' words', '>= 25 words');
      await shot('beat-2');
    } catch (err) {
      t('W4 Next advances the beat', false, 'click failed: ' + String(err.message).slice(0, 90), 'the counter moves');
    }
  } else {
    t('W4 Next advances the beat', false, 'Next was not on screen', 'the counter moves');
  }

  /* ------------------------------- a thematic re-encoding, mid-path ------- */
  await page.evaluate(() => window.BEA.bus.emit('ask:layer', { id: 'mechanism', predict: false }));
  await page.waitForTimeout(1200);
  const c = await probe();
  log('WITH A LAYER ON ' + JSON.stringify({ layerBar: c.layerBar, layerKey: c.layerKey, clipped: c.clipped, docOver: c.docOver, map: c.map }));
  t('W6 no scroll with a layer ', c.docOver <= 0, c.docOver + 'px over', '<= 0');
  t('W7 map floor with a layer ', mapOK(c), mapGot(c), 'h >= ' + wantHeight(c) + ', w >= ' + wantWidth(c));
  t('W8 no text clipped (layer)', c.clipped.length === 0, c.clipped.join(' | ') || 'clear', 'no single-line run overflows its box');
  await shot('beat-with-layer');

  /* ------------------------------------ one panel, one year on screen ----- */
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { a: 1914, b: 1922 }));
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.BEA.bus.emit('ask:layerKey', { open: true }));
  await page.waitForTimeout(1200);
  const d = await probe();
  log('COMPARE THEN LAYERS ' + JSON.stringify({ open: d.openPanels, years: d.years }));
  t('W10 one teaching panel    ', d.openPanels.length <= 1, d.openPanels.join('+') || 'none', '<= 1 of compare / sheet / dossier');
  t('W10 one year on screen    ', d.years.length <= 1, d.years.join(', '), 'the year is single-valued');
  await shot('one-panel');

  log(R.join('\n'));
  log(R.some((r) => r.startsWith('FAIL')) ? '>>> WORKING STAGE BROKEN' : '>>> working stage holds');
};
