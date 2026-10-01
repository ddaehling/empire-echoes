/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* =============================================================================
   P17 ROUND 6 — DOES THE RIBBON OBEY THE RESPONSIVE LAW?

   Four assertions, measured on the running app, cold-loaded and inside a beat:

   G1  the ribbon (either copy) NEVER overlaps `.cx-lede` — the one-sentence
       band the shell owns.  LAYOUT_BUDGET §3: the strip is at the FOOT of the
       plate, never over the lede.
   G2  the ribbon never overlaps the DRAWN MAP (RESPONSIVE_LAW D1/D6, docked
       band) and starts at or after the map's bottom edge.
   G3  no chip is cut: every painted `.legend__rib` fits inside the list box,
       and no `.legend__rib-w` is clipped by its own box (LAYOUT_BUDGET §4 —
       a word cut mid-word is a wrong key, not a shorter one).
   G4  the trailing reservation for the map's zooms (6.5rem below 62rem) is
       respected: the route control's right edge stops clear of the zooms.
   Also prints the map's measured rectangle, before/after, for the report.
   ========================================================================== */
const R = (b) => b ? [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)] : null;

async function measure(page) {
  return page.evaluate(() => {
    const box = (sel) => { const n = document.querySelector(sel); if (!n) return null;
      const cs = getComputedStyle(n); const b = n.getBoundingClientRect();
      if (cs.display === 'none' || cs.visibility === 'hidden' || !b.width || !b.height) return null;
      return { x: b.x, y: b.y, width: b.width, height: b.height, right: b.right, bottom: b.bottom }; };
    const boxes = (sel) => [...document.querySelectorAll(sel)].map(n => {
      const cs = getComputedStyle(n); const b = n.getBoundingClientRect();
      const painted = cs.display !== 'none' && cs.visibility !== 'hidden' && b.width > 0 && b.height > 0;
      const w = n.querySelector('.legend__rib-w');
      return { painted, tier: n.dataset.tier, hidden: !!n.hidden,
        x: b.x, y: b.y, width: b.width, height: b.height, right: b.right, bottom: b.bottom,
        word: w ? w.textContent : '', wordW: w ? w.getBoundingClientRect().width : 0,
        wordScroll: w ? w.scrollWidth : 0, wordClip: w ? (w.scrollWidth - Math.ceil(w.getBoundingClientRect().width)) : 0 };
    });
    const app = document.getElementById('app');
    const svg = document.querySelector('.map svg, .map canvas, .map__svg');
    return {
      vw: innerWidth, vh: innerHeight,
      dock: app ? app.dataset.dock : null, rail: app ? app.dataset.rail : null,
      path: app ? app.dataset.path : null, foot: app ? app.dataset.foot : null,
      lede: box('.cx-lede'), stageKey: box('.stage__key'), pin: box('.legend__pin'),
      ribbon: box('.stage__key .legend--ribbon'), pinRibbon: box('.legend__pin .legend--ribbon'),
      list: box('.stage__key .legend__ribbon-list') || box('.legend__ribbon-list'),
      route: box('.legend__route'), zooms: box('.map__zooms'),
      stageMap: box('.stage__map'), drawnMap: box('.map__plate') || box('.map svg') || svg && (() => { const b = svg.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height, right: b.right, bottom: b.bottom }; })(),
      ribs: boxes('.legend__rib'),
      say: box('.legend__say'),
    };
  });
}

const over = (a, b) => {
  if (!a || !b) return 0;
  const w = Math.max(0, Math.min(a.right, b.right) - Math.max(a.x, b.x));
  const h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y));
  return Math.round(w * h);
};

