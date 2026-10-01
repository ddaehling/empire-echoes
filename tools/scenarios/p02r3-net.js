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
  await page.keyboard.press('s');
  await page.waitForTimeout(600);
  const n = await page.evaluate(() => (window.__map.net||[]).map(l=>[l.a,l.b,Math.round(l.km)]));
  for (const l of n) log(JSON.stringify(l));
  log('nodes: ' + JSON.stringify(await page.evaluate(() => {
    const out=[]; for (const [u,r] of window.__map.plate.paint) if (r.stitchKind) out.push([u, r.stitchKind]); return out;
  })));
};
