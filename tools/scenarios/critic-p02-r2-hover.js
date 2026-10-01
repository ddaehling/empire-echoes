/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const box = await page.evaluate(() => { const e=document.querySelector('.map__target[data-unit="gibraltar"]'); const b=e.getBoundingClientRect(); return {x:b.x+b.width/2,y:b.y+b.height/2}; });
  await page.mouse.move(box.x, box.y);
  await page.waitForTimeout(900);
  await shot('hover-gib');
  log('tooltip?: ' + await page.evaluate(() => {
    const t = document.querySelector('.map__tip, .tooltip, [role=tooltip], .map__hover');
    return t ? t.innerText : 'NONE';
  }));
  log('body diff: ' + await page.evaluate(()=>document.querySelector('.map').innerText.slice(0,400)));
  // zoom deep into Med
  await page.mouse.wheel(0,-1200); await page.waitForTimeout(1200);
  await page.mouse.wheel(0,-1200); await page.waitForTimeout(1500);
  await shot('zoom-deep');
  log('after zoom, map text: ' + await page.evaluate(()=>document.querySelector('.map').innerText.slice(0,300)));
};
