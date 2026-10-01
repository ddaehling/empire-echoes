/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1500);
  await shot('before', '.stage__map');
  await page.evaluate(()=>window.BEA.store.act.select('bengal-presidency'));
  await page.waitForTimeout(1500);
  await shot('after', '.stage__map');
  log('selected units:', await page.evaluate(()=>{
    const s = window.BEA.data.unitsOf('bengal-presidency', 1900); return JSON.stringify(s);
  }));
  log('aria-selected targets:', await page.evaluate(()=>[...document.querySelectorAll('[aria-selected="true"]')].map(e=>e.getAttribute('data-unit')).join(',')));
  log('map api:', await page.evaluate(()=>Object.keys(window.BEA.map||{}).join(',')));
};
