/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const { fixGrid } = require('./critic-p04-r4-lib.js');
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1500);
  await page.evaluate(() => { location.hash = '#year=1765&sel=bengal-presidency'; });
  await page.waitForTimeout(1500);
  await fixGrid(page, log);
  log('hash before:', await page.evaluate(()=>location.hash));
  const chip = page.locator('#dossier a, #dossier button').filter({ hasText: 'British India, 1765' }).first();
  log('chip matches:', await chip.count());
  if (await chip.count()) {
    await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(200);
    await shot('chip-before');
    await chip.click(); await page.waitForTimeout(1400);
    log('hash after chip:', await page.evaluate(()=>location.hash));
    const head = await page.evaluate(()=>document.querySelector('#dossier').innerText.slice(0,420).replace(/\n+/g,' | '));
    log('dossier after chip:', head);
    await shot('chip-after');
    await page.goBack(); await page.waitForTimeout(1400);
    log('hash after back:', await page.evaluate(()=>location.hash));
    const head2 = await page.evaluate(()=>document.querySelector('#dossier').innerText.slice(0,300).replace(/\n+/g,' | '));
    log('dossier after back:', head2);
    await shot('chip-back');
  }
};
