/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const r = await page.evaluate(async () => {
    const mod = await import('/app/js/core/data.js');
    const data = await mod.loadData();
    const out = {};
    for (const y of [1996,1997,1998,1946,1947,1948]) {
      const m = data.statusAt(y);
      const e = m.get('hk-hong-kong-island');
      const b = m.get('in-bengal') || [...m.keys()].filter(k=>/bengal/.test(k));
      out[y] = { size: m.size, hkIsland: e ? {status:e.status, controlled:e.controlled, deg:e.controlDegree, since:e.since} : null };
    }
    // Bengal keys
    const m = data.statusAt(1946);
    out.bengalKeys = [...m.keys()].filter(k=>/bengal|india|punjab/i.test(k)).slice(0,10);
    const m2 = data.statusAt(1947); const m3 = data.statusAt(1948);
    out.b47 = out.bengalKeys.map(k => k+':'+(m2.get(k)?m2.get(k).status:'GONE'));
    out.b48 = out.bengalKeys.map(k => k+':'+(m3.get(k)?m3.get(k).status:'GONE'));
    // cuts near
    const t = data.timeline();
    out.cutsNear = t.cuts.filter(c=>c>1940 && c<2005);
    return out;
  });
  log(JSON.stringify(r, null, 1));
};
