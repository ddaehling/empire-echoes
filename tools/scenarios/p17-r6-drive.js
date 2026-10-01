/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 6 — drive every state this piece reacts to and count the damage. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.waitForTimeout(2600);

  const probe = (tag) => page.evaluate((t) => {
    const q = (s) => document.querySelector(s);
    const rect = (n) => { if (!n) return null; const b = n.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
    const map = q('.stage__map');
    const mb = map ? map.getBoundingClientRect() : null;
    const over = [];
    for (const n of document.querySelectorAll('#legend-byline, .legend--ribbon, .lsheet')) {
      const b = n.getBoundingClientRect();
      if (!mb || !b.width) continue;
      const w = Math.max(0, Math.min(b.right, mb.right) - Math.max(b.left, mb.left));
      const h = Math.max(0, Math.min(b.bottom, mb.bottom) - Math.max(b.top, mb.top));
      if (w * h > 4000) over.push([n.id || n.className, Math.round(w * h)]);
    }
    const rib = q('.legend--ribbon');
    const clipped = [...document.querySelectorAll('.legend--ribbon .legend__rib-w, .legend__say, .legend__route')]
      .filter(n => n.scrollWidth > n.clientWidth + 1).map(n => n.className);
    return { tag: t, stage: document.getElementById('app').dataset.stage,
      ribbon: rect(rib), onPlate: over, clippedWords: clipped,
      byline: rect(document.getElementById('legend-byline')),
      keyH: rect(q('.stage__key')), canvas: rect(q('.stage__map canvas')) };
  }, tag);

  const steps = [
    ['boot', null],
    ['def 2', () => page.keyboard.press('2')],
    ['def 3', () => page.keyboard.press('3')],
    ['def 4', () => page.keyboard.press('4')],
    ['def 1', () => page.keyboard.press('1')],
    ['proj', () => page.keyboard.press('p')],
    ['weight', () => page.keyboard.press('w')],
    ['stitch', () => page.keyboard.press('s')],
    ['silence', () => page.keyboard.press('h')],
    ['year 1620', () => page.evaluate(() => window.BEA.store.dispatch('setYear', 1620))],
    ['year 1783', () => page.evaluate(() => window.BEA.store.dispatch('setYear', 1783))],
    ['year 1997', () => page.evaluate(() => window.BEA.store.dispatch('setYear', 1997))],
    ['year 1200', () => page.evaluate(() => window.BEA.store.dispatch('setYear', 1200))],
    ['back 1900', () => page.evaluate(() => window.BEA.store.dispatch('setYear', 1900))],
    ['apparatus', () => page.evaluate(() => window.BEA.store.dispatch('setFilter', { stage: 'apparatus' }))],
    ['sheet', () => page.evaluate(() => window.BEA.legend.openPlate('colour'))],
    ['sheet+1620', () => page.evaluate(() => window.BEA.store.dispatch('setYear', 1620))],
    ['close', () => page.keyboard.press('Escape')],
  ];
  for (const [tag, run] of steps) {
    if (run) { await run(); await page.waitForTimeout(650); }
    log(JSON.stringify(await probe(tag)));
  }
  await shot('end');
  log('ERRORS ' + JSON.stringify(errs));
};
