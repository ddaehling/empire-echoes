/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.__map && window.__map.plate && window.__map.plate.geom, null, { timeout: 25000 });
  await page.waitForTimeout(2600);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.keyboard.press('s');
  await page.waitForTimeout(900);
  const o = await page.evaluate(() => {
    const M = window.__map;
    const stations = []; for (const [u, r] of M.plate.paint) if (r.stitchKind && M.plate.isTiny(u)) stations.push(u);
    const drawn = new Set(M.plate.labelsDrawn.map(l => l.uid));
    return { stations: stations.length, named: stations.filter(u => drawn.has(u)).length,
      missing: stations.filter(u => !drawn.has(u)), labels: M.labels };
  });
  log(JSON.stringify(o));
  await shot('stitch-labels');
};
