/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const IDS = ['gibraltar','malta','ascension','barbados','aden','singapore','hong-kong-island'];
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.evaluate(() => { location.hash = '#year=1913'; });
  await page.waitForTimeout(1200);
  const found = await page.evaluate((IDS) => {
    const out = {};
    for (const id of IDS) {
      const el = [...document.querySelectorAll('.map__target')].find(e => e.dataset.unit === id || e.dataset.unit.endsWith(id));
      if (!el) { out[id] = null; continue; }
      const r = el.getBoundingClientRect();
      out[id] = { unit: el.dataset.unit, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
        aria: el.getAttribute('aria-label'), tabindex: el.tabIndex,
        topAtCenter: (document.elementFromPoint(r.x + r.width/2, r.y + r.height/2)||{}).id || 'none' };
    }
    return out;
  }, IDS);
  log(JSON.stringify(found, null, 1));
  // click each and check selection
  for (const id of IDS) {
    const f = found[id];
    if (!f) { log('MISSING ' + id); continue; }
    await page.mouse.click(f.x + f.w/2, f.y + f.h/2);
    await page.waitForTimeout(700);
    const sel = await page.evaluate(() => ({ sel: document.querySelector('.map__target[aria-selected="true"]')?.dataset.unit, hash: location.hash }));
    log('CLICK ' + id + ' -> ' + JSON.stringify(sel));
  }
  await shot('after-clicks');
};
