/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of undefined (reading 'concat').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  log(await page.evaluate(() => {
    const p = document.querySelector('.tl').__p03;
    const out = {};
    for (const [y, name] of [[1781,'Sint'],[1806,'Buenos'],[1843,'Hawaii'],[1963,'Kenya'],[1942,'Madagascar']]) {
      const { groups, records } = p.itemsFor(y);
      out[y] = groups.concat(records).filter(g => g.subject.includes(name)).map(g => ({
        kind: g.kind, dir: g.dir, subject: g.subject, mech: g.mechanism, date: g.dateNote || g.date,
        thr: g.threshold, sm: g.statusMove, rec: g.recordId, mir: g.mirrorId, how: (g.howShort||'').slice(0,80),
      }));
    }
    return JSON.stringify(out, null, 1);
  }));
};
