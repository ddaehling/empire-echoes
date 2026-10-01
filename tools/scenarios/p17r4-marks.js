/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 4 — charge 7: the three marks that are not colours, in every state. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForTimeout(2600);
  const chips = () => page.evaluate(() => [...document.querySelectorAll('.legend__chips .legend__chip')]
    .map(c => ({ t: c.innerText.replace(/\s+/g,' '), idle: c.dataset.idle || 'false' })));
  const marksRows = () => page.evaluate(() => [...document.querySelectorAll('.lplate__col--b .legend__rows--marks > li')]
    .map(li => li.innerText.replace(/\s+/g,' ').slice(0, 150)));

  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1200));
  await page.waitForTimeout(700);
  log('1200 chips:', JSON.stringify(await chips()));
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1900));
  await page.waitForTimeout(700);
  log('1900 chips:', JSON.stringify(await chips()));
  await page.keyboard.press('w');
  await page.waitForTimeout(1000);
  log('after W chips:', JSON.stringify(await chips()));
  await page.keyboard.press('w');
  await page.waitForTimeout(700);
  await page.keyboard.press('h');
  await page.waitForTimeout(1000);
  log('after H chips:', JSON.stringify(await chips()));
  await page.evaluate(() => window.BEA.legend.openPlate('marks'));
  await page.waitForTimeout(800);
  log('marks rows with H on:', JSON.stringify(await marksRows(), null, 1));
  await shot('marks');
};
