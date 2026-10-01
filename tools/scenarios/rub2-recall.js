/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2200);
  await page.locator('button:has-text("Start the lesson")').first().click();
  await page.waitForTimeout(800);
  for (let i=0;i<30;i++){
    const c = await page.locator('.tr-bar__count').innerText().catch(()=>'');
    if (/END/i.test(c)) break;
    if (/RECALL/.test(c)) {
      await shot('recall-'+c.replace(/\D+/g,'-'));
      log('=== '+c+' ===');
      log(await page.evaluate(()=>{
        const p=document.querySelector('.tr-panel')||document.querySelector('[class*="qz"]')||document.body;
        return p.innerText.slice(0,1400);
      }));
    }
    for (let k=0;k<5;k++){
      const next=page.locator('.tr-bar__next');
      if(!(await next.isDisabled().catch(()=>true))) break;
      let did=false;
      for(const s of ['.tr-field__cell','.tr-choice','.dsr__choice','.qz-choice','.tr-gate__decline']){const l=page.locator(s).first(); if(await l.count()&&await l.isVisible().catch(()=>false)){await l.click({timeout:1500}).catch(()=>{});did=true;break;}}
      await page.waitForTimeout(300); if(!did)break;
    }
    const next=page.locator('.tr-bar__next');
    if(await next.isDisabled().catch(()=>true)){log('STUCK '+c);break;}
    await next.click({timeout:3000}).catch(()=>{});
    await page.waitForTimeout(380);
  }
};
