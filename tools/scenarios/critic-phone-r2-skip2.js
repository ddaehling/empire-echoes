/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(()=>window.BEA&&window.BEA.store&&window.BEA.store.getState().status==='ready',{timeout:30000});
  await page.waitForTimeout(600);
  await page.locator('button:has-text("Start the lesson")').first().click();
  await page.waitForTimeout(700);
  const t0=Date.now(); let clicks=0; const blocked=[];
  for (let i=1;i<=30;i++){
    const st = await page.evaluate(()=>{
      const n=document.querySelector('.tr-bar__next');
      return n?{d:n.disabled,l:(n.textContent||'').trim().replace(/\s+/g,' ')}:null;
    });
    if(!st){ log('no next at iter '+i); break; }
    if(st.d){
      blocked.push(i);
      const cells = await page.locator('.tr-field__cell').count();
      if(cells){ await page.locator('.tr-field__cell').nth(4).click({timeout:3000}).catch(()=>{}); await page.waitForTimeout(300); }
      else { log('blocked with no gate cells at '+i+' label='+st.l); break; }
    }
    const ok = await page.evaluate(()=>{ const n=document.querySelector('.tr-bar__next'); if(!n||n.disabled) return false; n.click(); return true; });
    if(!ok){ log('still blocked '+i); break; }
    clicks++;
    await page.waitForTimeout(400);
  }
  log('SECONDS='+Math.round((Date.now()-t0)/1000)+' clicks='+clicks+' gatesHit='+JSON.stringify(blocked));
  await shot('after-skip');
  log('TEXT '+(await page.evaluate(()=>document.body.innerText)).slice(0,700));
};
