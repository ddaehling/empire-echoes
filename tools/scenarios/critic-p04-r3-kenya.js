/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1964&sel=kenya', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  await shot('kenya-1964');
  await shot('kenya-1964-panel', '.app__dossier');
  const t = await page.evaluate(() => document.querySelector('.app__dossier').innerText.slice(0, 1600));
  log('TEXT:\n' + t);
};
