/** p02r10/enlarge-hit.js — under reduced motion, clicking Barbados selects
 *  Lagos. Where is Barbados' DOM target, where is its mark, and what does the
 *  plate say is under that point? */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(1200);
  const read = async (tag) => {
    const r = await page.evaluate(() => {
      const m = window.BEA.map, el = document.querySelector('.map');
      const cv = document.querySelector('.map canvas').getBoundingClientRect();
      const n = [...document.querySelectorAll('.map__target')].find((e) => e.dataset.unit === 'barbados');
      const nr = n ? n.getBoundingClientRect() : null;
      const sc = m.plate.unitScreen('barbados');
      const cx = nr ? nr.x + nr.width / 2 : 0, cy = nr ? nr.y + nr.height / 2 : 0;
      const all = [...document.querySelectorAll('.map canvas')].map((c, i) => { const r = c.getBoundingClientRect();
        return i + ':' + (c.className || '?') + ' ' + Math.round(r.x) + ',' + Math.round(r.y) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' attr ' + c.width + 'x' + c.height; });
      const mapR = document.querySelector('.map').getBoundingClientRect();
      const frR = document.querySelector('.map__frame') ? document.querySelector('.map__frame').getBoundingClientRect() : null;
      return { canvases: all, mapRect: Math.round(mapR.x) + ',' + Math.round(mapR.y) + ' ' + Math.round(mapR.width) + 'x' + Math.round(mapR.height),
        frameRect: frR ? Math.round(frR.x) + ',' + Math.round(frR.y) + ' ' + Math.round(frR.width) + 'x' + Math.round(frR.height) : null,
        enlarged: el.classList.contains('is-enlarged'),
        canvas: { x: Math.round(cv.x), y: Math.round(cv.y), w: Math.round(cv.width), h: Math.round(cv.height) },
        plateWH: m.plate.w + 'x' + m.plate.h,
        target: nr ? { x: Math.round(nr.x), y: Math.round(nr.y), w: Math.round(nr.width), h: Math.round(nr.height) } : null,
        mark: sc ? { mx: Math.round(sc.mx), my: Math.round(sc.my) } : null,
        pickAtTargetCentre: m.pick(cx - cv.x, cy - cv.y),
        pickAtMark: sc ? m.pick(sc.mx, sc.my) : null };
    });
    log(tag + '  enlarged=' + r.enlarged + '  canvas ' + JSON.stringify(r.canvas) + '  plate ' + r.plateWH);
    log('     target ' + JSON.stringify(r.target) + '  mark ' + JSON.stringify(r.mark));
    log('     pick at target centre: ' + JSON.stringify(r.pickAtTargetCentre) + '   pick at mark: ' + JSON.stringify(r.pickAtMark));
    return r;
  };
  await read('cold');
  // the acceptance test selects six other places first; the sixth is Ascension
  for (const id of ['gibraltar', 'malta', 'ascension']) {
    await page.evaluate((uid) => { const n = [...document.querySelectorAll('.map__target')].find((e) => e.dataset.unit === uid); if (n) { n.focus(); n.click(); } }, id);
    await page.waitForTimeout(320);
  }
  await read('after three selections');
  await shot('state');
};
