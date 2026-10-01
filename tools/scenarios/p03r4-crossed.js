/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of undefined (reading 'slice').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  const out = await page.evaluate(() => {
    const p = document.querySelector('.tl').__p03;
    const bad = [];
    // scan the ACTIVE definition for the banned sentence anywhere in the model
    for (const [y, rec] of p.def.years) {
      for (const g of rec.groups.concat(rec.records)) {
        const blob = [g.mechanism, g.gloss, g.how, g.threshold, g.thresholdWhy].filter(Boolean).join(' | ');
        if (/redefined|Nothing was taken/i.test(blob)) bad.push({ y, subject: g.subject, blob: blob.slice(0, 200) });
      }
    }
    const look = {};
    for (const y of [1882, 1922, 1941, 1942, 1834]) {
      const it = p.itemsFor(y);
      look[y] = it.all.slice(0, 8).map(x => ({
        kind: x.kind, dir: x.dir, subject: x.subject || x.title, mech: x.mechanism,
        date: x.dateNote || x.date, seamStatus: x.statusMove, thr: x.threshold,
        how: (x.howShort || '').slice(0, 100), also: (x.alsoRecords || []).length, rec: x.recordId, mir: x.mirrorId,
      }));
    }
    return { bannedSentences: bad.length, bad: bad.slice(0, 10), look };
  });
  log(JSON.stringify(out, null, 1));
};
