/** p02r10/bands.js — the map's rectangle, cold and inside beat 17, and what it
 *  draws there: the plate rect, the drawn canvas, the fill of the rectangle,
 *  the number of names, and the subject's share of the band. */
module.exports = async ({ page, shot, log }) => {
  const base = page.url().split('#')[0];
  const read = async () => page.evaluate(() => {
    const M = window.__map, P = M.plate;
    const st = document.querySelector('.stage__map').getBoundingClientRect();
    const cv = document.querySelector('.map__plate').getBoundingClientRect();
    const sel = [...(P.selectedUnits || [])];
    const s = sel[0] ? P.unitScreen(sel[0]) : null;
    return {
      stage: Math.round(st.width) + 'x' + Math.round(st.height),
      canvas: Math.round(cv.width) + 'x' + Math.round(cv.height),
      fill: Math.round(100 * (cv.width * cv.height) / (st.width * st.height)),
      labels: P.labelsDrawn.length, k: +P.view.k.toFixed(2),
      subject: sel[0] || null,
      subjPct: s ? Math.round(100 * s.h / cv.height) : null,
      offY: s ? Math.round(((s.y0 + s.y1) / 2) - cv.height / 2) : null,
      dock: document.getElementById('app').dataset.dock,
    };
  });
  await page.waitForFunction(() => window.__map && window.__map.plate && window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForTimeout(1500);
  const cold = await read();
  log('COLD   stage ' + cold.stage + '  drawn ' + cold.canvas + '  ' + cold.fill + '% of the rectangle  ' + cold.labels + ' names  dock=' + cold.dock);
  await shot('cold');
  await page.goto(base + '#tour=thirty&step=17', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__map && window.__map.plate && window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForTimeout(1600);
  const beat = await read();
  log('BEAT17 stage ' + beat.stage + '  drawn ' + beat.canvas + '  ' + beat.fill + '% of the rectangle  ' + beat.labels + ' names  k=' + beat.k
    + '  subject ' + beat.subject + ' = ' + beat.subjPct + '% of the band height, centre off by ' + beat.offY + 'px');
  await shot('beat17');
};
