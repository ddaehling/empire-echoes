/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  const out = await page.evaluate(() => {
    const d = window.BEA.data;
    const pick = (y, re) => [...d.statusAt(y).entries()].filter(([u])=>re.test(u)).map(([u,e])=>({u,st:e.status,deg:e.controlDegree,terr:e.territoryId,spanStart:e.spanStart,spanEnd:e.spanEnd,label:e.span&&e.span.label,note:(e.span&&e.span.note||'').slice(0,300),how:(e.span&&e.span.howControlWorked||'').slice(0,200)}));
    const stat = (d.statuses||[]).map(s=>({id:s.id,label:s.label,short:s.short,deg:s.controlDegree}));
    return {
      au41: pick(1941, /^au-/).slice(0,2), au42: pick(1942, /^au-/).slice(0,2),
      nz46: pick(1946, /^nz/).slice(0,2), nz47: pick(1947, /^nz/).slice(0,2),
      sg41: pick(1941, /^singapore/), sg42: pick(1942, /^singapore/),
      statuses: stat,
    };
  });
  log(JSON.stringify(out, null, 1));
};
