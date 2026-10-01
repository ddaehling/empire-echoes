/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1400);
  await page.evaluate(() => { window.__sw = []; window.BEA.bus.on('chrome:sweep', (m) => window.__sw.push(JSON.parse(JSON.stringify(m||{})))); });
  const snap = async (t) => log(t + ' ' + JSON.stringify(await page.evaluate(() => ({
    year: window.BEA.store.getState().year,
    playing: window.BEA.store.getState().playing,
    stage: document.documentElement.dataset.stage,
    cta: (() => { const c = document.querySelector('.cx-cta'); return c ? (c.hidden ? 'HIDDEN' : c.textContent.trim()) : 'none'; })(),
    say: (document.querySelector('.cx-lede__say')||{}).textContent,
    sw: window.__sw,
  }))));
  await snap('before');
  await page.click('.tl-btn--play');
  await page.waitForTimeout(900); await snap('t+0.9');
  await page.waitForTimeout(3000); await snap('t+3.9');
  await page.waitForTimeout(27000); await snap('t+31');
  await shot('end');
};
