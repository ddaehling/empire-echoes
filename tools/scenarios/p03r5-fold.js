/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  log(JSON.stringify(await page.evaluate(() => {
    const p = document.querySelector('.tl').__p03;
    let acts = 0, folded = 0, years = 0;
    const worst = [];
    for (const [y, r] of p.rows) { acts += r.acts.length; folded += r.folded; years++; if (r.folded >= 2) worst.push(y + ':' + r.folded); }
    const sample = (y) => { const r = p.rows.get(y); return r ? r.acts.map(a => a.glyph + ' ' + a.subject + (a.also.length ? ' (+' + a.also.length + ')' : '')) : 'none'; };
    return { years, acts, folded, eventsTotal: p.events.total,
      worstFolds: worst.slice(0, 12),
      y1833: sample(1833), y1931: sample(1931), y1919: sample(1919), y1857: sample(1857) };
  }), null, 1));
};
