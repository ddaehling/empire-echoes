/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await shot('cold-landing');
  // click on India area of the map
  const svg = await page.locator('#map svg, .map svg, svg').first();
  const box = await svg.boundingBox();
  log('svg box', JSON.stringify(box));
  // try clicking a unit element directly
  const unit = page.locator('[data-unit], .unit, path[data-id]').first();
  log('unit count', await page.locator('[data-unit], .unit, path[data-id]').count());
  try {
    await unit.click({ force: true });
    await page.waitForTimeout(1200);
    await shot('after-map-click');
    log('URL', page.url());
    log('DOSSIER', await page.evaluate(()=>document.querySelector('.app__dossier').innerText.slice(0,400).replace(/\n/g,' | ')));
  } catch(e) { log('click failed', e.message); }
};
