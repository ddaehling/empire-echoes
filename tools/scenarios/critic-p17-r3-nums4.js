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
    const um = data.unitMeta;
    const st0 = data.statusAt(1900); const st = st0 instanceof Map ? Object.fromEntries(st0) : st0;
    let aC=0,nC=0,aA=0,nA=0, hi=0,hiA=0, trop=0,tropA=0, tinyN=0;
    for (const [id, s] of Object.entries(st)) {
      const m = um.get(id) || {};
      const informal = s.status === 'informal-sphere';
      const deg = s.controlDegree;
      if (deg >= 1 && !informal) { nC++; aC += m.area_km2||0;
        const lat = Math.abs((m.centroid||m.point||[0,0])[1]||0);
        if (lat >= 40) { hi++; hiA += m.area_km2||0; }
        if (lat <= 23.5) { trop++; tropA += m.area_km2||0; }
        if (m.tiny) tinyN++;
      }
      if (deg >= 3 && !informal) { nA++; aA += m.area_km2||0; }
    }
    const bb = um.get('barbados') || [...um.entries()].find(([k])=>/barbado/i.test(k));
    return { nC, aC: Math.round(aC), aCm: +(aC/1e6).toFixed(2), nA, aA: Math.round(aA), pct: Math.round(aA/aC*100),
      hi, hiA: +(hiA/1e6).toFixed(2), trop, tropA: +(tropA/1e6).toFixed(2), ratio: +(tropA/hiA).toFixed(2), tinyN,
      barbados: bb ? (bb.area_km2 || bb[1] && bb[1].area_km2) : null, umSize: um.size };
  });
  log(JSON.stringify(r, null, 1));
};
