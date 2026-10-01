/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForTimeout(2600);
  const ids = await page.evaluate(() => window.BEA.data.territories.map(t => t.id));
  const bad = []; let worst = null;
  for (const id of ids) {
    await page.evaluate((i) => { location.hash = '#year=1913&sel=' + i; }, id);
    await page.waitForTimeout(40);
    const r = await page.evaluate(() => {
      const d = document.querySelector('.app__dossier');
      const e = d.querySelector('[data-block="ended"]');
      const s = d.querySelector('[data-block="status"]');
      const f = d.querySelector('.dsr__fold .dsr__franchise');
      return { over: e ? Math.round(e.getBoundingClientRect().bottom - d.getBoundingClientRect().bottom) : null,
        hasStatus: !!s, hasEnded: !!e, hasFranchise: !!f };
    });
    if (!worst || (r.over != null && r.over > worst.over)) worst = { id, ...r };
    if (r.over == null || r.over > 0 || !r.hasStatus || !r.hasFranchise) bad.push(id + ' over=' + r.over + ' status=' + r.hasStatus + ' franchise=' + r.hasFranchise);
  }
  log('territories: ' + ids.length);
  log('worst overhang: ' + JSON.stringify(worst));
  log('FAILING (' + bad.length + '):');
  bad.slice(0, 40).forEach(b => log('  ' + b));
};
