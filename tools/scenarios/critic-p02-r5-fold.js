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
  return {w:Math.round(plate.width),h:Math.round(plate.height),pct:Math.round(100*cov/tot)};
});
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913&sel=gibraltar', {waitUntil:'load'});
  await page.waitForTimeout(3500);
  log('dossier open:', JSON.stringify(await M(page)));
  await shot('a-dossier');
  const fold = page.locator('button:has-text("FOLD")').first();
  if (await fold.count()) { await fold.click(); await page.waitForTimeout(1200); log('after FOLD:', JSON.stringify(await M(page))); await shot('b-folded'); }
  await page.keyboard.press('e'); await page.waitForTimeout(1400);
  log('after E:', JSON.stringify(await M(page)));
  await shot('c-enlarged');
  log('gib visible?', await page.evaluate(()=>{const t=document.querySelector('.map__target[data-unit="gibraltar"]');const p=document.querySelector('.map__plate').getBoundingClientRect();const r=t.getBoundingClientRect();return JSON.stringify({r:{x:Math.round(r.x),y:Math.round(r.y)},plate:{x:Math.round(p.x),w:Math.round(p.width)},under:(document.elementFromPoint(r.x+22,r.y+22)||{}).className})}));
};
