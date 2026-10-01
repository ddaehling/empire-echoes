/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{location.hash='#year=1913';});
  await page.waitForTimeout(2500);
  await shot('full');
  const el = await page.evaluate(()=>{
    const e=document.querySelector('[class*="legend"]');
    const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height};
  });
  log('LEGEND BOX '+JSON.stringify(el));
  await page.screenshot({path: process.env.OUT + '/zoom-legend.png', clip:{x:el.x-4,y:el.y-4,width:Math.min(el.w+8,700),height:Math.min(el.h+8,520)}});
  log('wrote zoom');
  // measure occlusion of map
  const occ = await page.evaluate(()=>{
    const map=document.querySelector('svg, canvas, .map__plate, [class*="map__"]');
    const m=document.querySelector('.map__plate')||document.querySelector('svg');
    const mr=m?m.getBoundingClientRect():null;
    const ov=[...document.querySelectorAll('[class*="legend"],[class*="byline"]')].map(e=>{const r=e.getBoundingClientRect();return {c:(e.className||'').toString().slice(0,40),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};}).filter(o=>o.w>200&&o.h>40);
    return {map:mr?{x:Math.round(mr.x),y:Math.round(mr.y),w:Math.round(mr.width),h:Math.round(mr.height)}:null, ov:ov.slice(0,4)};
  });
  log('OCC '+JSON.stringify(occ));
};
