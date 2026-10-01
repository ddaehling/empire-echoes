/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.click('.cx-cta'); await page.waitForTimeout(1200);
  for(let i=0;i<3;i++){ await page.evaluate(()=>{const n=document.querySelector('.tr-bar__next'); if(n&&!n.disabled)n.click();}); await page.waitForTimeout(700); }
  const a = await page.evaluate(()=>({hash:location.hash, bar:(document.querySelector('.tr-bar')||{}).innerText.replace(/\s+/g,' ')}));
  log('BEFORE RELOAD>>'+JSON.stringify(a));
  await page.reload({waitUntil:'load'}); await page.waitForTimeout(2500);
  const b = await page.evaluate(()=>({hash:location.hash, bar:(document.querySelector('.tr-bar')||{}).innerText.replace(/\s+/g,' '), map:(()=>{const m=document.querySelector('.stage__map');const r=m.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)];})()}));
  log('AFTER RELOAD>>'+JSON.stringify(b));
  await shot('after-reload');
  // now the same but with a resize first
  await page.goto('http://localhost:8777/app/',{waitUntil:'load'}); await page.waitForTimeout(2200);
  await page.click('.cx-cta'); await page.waitForTimeout(1000);
  for(let i=0;i<3;i++){ await page.evaluate(()=>{const n=document.querySelector('.tr-bar__next'); if(n&&!n.disabled)n.click();}); await page.waitForTimeout(600); }
  await page.setViewportSize({width:390,height:844}); await page.waitForTimeout(1000);
  const c = await page.evaluate(()=>({hash:location.hash, bar:(document.querySelector('.tr-bar')||{}).innerText.replace(/\s+/g,' ')}));
  log('AFTER RESIZE TO 390>>'+JSON.stringify(c));
  await shot('resized');
  await page.reload({waitUntil:'load'}); await page.waitForTimeout(2500);
  const d = await page.evaluate(()=>({hash:location.hash, bar:(document.querySelector('.tr-bar')||{}).innerText.replace(/\s+/g,' '), map:(()=>{const m=document.querySelector('.stage__map');const r=m.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)];})()}));
  log('RELOAD@390>>'+JSON.stringify(d));
  await shot('reload390');
};
