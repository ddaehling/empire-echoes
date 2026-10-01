/** p02r10/walk24.js — every beat of the authored path, for errors and for the
 *  band the map keeps at each one. */
module.exports = async ({ page, log }) => {
  const base = page.url().split('#')[0];
  let worst = 1e9, worstStep = 0, offMax = 0, offStep = 0;
  for (let st = 1; st <= 24; st++) {
    await page.goto(base + '#tour=thirty&step=' + st, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__map && window.__map.plate && window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
    await page.waitForTimeout(700);
    const r = await page.evaluate(() => {
      const P = window.__map.plate;
      const cv = document.querySelector('.map__plate').getBoundingClientRect();
      const sel = [...(P.selectedUnits || [])];
      const s = sel[0] ? P.unitScreen(sel[0]) : null;
      return { w: Math.round(cv.width), h: Math.round(cv.height), n: P.labelsDrawn.length,
        off: s ? Math.round(Math.abs(((s.y0 + s.y1) / 2) - cv.height / 2)) : 0 };
    });
    if (r.w * r.h < worst) { worst = r.w * r.h; worstStep = st; }
    if (r.off > offMax) { offMax = r.off; offStep = st; }
    log('step ' + String(st).padStart(2) + '  band ' + r.w + 'x' + r.h + '  ' + r.n + ' names  subject off centre ' + r.off + 'px');
  }
  log('smallest band: ' + worst + 'px2 at step ' + worstStep + '   worst off-centre: ' + offMax + 'px at step ' + offStep);
};
