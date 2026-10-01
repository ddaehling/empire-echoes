/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2400);
  const go = async (sel, y, name) => {
    await page.evaluate(([s,yy]) => { location.hash = '#year='+yy+'&sel='+s; }, [sel,y]);
    await page.waitForTimeout(900);
    await shot(name);
    const t = await page.evaluate(() => document.querySelector('.app__dossier').innerText);
    log('=== ' + sel + '@' + y + ' (' + t.length + ' chars) ===\n' + t.slice(0, 2600));
  };
  await go('kenya', 1955, 'kenya');
  await go('ascension', 1900, 'ascension');
  await go('jersey', 1900, 'jersey');
};
