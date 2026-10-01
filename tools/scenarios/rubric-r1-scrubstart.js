/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{ const s=window.BEA.store; for(let y=1600;y<=1997;y+=7) s.dispatch('setYear', y); });
  await page.waitForTimeout(1000);
  log('hash after scrub: '+await page.evaluate(()=>location.hash));
  const has = await page.evaluate(()=>!!document.querySelector('.cx-cta'));
  log('cta present: '+has);
  await page.evaluate(()=>{const c=document.querySelector('.cx-cta'); if(c){c.focus();}});
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1600);
  log('hash after start: '+await page.evaluate(()=>location.hash));
  log('bar: '+await page.evaluate(()=>(document.querySelector('.tr-bar')||{}).innerText.replace(/\s+/g,' ')));
  await shot('started');
  for(let i=0;i<3;i++){ await page.evaluate(()=>{const n=document.querySelector('.tr-bar__next'); if(n&&!n.disabled)n.click();}); await page.waitForTimeout(700); }
  log('hash after 3 next: '+await page.evaluate(()=>location.hash));
  log('bar: '+await page.evaluate(()=>(document.querySelector('.tr-bar')||{}).innerText.replace(/\s+/g,' ')));
  await shot('after3');
  await page.reload({waitUntil:'load'}); await page.waitForTimeout(2500);
  log('hash after reload: '+await page.evaluate(()=>location.hash));
  log('bar: '+await page.evaluate(()=>(document.querySelector('.tr-bar')||{}).innerText.replace(/\s+/g,' ')));
  await shot('reloaded');
};
