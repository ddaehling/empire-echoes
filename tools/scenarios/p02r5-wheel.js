/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.waitForTimeout(2600);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(700);
  const before = await page.evaluate(() => {
    const m = window.BEA.map, s = m.unitScreen('in-uttar-pradesh') || m.unitScreen('bengal') || m.unitScreen('in-west-bengal');
    const f = document.querySelector('.map__frame').getBoundingClientRect();
    return s ? { px: s.px, py: s.py, vx: Math.round(f.left + s.px), vy: Math.round(f.top + s.py), f: { l: f.left, t: f.top } } : null;
  });
  log('before ' + JSON.stringify(before));
  await page.mouse.move(before.vx, before.vy);
  for (let i = 0; i < 5; i++) { await page.mouse.wheel(0, -240); await page.waitForTimeout(120); }
  await page.waitForTimeout(600);
  const after = await page.evaluate((b) => {
    const m = window.BEA.map, s = m.unitScreen('in-uttar-pradesh') || m.unitScreen('bengal') || m.unitScreen('in-west-bengal');
    return { k: m.plate.view.k, px: s ? Math.round(s.px) : null, py: s ? Math.round(s.py) : null,
      drift: s ? Math.round(Math.hypot(s.px - b.px, s.py - b.py)) : null };
  }, before);
  log('after ' + JSON.stringify(after));
  await shot('wheel');
  // dense-region hit test at a few marks
  log('dense ' + JSON.stringify(await page.evaluate(() => {
    window.BEA.map.home();
    const m = window.BEA.map;
    return ['us-florida','montserrat','antigua','st-kitts','in-gujarat','in-bihar','ye-perim','om-kuria-muria'].map(id => {
      const s = m.unitScreen(id);
      return { id, hasPos: !!s, pickAtMark: s ? m.pick(s.mx, s.my) : null, moved: s ? !!s.moved : null };
    });
  })));
};
