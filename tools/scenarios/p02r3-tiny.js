/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const IDS = ['gibraltar','malta','ascension','barbados','ye-aden-colony','singapore','hk-hong-kong-island'];
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.__map && window.__map.plate && window.__map.plate.geom, null, { timeout: 20000 });
  await page.waitForTimeout(2800);
  const probe = await page.evaluate((ids) => {
    const m = window.__map;
    const r = m.module.el.getBoundingClientRect();
    const out = [];
    for (const id of ids) {
      const s = m.unitScreen(id);
      if (!s) { out.push({ id, err: 'no screen' }); continue; }
      const x = Math.round(r.left + s.mx), y = Math.round(r.top + s.my);
      const top = document.elementFromPoint(x, y);
      const moved = Math.round(Math.hypot(s.mx - s.px, s.my - s.py));
      out.push({ id, x: Math.round(s.mx), y: Math.round(s.my), moved,
        top: top ? top.tagName + '.' + String(top.className||'').split(' ')[0] : 'none',
        picked: m.pick(s.mx, s.my) });
    }
    return out;
  }, IDS);
  for (const p of probe) log(JSON.stringify(p));
  await shot('plate');
};
