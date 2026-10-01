/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=1', {waitUntil:'load'});
  await page.waitForTimeout(2400);
  await shot('core1');
  let tot=0;
  for (let i=0;i<30;i++){
    const c = await page.locator('.tr-bar__count').innerText().catch(()=>'');
    if (/END/i.test(c)) { log('END at loop '+i); break; }
    const w = await page.evaluate(()=>{const e=document.querySelector('.tr-panel')||document.querySelector('.tr-gate'); return e?e.innerText.split(/\s+/).filter(Boolean).length:0;});
    tot+=w; log(c+' | '+w);
    for (let k=0;k<5;k++){
      const next = page.locator('.tr-bar__next');
      if (!(await next.isDisabled().catch(()=>true))) break;
      let did=false;
      for (const s of ['.tr-field__cell','.tr-choice','.dsr__choice','.qz-choice','.tr-gate__decline']){ const l=page.locator(s).first(); if(await l.count()&&await l.isVisible().catch(()=>false)){await l.click({timeout:1500}).catch(()=>{});did=true;break;} }
      await page.waitForTimeout(300); if(!did) break;
    }
    const next = page.locator('.tr-bar__next');
    if (await next.isDisabled().catch(()=>true)) { log('STUCK '+c); break; }
    await next.click({timeout:3000}).catch(()=>{});
    await page.waitForTimeout(380);
  }
  log('CORE TOTAL '+tot);
  // find the route offer on beat 1
  await page.goto('http://localhost:8777/app/#tour=thirty&step=1', {waitUntil:'load'});
  await page.waitForTimeout(2200);
  const routes = await page.evaluate(()=>{const e=document.querySelector('.tr-panel'); return e?e.innerText.slice(0,1400):'';});
  log('BEAT1 PANEL: '+routes);
};
