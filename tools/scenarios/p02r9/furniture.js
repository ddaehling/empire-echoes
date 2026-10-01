/**
 * p02r9/furniture.js — WHERE THE MAP'S OWN FURNITURE STANDS, and on what.
 *
 * Cold-loads into a lesson beat (the state a student is in for twenty-nine of
 * the lesson's thirty minutes), measures the drawn map, the zoom cluster and
 * the definition dial, and then names the TERRITORIES each control is drawn
 * over — from `.map__target`, which is one element per drawn unit, so "it only
 * covers sea" is a measurement and not an opinion.
 */
const STEP = process.env.P02_STEP || '9';
module.exports = async ({ page, shot, log }) => {
  await page.goto(page.url().split('#')[0] + '#tour=thirty&step=' + STEP, { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForFunction(() => { const e = window.BEA.registry.get('map'); return e && e.status === 'mounted' && e.mod.plate; }, null, { timeout: 30000 });
  await page.waitForTimeout(1800);

  const r = await page.evaluate(() => {
    const app = document.getElementById('app');
    const vis = (e) => { if (!e) return false; const c = getComputedStyle(e);
      if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0) return false;
      const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2; };
    const R = (e) => { if (!vis(e)) return null; const b = e.getBoundingClientRect();
      return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), r: Math.round(b.right), b: Math.round(b.bottom) }; };
    const box = (s) => R(document.querySelector(s));
    const clip = box('.stage__map');
    let drawn = null;
    for (const sel of ['.map.is-enlarged canvas', '.stage__map canvas']) {
      const n = document.querySelector(sel); if (!vis(n)) continue;
      const b = n.getBoundingClientRect();
      let x = b.left, y = b.top, rr = b.right, bb = b.bottom;
      const cn = document.querySelector('.stage__map');
      if (cn && !n.closest('.map.is-enlarged')) { const c = cn.getBoundingClientRect();
        x = Math.max(x, c.left); y = Math.max(y, c.top); rr = Math.min(rr, c.right); bb = Math.min(bb, c.bottom); }
      drawn = { x: Math.round(x), y: Math.round(y), w: Math.round(rr - x), h: Math.round(bb - y), r: Math.round(rr), b: Math.round(bb) };
      break;
    }
    const over = (rect) => {
      if (!rect) return [];
      const hits = [];
      for (const t of document.querySelectorAll('.map__target')) {
        const b = t.getBoundingClientRect();
        if (b.width < 1 || b.height < 1) continue;
        const w = Math.min(rect.r, b.right) - Math.max(rect.x, b.left);
        const h = Math.min(rect.b, b.bottom) - Math.max(rect.y, b.top);
        if (w > 0 && h > 0) hits.push({ id: t.id.replace('map-u-', ''), name: (t.getAttribute('aria-label') || '').slice(0, 46), px: Math.round(w * h) });
      }
      return hits.sort((a, b) => b.px - a.px).slice(0, 10);
    };
    const area = (a, b) => { if (!a || !b) return 0;
      const w = Math.min(a.r, b.r) - Math.max(a.x, b.x), h = Math.min(a.b, b.b) - Math.max(a.y, b.y);
      return w > 0 && h > 0 ? w * h : 0; };
    const zooms = box('.map__zooms'), foot = box('.map__foot'), sw = box('.map__switch');
    return {
      vw: innerWidth, vh: innerHeight,
      dock: app.dataset.dock, stage: app.dataset.stage, dockfoot: app.dataset.dockfoot, path: app.dataset.path,
      clip, drawn, zooms, foot, sw,
      key: box('.stage__key') || box('.legend__pin'),
      panel: box('.cx-sheet') || box('.app__sheet') || box('.rail__panel'),
      onZooms: over(zooms), onFoot: over(foot),
      coveredPx: area(drawn, zooms) + area(drawn, foot),
      zoomsParent: (document.querySelector('.map__zooms') || {}).parentElement ? document.querySelector('.map__zooms').parentElement.className : null,
      footParent: (document.querySelector('.map__foot') || {}).parentElement ? document.querySelector('.map__foot').parentElement.className : null,
    };
  });
  log(JSON.stringify(r, null, 1));
  await shot('beat' + STEP);
};
