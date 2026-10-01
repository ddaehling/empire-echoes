/**
 * p02r10/repro.js — round 2 of wave 5. Reproduce, with numbers, every map
 * defect the four critics named, before changing a line.
 *
 *  1. two names for one island at 2020 and 1992 (South Georgia / Isle of Georgia)
 *  2. the phone band at step 17: how much of it is the beat's own subject and
 *     how much is empty ocean
 *  3. labels that overlap or crowd on the same plate
 *  4. the map band, in a beat and cold, at this viewport
 */
const STEPS = [9, 17];

const probe = () => {
  const R = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect();
    return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  const M = window.__map;
  const plate = M.plate;
  const cam = plate.camera();
  const labels = plate.labelsDrawn.map((l) => ({ text: l.text, x: Math.round(l.x), y: Math.round(l.y) }));
  // where is the drawn land, in the band? sample the canvas by rows.
  const cv = document.querySelector('.map canvas');
  const g = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  let img = null;
  try { img = g.getImageData(0, 0, W, H); } catch (e) { img = null; }
  let rows = [], landPx = 0, seaPx = 0;
  if (img) {
    const D = img.data;
    // the sea tone: sample a pixel at the very top-left corner (always sea at world zoom)
    const bg = [D[0], D[1], D[2]];
    const step = Math.max(1, Math.floor(H / 24));
    for (let y = 0; y < H; y += step) {
      let land = 0, n = 0;
      for (let x = 0; x < W; x += 4) {
        const i = (y * W + x) * 4; n++;
        const dr = Math.abs(D[i] - bg[0]) + Math.abs(D[i + 1] - bg[1]) + Math.abs(D[i + 2] - bg[2]);
        if (dr > 18) land++;
      }
      rows.push(Math.round(100 * land / n));
      landPx += land; seaPx += n - land;
    }
  }
  return {
    vw: innerWidth, vh: innerHeight,
    dock: document.getElementById('app').dataset.dock,
    stageMap: R('.stage__map'), canvas: R('.map canvas'),
    view: { k: +plate.view.k.toFixed(3), x: +plate.view.x.toFixed(4), y: +plate.view.y.toFixed(4) },
    base: +cam.base.toFixed(4),
    worldSpanX: Math.round(cam.availW / cam.base), worldSpanY: Math.round(cam.availH / cam.base),
    labels, nLabels: labels.length,
    rowsLandPct: rows,
    landPct: landPx + seaPx ? Math.round(100 * landPx / (landPx + seaPx)) : 0,
    sel: [...(M.module.plate.selectedUnits || [])],
  };
};

module.exports = async ({ page, shot, log }) => {
  const base = page.url().split('#')[0];
  const ready = async () => {
    await page.waitForFunction(() => window.__map && window.__map.plate && window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1400);
  };

  /* ---- 1. one island, two names --------------------------------------- */
  for (const y of [2020, 1992, 1900]) {
    await page.goto(base + '#year=' + y, { waitUntil: 'load' });
    await ready();
    const r = await page.evaluate(() => {
      const M = window.__map;
      const labs = M.plate.labelsDrawn.map((l) => l.text);
      const geo = labs.filter((t) => /georgia/i.test(t));
      // ask the namer directly for every unit of the island territory
      const data = window.BEA.data;
      const t = data.byId.get('south-georgia-and-the-south-sandwich-islands');
      const units = (t && t.units) ? t.units.map((u) => (typeof u === 'string' ? u : u.id)) : [];
      const each = units.map((u) => ({ u, plate: M.module._plateName(u, M.plate.paint.get(u) || {}, window.BEA.store.getState().year) }));
      return { geo, units: each, n: labs.length };
    });
    log('year ' + y + '  labels with "Georgia": ' + JSON.stringify(r.geo) + '   per unit: ' + JSON.stringify(r.units));
  }

  /* ---- 2 + 3 + 4. the beats ------------------------------------------- */
  for (const st of STEPS) {
    await page.goto(base + '#tour=thirty&step=' + st, { waitUntil: 'load' });
    await ready();
    const r = await page.evaluate(probe);
    log('--- step ' + st + ' @' + r.vw + 'x' + r.vh + ' dock=' + r.dock);
    log('    stage__map ' + JSON.stringify(r.stageMap) + '  canvas ' + JSON.stringify(r.canvas));
    log('    view ' + JSON.stringify(r.view) + '  visible world span ' + r.worldSpanX + ' x ' + r.worldSpanY);
    log('    land % of the band: ' + r.landPct + '   by row (top->bottom): ' + r.rowsLandPct.join(','));
    log('    ' + r.nLabels + ' labels: ' + r.labels.map((l) => l.text + '@' + l.x + ',' + l.y).join(' | '));
    await shot('step' + st);
  }

  /* ---- cold plate ------------------------------------------------------ */
  await page.goto(base, { waitUntil: 'load' });
  await ready();
  const c = await page.evaluate(probe);
  log('--- cold  stage__map ' + JSON.stringify(c.stageMap) + '  canvas ' + JSON.stringify(c.canvas) + '  land ' + c.landPct + '%');
  await shot('cold');
};
