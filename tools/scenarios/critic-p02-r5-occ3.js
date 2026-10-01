/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const M = p => p.evaluate(() => {
  const plate=document.querySelector('.map__plate').getBoundingClientRect();
  let cov=0,tot=0;
  for(let x=plate.x+3;x<plate.right-3;x+=5) for(let y=plate.y+3;y<plate.bottom-3;y+=5){tot++;const t=document.elementFromPoint(x,y); if(t&&!t.closest('.map'))cov++;}
  const g=document.querySelector('.map__target[data-unit="gibraltar"]');
  let gib=null;
  if(g){const r=g.getBoundingClientRect(); const t=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2); gib={x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),under:t?((t.className.baseVal!==undefined?t.className.baseVal:t.className)||t.tagName):'none', inPlate: r.x>=plate.x&&r.right<=plate.right&&r.y>=plate.y&&r.bottom<=plate.bottom};}
  return {plate:{x:Math.round(plate.x),w:Math.round(plate.width),h:Math.round(plate.height)}, pct:Math.round(100*cov/tot), gib};
});
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913&def=claimed', {waitUntil:'load'});
  await page.waitForTimeout(3500);
  log('before select:', JSON.stringify(await M(page)));
  await page.evaluate(()=>{const t=document.querySelector('.map__target[data-unit="gibraltar"]');const r=t.getBoundingClientRect();t.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:r.x+22,clientY:r.y+22}));});
  const c = await page.evaluate(()=>{const t=document.querySelector('.map__target[data-unit="gibraltar"]');const r=t.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}});
  await page.mouse.click(c.x,c.y);
  await page.waitForTimeout(2500);
  log('after select gibraltar:', JSON.stringify(await M(page)));
  await shot('gib-selected-plate','.map__frame');
};
