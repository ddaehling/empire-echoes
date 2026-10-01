/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  // extreme years
  for (const y of [1200, 1583, 1922, 2025]) {
    await page.evaluate(y => { location.hash = '#year='+y; }, y); await page.waitForTimeout(900);
    log(y + ' -> ' + await page.evaluate(()=>document.querySelector('.map__plate').getAttribute('aria-label')));
  }
  await shot('y2025');
  // rapid toggles
  for (let i=0;i<12;i++){ await page.keyboard.press(['p','w','s','h','1','2','3','4'][i%8]); await page.waitForTimeout(120); }
  await page.waitForTimeout(2500);
  await shot('after-rapid');
  log('state: ' + await page.evaluate(()=>JSON.stringify({p:window.__map.projection,d:window.__map.definition,st:window.__map.stitch,sm:window.__map.silenceMode,w:!!window.__map.weight})));
  // zoom + pan keyboard
  for (let i=0;i<6;i++){ await page.keyboard.press('+'); await page.waitForTimeout(150); }
  await page.waitForTimeout(1500); await shot('zoomed');
  log('view: ' + await page.evaluate(()=>location.hash));
  await page.keyboard.press('Home');
  await page.waitForTimeout(800);
  // bad hash
  await page.evaluate(()=>{ location.hash = '#year=abc&def=nonsense&sel=zzz&view=9,9,9'; }); await page.waitForTimeout(1800);
  await shot('bad-hash');
  log('after bad hash: ' + await page.evaluate(()=>document.querySelector('.map__plate').getAttribute('aria-label')));
};
