/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'innerText').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.__map && window.__map.plate && window.__map.plate.geom, null, { timeout: 20000 });
  await page.waitForTimeout(2400);
  await page.keyboard.press('s');
  await page.waitForTimeout(800);
  log('longest: ' + JSON.stringify(await page.evaluate(() => (window.__map.net||[]).longest)));
  log('card: ' + await page.evaluate(() => document.querySelector('.map__switchbody').innerText.replace(/\s+/g,' ').slice(0,1400)));
  await shot('stitch');
};
