/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(800);
  const layers = ['status', 'control', 'tenure', 'mechanism', 'taken-from', 'exit', 'slavery', 'labour', 'famine', 'informal', 'system', 'resistance', 'weight'];
  for (const L of layers) {
    await page.evaluate((l) => { location.hash = '#year=1900&layer=' + l; }, L);
    await page.waitForTimeout(650);
    const r = await page.evaluate(() => {
      const api = window.__map;
      if (!api || !api.plate || !api.plate.paint) return { no: true };
      const g = new Map();
      let quiet = 0, dim = 0, hole = 0, tot = 0;
      for (const [, rec] of api.plate.paint) {
        tot++;
        if (rec.mode === 'hole') { hole++; continue; }
        if (rec.quiet) { quiet++; continue; }
        if (rec.dim) { dim++; continue; }
        const k = (rec.layerKey !== undefined ? 'L:' + rec.layerKey : 'K:' + rec.key) + ' | ' + (rec.layerWord || rec.mode || '');
        g.set(k, (g.get(k) || 0) + 1);
      }
      const sample = [];
      let i = 0;
      for (const [uid, rec] of api.plate.paint) { if (i++ > 1) break; sample.push({ uid, keys: Object.keys(rec).join(','), key: rec.key, layerKey: rec.layerKey, layerWord: rec.layerWord, mode: rec.mode, tenure: rec.tenure, fill: rec.fill }); }
      return { tot, quiet, dim, hole, groups: [...g.entries()].sort((a, b) => b[1] - a[1]), sample };
    });
    log('== ' + L + ' :: ' + JSON.stringify(r).slice(0, 1400));
  }
};