module.exports = async ({ page, shot, log }) => {
  const fails = [];
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });

  const states = [
    ['cold plate 1900', '#year=1900&layer=status'],
    ['cold plate 1700', '#year=1700&layer=status'],
    ['a territory open', '#year=1900&sel=british-india&layer=status'],
    ['inside beat 1', '#tour=empire&step=1'],
    ['inside beat 9', '#tour=empire&step=9'],
    ['inside beat 17', '#tour=empire&step=17'],
    ['inside beat 23', '#tour=empire&step=23'],
  ];

  for (const [name, hash] of states) {
    await page.evaluate((h) => { location.hash = h; }, hash);
    await page.waitForTimeout(1500);
    const m = await measure(page);
    const rib = m.ribbon || m.pinRibbon;
    const strip = m.pin || m.stageKey;
    log('');
    log('== ' + name + '  ' + m.vw + 'x' + m.vh + '  dock=' + m.dock + ' rail=' + m.rail + ' path=' + m.path);
    log('   .cx-lede        ' + JSON.stringify(R(m.lede)));
    log('   .stage__map     ' + JSON.stringify(R(m.stageMap)));
    log('   drawn map       ' + JSON.stringify(R(m.drawnMap)));
    log('   .stage__key     ' + JSON.stringify(R(m.stageKey)) + '   .legend__pin ' + JSON.stringify(R(m.pin)));
    log('   ribbon          ' + JSON.stringify(R(rib)) + '   route ' + JSON.stringify(R(m.route)) + '   zooms ' + JSON.stringify(R(m.zooms)));
    const painted = m.ribs.filter(r => r.painted && !r.hidden);
    log('   chips painted   ' + painted.length + ' of ' + m.ribs.length + '  [' + painted.map(r => r.word + '/' + r.tier).join(' | ') + ']');

    /* G1 — never over the lede */
    for (const [lbl, b] of [['ribbon', rib], ['strip', strip], ['route', m.route]]) {
      const px = over(b, m.lede);
      if (px > 0) fails.push('G1 ' + name + ': ' + lbl + ' overlaps .cx-lede by ' + px + 'px²');
    }
    log('   G1 lede overlap ' + over(rib, m.lede) + 'px² (ribbon), ' + over(strip, m.lede) + 'px² (strip)');

    /* G2 — never over the drawn map, and below it */
    const mapPx = over(rib, m.drawnMap);
    if (m.dock === 'docked' && mapPx > 0) fails.push('G2 ' + name + ': ribbon overlaps the drawn map by ' + mapPx + 'px²');
    if (m.dock === 'docked' && strip && m.drawnMap && strip.y + 0.5 < m.drawnMap.bottom) {
      fails.push('G2 ' + name + ': the strip starts at y=' + Math.round(strip.y) + ', above the map bottom ' + Math.round(m.drawnMap.bottom));
    }
    log('   G2 map overlap  ' + mapPx + 'px²');

    /* G3 — nothing half-drawn */
    for (const r of painted) {
      if (r.wordClip > 1) fails.push('G3 ' + name + ': chip word "' + r.word + '" cut by ' + r.wordClip + 'px');
      if (m.list && r.right > m.list.right + 1) fails.push('G3 ' + name + ': chip "' + r.word + '" runs ' + Math.round(r.right - m.list.right) + 'px past the list');
    }
    log('   G3 clipped words ' + painted.filter(r => r.wordClip > 1).length);

    /* G4 — clear of the zooms */
    const zpx = over(rib, m.zooms);
    if (m.dock === 'docked' && m.zooms && m.route && over(m.route, m.zooms) > 0) {
      fails.push('G4 ' + name + ': the route control overlaps the zoom cluster by ' + over(m.route, m.zooms) + 'px²');
    }
    log('   G4 ribbon∩zooms ' + zpx + 'px² (the zooms dock INSIDE the strip below 62rem; route∩zooms ' + (m.route && m.zooms ? over(m.route, m.zooms) : 0) + ')');
    await shot(name.replace(/\s+/g, '-'));
  }

  log('');
  log('=== geometry failures: ' + fails.length + ' ===');
  fails.forEach(f => log('   FAIL ' + f));
  log(fails.length ? '>>> P17 GEOMETRY BROKEN' : '>>> the ribbon keeps its strip');
};
