/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** P08 — the Tension Plate, opened by its published contract. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1200);

  const before = await page.evaluate(() => {
    const b = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; };
    return { map: b('.stage__map canvas') || b('.stage__map svg'), stage: b('.app__stage') };
  });
  log('MAP BEFORE ' + JSON.stringify(before));

  await page.evaluate(() => window.BEA.bus.emit('viz:open', { id: 'plate:abolition' }));
  await page.waitForTimeout(900);
  await shot('plate-field');

  const m = await page.evaluate(() => {
    const root = document.querySelector('.viz-plate');
    const body = document.querySelector('.cx-sheet__body');
    const b = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; };
    const cells = [...document.querySelectorAll('.viz-claim')];
    const vis = cells.filter((c) => { const r = c.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= innerHeight + 0.5; });
    return {
      present: !!root,
      claims: cells.length,
      fullyVisible: vis.length,
      sheetScroll: body ? { scrollH: body.scrollHeight, clientH: body.clientHeight, overflows: body.scrollHeight > body.clientHeight + 1 } : null,
      tabs: document.querySelectorAll('.viz [role="tab"], .viz details, .viz summary').length,
      figs: [...document.querySelectorAll('.viz-fig')].map((f) => f.dataset.fig),
      defects: document.querySelectorAll('.viz-fig--bad').length,
      map: b('.stage__map canvas') || b('.stage__map svg'),
      url: location.hash,
      filters: JSON.stringify(window.BEA.store.getState().filters),
    };
  });
  log('PLATE ' + JSON.stringify(m, null, 1));

  /* cross-lighting by keyboard */
  const lit = await page.evaluate(() => {
    const f = [...document.querySelectorAll('.viz-fig')].find((n) => n.dataset.fig === 'freed-800k');
    if (!f) return 'no figure';
    f.focus();
    return 'focused';
  });
  await page.waitForTimeout(300);
  const litOut = await page.evaluate(() => [...document.querySelectorAll('.viz-fig[data-lit="yes"]')].map((n) => n.dataset.fig));
  log('LIT after focusing freed-800k: ' + JSON.stringify(litOut) + ' (' + lit + ')');
  await shot('plate-crosslit');

  /* collapse */
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.viz-claim__pick')][0];
    if (b) b.click();
  });
  await page.waitForTimeout(500);
  await shot('plate-collapsed');
  const col = await page.evaluate(() => ({
    mode: document.querySelector('.viz-plate').dataset.mode,
    chosen: document.querySelector('.viz-plate').dataset.chosen,
    struck: [...document.querySelectorAll('.viz-strip__s')].map((s) => s.textContent),
    ledger: (JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]')).filter((e) => e.kind === 'collapsed'),
  }));
  log('COLLAPSED ' + JSON.stringify(col, null, 1));
};
