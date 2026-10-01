/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — elementHandle.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  log('motion attr: ' + await page.evaluate(()=>document.documentElement.dataset.motion + '|' + document.body.dataset.motion));
  const btn = await page.$('.map__proj');
  const t0 = Date.now();
  await btn.click();
  await page.waitForTimeout(120); await shot('rm-120ms');
  await page.waitForTimeout(300); await shot('rm-420ms');
  await page.waitForTimeout(1500); await shot('rm-done');
  log('proj now: ' + await page.evaluate(()=>document.querySelector('.map').dataset.projection));
  // selection outline check
  await page.evaluate(()=>{ location.hash='#year=1900&sel=barbados'; });
  await page.waitForTimeout(1200);
  await shot('selected');
};
