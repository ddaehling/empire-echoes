/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const b = await page.evaluate(()=>{const e=document.querySelector('.byline__crit'); const r=e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};});
  await page.mouse.click(b.x,b.y); await page.waitForTimeout(1000);
  const ent = await page.evaluate(()=>{const e=[...document.querySelectorAll('.legend__entry')].find(x=>/Princely state/.test(x.innerText)); const r=e.getBoundingClientRect(); return {x:r.x+40,y:r.y+12};});
  await page.mouse.click(ent.x,ent.y); await page.waitForTimeout(1600);
  const m = await page.evaluate(()=>{const e=document.querySelector('.map__plate')||document.querySelector('svg'); const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height};});
  log('MAP '+JSON.stringify(m));
  await page.screenshot({path:'/tmp/p17r5-paint/map-painted.png', clip:{x:m.x,y:m.y,width:m.w,height:m.h}});
  // now unclick
  await page.mouse.click(ent.x,ent.y); await page.waitForTimeout(1400);
  await page.screenshot({path:'/tmp/p17r5-paint/map-normal.png', clip:{x:m.x,y:m.y,width:m.w,height:m.h}});
  log('done');
};
