/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.waitForTimeout(2800);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(800);
  const ids = ['gibraltar','malta','ascension','barbados','ye-aden-colony','singapore','hk-hong-kong-island'];
  const out = [];
  for (const id of ids) {
    const p = await page.evaluate((uid) => {
      const m = window.BEA.map, s = m.unitScreen(uid);
      if (!s) return null;
      const f = document.querySelector('.map__frame').getBoundingClientRect();
      const x = Math.round(f.left + s.mx), y = Math.round(f.top + s.my);
      const top = document.elementFromPoint(x, y);
      return { x, y, top: top ? (String(top.className) || top.tagName) : null };
    }, id);
    if (!p) { out.push({ id, ok: false, why: 'no screen position' }); continue; }
    await page.mouse.click(p.x, p.y);
    await page.waitForTimeout(450);
    const st = await page.evaluate(() => ({ sel: window.BEA.store.getState().selectedTerritoryId, focus: window.BEA.store.getState().focusedUnitId }));
    out.push({ id, at: [p.x, p.y], topEl: p.top, sel: st.sel, focusedUnit: st.focus, ok: st.focus === id });
  }
  log('T3 clicks ' + JSON.stringify(out, null, 1));
  // keyboard: focus each target and read its label
  const kb = await page.evaluate(async (ids) => {
    const res = [];
    for (const id of ids) {
      const t = document.querySelector('.map__target[data-unit="' + id + '"]');
      if (!t) { res.push({ id, focusable: false }); continue; }
      t.focus();
      await new Promise(r => setTimeout(r, 60));
      const lab = t.getAttribute('aria-label') || '';
      res.push({ id, focusable: document.activeElement === t, label: lab,
        hasName: /\w/.test(lab), hasDegree: /control degree \d of 5/i.test(lab),
        hasStatus: lab.split('.').length > 2 });
    }
    return res;
  }, ids);
  log('T3 keyboard ' + JSON.stringify(kb, null, 1));
  await shot('t3');
};
