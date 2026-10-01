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
    const D = window.BEA.data;
    const out = {};
    const y = 1900;
    const st = D.statusAt(y);
    const meta = D.unitMeta;
    const drawn = [...st.values()].filter(v => v.controlDegree >= 1 && v.status !== 'informal-sphere');
    out.claimedUnits = drawn.length;
    out.terr = new Set(drawn.map(v=>v.territoryId)).size;
    let km=0, missing=0;
    for (const v of drawn){ const m = meta.get(v.unitId); if(m && m.area_km2!=null) km += (v.partial? m.area_km2/2 : m.area_km2); else missing++; }
    out.km2_halved = Math.round(km);
    let kmFull=0; for (const v of drawn){ const m=meta.get(v.unitId); if(m&&m.area_km2!=null) kmFull+=m.area_km2; }
    out.km2_full = Math.round(kmFull);
    out.missingArea = missing;
    // latitude split using centroid
    let far=0, farKm=0, trop=0, tropKm=0, mid=0, midKm=0;
    for (const v of drawn){
      const m = meta.get(v.unitId); if(!m) continue;
      const c = m.centroid || m.point; if(!c) continue;
      const lat = Math.abs(c[1]);
      const a = m.area_km2 || 0;
      if (lat >= 40){ far++; farKm+=a; } else if (lat <= 23.44){ trop++; tropKm+=a; } else { mid++; midKm+=a; }
    }
    out.lat = { far, farKm: Math.round(farKm), trop, tropKm: Math.round(tropKm), mid, midKm: Math.round(midKm) };
    // administered (deg>=3)
    const adm = [...st.values()].filter(v => v.controlDegree >= 3);
    out.adminUnits = adm.length;
    let admKm=0; for(const v of adm){const m=meta.get(v.unitId); if(m&&m.area_km2!=null) admKm += (v.partial?m.area_km2/2:m.area_km2);}
    out.adminKm = Math.round(admKm);
    out.adminPctOfClaimed = Math.round(admKm/km*100);
    const ctl = [...st.values()].filter(v => v.controlDegree === 5);
    out.controlledUnits = ctl.length;
    const inf = [...st.values()].filter(v => v.status === 'informal-sphere');
    out.informal = inf.length;
    out.widest = drawn.length + inf.length;
    out.metricsAt = D.metricsAt(y);
    out.statuses = D.statuses.map(s=>s.id+':'+s.label+':'+s.controlDegree);
    return out;
  });
  log(JSON.stringify(r, null, 1).slice(0, 6000));
};
