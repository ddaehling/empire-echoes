/**
 * p02r9/walk.js — walk the authored path and report, beat by beat, how much
 * DRAWN TERRITORY each of this module's floating controls is standing on, and
 * which territories they are. "It only covers sea" becomes a measurement.
 */
const STEPS = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23];
module.exports = async ({ page, shot, log }) => {
  const base = page.url().split('#')[0];
  let worst = 0, worstStep = 0;
  for (const st of STEPS) {
    await page.goto(base + '#tour=thirty&step=' + st, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => {
      const vis = (e) => { if (!e) return false; const c = getComputedStyle(e);
        if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0) return false;
        const b = e.getBoundingClientRect(); return b.width > 2 && b.height > 2; };
      const R = (s) => { const e = document.querySelector(s); if (!vis(e)) return null;
        const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, r: b.right, b: b.bottom }; };
      const on = (box) => { if (!box) return { px: 0, who: [] };
        let px = 0; const who = [];
        for (const t of document.querySelectorAll('.map__target')) {
          const b = t.getBoundingClientRect();
          if (b.width < 1) continue;
          const w = Math.min(box.r, b.right) - Math.max(box.x, b.left);
          const h = Math.min(box.b, b.bottom) - Math.max(box.y, b.top);
          if (w > 0 && h > 0) { px += w * h; who.push(t.id.replace('map-u-', '')); }
        }
        return { px: Math.round(px), who: who.slice(0, 6) };
      };
      const f = R('.map__foot'), z = R('.map__zooms');
      const fur = document.querySelector('.map__furniture');
      return { dock: document.getElementById('app').dataset.dock,
        foot: on(f), zooms: on(z),
        slots: fur ? (fur.dataset.footslot || '-') + '/' + (fur.dataset.zoomslot || '-') + (fur.dataset.tight === 'yes' ? ' TIGHT' : '') + ' lift' + (fur.style.getPropertyValue('--map-foot-lift') || '0px') : '-' };
    });
    const tot = r.foot.px + r.zooms.px;
    if (tot > worst) { worst = tot; worstStep = st; }
    log('step ' + String(st).padStart(2) + '  dock=' + r.dock + '  slots ' + r.slots
      + '  on the dial: ' + r.foot.px + 'px2 ' + JSON.stringify(r.foot.who)
      + '  on the zooms: ' + r.zooms.px + 'px2 ' + JSON.stringify(r.zooms.who));
    if (st === 9 || st === 13) await shot('step' + st);
  }
  log('WORST: ' + worst + ' px2 of drawn territory under this module, at step ' + worstStep);
};
