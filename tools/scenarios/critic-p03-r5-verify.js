/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const r = await page.evaluate(() => {
    const d = window.BEA.data;
    // independent recount: units with controlDegree>=1 and not informal-sphere, per year
    let best = { y: 0, n: -1 }; const counts = {};
    const yearsWithRecord = new Set();
    for (let y = 1200; y <= 2027; y++) {
      const m = d.statusAt(y);
      let n = 0;
      for (const [uid, s] of m) {
        if (!s) continue;
        if (s.status === 'informal-sphere') continue;
        if ((s.controlDegree|0) >= 1) n++;
      }
      counts[y] = n;
      if (n > best.n) best = { y, n };
    }
    const tl = d.timeline();
    for (const e of tl.events) yearsWithRecord.add(e.year);
    for (const c of tl.cuts) yearsWithRecord.add(c);
    return { peak: best, at1918: counts[1918], at1922: counts[1922], at1900: counts[1900], at1947: counts[1947],
      cuts: tl.cuts.length, events: tl.events.length,
      totalTerritories: d.meta.counts.territories, units: d.meta.counts.units,
      deltas: { d1947: counts[1947]-counts[1946], d1948: counts[1948]-counts[1947], d1945: counts[1945]-counts[1944] } };
  });
  log(JSON.stringify(r,null,1));
};
