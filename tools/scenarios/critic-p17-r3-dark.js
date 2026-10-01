/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('dark-landing');
  await shot('dark-legend', '.legend');
  await page.locator('text=Three things wrong with this rendering').first().click();
  await page.waitForTimeout(700);
  await shot('dark-crit');
  // contrast probe on legend text
  const c = await page.evaluate(() => {
    const out = [];
    ['.legend__title','.legend__rule-line','.legend__delta','.legend__entry','.byline__q','.legend__hint'].forEach(s => {
      const e = document.querySelector(s); if (!e) return;
      const cs = getComputedStyle(e); out.push({ s, color: cs.color, bg: cs.backgroundColor, fs: cs.fontSize });
    });
    const lg = document.querySelector('.legend'); out.push({ s: '.legend', bg: getComputedStyle(lg).backgroundColor });
    return out;
  });
  log(JSON.stringify(c, null, 1));
};
