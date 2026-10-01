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
    const probe = (y) => {
      const s = data.statusAt(y);
      const keys = Object.keys(s);
      return { n: keys.length, hk: keys.filter(k=>/hk|hong/i.test(k)).map(k=>k+'='+s[k].status) , sample: keys.slice(0,3)};
    };
    for (const y of [1996,1997,1998,1947,1948]) out[y] = probe(y);
    // Hong Kong territory record
    const t = data.territories.find(t=>/hong kong/i.test(t.name));
    out.hkRec = t ? {id:t.id, departures:t.departures, units:(t.units||[]).map(u=>u.id||u)} : 'not found';
    const ind = data.territories.find(t=>/^bengal presidency/i.test(t.name));
    out.bengal = ind ? {id:ind.id, departures: ind.departures} : 'nf';
    return out;
  });
  log(JSON.stringify(r, null, 1).slice(0, 4000));
};
