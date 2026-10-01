/**
 * p02r11/furniture.js — TWO OBJECTS, NEVER ONE PLACE.
 *
 * Walks the cold plate and eight beats and asserts, at whatever viewport it is
 * run at:
 *   P1  the definition row and the zoom cluster do not overlap (px2 = 0)
 *   P2  every segment of the "British means" dial is inside the plate and
 *       none of its four words is clipped (scrollWidth <= clientWidth + 1)
 *   P3  neither object stands outside the drawn map's rectangle
 *   P4  in the docked band nothing of this module's furniture is on the map
 * Prints PASS/FAIL and `>>> the furniture holds` / `>>> FURNITURE BROKEN`.
 */
const BEATS = [1, 5, 9, 12, 14, 17, 21, 24];

module.exports = async ({ page, shot, log }) => {
  const base = page.url().split('#')[0];
  const ready = async () => {
    await page.waitForFunction(() => window.__map && window.__map.plate && window.BEA
      && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1300);
  };
  const read = async () => page.evaluate(() => {
    const R = (e) => { const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    const vis = (s) => { const e = document.querySelector(s); if (!e) return null; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return null; const b = e.getBoundingClientRect(); return b.width > 2 && b.height > 2 ? R(e) : null; };
    const over = (a, b) => { if (!a || !b) return 0; const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x); const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y); return w > 0 && h > 0 ? Math.round(w * h) : 0; };
    const map = vis('.map__plate');
    const foot = vis('.map__foot'), zooms = vis('.map__zooms');
    const clipped = [];
    for (const d of document.querySelectorAll('.map__def, .map__defw, .map__switchttl')) {
      const cs = getComputedStyle(d);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (d.scrollWidth > d.clientWidth + 1) clipped.push((d.textContent || '').trim().slice(0, 30));
    }
    const app = document.getElementById('app');
    const outside = (r) => !r || !map ? 0 : (r.x < map.x - 2 || r.y < map.y - 2
      || r.x + r.w > map.x + map.w + 2 || r.y + r.h > map.y + map.h + 2) ? 1 : 0;
    return {
      dock: app.dataset.dock, map, foot, zooms,
      overlap: over(foot, zooms),
      onMap: app.dataset.dock === 'docked' ? over(foot, map) + over(zooms, map) : 0,
      clipped,
      footOut: app.dataset.dock === 'float' ? outside(foot) : 0,
      zoomOut: app.dataset.dock === 'float' ? outside(zooms) : 0,
      slots: (document.querySelector('.map__furniture') || {}).dataset || {},
    };
  });

  const fails = [];
  const check = async (name) => {
    const m = await read();
    const bad = [];
    if (m.overlap > 0) bad.push('P1 dial x zooms = ' + m.overlap + 'px2 ' + JSON.stringify(m.foot) + ' / ' + JSON.stringify(m.zooms));
    if (m.clipped.length) bad.push('P2 clipped: ' + JSON.stringify(m.clipped));
    if (m.footOut || m.zoomOut) bad.push('P3 outside the plate: foot=' + m.footOut + ' zooms=' + m.zoomOut);
    if (m.onMap > 0) bad.push('P4 docked band, furniture on the map = ' + m.onMap + 'px2');
    log((bad.length ? 'FAIL ' : 'PASS ') + name.padEnd(9)
      + ' dock=' + m.dock + ' map ' + (m.map ? m.map.w + 'x' + m.map.h : '-')
      + ' foot=' + (m.slots.footslot || '-') + '/' + (m.foot ? m.foot.w + 'x' + m.foot.h : 'none')
      + ' zoom=' + (m.slots.zoomslot || '-') + '/' + (m.zooms ? m.zooms.w + 'x' + m.zooms.h : 'none')
      + ' tight=' + (m.slots.tight || '-'));
    for (const b of bad) { log('        ' + b); fails.push(name + ': ' + b); }
  };

  await page.goto(base, { waitUntil: 'load' });
  await ready();
  await check('cold');
  await shot('cold');
  for (const s of BEATS) {
    await page.goto(base + '#tour=thirty&step=' + s, { waitUntil: 'load' });
    await ready();
    await check('beat' + s);
    if (s === 17 || s === 9) await shot('beat' + s);
  }
  log(fails.length ? '>>> FURNITURE BROKEN' : '>>> the furniture holds');
};
