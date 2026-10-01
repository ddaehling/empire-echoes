/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const years = [1783, 1833, 1858, 1876, 1947, 1957, 1960, 1997];
  for (const y of years) {
    await page.evaluate((yy) => { location.hash = '#year=' + yy; }, y);
    await page.waitForTimeout(700);
    const txt = await page.evaluate(() => {
      const row = document.querySelector('.tl-changes, [class*="change"]');
      const slot = document.querySelector('.time__slot');
      const head = slot.innerText.split('\n').slice(0,0);
      return {
        row: row ? row.innerText : '(none)',
      };
    });
    log('===== ' + y + ' =====\n' + txt.row);
  }
  await page.evaluate(() => { location.hash = '#year=1858'; });
  await page.waitForTimeout(700);
  await shot('y1858');
  await page.evaluate(() => { location.hash = '#year=1947'; });
  await page.waitForTimeout(700);
  await shot('y1947');
};
