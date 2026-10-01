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
    const p=document.querySelector('.tl').__p03;
    const r=p.rows.get(1820);
    return r.acts.map(a=>({s:a.subject, sib:a.sibling||null, how:(a.src.how||'').slice(0,150)}));
  }), null, 1));
};
