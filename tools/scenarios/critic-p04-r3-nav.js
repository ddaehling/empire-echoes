/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.scrollIntoViewIfNeeded: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1857&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const before = page.url();
  log('BEFORE:', before);
  const chip = page.locator('.dsr-chip', { hasText: 'The Bengal famine of 1770' }).first();
  await chip.scrollIntoViewIfNeeded();
  await chip.click();
  await page.waitForTimeout(1500);
  log('AFTER CHIP:', page.url());
  const head = await page.evaluate(() => document.querySelector('.app__dossier').innerText.slice(0,300).replace(/\n/g,' | '));
  log('HEAD:', head);
  await shot('after-chip');
  await page.goBack();
  await page.waitForTimeout(1500);
  log('AFTER BACK:', page.url());
  const head2 = await page.evaluate(() => document.querySelector('.app__dossier').innerText.slice(0,300).replace(/\n/g,' | '));
  log('HEAD2:', head2);
  await shot('after-back');
  // scroll position restored?
  const sc = await page.evaluate(() => document.querySelector('.app__dossier').scrollTop);
  log('scrollTop after back:', sc);
};
