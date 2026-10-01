/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.locator('text=Three things wrong with this rendering').first().click();
  await page.waitForTimeout(600);
  for (const l of ['status','tenure','mechanism','exit','informal','system','trade']) {
    await page.evaluate((L) => { location.hash = '#year=1900&layer=' + L; }, l);
    await page.waitForTimeout(1600);
    const t = await page.evaluate(() => {
      const b = document.querySelector('.byline');
      const lg = document.querySelector('.legend');
      return { byline: b ? b.innerText.replace(/\n+/g,' | ') : null, rule: lg ? lg.innerText.split('MARKS')[0].replace(/\n+/g,' | ') : null };
    });
    log('=== layer=' + l + ' ===\n' + JSON.stringify(t, null, 1));
  }
  await shot('layer-last');
};
