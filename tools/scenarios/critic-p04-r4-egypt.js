/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const { fixGrid } = require('./critic-p04-r4-lib.js');
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1500);
  await fixGrid(page, log);
  for (const y of [1881, 1882, 1914, 1922, 1936, 1956]) {
    await page.evaluate(yy => { location.hash = `#year=${yy}&sel=egypt`; }, y);
    await page.waitForTimeout(900);
    const t = await page.evaluate(() => {
      const d = document.querySelector('#dossier');
      const txt = d ? d.innerText : '(none)';
      const i = txt.indexOf('LEGAL STATUS');
      return txt.slice(i, i + 520).replace(/\n+/g,' | ');
    });
    log(`--- ${y}: ${t}`);
  }
  await shot('egypt-1956');
};
