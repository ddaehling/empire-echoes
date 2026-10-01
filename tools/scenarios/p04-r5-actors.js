/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 5 — the local-actors requirement across all 260 entries. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const r = await page.evaluate(async () => {
    const f = await import('/app/js/panels/dossier/fields.js');
    const ts = window.BEA.data.territories;
    const noneAtAll = [], noneLocal = [], emptyDeclared = [];
    for (const t of ts) {
      const a = f.actorsOf(t);
      if (!a.named) noneAtAll.push(t.id);
      else if (!a.here.length) noneLocal.push(t.id);
      if (a.empty && !a.here.length) emptyDeclared.push(t.id);
    }
    return { total: ts.length, noneAtAll, noneLocal: noneLocal.length, noneLocalIds: noneLocal.slice(0, 20), emptyDeclared: emptyDeclared.length };
  });
  log(JSON.stringify(r, null, 1));
};
