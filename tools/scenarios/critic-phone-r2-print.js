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
  await page.waitForTimeout(600);
  for (let i=1;i<=32;i++){
    const st=await page.evaluate(()=>{const n=document.querySelector('.tr-bar__next'); return n?{d:n.disabled}:null;});
    if(!st) break;
    if(st.d){const c=await page.locator('.tr-field__cell').count(); if(c){await page.locator('.tr-field__cell').nth(4).click().catch(()=>{}); await page.waitForTimeout(200);} else break;}
    const ok=await page.evaluate(()=>{const n=document.querySelector('.tr-bar__next'); if(!n||n.disabled)return false; n.click(); return true;});
    if(!ok) break; await page.waitForTimeout(300);
  }
  await page.waitForTimeout(800);
  // find print button
  const b = page.locator('button:has-text("Print my revision sheet")').first();
  log('print btn count '+await b.count());
  if (await b.count()) {
    await b.scrollIntoViewIfNeeded().catch(()=>{});
    await page.evaluate(()=>{window.__printed=0; const op=window.print; window.print=()=>{window.__printed++;};});
    await b.click({force:true}).catch(e=>log('click err '+e.message));
    await page.waitForTimeout(1500);
    await shot('printed');
    log('window.print called: '+await page.evaluate(()=>window.__printed));
    const t=await page.evaluate(()=>document.body.innerText.slice(0,1200));
    log('AFTER PRINT TEXT '+t);
  }
  // emulate print media
  await page.emulateMedia({media:'print'});
  await page.waitForTimeout(500);
  await shot('print-media');
  const pm = await page.evaluate(()=>({h:document.documentElement.scrollHeight, txt:document.body.innerText.slice(0,600)}));
  log('PRINT MEDIA height='+pm.h);
  log('PRINT MEDIA text '+pm.txt);
};
