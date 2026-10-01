/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const r = await page.evaluate(async () => {
    const B = window.BEA;
    const out = { keys: Object.keys(B||{}) };
    try {
      const d = B.data;
      out.dataKeys = Object.keys(d);
      for (const y of [1770, 1900, 1913, 1922]) {
        const m = d.metricsAt ? d.metricsAt(y) : null;
        out['m'+y] = m ? JSON.parse(JSON.stringify(m)) : null;
      }
    } catch(e) { out.err = String(e); }
    return out;
  });
  log(JSON.stringify(r, null, 1).slice(0, 6000));
};
