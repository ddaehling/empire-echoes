/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.__map && window.__map.plate && window.__map.plate.geom, null, { timeout: 20000 });
  await page.waitForTimeout(2200);
  for (const y of [1913, 1960]) {
    await page.evaluate((yy) => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(700);
    const out = await page.evaluate(() => {
      const m = window.__map;
      const D = window.BEA.data;
      return m.plate.labelsDrawn.map(l => {
        const rec = m.plate.paint.get(l.uid);
        const tid = rec && rec.entry ? rec.entry.territoryId : null;
        return [l.uid, tid, l.text, D.unitName ? D.unitName(l.uid) : ''];
      });
    });
    log('YEAR ' + y + ' (' + out.length + ')');
    for (const r of out) log('   ' + JSON.stringify(r));
  }
  // the specific anachronism the critic named
  const cy = await page.evaluate(() => {
    window.BEA.store.dispatch('setYear', 1913);
    return null;
  });
  await page.waitForTimeout(600);
  log('AKROTIRI 1913: ' + await page.evaluate(() => window.__map.describe('cy-akrotiri-dhekelia')));
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1975));
  await page.waitForTimeout(600);
  log('AKROTIRI 1975: ' + await page.evaluate(() => window.__map.describe('cy-akrotiri-dhekelia')));
};
