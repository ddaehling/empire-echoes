/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* p20-version — does the browser's ledger agree with tools/evidence-audit.js? */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(800);
  await page.click('.tp-entry');
  await page.waitForTimeout(1200);
  await page.click('#tp-tab-evidence');
  await page.waitForTimeout(800);
  const out = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.tp-led__rec')];
    return {
      version: document.querySelector('.tp__version').textContent,
      rows: rows.length,
      first10: rows.slice(0, 10).map(r => (r.querySelector('.tp-led__link') || {}).textContent + ' | ' + (r.querySelector('.tp-led__fig') || {}).textContent),
    };
  });
  log('BROWSER ' + JSON.stringify(out, null, 1));
};
