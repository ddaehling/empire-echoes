/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'innerText').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1882));
  await page.waitForTimeout(500);
  await shot('1882');
  log('row text:', await page.evaluate(() => document.querySelector('.tl__changes').innerText.replace(/\n/g, ' | ')));
  // open the sheet at 1858
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1858));
  await page.waitForTimeout(400);
  log('head 1858:', await page.evaluate(() => document.querySelector('.tl__changehead').innerText));
  log('more btn:', await page.evaluate(() => { const b = document.querySelector('.tl-chg--more'); return b && !b.hidden ? b.textContent : 'hidden'; }));
  await page.click('.tl-chg--more');
  await page.waitForTimeout(500);
  await shot('sheet1858');
  const geom = await page.evaluate(() => {
    const m = document.querySelector('#stage') || document.querySelector('[data-mount=map]');
    const d = document.querySelector('.tl__drawer');
    const r = (e) => e ? e.getBoundingClientRect() : null;
    return { stage: r(m), drawer: r(d), tl: r(document.querySelector('.tl')) };
  });
  log('geometry:', JSON.stringify(geom));
};
