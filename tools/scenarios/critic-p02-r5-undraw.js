/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  for (const [y, sel] of [[1865,'new-zealand'],[1955,'kenya']]) {
    await page.evaluate(([y,s]) => { location.hash = `#year=${y}&sel=${s}`; }, [y,sel]);
    await page.waitForTimeout(2000);
    await shot('undraw-'+sel);
    const t = await page.evaluate(() => { const r = document.querySelector('.map__rail, .map__switch, .map__cards'); return r ? r.innerText : document.querySelector('.map').innerText; });
    log(y+' '+sel+' RAIL:\n' + t.slice(0, 1800));
    log('---');
  }
};
