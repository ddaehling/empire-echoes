/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.route('**/legend.css*', (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '/* p17 neutralised */' }));
  await page.goto('http://localhost:8777/app/#tour=thirty&step=3', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2200);
  const r = await page.evaluate(() => {
    const n = [...document.querySelectorAll('.app__foot .cx-more')][0];
    if (!n) return { none: true };
    const b = n.getBoundingClientRect(); const f = n.closest('.app__foot').getBoundingClientRect();
    return { above: Math.round(f.y - b.y), h: Math.round(b.height), footH: Math.round(f.height), legendCss: [...document.styleSheets].filter(s => /legend\.css/.test(s.href || '')).map(s => s.cssRules.length) };
  });
  log('legend.css served empty: ' + JSON.stringify(r));
};
