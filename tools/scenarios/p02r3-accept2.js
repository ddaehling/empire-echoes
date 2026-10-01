/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const TINY = ['gibraltar','malta','ascension','barbados','ye-aden-colony','singapore','hk-hong-kong-island'];
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.__map && window.__map.plate && window.__map.plate.geom, null, { timeout: 25000 });
  await page.waitForTimeout(2600);

  // ---- T4 projection: Canada shrinks, nothing recolours, selection survives
  await page.evaluate(() => { window.BEA.store.dispatch('setYear', 1913); window.BEA.store.dispatch('select', 'canada'); });
  await page.waitForTimeout(700);
  const t4 = await page.evaluate(async () => {
    const M = window.__map;
    const box = (u) => { const s = M.unitScreen(u); return s ? s.w * s.h : null; };
    const sig = () => [...M.plate.paint.entries()].map(([u, r]) => u + ':' + (r.fill || r.mode)).join('|');
    const before = { nunavut: box('ca-nunavut'), ontario: box('ca-ontario'), sig: sig(), sel: window.BEA.store.getState().selectedTerritoryId };
    M.setProjection('equal-earth');
    await new Promise(r => setTimeout(r, 1400));
    const after = { nunavut: box('ca-nunavut'), ontario: box('ca-ontario'), sig: sig(), sel: window.BEA.store.getState().selectedTerritoryId, proj: M.projection };
    return {
      nunavutMercator: Math.round(before.nunavut), nunavutEqualEarth: Math.round(after.nunavut),
      ratio: +(after.nunavut / before.nunavut).toFixed(3),
      ontarioRatio: +(after.ontario / before.ontario).toFixed(3),
      coloursIdentical: before.sig === after.sig, selectionKept: before.sel === after.sel, proj: after.proj,
    };
  });
  log('T4 :: ' + JSON.stringify(t4));
  await shot('t4-equal-earth');

  // ---- T3 seven tiny units: click, focus, and what focus says
  await page.evaluate(() => { window.__map.setProjection('mercator'); window.BEA.store.dispatch('deselect'); });
  await page.waitForTimeout(1200);
  for (const id of TINY) {
    const r = await page.evaluate((uid) => {
      const M = window.__map; const s = M.unitScreen(uid); if (!s) return { uid, err: 'not drawn' };
      const box = M.module.el.getBoundingClientRect();
      return { uid, x: Math.round(box.left + s.mx), y: Math.round(box.top + s.my), moved: Math.round(Math.hypot(s.mx - s.px, s.my - s.py)) };
    }, id);
    if (r.err) { log('T3 ' + id + ' :: ' + r.err); continue; }
    await page.mouse.click(r.x, r.y);
    await page.waitForTimeout(320);
    const got = await page.evaluate((uid) => {
      const S = window.BEA.store.getState();
      const node = document.getElementById('map-u-' + uid);
      let focusOk = false, label = null;
      if (node) { node.focus(); focusOk = document.activeElement === node; label = node.getAttribute('aria-label'); }
      return { sel: S.selectedTerritoryId, focused: S.focusedUnitId, tab: node ? node.tabIndex : null, focusOk, label };
    }, id);
    log('T3 ' + id + ' click@' + r.x + ',' + r.y + ' moved=' + r.moved + ' :: ' + JSON.stringify(got));
  }
  await shot('t3');
};
