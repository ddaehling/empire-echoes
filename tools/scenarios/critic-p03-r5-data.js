/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  const t = await page.evaluate(() => {
    const d = window.BEA.data;
    const out = { bounds: d.bounds, keys: Object.keys(d).slice(0,60) };
    try {
      out.next1856 = d.nextChangeYear(1856, 1);
      out.prev1857 = d.nextChangeYear(1857, -1);
      out.next1900 = d.nextChangeYear(1900, 1);
      out.next1913 = d.nextChangeYear(1913, 1);
    } catch(e) { out.err = e.message; }
    try {
      const tl = d.timeline();
      out.tlKeys = Object.keys(tl);
      out.cuts = Array.isArray(tl.cuts) ? tl.cuts.length : typeof tl.cuts;
      out.events = Array.isArray(tl.events) ? tl.events.length : typeof tl.events;
      const yrs = Object.keys(tl.eventsByYear||{}).map(Number).sort((a,b)=>a-b);
      out.eventYearMin = yrs[0]; out.eventYearMax = yrs[yrs.length-1]; out.eventYearCount = yrs.length;
      out.firstYears = yrs.slice(0,12);
    } catch(e) { out.tlerr = e.message; }
    return out;
  });
  log('DATA:', JSON.stringify(t, null, 1));
  // count of change-carrying years
  const t2 = await page.evaluate(() => {
    const d = window.BEA.data; const tl = d.timeline();
    const u = tl.unitsByYear || {}; const ks = Object.keys(u).map(Number);
    return { unitsByYearCount: ks.length, min: Math.min(...ks), max: Math.max(...ks), sample1900: u[1900] };
  });
  log('UNITS:', JSON.stringify(t2));
};
