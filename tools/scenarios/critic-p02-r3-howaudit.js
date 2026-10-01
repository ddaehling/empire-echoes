/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913');
  await page.waitForTimeout(3000);
  const r = await page.evaluate(async () => {
    const mod = await import('/app/js/core/data.js');
    const d = await mod.loadData();
    let multi = 0, affectedUnits = 0; const examples = [];
    for (const t of d.territories || []) {
      const acqs = (t.acquisitions||[]).filter(a=>Number.isFinite(Number(a.year)));
      const units = (t.units||[]).length;
      if (acqs.length > 1 && units > 1) {
        multi++; affectedUnits += units;
        if (examples.length < 12) examples.push({ id: t.id, units, acqs: acqs.map(a=>a.year + ':' + a.mechanism) });
      }
    }
    return { territories: (d.territories||[]).length, multi, affectedUnits, examples };
  });
  log(JSON.stringify(r, null, 1).slice(0, 4000));
};
