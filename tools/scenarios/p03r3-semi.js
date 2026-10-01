/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: it.all is not iterable.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && document.querySelector('.tl') && document.querySelector('.tl').__p03, null, { timeout: 20000 });
  const r = await page.evaluate(() => {
    const tl = document.querySelector('.tl').__p03;
    const bad = [];
    let n = 0;
    for (const y of tl.storyYears) {
      const it = tl.itemsFor(y);
      for (const g of it.all) {
        const s = g.howShort || g.summaryShort || '';
        if (!s) continue;
        n++;
        if (/[;,:]\s*$/.test(s)) bad.push({ y, s: s.slice(-60) });
      }
    }
    return { clauses: n, endingInPunct: bad.length, sample: bad.slice(0, 5) };
  });
  log(JSON.stringify(r, null, 1));
  for (const y of [1783, 1946]) {
    await page.evaluate((yy) => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(120);
    log(y + ': ' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.tl-chg__how')].map(n=>n.textContent).filter(Boolean).slice(0,6))));
  }
};
