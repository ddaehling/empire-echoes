/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const yr = () => page.evaluate(() => document.querySelector('.time__slot').innerText.split('\n').filter(s=>/^\d{4}$/.test(s.trim()))[0]);
  await page.evaluate(() => { location.hash = '#year=1938'; });
  await page.waitForTimeout(700);
  // focus body then Space
  await page.evaluate(() => document.body.focus());
  await page.keyboard.press('Space');
  await page.waitForTimeout(1500);
  log('1.5s after Space:', await yr());
  await page.waitForTimeout(4000);
  log('5.5s after Space:', await yr());
  await shot('playing');
  const st = await page.evaluate(() => document.querySelector('.time__slot').innerText.slice(0,1500));
  log('slot while playing:\n'+st);
  await page.waitForTimeout(6000);
  log('11.5s:', await yr());
  await shot('stopped');
  log('slot now:\n'+await page.evaluate(() => document.querySelector('.time__slot').innerText.slice(0,1800)));
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);
  log('paused at:', await yr());
};
