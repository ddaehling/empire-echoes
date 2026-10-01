/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1500);
  const S = async (l) => log(l, page.url(), '| sel=', await page.evaluate(()=>window.BEA.store.getState().selectedTerritoryId), '| dossier=', await page.evaluate(()=>document.getElementById('app').dataset.dossier), '| histlen', await page.evaluate(()=>history.length));
  await S('start');
  await page.evaluate(()=>window.BEA.store.act.setYear(1858)); await page.waitForTimeout(600);
  await page.evaluate(()=>window.BEA.store.act.select('bengal-presidency')); await page.waitForTimeout(900);
  await S('selected');
  await page.evaluate(()=>window.BEA.store.act.select('egypt')); await page.waitForTimeout(900);
  await S('selected egypt');
  await page.evaluate(()=>history.back()); await page.waitForTimeout(1200);
  await S('back 1');
  await page.evaluate(()=>history.back()); await page.waitForTimeout(1200);
  await S('back 2');
  await page.evaluate(()=>history.forward()); await page.waitForTimeout(1200);
  await S('forward');
};
