/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('rm-landing');
  await page.locator('text=Three things wrong with this rendering').first().click();
  await page.waitForTimeout(700);
  await shot('rm-crit');
  await page.locator('.legend__entry').first().click();
  await page.waitForTimeout(700);
  await shot('rm-row');
  const anim = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.legend *, .byline *').forEach(e => {
      const cs = getComputedStyle(e);
      if (cs.transitionDuration !== '0s' && cs.transitionDuration !== '' ) out.push({ c: String(e.className).slice(0,40), td: cs.transitionDuration, ad: cs.animationDuration });
    });
    return out.slice(0, 12);
  });
  log('animated in reduced-motion: ' + JSON.stringify(anim));
};
