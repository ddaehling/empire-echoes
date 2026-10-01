/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{location.hash='#year=1650';}); await page.waitForTimeout(400);
  await page.evaluate(()=>{location.hash='#year=1947';}); await page.waitForTimeout(600);
  await page.click('.tl-rate__ask'); await page.waitForTimeout(400);
  const ls = await page.evaluate(()=>{const o={}; for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i); o[k]=String(localStorage.getItem(k)).slice(0,400);} return o;});
  log('LOCALSTORAGE:', JSON.stringify(ls, null, 1));
  log('circa test:');
  for (const y of [1585, 1497, 1815]) { await page.evaluate(yy=>{location.hash='#year='+yy;}, y); await page.waitForTimeout(500);
    log(y, await page.evaluate(()=>{const c=document.querySelector('.tl__circa'); return {circa: c && !c.hidden, year: document.querySelector('.tl__year').textContent, warn: document.querySelector('.tl__warn')?.textContent||'none'};})); }
};
