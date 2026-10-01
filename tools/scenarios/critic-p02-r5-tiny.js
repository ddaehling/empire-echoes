/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  await page.evaluate(() => { location.hash = '#year=1913'; });
  await page.waitForTimeout(1500);
  const want = ['gibraltar','malta','ascension','barbados','aden','singapore','hong-kong'];
  const ids = await page.evaluate(() => [...document.querySelectorAll('.map__target')].map(e => e.dataset.unit));
  log('total targets: ' + ids.length);
  const found = {};
  for (const w of want) { found[w] = ids.filter(i => i.includes(w)); }
  log('matches: ' + JSON.stringify(found));
  // measure hit targets
  const rects = await page.evaluate((want) => {
    const out = {};
    for (const e of document.querySelectorAll('.map__target')) {
      const id = e.dataset.unit;
      if (!want.some(w => id.includes(w))) continue;
      const b = e.getBoundingClientRect();
      out[id] = { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), aria: e.getAttribute('aria-label'), tabindex: e.tabIndex };
    }
    return out;
  }, want);
  log(JSON.stringify(rects, null, 1));
};
