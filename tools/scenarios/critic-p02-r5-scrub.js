/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  const t0 = Date.now();
  for (let y = 1600; y <= 1997; y += 1) {
    await page.evaluate(y => { const h = new URLSearchParams(location.hash.slice(1)); h.set('year', y); location.hash = h.toString(); }, y);
    if (y % 50 === 0) await page.waitForTimeout(60);
  }
  await page.waitForTimeout(2000);
  log('scrub done in ' + (Date.now()-t0) + 'ms; hash=' + await page.evaluate(()=>location.hash));
  log('frameStats: ' + await page.evaluate(()=>JSON.stringify(window.__map.frameStats && (typeof window.__map.frameStats==='function'?window.__map.frameStats():window.__map.frameStats))));
  await shot('after-scrub');
  log('units at 1997: ' + await page.evaluate(()=>document.querySelectorAll('.map__target').length));
};
