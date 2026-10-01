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
    out.bounds = data.bounds;
    out.next1856 = data.nextChangeYear(1856, 1);
    out.next1900 = data.nextChangeYear(1900, 1);
    out.prev1857 = data.nextChangeYear(1857, -1);
    const t = data.timeline();
    out.cutsN = t.cuts.length;
    out.firstCuts = t.cuts.slice(0, 12);
    out.lastCuts = t.cuts.slice(-6);
    out.min = t.min; out.max = t.max;
    out.eventsN = t.events.length;
    out.at1820 = t.at(1820); out.at1900 = t.at(1900); out.at1830 = t.at(1830);
    // count changes in 1900
    out.ev1900 = (t.eventsByYear.get(1900)||[]).map(e=>e.title+' | '+e.kind+' | '+e.scope);
    // what exists at 1200
    out.at1200 = t.at(1200); out.at1500 = t.at(1500);
    return out;
  });
  log(JSON.stringify(r, null, 1));
};
