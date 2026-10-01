/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'click').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P03 round 2 — the pixels, in the app's own default state. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && document.querySelector('.tl'), null, { timeout: 20000 });
  await page.waitForTimeout(400);
  const geom = await page.evaluate(() => {
    const r = document.querySelector('.tl').getBoundingClientRect();
    return { docH: document.documentElement.scrollHeight, vh: innerHeight, tlTop: Math.round(r.top), tlH: Math.round(r.height) };
  });
  log('geometry: ' + JSON.stringify(geom));
  const at = async (y, name) => {
    await page.evaluate((yy) => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(180);
    await shot(name, '.tl');
  };
  await at(1820, 'tl-1820-three-engines');
  await at(1858, 'tl-1858');
  await at(1948, 'tl-1948');
  await at(1945, 'tl-1945');
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1947));
  await page.waitForTimeout(150);
  await page.evaluate(() => document.querySelector('.tl-chg--more').click());
  await page.waitForTimeout(250);
  await shot('expander-1947', '.tl');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  await shot('full-page');
};
