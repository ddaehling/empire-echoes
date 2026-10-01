/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getAttribute').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const a = await page.evaluate(() => {
    const w = document.querySelector('.legend__bodywrap');
    return { atEnd: w.getAttribute('data-at-end'), mask: getComputedStyle(w).maskImage || getComputedStyle(w).webkitMaskImage,
      sbW: w.offsetWidth - w.clientWidth, tight: document.querySelector('.legend').getAttribute('data-tight') || document.documentElement.getAttribute('data-tight') };
  });
  log('FADE: ' + JSON.stringify(a));
  // crop the bottom of the legend
  const b = await page.locator('.legend').boundingBox();
  await page.screenshot({ path: require('path').join(process.env.SHOT_DIR || '/tmp', 'x.png') }).catch(()=>{});
  await shot('legend-bottom');
  await page.evaluate(() => { const w=document.querySelector('.legend__bodywrap'); w.scrollTop = 400; });
  await page.waitForTimeout(400);
  await shot('legend-scrolled', '.legend');
};
