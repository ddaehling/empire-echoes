/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3200);
  const r = await page.evaluate(async () => {
    const mod = await import('/app/js/core/data.js');
    const d = await mod.loadData();
    const sm = d.statusAt(1913);
    const pick = (re) => [...sm.values()].filter(e=>re.test(e.unitId)).map(e=>({id:e.unitId, st:e.status, deg:e.controlDegree, partial:e.partial, since:e.since, controlled:e.controlled}));
    return {
      midEast: pick(/afghan|iran|persia|turkey|nepal|oman|qatar|kuwait|bahrain|trucial|arab|hejaz|yemen|aden/i),
      nz: pick(/new-zealand|nz-|maori|waikato|taranaki/i),
      hkAden: pick(/hong|aden|weihai|singapore/i),
      egypt: pick(/egypt|sudan/i),
      unitCount: sm.size,
    };
  });
  log('AUDIT:', JSON.stringify(r,null,1).slice(0,4200));
};
