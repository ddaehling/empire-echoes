/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* T1 (coastlines + no #000/#fff fills, both themes) and T3 (the seven small places). */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.goto('http://localhost:8777/app/#year=1913', { waitUntil: 'load' });
  await page.waitForTimeout(3200);
  if (process.env.T13_W) { await page.setViewportSize({ width: +process.env.T13_W, height: +process.env.T13_H }); await page.waitForTimeout(900); }

  const SEVEN = ['gibraltar', 'malta', 'ascension', 'barbados', 'ye-aden-colony', 'singapore', 'hk-hong-kong-island'];

  /* T3a — a real mouse click on each of the seven, at the mark the eye sees */
  const clickOne = async (uid) => {
    // Deselect FIRST and let the dossier finish closing: it resizes the plate,
    // and a coordinate read before that is a coordinate for the old layout.
    await page.evaluate(() => window.BEA.store.dispatch('deselect'));
    await page.waitForTimeout(450);
    const p = await page.evaluate((u) => {
      const s = window.__map.unitScreen(u); if (!s) return null;
      const r = document.querySelector('.map__plate').getBoundingClientRect();
      const X = r.x + s.mx, Y = r.y + s.my;
      const top = document.elementFromPoint(X, Y);
      return { x: X, y: Y, moved: s.moved, tiny: s.tiny, top: top ? (top.className || top.tagName) : null };
    }, uid);
    if (!p) return { uid, err: 'no geometry' };
    await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.waitForTimeout(40); await page.mouse.up();
    await page.waitForTimeout(320);
    const got = await page.evaluate((u) => ({ sel: window.BEA.store.getState().selectedTerritoryId, hit: window.__map.pick(...(function () { const s = window.__map.unitScreen(u); return [s.mx, s.my]; })()) }), uid);
    return { uid, tiny: p.tiny, moved: p.moved, top: p.top, picked: got.hit, selected: got.sel };
  };
  for (const u of SEVEN) log('T3 click', JSON.stringify(await clickOne(u)));

  /* T3b — keyboard focus + the words it reads */
  const kb = await page.evaluate((ids) => ids.map((u) => {
    const n = document.getElementById('map-u-' + u);
    if (!n) return u + ' => NO TARGET';
    n.focus();
    const r = n.getBoundingClientRect();
    return u + ' => ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' focus=' + (document.activeElement === n) + ' | ' + n.getAttribute('aria-label');
  }), SEVEN);
  log('T3 keyboard', JSON.stringify(kb, null, 1));

  /* T1 — coastline + fill audit, both themes */
  const audit = async (theme) => {
    await page.evaluate((t) => window.BEA.store.dispatch('setTheme', t), theme);
    await page.waitForTimeout(500);
    return page.evaluate(() => {
      const m = window.__map, T = m.plate.tokens;
      const bad = [];
      const isBW = (c) => { const s = String(c || '').toLowerCase().replace(/\s/g, ''); return /#(000000|fff|ffffff|000)$/.test(s) || s === 'rgb(0,0,0)' || s === 'rgb(255,255,255)'; };
      for (const k of Object.keys(T.fills)) if (isBW(T.fills[k])) bad.push(k + '=' + T.fills[k]);
      // sample the canvas: is there a coast-coloured hairline around a big unit?
      const c = m.plate.canvas.getContext('2d');
      const s = m.unitScreen('india' in {} ? 'india' : 'in-west-bengal');
      return { theme: document.documentElement.dataset.theme, coast: T.coast, sea: T.sea, paper: T.paper, badFills: bad, fillCount: Object.keys(T.fills).length, drawn: m.plate.paint.size };
    });
  };
  log('T1 paper', JSON.stringify(await audit('paper')));
  await shot('01-paper');
  log('T1 lamplit', JSON.stringify(await audit('lamplit')));
  await shot('02-lamplit');
  await page.evaluate(() => window.BEA.store.dispatch('setTheme', 'paper'));

  /* T4b — reduced motion is a cross-fade, not a tween */
  await page.evaluate(() => window.BEA.store.dispatch('setReducedMotion', 'reduced'));
  await page.waitForTimeout(300);
  const rm = await page.evaluate(async () => {
    const m = window.__map;
    const before = m.projection;
    const samples = [];
    const t0 = performance.now();
    const iv = setInterval(() => samples.push(+m.plate.t.toFixed(2)), 30);
    m.setProjection(before === 'mercator' ? 'equal-earth' : 'mercator');
    await new Promise(r => setTimeout(r, 900));
    clearInterval(iv);
    return { before, after: m.projection, tweened: samples.some(v => v > 0 && v < 1), samples: samples.slice(0, 8), fadeUsed: !!document.querySelector('.map__fade') };
  });
  log('T4 reduced-motion', JSON.stringify(rm));
  log('errors', JSON.stringify(errs));
};
