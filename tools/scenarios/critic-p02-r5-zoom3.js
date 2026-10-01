/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  await page.evaluate(() => { location.hash = '#year=1913'; }); await page.waitForTimeout(1200);
  const p = await page.evaluate(()=>{const b=document.querySelector('.map__plate').getBoundingClientRect(); return {x:b.x+b.width*0.55,y:b.y+b.height*0.85};});
  await page.mouse.click(p.x, p.y); await page.waitForTimeout(800);
  log('after ocean click, active: ' + await page.evaluate(()=>document.activeElement.className + ' / ' + (document.activeElement.dataset||{}).unit));
  await page.keyboard.press('+'); await page.waitForTimeout(900);
  log('view after +: ' + await page.evaluate(()=>JSON.stringify(window.__map.plate.view)));
  await page.keyboard.press('w'); await page.waitForTimeout(1200);
  log('weight after w: ' + await page.evaluate(()=>!!window.__map.weight));
};
