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
  await page.waitForTimeout(2800);
  let pass = 0;
  for (const id of TINY) {
    const r = await page.evaluate((uid) => {
      const M = window.__map; const s = M.unitScreen(uid); if (!s) return { err: 'not drawn' };
      const box = M.module.el.getBoundingClientRect();
      return { x: Math.round(box.left + s.mx), y: Math.round(box.top + s.my),
        inPlate: s.mx > 0 && s.my > 0 && s.mx < box.width && s.my < box.height,
        moved: Math.round(Math.hypot(s.mx - s.px, s.my - s.py)) };
    }, id);
    if (r.err) { log('T3 ' + id + ' :: ' + r.err); continue; }
    await page.mouse.click(r.x, r.y);
    await page.waitForTimeout(300);
    const got = await page.evaluate((uid) => {
      const S = window.BEA.store.getState();
      const node = document.getElementById('map-u-' + uid);
      let focusOk = false, label = null;
      if (node) { node.focus(); focusOk = document.activeElement === node; label = node.getAttribute('aria-label'); }
      return { sel: S.selectedTerritoryId, hover: S.hoveredUnitId, focused: S.focusedUnitId, focusOk, label };
    }, id);
    const ok = got.focused === id && got.focusOk && /Control degree/.test(got.label || '');
    if (ok && got.sel) pass++;
    log('T3 ' + id + ' @' + r.x + ',' + r.y + ' inPlate=' + r.inPlate + ' moved=' + r.moved
      + ' -> selected=' + got.sel + ' focused=' + got.focused + ' focusable=' + got.focusOk);
    log('     label: ' + got.label);
  }
  log('T3 PASSED ' + pass + '/7');
  // keyboard: arrow-walk from one tiny unit to another
  await page.evaluate(() => document.getElementById('map-u-gibraltar').focus());
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(250);
  log('T3 keyboard ArrowRight from Gibraltar -> ' + await page.evaluate(() => window.BEA.store.getState().focusedUnitId));
  await shot('t3');
  // projection round trip must leave the view where it was
  const rt = await page.evaluate(async () => {
    const M = window.__map;
    const v0 = { ...M.plate.view };
    M.setProjection('equal-earth'); await new Promise(r => setTimeout(r, 1200));
    M.setProjection('mercator'); await new Promise(r => setTimeout(r, 1200));
    const v1 = { ...M.plate.view };
    const g = M.unitScreen('gibraltar');
    return { v0, v1, gib: g && [Math.round(g.mx), Math.round(g.my)] };
  });
  log('T3 projection round trip :: ' + JSON.stringify(rt));
};
