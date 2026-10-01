/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913&def=controlled', { waitUntil: 'domcontentloaded' });
  log('hash at DCL:', await page.evaluate(() => location.hash));
  await page.waitForTimeout(600);
  log('hash +600ms:', await page.evaluate(() => location.hash));
  await page.waitForTimeout(2600);
  log('hash +3.2s:', await page.evaluate(() => location.hash));
  log('drawn:', await page.evaluate(() => (document.body.innerText.match(/DRAWN NOW\s+(\w+)/)||[])[1]));
  await shot('deep-controlled');
};
