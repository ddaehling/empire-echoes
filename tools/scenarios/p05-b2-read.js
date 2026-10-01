/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p05-b2-read.js — the reading window against the content, per step, plus the map. */
const ROUTE = process.env.ROUTE || 'core';
const STEPS = (process.env.STEPS || '0,2,5,8,10').split(',').map(Number);

module.exports = async ({ page, shot, log }) => {
  for (const n of STEPS) {
    await page.goto('http://localhost:8777/app/#tour=' + ROUTE + '&step=' + n, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1700);
    const m = await page.evaluate(() => {
      const q = (s) => document.querySelector(s);
      const b = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y) }; };
      const sc = q('.tr-panel__scroll') || q('.cx-sheet__body');
      const map = q('.map.is-enlarged') || q('.stage__map canvas') || q('.stage__map svg');
      const tl = q('.app__time') || q('.tl') || q('.time');
      return {
        vp: innerWidth + 'x' + innerHeight,
        fit: document.documentElement.getAttribute('data-tour-fit'),
        read: (document.getElementById('app') || {}).dataset ? document.getElementById('app').dataset.read : null,
        rail: (document.getElementById('app') || {}).dataset ? document.getElementById('app').dataset.rail : null,
        kind: (window.BEA.tourStep && window.BEA.tourStep.kind) || null,
        title: (q('.cx-sheet__title') || {}).textContent,
        sheet: b(q('.app__sheet')),
        scroller: sc ? { h: Math.round(sc.clientHeight), content: sc.scrollHeight } : null,
        map: b(map), time: b(tl),
        screenfuls: sc && sc.clientHeight ? +(sc.scrollHeight / sc.clientHeight).toFixed(1) : null,
      };
    });
    log('step ' + n + ' ' + JSON.stringify(m));
    await shot('s' + n);
  }
};
