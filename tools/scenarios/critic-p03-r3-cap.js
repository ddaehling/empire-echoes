/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const res = await page.evaluate(() => {
    const D = window.BEA.data;
    const byYear = new Map();
    const bump = (y) => { if(!Number.isFinite(y)) return; byYear.set(y,(byYear.get(y)||0)+1); };
    for (const a of D.acquisitions) if (a.contested && a.contested.isContested && a.contested.note) bump(a.year);
    for (const d of D.departures) if (d.contested && d.contested.isContested && d.contested.note) bump(d.year);
    for (const e of D.events) if (e.contested && e.contested.isContested && e.contested.note) bump(e.year);
    const over = [...byYear.entries()].filter(([y,n])=>n>5).sort((a,b)=>b[1]-a[1]);
    return { totalYears: byYear.size, over: over.slice(0,12), overCount: over.length,
             droppedReasons: over.reduce((s,[y,n])=>s+(n-5),0) };
  });
  log('contested per year:', JSON.stringify(res));
};
