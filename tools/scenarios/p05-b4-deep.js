/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  for (const a of ['#tour=thirty&step=17','#tour=thirty&step=16','#tour=core&step=10','#tour=thirty&step=6']) {
    await page.goto('http://localhost:8777/app/' + a, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => {
      const st = window.BEA.store.getState();
      const q = (s) => document.querySelector(s);
      return { tourStep: st.tourStep, tour: st.activeTour, hash: location.hash,
        title: (q('.cx-sheet__title')||{}).textContent,
        count: (q('.tr-bar__count')||{}).textContent,
        panel: q('.tr-panel') ? q('.tr-panel').dataset.beat : null };
    });
    log(a + ' -> ' + JSON.stringify(r));
  }
};
