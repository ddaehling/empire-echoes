/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2600);
  const m = () => page.evaluate(() => ({ modes: [...document.querySelectorAll('.map__mode')].map(n=>n.innerText.replace(/\s+/g,' ')),
    mapW: Math.round(document.querySelector('.stage__map').getBoundingClientRect().width) }));
  log('closed ' + JSON.stringify(await m()));
  await page.evaluate(() => window.BEA.legend.openPlate('colour')); await page.waitForTimeout(900);
  log('open   ' + JSON.stringify(await m()));
  for (const w of ['34rem','30rem','26rem']) {
    await page.evaluate(ww => document.documentElement.style.setProperty('--lplate-w', ww), w);
    await page.waitForTimeout(700);
    log(w + ' ' + JSON.stringify(await m()));
  }
};
