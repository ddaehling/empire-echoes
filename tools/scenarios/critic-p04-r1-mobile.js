/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2200);
  await page.evaluate(() => { location.hash = '#year=1913&sel=bengal-presidency'; });
  await page.waitForTimeout(1400);
  await shot('mobile-top');
  const g = await page.evaluate(() => { const h=document.querySelector('.app__dossier');
    return { sh:h.scrollHeight, ch:h.clientHeight, open: document.querySelector('.app').dataset.dossier }; });
  log('mobile dossier ' + JSON.stringify(g));
  await page.evaluate(() => { document.querySelector('.app__dossier').scrollTop = 1200; });
  await page.waitForTimeout(400);
  await shot('mobile-scrolled');
  await page.evaluate(() => { const h=document.querySelector('.app__dossier'); h.scrollTop = h.scrollHeight; });
  await page.waitForTimeout(400);
  await shot('mobile-bottom');
};
