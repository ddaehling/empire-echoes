/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913&sel=kenya', { waitUntil: 'load' });
  await page.waitForTimeout(2200);
  log(JSON.stringify(await page.evaluate(() => ({
    renderSource: typeof (window.BEA && window.BEA.renderSource),
    unsourced: window.BEA.unsourcedCount ? window.BEA.unsourcedCount() : 'n/a',
    classOnly: window.BEA.classOnlyCount ? window.BEA.classOnlyCount() : 'n/a',
    ledgerSize: window.BEA.dossierLedger ? window.BEA.dossierLedger.size() : 'n/a',
    fourFields: (() => {
      const n = window.BEA.renderSource({ kind: 'book', author: 'Test Author', work: 'A Work', year: 1999 });
      return [...n.querySelectorAll('.src__k')].map((k) => k.textContent);
    })(),
    unsourcedMark: (() => {
      const n = window.BEA.renderSource({ author: 'Nobody' });
      return n.querySelectorAll('.defect').length;
    })(),
  }))));
  // click a "more" button and confirm it scrolls the panel
  const before = await page.evaluate(() => document.querySelector('.app__dossier').scrollTop);
  const has = await page.evaluate(() => { const b = document.querySelector('.dsr__fold .dsr__more'); if (b) { b.click(); return true; } return false; });
  await page.waitForTimeout(700);
  const after = await page.evaluate(() => document.querySelector('.app__dossier').scrollTop);
  log('more button present:', has, 'scrollTop', before, '->', after);
};
