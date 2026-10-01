/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForSelector('.tl', { timeout: 15000 });
  await page.waitForTimeout(900);
  const snap = () => page.evaluate(() => ({
    year: (document.querySelector('.tl__year') || {}).textContent,
    playing: !!(document.querySelector('.tl-btn--play') || {}).dataset,
    cta: (() => { const c = document.querySelector('.cx-cta'); return c && !c.hidden ? c.textContent : null; })(),
    band: ((document.querySelector('.cx-lede__say') || {}).textContent || '').slice(0, 80),
    stage: document.documentElement.dataset.stage,
    sheet: document.getElementById('app').dataset.sheet || 'none',
  }));
  log('cold: ' + JSON.stringify(await snap()));
  const t0 = Date.now();
  await page.click('.tl-btn--play');            // first Play = the sweep
  await page.waitForTimeout(2500);
  log('t+2.5s: ' + JSON.stringify(await snap()));
  await page.waitForTimeout(8000);
  log('t+10.5s: ' + JSON.stringify(await snap()));
  await shot('mid-sweep');
  // wait for it to end (30s total)
  await page.waitForFunction(() => !document.querySelector('.cx-cta') || !/Stop/.test(document.querySelector('.cx-cta').textContent), { timeout: 40000 }).catch(() => {});
  await page.waitForTimeout(1200);
  log(`ended after ${Math.round((Date.now() - t0) / 1000)}s: ` + JSON.stringify(await snap()));
  await shot('after-sweep');
  // second Play must be real playback, not another sweep
  await page.click('.tl-btn--play');
  await page.waitForTimeout(2500);
  log('second Play: ' + JSON.stringify(await snap()));
  await page.click('.tl-btn--play');
};
