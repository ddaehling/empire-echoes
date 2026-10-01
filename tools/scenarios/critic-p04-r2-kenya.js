/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2400);
  await shot('kenya-top');
  const body = await page.evaluate(() => document.querySelector('.dossier__body') || document.querySelector('.dossier'));
  const h = await page.evaluate(() => { const e = document.querySelector('.dossier__body'); return e ? [e.scrollHeight, e.clientHeight] : null; });
  log('scroll: ' + JSON.stringify(h));
  const steps = Math.ceil((h[0]-h[1]) / (h[1]*0.9));
  for (let i = 1; i <= Math.min(steps, 9); i++) {
    await page.evaluate((k) => { const e=document.querySelector('.dossier__body'); e.scrollTop = k * e.clientHeight * 0.9; }, i);
    await page.waitForTimeout(400);
    await shot('kenya-scroll-' + i);
  }
  log('FULL TEXT:\n' + (await page.evaluate(() => document.querySelector('.dossier').innerText)));
};
