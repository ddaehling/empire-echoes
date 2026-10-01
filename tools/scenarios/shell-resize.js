/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* shell-resize.js — cross the rail bands live, with a territory open, and check
   the shell re-measures every time rather than only on load. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 25000 });
  await page.waitForTimeout(1400);
  await page.evaluate(() => { window.BEA.store.dispatch('select', 'barbados'); window.BEA.store.flush(); });
  await page.waitForTimeout(1200);
  const read = () => page.evaluate(() => {
    const app = document.getElementById('app');
    const R = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect();
      const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return null;
      return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: Math.round(r.width), h: Math.round(r.height) }; };
    const map = R('.stage__map canvas') || R('.stage__map svg') || R('.map.is-enlarged') || R('.stage__map');
    const d = R('.app__dossier');
    const area = (a, b) => (!a || !b) ? 0 : Math.round(Math.max(0, Math.min(a.r,b.r)-Math.max(a.l,b.l)) * Math.max(0, Math.min(a.b,b.b)-Math.max(a.t,b.t)));
    return { vp: innerWidth + 'x' + innerHeight, rail: app.dataset.rail,
      stageTop: app.style.getPropertyValue('--stage-top'), railTopMin: app.style.getPropertyValue('--rail-top-min'),
      map: map ? map.w + 'x' + map.h : null, dossier: d ? d.w + 'x' + d.h : null,
      overlap: area(d, map), scrollOver: document.documentElement.scrollHeight - innerHeight };
  });
  for (const [w, h] of [[1366,768],[900,700],[768,1024],[390,844],[1024,600],[1440,900]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(1200);
    log(w + 'x' + h + '  ' + JSON.stringify(await read()));
  }
  await shot('after-resizes');
};
