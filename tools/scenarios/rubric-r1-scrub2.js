/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  log('cta before: '+await page.evaluate(()=>{const c=document.querySelector('.cx-cta'); return c? c.innerText.replace(/\s+/g,' '):'none';}));
  await page.evaluate(()=>{ const s=window.BEA.store; for(let y=1600;y<=1997;y+=7) s.dispatch('setYear', y); });
  await page.waitForTimeout(1200);
  log('cta after scrub: '+await page.evaluate(()=>{const c=document.querySelector('.cx-cta'); return c? c.innerText.replace(/\s+/g,' '):'none';}));
  await shot('post-scrub');
  await page.click('.cx-cta'); await page.waitForTimeout(1500);
  log('hash after click1: '+await page.evaluate(()=>location.hash));
  log('bar: '+await page.evaluate(()=>(document.querySelector('.tr-bar')||{}).innerText.replace(/\s+/g,' ')));
  await shot('after-click1');
};
