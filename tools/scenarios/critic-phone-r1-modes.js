/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1600);
  await page.locator('.cx-cta').first().click();
  await page.waitForTimeout(1200);
  await page.locator('.tr-bar__next').first().click(); await page.waitForTimeout(500);
  await page.locator('.tr-bar__next').first().click(); await page.waitForTimeout(1400);
  await shot('beat3');
  await page.evaluate(()=>document.querySelector('.cx-sheet__body').scrollTop = 400);
  await page.waitForTimeout(400);
  await shot('beat3-scrolled');
  // zoom on the sheet/timeline seam
  const seam = await page.evaluate(()=>{ const s=document.querySelector('.app__sheet').getBoundingClientRect(); return Math.round(s.bottom); });
  log('sheet bottom y = ' + seam);
  await page.screenshot({ path: require('path').join(process.env.OUT||'/tmp','seam.png'), clip: { x:0, y: seam-90, width: 390, height: 110 } }).catch(e=>log('clip fail '+e.message));
};
