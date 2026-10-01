/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(900);
  const t0 = Date.now();
  await page.goto(page.url().split('#')[0] + '#panel=evidence');
  await page.waitForFunction(() => document.querySelectorAll('.tp-led__rec').length > 800, null, { timeout: 20000 });
  log('first paint of 898 rows: ' + (Date.now() - t0) + 'ms (includes boot)');
  const m = await page.evaluate(() => {
    const out = {};
    const chip = [...document.querySelectorAll('.tp-chip')][0];
    let a = performance.now(); chip.click(); out.filter = Math.round(performance.now() - a);
    a = performance.now(); chip.click(); out.unfilter = Math.round(performance.now() - a);
    const sort = document.querySelector('.tp-led__sort');
    a = performance.now(); sort.click(); out.sort = Math.round(performance.now() - a);
    a = performance.now(); sort.click(); out.resort = Math.round(performance.now() - a);
    out.nodes = document.querySelectorAll('.tp *').length;
    return out;
  });
  log('SYNC COST ' + JSON.stringify(m));
  const nav = await page.evaluate(() => {
    const out = {};
    for (const id of ['workshop', 'classroom', 'methods', 'evidence']) {
      const a = performance.now();
      document.getElementById('tp-tab-' + id).click();
      out[id] = Math.round(performance.now() - a);
    }
    return out;
  });
  log('TAB SWITCH ' + JSON.stringify(nav));
};
