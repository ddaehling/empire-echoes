/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  for (const y of [1882, 1820]) {
    await page.evaluate((y) => { location.hash='#year='+y; }, y);
    await page.waitForTimeout(500);
    log(y + ':', JSON.stringify(await page.evaluate(() => {
      const p=document.querySelector('.tl').__p03;
      const r=p.rows.get(p.store.getState().year);
      return { head: r.head, acts: r.acts.map(a=>a.glyph+' '+a.subject+(a.also.length?' (+'+a.also.length+')':'')) };
    })));
  }
};
