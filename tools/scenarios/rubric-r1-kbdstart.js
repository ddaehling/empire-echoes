/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const probe = async(tag)=>log(tag+' | hash='+await page.evaluate(()=>location.hash)+' | bar='+await page.evaluate(()=>(document.querySelector('.tr-bar')||{}).innerText.replace(/\s+/g,' ')));
  // 1. mouse click
  await page.waitForTimeout(2400); await probe('cold');
  await page.click('.cx-cta'); await page.waitForTimeout(1400); await probe('after MOUSE click');
  // 2. keyboard Enter
  await page.goto('http://localhost:8777/app/',{waitUntil:'load'}); await page.waitForTimeout(2400);
  await page.evaluate(()=>document.querySelector('.cx-cta').focus());
  await page.keyboard.press('Enter'); await page.waitForTimeout(1400); await probe('after ENTER');
  await shot('enter');
  // 3. keyboard Space
  await page.goto('http://localhost:8777/app/',{waitUntil:'load'}); await page.waitForTimeout(2400);
  await page.evaluate(()=>document.querySelector('.cx-cta').focus());
  await page.keyboard.press('Space'); await page.waitForTimeout(1400); await probe('after SPACE');
  // 4. tab to the CTA naturally and count tabs
  await page.goto('http://localhost:8777/app/',{waitUntil:'load'}); await page.waitForTimeout(2400);
  let n=0, found=false;
  for(;n<40;n++){ await page.keyboard.press('Tab');
    const isCta = await page.evaluate(()=>document.activeElement && document.activeElement.classList.contains('cx-cta'));
    if(isCta){found=true;break;} }
  log('tabs to reach CTA: '+(found? (n+1):'NOT REACHED in 40'));
  const order = await page.evaluate(()=>document.activeElement.outerHTML.slice(0,120));
  log('focused: '+order);
};
