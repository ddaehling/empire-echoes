/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const r = await page.evaluate(async () => {
    const m = await import('/app/js/core/data.js');
    const data = await m.loadData({});
    const out = {};
    for (const y of [1839,1840,1841,1860,1863,1865,1870,1907,1975]) {
      const st = data.statusAt(y);
      const nz = [...st.entries()].filter(([u,e]) => /nz|new-zealand|maori/.test(u) || /new-zealand/.test(e.territoryId||''));
      out[y] = nz.map(([u,e]) => u + '=' + e.status + '/d' + e.controlDegree + (e.partial?'/partial':''));
    }
    return out;
  });
  log(JSON.stringify(r, null, 1));
};
