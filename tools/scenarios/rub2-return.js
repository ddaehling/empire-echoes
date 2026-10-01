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
  for (let i=0;i<8;i++){
    for (let k=0;k<4;k++){
      const n=page.locator('.tr-bar__next'); if(!(await n.isDisabled().catch(()=>true))) break;
      let d=false; for(const s of ['.tr-field__cell','.tr-choice','.dsr__choice']){const l=page.locator(s).first(); if(await l.count()&&await l.isVisible().catch(()=>false)){await l.click({timeout:1200}).catch(()=>{});d=true;break;}}
      await page.waitForTimeout(300); if(!d)break;
    }
    const n=page.locator('.tr-bar__next'); if(await n.isDisabled().catch(()=>true))break;
    await n.click({timeout:2500}).catch(()=>{}); await page.waitForTimeout(350);
  }
  const before = await page.locator('.tr-bar__count').innerText().catch(()=>'');
  log('before reload: '+before+' hash '+await page.evaluate(()=>location.hash));
  // hard return: go to bare url
  await page.goto('http://localhost:8777/app/', {waitUntil:'load'});
  await page.waitForTimeout(2500);
  await shot('return');
  log('RETURN BODY: '+(await page.evaluate(()=>document.body.innerText)).slice(0,1400));
};
