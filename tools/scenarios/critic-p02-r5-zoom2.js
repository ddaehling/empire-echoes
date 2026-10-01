/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  await page.evaluate(() => { location.hash = '#year=1913'; }); await page.waitForTimeout(1200);
  await page.evaluate(() => { const e=document.querySelector('.map__target[tabindex="0"]'); e && e.focus(); });
  await page.waitForTimeout(400);
  const v = () => page.evaluate(() => JSON.stringify({view: window.__map.plate.view, focus: (document.activeElement.dataset||{}).unit, year: location.hash}));
  log('focused: ' + await v());
  for (const k of ['+','-','Shift+ArrowRight','Shift+ArrowUp']) {
    await page.keyboard.press(k); await page.waitForTimeout(900);
    log(k + ' -> ' + await v());
  }
  await shot('kbd-zoom');
};
