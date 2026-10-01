/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  for (const def of ['claimed','administered','controlled','influenced']) {
    await page.evaluate((d) => { location.hash = '#year=1913&def=' + d; }, def);
    await page.waitForTimeout(900);
    const tl = await page.evaluate(() => document.querySelector('.tl__count').innerText);
    const legend = await page.evaluate(() => {
      const e = document.querySelector('.legend, .stage__legend, .byline');
      return '';
    });
    const panelTxt = await page.evaluate(() => {
      const n = document.querySelector('.app__dossier');
      return n ? n.innerText.replace(/\n+/g,' | ').slice(0,400) : '';
    });
    const overlay = await page.evaluate(() => {
      const n = document.querySelector('.stage__over');
      return n ? n.innerText.replace(/\n+/g,' | ').slice(0,600) : '';
    });
    log('=== def=' + def + ' TL: ' + tl);
    log('   overlay: ' + overlay);
    await shot('def-' + def);
  }
  log('state def:', await page.evaluate(() => JSON.stringify(window.BEA.store.getState().definition ?? window.BEA.store.getState().def ?? Object.keys(window.BEA.store.getState()))));
};
