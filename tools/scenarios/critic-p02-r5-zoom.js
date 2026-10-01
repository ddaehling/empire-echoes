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
  const v = () => page.evaluate(() => JSON.stringify(window.__map.plate ? window.__map.plate.view : null));
  log('view0: ' + await v());
  await page.keyboard.press('+'); await page.waitForTimeout(900); log('after + : ' + await v() + ' hash=' + await page.evaluate(()=>location.hash));
  await page.keyboard.press('Equal'); await page.waitForTimeout(900); log('after Equal: ' + await v());
  await page.keyboard.press('Shift+Equal'); await page.waitForTimeout(900); log('after Shift+Equal: ' + await v());
  // click the zoom button
  await page.click('.map__zoom'); await page.waitForTimeout(1200); log('after zoom btn: ' + await v() + ' hash=' + await page.evaluate(()=>location.hash));
  await shot('zoom-btn');
  // wheel
  const p = await page.evaluate(()=>{const b=document.querySelector('.map__plate').getBoundingClientRect(); return {x:b.x+b.width/2,y:b.y+b.height/2};});
  await page.mouse.move(p.x,p.y); await page.mouse.wheel(0,-600); await page.waitForTimeout(1200); log('after wheel: ' + await v());
  await shot('wheel');
  // arrows pan (shift+arrow per hint)
  await page.keyboard.press('Shift+ArrowRight'); await page.waitForTimeout(800); log('after shift-right: ' + await v());
  // drag pan
  await page.mouse.move(p.x,p.y); await page.mouse.down(); await page.mouse.move(p.x-150,p.y, {steps:10}); await page.mouse.up(); await page.waitForTimeout(1000);
  log('after drag: ' + await v() + ' hash=' + await page.evaluate(()=>location.hash));
  await shot('panned');
};
