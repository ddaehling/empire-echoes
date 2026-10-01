/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.evaluate(() => { location.hash = '#year=1900&layer=exit'; });
  await page.waitForTimeout(1000);
  const probe = () => page.evaluate(() => {
    const out = [];
    const all = document.querySelectorAll('.legend, .legend--ribbon, .lsheet, #legend-byline');
    const seen = new Set();
    for (const root of all) {
      for (const n of root.querySelectorAll('button, a[href], [role="button"], input, select, summary')) {
        if (seen.has(n)) continue; seen.add(n);
        const b = n.getBoundingClientRect();
        if (!b.width || !b.height) continue;
        const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
        const top = document.elementFromPoint(cx, cy);
        out.push({
          cls: n.className.toString().slice(0, 46),
          w: Math.round(b.width), h: Math.round(b.height),
          hit: top === n || n.contains(top) ? 'self' : (top ? top.className.toString().slice(0, 30) : 'none'),
          aa: b.width >= 24 && b.height >= 24,
        });
      }
    }
    return out;
  });
  log('COLD CONTROLS ' + JSON.stringify(await probe()));
  await page.evaluate(() => window.BEA.legend.openPlate('colour'));
  await page.waitForTimeout(900);
  const withSheet = await probe();
  log('SHEET CONTROLS (' + withSheet.length + ') under 24px: ' + JSON.stringify(withSheet.filter(x => !x.aa)));
  log('SHEET CONTROLS occluded: ' + JSON.stringify(withSheet.filter(x => x.hit !== 'self')));
  await shot('sheet');
};
