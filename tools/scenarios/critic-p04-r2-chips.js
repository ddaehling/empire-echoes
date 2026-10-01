/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2200);
  const chips = await page.$$('.dsr-chip');
  log('chip count at india/1913: ' + chips.length);
  const info = await page.evaluate(() => [...document.querySelectorAll('.dsr-chip')].map(c => ({txt:c.innerText.replace(/\n/g,' | '), tgt:c.dataset.target, ty:c.dataset.targetYear})));
  log('CHIPS ' + JSON.stringify(info, null, 1));
  if (chips.length) {
    const before = page.url();
    // scroll into view and click the first chip
    await page.evaluate(() => document.querySelector('.dsr-chip').scrollIntoView({block:'center'}));
    await page.waitForTimeout(300);
    await shot('before-chip');
    await page.click('.dsr-chip');
    await page.waitForTimeout(1200);
    log('URL before: ' + before);
    log('URL after : ' + page.url());
    const after = await page.evaluate(() => {
      const el = document.querySelector('.dossier');
      return el ? el.innerText.slice(0, 700) : 'none';
    });
    log('AFTER TEXT:\n' + after);
    await shot('after-chip');
    await page.goBack();
    await page.waitForTimeout(1200);
    log('URL after back: ' + page.url());
    log('BACK TEXT:\n' + (await page.evaluate(() => (document.querySelector('.dossier')||{innerText:'none'}).innerText.slice(0,400))));
    await shot('after-back');
  }
};
