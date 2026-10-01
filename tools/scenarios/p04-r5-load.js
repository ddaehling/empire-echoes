/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 5 — reading load and the core path. */
module.exports = async ({ page, shot, log }) => {
  for (const [sel, yr] of [['kenya', 1955], ['british-india', 1913], ['bengal-presidency', 1765], ['egypt', 1922]]) {
    await page.goto('http://localhost:8777/app/#year=' + yr + '&sel=' + sel, { waitUntil: 'load' });
    await page.waitForTimeout(2600);
    const r = await page.evaluate(() => {
      const d = document.querySelector('.app__dossier');
      return {
        innerText: d.innerText.length,
        buttons: d.querySelectorAll('button').length,
        folds: d.querySelectorAll('details.dsr__ext').length,
        open: d.querySelectorAll('details.dsr__ext[open]').length,
        pathline: (document.querySelector('.dsr__pathline') || {}).textContent,
        scrollH: d.scrollHeight,
        sections: document.querySelectorAll('.dsr__contentsbtn').length,
      };
    });
    log(sel + ' ' + yr + ' :: ' + JSON.stringify(r));
  }
  await page.goto('http://localhost:8777/app/#year=1955&sel=kenya', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => { const n = document.querySelector('.dsr__pathmark'); if (n) n.scrollIntoView(); });
  await page.waitForTimeout(300);
  await shot('kenya-corepath');
};
