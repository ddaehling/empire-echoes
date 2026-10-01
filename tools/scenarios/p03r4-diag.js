/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of undefined (reading 'length').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  const years = [1834, 1882, 1922, 1941, 1942, 1858, 1947, 1948, 1931];
  const out = await page.evaluate((years) => {
    const tl = document.querySelector('.tl');
    const p = tl && tl.__p03;
    if (!p) return { error: 'no p03' };
    const res = {};
    for (const y of years) {
      const it = p.itemsFor(y);
      res[y] = {
        counts: { groups: it.groups.length, records: it.records.length, redraws: it.redraws.length, events: it.events.length },
        rec: it.rec ? { unitsChanged: it.rec.unitsChanged, inU: it.rec.inUnits, outU: it.rec.outUnits, sh: it.rec.shiftUnits } : null,
        items: it.all.slice(0, 12).map(x => ({
          kind: x.kind, dir: x.dir, crossed: !!x.crossed, subject: x.subject || x.title,
          mech: x.mechanism, date: x.dateNote || x.date, how: (x.howShort || x.gloss || '').slice(0, 130),
          mapYear: x.mapYear, year: x.year, recordId: x.recordId,
        })),
      };
    }
    // uncertain reasons per year
    const un = {};
    for (const u of p.uncertain) if (years.includes(u.year)) un[u.year] = u.reasons.length;
    return { res, un, defId: p.defId, storyYears: p.storyYears.length, changeYears: p.def.changeYears.length, bounds: p.bounds };
  }, years);
  log(JSON.stringify(out, null, 1));
};
