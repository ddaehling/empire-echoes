/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const b = await page.evaluate(()=>[...document.querySelectorAll('button,[role=button]')].map((e,i)=>({i,t:e.textContent.trim().slice(0,12),a:e.getAttribute('aria-label'),c:e.className})).filter(x=>/zoom|◻|□|reset|fit|home/i.test(x.t+' '+x.a+' '+x.c)));
  log('B:', JSON.stringify(b));
  const el = await page.$('[aria-label*="Reset"], [aria-label*="reset"], [aria-label*="fit"], [aria-label*="Fit"], [aria-label*="whole"], [aria-label*="world"]');
  if (el) { log('label:', await el.getAttribute('aria-label')); await el.click(); await page.waitForTimeout(1200);
    log('view:', JSON.stringify(await page.evaluate(()=>window.BEA.store.getState().mapView))); await shot('after-sq'); }
};
