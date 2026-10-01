/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  for (const t of [300, 1200, 2500]) {
    await page.waitForTimeout(t);
    const r = await page.evaluate(() => {
      const S = window.BEA.symbology;
      const totals = window.BEA.legend.totalsAt(window.BEA.store.getState().year);
      const out = {};
      for (const d of ['claimed', 'administered']) {
        const fam = new Map();
        for (const a of totals.sets[d].byStatus) { if (!a.units) continue; const sym = S.STATUS_SYMBOL[a.statusId]; const k = sym && sym.family ? sym.family : '_i'; fam.set(k, (fam.get(k) || 0) + a.units); }
        out[d] = [...fam.entries()].sort((a, b) => b[1] - a[1]);
      }
      return { year: window.BEA.store.getState().year, def: (window.BEA.store.getState().filters || {}).def, out };
    });
    log('t=' + t + ' ' + JSON.stringify(r));
  }
};
