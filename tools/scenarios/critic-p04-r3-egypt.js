/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1882&sel=egypt', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  for (const y of [1882, 1914, 1922, 1956]) {
    await page.evaluate((yy) => window.BEA.store.act.setYear(yy), y);
    await page.waitForTimeout(700);
    const s = await page.evaluate(() => {
      const el = document.querySelector('.app__dossier');
      const t = el.innerText;
      const i = t.indexOf('LEGAL STATUS');
      return t.slice(0, 40).replace(/\n/g,' | ') + ' ||| ' + t.slice(i, i + 520).replace(/\n/g, ' | ');
    });
    log('YEAR ' + y + ': ' + s);
    await shot('egypt-' + y);
  }
};
