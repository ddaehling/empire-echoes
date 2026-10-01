/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p05-b2-mapsize.js — the drawn map, cold and inside a beat of each kind. */
module.exports = async ({ page, log }) => {
  const rows = [];
  const m = () => page.evaluate(() => {
    const e = document.querySelector('.map.is-enlarged') || document.querySelector('.stage__map canvas') || document.querySelector('.stage__map svg');
    const r = e ? e.getBoundingClientRect() : null;
    const sh = document.querySelector('.app__sheet');
    return { vp: innerWidth + 'x' + innerHeight, read: document.getElementById('app').dataset.read || 'n/a',
      fit: document.documentElement.getAttribute('data-tour-fit'),
      map: r ? Math.round(r.width) + 'x' + Math.round(r.height) : 'none',
      pct: r ? +(100 * r.height / innerHeight).toFixed(1) : 0,
      sheet: sh ? Math.round(sh.getBoundingClientRect().height) : 0 };
  });
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  rows.push(['cold plate', await m()]);
  for (const [name, step] of [['poster (map beat)', 0], ['revenue-loop (text beat)', 6], ['two-in-tension / Amritsar', 11]]) {
    await page.goto('http://localhost:8777/app/#tour=core&step=' + step, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1800);
    rows.push([name, await m()]);
  }
  for (const [n, r] of rows) log(n.padEnd(26) + ' ' + JSON.stringify(r));
};
