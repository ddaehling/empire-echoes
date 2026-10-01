/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2400);
  const r = await page.evaluate(() => {
    const d = window.BEA.data; const out = [];
    for (const t of d.territories) {
      const a = t.acquisitions || []; if (a.length < 2) continue;
      const spans = t.spans||[]; if(!spans.length) continue;
      const y = spans[spans.length-1].end || 1960;
      let hit = null; for (const x of a) if (x.year != null && x.year <= y) hit = x;
      if (hit && hit !== a[0]) out.push({ id: t.id, n: a.length, y, shows: hit.year + ' ' + hit.mechanism + ' from ' + (hit.counterparties||[]).map(c=>c.name).join(', ').slice(0,60),
        first: a[0].year + ' ' + a[0].mechanism });
    }
    return { total: d.territories.length, multi: d.territories.filter(t=>(t.acquisitions||[]).length>1).length, out };
  });
  log('territories with >1 acquisition: ' + r.multi + ' of ' + r.total);
  log('showing a NON-founding acquisition at their final year: ' + r.out.length);
  log(JSON.stringify(r.out.slice(0, 25), null, 1));
};
