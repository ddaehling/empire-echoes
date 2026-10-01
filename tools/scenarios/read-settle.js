/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  const seq = (process.env.SEQ || '14').split(',');
  for (const s of seq) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step=' + s, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
    const line = [];
    for (let i = 0; i < 14; i++) {
      await page.waitForTimeout(300);
      line.push(await page.evaluate(() => {
        const a = document.getElementById('app');
        const m = document.querySelector('.stage__map');
        return (a.dataset.read || '?')[0] + (document.querySelector('.tr-panel') ? 'P' : '-')
          + Math.round(m ? m.getBoundingClientRect().height : 0);
      }));
    }
    log('step ' + s + ': ' + line.join(' '));
  }
};
