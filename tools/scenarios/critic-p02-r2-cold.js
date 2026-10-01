/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const r = await page.evaluate(() => ({
    hash: location.hash,
    def: document.querySelector('.map')?.dataset.definition,
    proj: document.querySelector('.map')?.dataset.projection,
    plate: document.querySelector('.map__plate')?.getAttribute('aria-label'),
    targets: document.querySelectorAll('.map__target').length,
    switchText: document.querySelector('.map__switch')?.innerText,
    readout: document.querySelector('.map__card, .map__readout')?.innerText
  }));
  log(JSON.stringify(r, null, 1));
  await shot('cold');
};
