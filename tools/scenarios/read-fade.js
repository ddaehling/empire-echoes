/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=18', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForTimeout(2000);
  await page.evaluate(() => { document.querySelector('.tr-panel__scroll').scrollTop = 700; });
  await page.waitForTimeout(500);
  log(await page.evaluate(() => {
    const s = document.querySelector('.tr-panel__scroll');
    return 'scroll ' + s.scrollTop + ' of ' + (s.scrollHeight - s.clientHeight) + ', window ' + Math.round(s.getBoundingClientRect().height);
  }));
  await shot('mid-scroll');
};
