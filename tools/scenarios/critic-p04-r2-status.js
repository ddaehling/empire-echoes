/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2000);
  for (const y of [1880,1882,1900,1914,1918,1922,1936,1952,1956,1957]) {
    await page.evaluate((yy) => { location.hash = '#year=' + yy + '&sel=egypt'; }, y);
    await page.waitForTimeout(650);
    const s = await page.evaluate(() => {
      const el = document.querySelector('.dossier');
      const t = el.innerText;
      const i = t.indexOf('LEGAL STATUS IN');
      return t.slice(i, i + 180).replace(/\n+/g, ' | ');
    });
    log(y + '  ' + s);
  }
  await shot('egypt-final');
};
