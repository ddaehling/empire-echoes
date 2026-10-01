/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const r = await page.evaluate(async () => {
    const out = {};
    try {
      const mod = await import('/app/js/core/data.js');
      out.exports = Object.keys(mod);
      const D = mod.data || mod.default || mod;
      let d = D;
      if (typeof D === 'function') d = await D();
      if (d && typeof d.ready === 'function') await d.ready();
      out.dkeys = Object.keys(d).slice(0,50);
      for (const y of [1900, 1913, 1922]) {
        try { out['m'+y] = d.metricsAt(y); } catch(e) { out['m'+y]='ERR '+e.message; }
      }
    } catch (e) { out.err = String(e); }
    return JSON.parse(JSON.stringify(out));
  });
  log(JSON.stringify(r, null, 1).slice(0, 12000));
};
