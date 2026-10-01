/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  for (const L of ['status', 'control', 'system', 'exit', 'tenure']) {
    await page.evaluate((l) => { location.hash = '#year=1900&layer=' + l; }, L);
    await page.waitForTimeout(1100);
    const t = await page.evaluate(() => {
      const n = document.querySelector('#legend-byline');
      return n ? n.textContent.replace(/\s+/g, ' ').slice(0, 300) : '(byline not rendered at this width)';
    });
    log(L + ' :: ' + t);
  }
};
