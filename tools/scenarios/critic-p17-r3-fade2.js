/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot set properties of null (setting 'scrollTop').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const ok = await page.evaluate(() => !!document.querySelector('.legend__bodywrap'));
  log('legend present: ' + ok);
  await shot('legend-default', '.legend');
  await page.evaluate(() => { const w=document.querySelector('.legend__bodywrap'); w.scrollTop = 500; });
  await page.waitForTimeout(500);
  const a = await page.evaluate(() => { const w=document.querySelector('.legend__bodywrap'); return { st: w.scrollTop, atEnd: w.getAttribute('data-at-end') }; });
  log('after scroll: ' + JSON.stringify(a));
  await shot('legend-scrolled2', '.legend');
};
