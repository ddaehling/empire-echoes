/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1882));
  await page.waitForTimeout(400);
  await page.click('.tl-chg');
  await page.waitForTimeout(500);
  log(await page.evaluate(() => {
    const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.height)]; };
    return JSON.stringify({ drawerAttr: document.querySelector('.tl').dataset.drawer,
      tl: r('.tl'), deck: r('.tl__deck'), body: r('.tl__body'), changes: r('.tl__changes'),
      changerow: r('.tl__changerow'), ax: r('.tl-ax'), spine: r('.tl-spine'), drawer: r('.tl__drawer') }, null, 1);
  }));
};
