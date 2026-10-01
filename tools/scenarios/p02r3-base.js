/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.__map && window.__map.plate && window.__map.plate.geom, null, { timeout: 20000 });
  await page.waitForTimeout(2500);
  await shot('desktop');
  const info = await page.evaluate(() => {
    const m = window.__map;
    const r = m.module.el.getBoundingClientRect();
    return {
      plate: [Math.round(r.width), Math.round(r.height)],
      insets: m.plate.insets,
      definition: m.definition, projection: m.projection,
      measures: Object.fromEntries(Object.entries(m.measures).map(([k,v])=>[k,{units:v.units,km2:v.km2,terr:v.territories}])),
    };
  });
  log(JSON.stringify(info, null, 1));
  // where do the seven tiny units land, and what is on top of them?
  const probe = await page.evaluate(() => {
    const ids = ['gibraltar','malta','ascension','barbados','ye-aden-colony','singapore','hk-hong-kong-island'];
    const out = [];
    for (const id of ids) {
      const s = window.__map.unitScreen(id);
      if (!s) { out.push([id, 'no screen']); continue; }
      const r = window.__map.module.el.getBoundingClientRect();
      const x = Math.round(r.left + s.mx), y = Math.round(r.top + s.my);
      const top = document.elementFromPoint(x, y);
      out.push([id, Math.round(s.mx), Math.round(s.my), top ? (top.tagName + '.' + (top.className||'').toString().split(' ')[0]) : 'none', top && top.dataset ? top.dataset.unit||'' : '']);
    }
    return out;
  });
  log('TINY: ' + JSON.stringify(probe));
};
