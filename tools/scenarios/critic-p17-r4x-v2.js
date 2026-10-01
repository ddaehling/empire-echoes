/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  const r = await page.evaluate(() => {
    const D = window.BEA.data, M = D.unitMeta;
    const f = (y, mode) => {
      const st = D.statusAt(y);
      const drawn = [...st.values()].filter(v => mode==='inf' ? (v.controlDegree>=1) : (v.controlDegree>=1 && v.status!=='informal-sphere'));
      const tiny = drawn.filter(v => { const m=M.get(v.unitId); return m && m.tiny; });
      return { y, mode, drawn: drawn.length, tiny: tiny.length };
    };
    const allTiny = [...M.values()].filter(m=>m.tiny).length;
    const bb = M.get('barbados');
    return { t1900: f(1900,'cl'), t1900inf: f(1900,'inf'), t1750: f(1750,'cl'), t1750inf: f(1750,'inf'),
      allTiny, barbados: bb && {area: bb.area_km2, tiny: bb.tiny, name: bb.name} };
  });
  log(JSON.stringify(r, null, 1));
};
