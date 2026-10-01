/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1900&sel=india');
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1800);
  log('hash:', page.url());
  log('app dataset:', await page.evaluate(()=>JSON.stringify({...document.getElementById('app').dataset})));
  log('shell note:', await page.evaluate(()=>document.getElementById('shell-note').textContent));
  log('sel:', await page.evaluate(()=>window.BEA.store.getState().selectedTerritoryId));
  await shot('badsel');
  // and a good one
  await page.evaluate(()=>window.BEA.store.act.select('bengal-presidency'));
  await page.waitForTimeout(1200);
  log('good sel:', await page.evaluate(()=>window.BEA.store.getState().selectedTerritoryId), page.url());
  log('app dataset:', await page.evaluate(()=>JSON.stringify({...document.getElementById('app').dataset})));
  await shot('goodsel');
};
