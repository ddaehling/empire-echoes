/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'innerText').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.waitForTimeout(2600);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(700);
  log('T1 ' + JSON.stringify(await page.evaluate(() => {
    const m = window.BEA.map, T = m.module.tokens;
    const n = (c) => String(c || '').trim().toLowerCase();
    const bad = Object.entries(T.fills || {}).filter(([k, v]) => /^#(0{3}|0{6}|f{3}|f{6})$/i.test(n(v)) || n(v) === 'rgb(0, 0, 0)' || n(v) === 'rgb(255, 255, 255)');
    let drawn = 0, noCoast = 0;
    for (const [id, r] of m.plate.paint) { drawn++; if (r.mode === 'nostroke') noCoast++; }
    return { theme: document.documentElement.getAttribute('data-theme'), motion: document.documentElement.getAttribute('data-motion'),
      coast: T.coast, sea: T.sea, paper: T.paper, badFills: bad, drawn, noCoast, fills: T.fills };
  })));
  log('card ' + JSON.stringify(await page.evaluate(() => document.querySelector('.map__switchbody').innerText)));
  await shot('theme');
};
