/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const path=require('path');
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const out='/tmp/cp02r4-drive'; require('fs').mkdirSync(out,{recursive:true});
  const view = async t => log(t, JSON.stringify(await page.evaluate(()=>window.BEA.store.getState().mapView)));
  await view('before');
  // the square button
  const sq = await page.$('.map__zoom button:nth-child(3), button:has-text("□")');
  const zb = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>/^[+−□]$/.test(b.textContent.trim())).map(b=>({t:b.textContent.trim(),a:b.getAttribute('aria-label'),c:b.className})));
  log('ZOOMBTNS:', JSON.stringify(zb));
  // wheel zoom over India
  await page.mouse.move(798,180);
  for (let i=0;i<8;i++){ await page.mouse.wheel(0,-220); await page.waitForTimeout(120); }
  await page.waitForTimeout(900);
  await view('after wheel');
  await page.screenshot({path: path.join(out,'wheel.png'), clip:{x:0,y:56,width:1440,height:330}});
  await shot('after-wheel-full');
  // click a unit
  await page.mouse.click(720,200);
  await page.waitForTimeout(1200);
  await shot('after-click');
  log('selected:', JSON.stringify(await page.evaluate(()=>window.BEA.store.getState().selectedTerritoryId)));
};
