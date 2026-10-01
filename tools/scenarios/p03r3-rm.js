/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForSelector('.tl', { timeout: 15000 });
  await page.waitForTimeout(800);
  const st = () => page.evaluate(() => {
    const p = document.querySelector('.tl').__p03;
    return { year: p.store.getState().year, playing: p.store.getState().playing, btn: (document.querySelector('.tl-btn--play')||{}).textContent,
      band: ((document.querySelector('.cx-lede__say')||{}).textContent||'').slice(0,70), stage: document.documentElement.dataset.stage };
  });
  log('cold: ' + JSON.stringify(await st()));
  await page.click('.tl-btn--play');
  await page.waitForTimeout(1200);
  log('press 1: ' + JSON.stringify(await st()));
  await page.click('.tl-btn--play');
  await page.waitForTimeout(1200);
  log('press 2: ' + JSON.stringify(await st()));
  await shot('reduced');
};
