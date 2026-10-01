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
    const show = (y) => (p.rows.get(y)||{acts:[]}).acts.map(a => ({ s: a.glyph + ' ' + a.subject, also: a.also.map(x => x.head.slice(0, 80)) }));
    return { y1763: show(1763), y1775: show(1775), y1900: show(1900) };
  }), null, 1));
};
