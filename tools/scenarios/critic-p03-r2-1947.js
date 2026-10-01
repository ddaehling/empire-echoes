/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  for (const y of [1946,1947,1948,1996,1997,1998,1962,1963]) {
    await page.evaluate((yy) => { location.hash = '#year=' + yy; }, y);
    await page.waitForTimeout(650);
    // expand all
    const btn = await page.$('button:has-text("more")');
    if (btn) await btn.click();
    await page.waitForTimeout(300);
    const row = await page.evaluate(() => {
      const r = document.querySelector('.tl-changes, [class*="change"]');
      return r ? r.innerText : '(none)';
    });
    log('===== ' + y + ' =====\n' + row);
  }
};
