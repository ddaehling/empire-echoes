/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(()=>{ location.hash='#year=1857&sel=bengal'; });
  await page.waitForTimeout(2000);
  await shot('sel-bengal');
  // crop around the selection
  const b = await page.evaluate(()=>{ const e=document.querySelector('.map__target[aria-selected="true"]'); if(!e) return null; const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height,u:e.dataset.unit}; });
  log('selected: ' + JSON.stringify(b));
  if (b) await page.screenshot({ path: require('path').join(process.env.OUT||'/tmp/cp02r2-sel','crop.png'), clip: { x: Math.max(0,b.x-140), y: Math.max(0,b.y-120), width: 340, height: 300 } });
};
