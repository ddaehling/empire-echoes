/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.evaluate(() => { location.hash = '#year=1900&layer=status'; });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const api = window.__map, S = window.BEA.symbology;
    const paint = api.plate.paint;
    const byKey = new Map();
    const lost = new Map();
    for (const [uid, rec] of paint) {
      const m = rec.lost ? lost : byKey;
      m.set(rec.key, (m.get(rec.key) || 0) + 1);
    }
    const totals = window.BEA.legend.totalsAt(1900);
    const set = totals.sets.claimed;
    const fam = new Map();
    for (const a of set.byStatus) {
      if (!a.units) continue;
      const sym = S.STATUS_SYMBOL[a.statusId];
      const k = sym && sym.family ? sym.family : '_informal';
      fam.set(k, (fam.get(k) || 0) + a.units);
    }
    // which units are settlement on the plate?
    const settle = [];
    for (const [uid, rec] of paint) if (rec.key === 'settlement' && !rec.lost) settle.push(uid + ' :: ' + (rec.label || ''));
    return { plate: [...byKey.entries()], lost: [...lost.entries()], totals: [...fam.entries()], setUnits: set.units, settle };
  });
  log('PLATE  ' + JSON.stringify(r.plate));
  log('LOST   ' + JSON.stringify(r.lost));
  log('TOTALS ' + JSON.stringify(r.totals) + ' units=' + r.setUnits);
  log('SETTLE ' + JSON.stringify(r.settle));
};
