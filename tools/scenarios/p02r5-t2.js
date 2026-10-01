/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.waitForTimeout(2600);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(700);
  log(JSON.stringify(await page.evaluate(() => {
    const m = window.BEA.map, d = window.BEA.data;
    const st = d.statusAt(1913);
    const claimed = [...st.keys()].filter(k => st.get(k).controlDegree >= 1);
    const painted = new Set([...m.plate.paint.keys()].filter(k => m.plate.paint.get(k).entry));
    const missing = claimed.filter(k => !painted.has(k));
    const shapes = m.plate.geom ? new Set(m.plate.geom.shapes.keys()) : new Set();
    const und = (m.undrawable || []).map(u => ({ id: u.unitId, title: u.title }));
    return { claimed: claimed.length, painted: painted.size, missing,
      hasShape: missing.map(k => shapes.has(k)), shapes: shapes.size,
      und, measureUnits: m.measures && m.measures.units };
  }), null, 1));
};
