/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.waitForTimeout(2600);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(600);
  await shot('mercator');
  const t4 = await page.evaluate(async () => {
    const m = window.BEA.map;
    const area = (id) => { const b = m.plate._boundsNow().get(id); return b ? (b.x1 - b.x0) * (b.y1 - b.y0) : null; };
    const snap = () => ({
      canada: area('ca-quebec'), nwt: area('ca-northwest-territories'), kenya: area('kenya'), india: area('in-uttar-pradesh'),
      colours: [...m.plate.paint.entries()].map(([k, r]) => k + ':' + (r.entry ? r.entry.status : r.mode)).sort().join('|'),
      sel: window.BEA.store.getState().selectedTerritoryId, proj: m.projection });
    const before = snap();
    m.setProjection('equal-earth');
    await new Promise(r => setTimeout(r, 1500));
    const after = snap();
    m.setProjection('mercator');
    await new Promise(r => setTimeout(r, 1400));
    return { before: { proj: before.proj, canada: before.canada, nwt: before.nwt, kenya: before.kenya },
      after: { proj: after.proj, canada: after.canada, nwt: after.nwt, kenya: after.kenya },
      canadaRatio: before.canada && after.canada ? +(after.canada / before.canada).toFixed(3) : null,
      nwtRatio: before.nwt && after.nwt ? +(after.nwt / before.nwt).toFixed(3) : null,
      kenyaRatio: before.kenya && after.kenya ? +(after.kenya / before.kenya).toFixed(3) : null,
      coloursUnchanged: before.colours === after.colours, selUnchanged: before.sel === after.sel };
  });
  log('T4 ' + JSON.stringify(t4));
  await page.evaluate(() => window.BEA.map.setProjection('equal-earth'));
  await page.waitForTimeout(1500);
  await shot('equal-earth');
  // reduced motion: cross-fade, no tween
  await page.evaluate(() => window.BEA.store.dispatch('setReducedMotion', 'reduced'));
  await page.waitForTimeout(400);
  const rm = await page.evaluate(async () => {
    const m = window.BEA.map, mod = m.module;
    const seen = [];
    const t0 = performance.now();
    m.setProjection('mercator');
    for (let i = 0; i < 24; i++) { await new Promise(r => requestAnimationFrame(r)); seen.push(mod.morph ? +(mod.morph.t || 0).toFixed(2) : null); }
    return { morphSamples: seen.filter(v => v !== null && v > 0 && v < 1).length, samples: seen.slice(0, 8),
      fadeUsed: document.querySelector('.map__fade') ? document.querySelector('.map__fade').className : null, ms: Math.round(performance.now() - t0) };
  });
  log('reduced ' + JSON.stringify(rm));
  await shot('reduced-after');
};
