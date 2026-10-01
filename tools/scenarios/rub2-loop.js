/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', {waitUntil:'load'});
  await page.waitForTimeout(2400);
  const box = await page.evaluate(()=>{
    const e = document.querySelector('[class*="loop"], svg.mech, .tr-loop, .mech');
    if(!e) return null; const b=e.getBoundingClientRect(); return {c:e.className.toString(),x:b.x,y:b.y,w:b.width,h:b.height};
  });
  log('LOOP '+JSON.stringify(box));
  if(box) await shot('loop', '[class*="loop"], svg.mech, .tr-loop, .mech');
  await shot('full');
  // step it
  const step = page.locator('button:has-text("Step it")').first();
  for (let i=0;i<5;i++){ if(await step.count()&&await step.isVisible()){ await step.click(); await page.waitForTimeout(700);} }
  await shot('stepped');
  if(box) await shot('loop-lit', '[class*="loop"], svg.mech, .tr-loop, .mech');
  log(await page.evaluate(()=>{const e=document.querySelector('.tr-panel'); return e?e.innerText.slice(0,2500):'';}));
};
