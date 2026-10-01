/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const go = async (hash) => { await page.evaluate(h => { location.hash = h; }, hash); await page.waitForTimeout(1400); };
  await page.waitForTimeout(3000);
  for (const def of ['claimed','administered','controlled','influenced']) {
    await go('#year=1913&def=' + def);
    const r = await page.evaluate(() => {
      const m = window.BEA.data.metricsAt(1913);
      const drawn = window.__map.marks ? (typeof window.__map.marks === 'function' ? window.__map.marks() : window.__map.marks) : null;
      const ids = document.querySelectorAll('.map__target').length;
      return { def: window.__map.definition, byDegree: m.byDegree, units: m.units, targets: ids,
        aria: document.querySelector('.map__plate')?.getAttribute('aria-label'),
        drawnLen: Array.isArray(drawn) ? drawn.length : (drawn && drawn.length) || null };
    });
    log(JSON.stringify(r));
    await shot('def-' + def);
  }
};
