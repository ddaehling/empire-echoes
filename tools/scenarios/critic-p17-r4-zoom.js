/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(()=>{ const l=document.querySelector('.legend'); const b=document.querySelector('.byline'); });
  // zoom into the india / caribbean region of the map plate
  await page.screenshot({path:'/tmp/cp17r4-zoom/full.png'});
  const box = await page.evaluate(()=>{ const p=document.querySelector('.map__plate'); const r=p.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; });
  log('plate ' + JSON.stringify(box));
  await page.screenshot({path:'/tmp/cp17r4-zoom/crop-india.png', clip:{x:box.x+box.w*0.60, y:box.y, width:box.w*0.30, height:box.h}});
  await page.screenshot({path:'/tmp/cp17r4-zoom/crop-carib.png', clip:{x:box.x+box.w*0.15, y:box.y+box.h*0.15, width:box.w*0.25, height:box.h*0.6}});
};
