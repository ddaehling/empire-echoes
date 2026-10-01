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
  await page.waitForTimeout(900);
  let tot=0, inter=0;
  for (let i=0;i<30;i++){
    const c = await page.locator('.tr-bar__count').innerText().catch(()=>'');
    if (/END/i.test(c)) { log('END at loop '+i); break; }
    // read everything in the beat panel + lede + gate
    const w = await page.evaluate(()=>{
      const seen=new Set(); let t='';
      ['.tr-panel','.tr-gate','.stage__lede','.cx-sheet','.tr-forward','[class*="tr-"]'].forEach(s=>{
        document.querySelectorAll(s).forEach(e=>{ if(!e.offsetParent) return; if([...seen].some(p=>p.contains(e))) return; seen.add(e); t+=' '+e.innerText; });
      });
      return t.split(/\s+/).filter(Boolean).length;
    });
    tot+=w;
    let acts=0;
    for (let k=0;k<5;k++){
      const next = page.locator('.tr-bar__next');
      if (!(await next.isDisabled().catch(()=>true))) break;
      const cands = ['.tr-field__cell', '.tr-choice', '.dsr__choice', '.qz-choice', '.tr-gate__decline'];
      let did=false;
      for (const s of cands){ const l=page.locator(s).first(); if(await l.count() && await l.isVisible().catch(()=>false)){ await l.click({timeout:1500}).catch(()=>{}); did=true; acts++; break; } }
      await page.waitForTimeout(300); if(!did) break;
    }
    inter+=acts;
    log(c+' | '+w+' words | '+acts+' required acts');
    const next = page.locator('.tr-bar__next');
    if (await next.isDisabled().catch(()=>true)) { log('STUCK'); break; }
    await next.click({timeout:3000}).catch(()=>{});
    await page.waitForTimeout(380);
  }
  log('TOTAL VISIBLE WORDS '+tot+'  required gate acts '+inter);
};
