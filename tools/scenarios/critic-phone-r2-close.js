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
  for (let i=1;i<=32;i++){
    const st = await page.evaluate(()=>{const n=document.querySelector('.tr-bar__next'); return n?{d:n.disabled}:null;});
    if(!st) break;
    if(st.d){ const c=await page.locator('.tr-field__cell').count(); if(c){await page.locator('.tr-field__cell').nth(4).click().catch(()=>{}); await page.waitForTimeout(250);} else break; }
    const ok = await page.evaluate(()=>{const n=document.querySelector('.tr-bar__next'); if(!n||n.disabled)return false; n.click(); return true;});
    if(!ok) break;
    await page.waitForTimeout(350);
  }
  await page.waitForTimeout(900);
  await shot('close-top');
  const p = await page.evaluate(()=>{ const e=document.querySelector('.tr-panel__scroll')||document.querySelector('.cx-sheet__body'); return e?{ch:e.clientHeight,sh:e.scrollHeight,t:e.innerText}:null;});
  log('CLOSE window='+(p&&p.ch)+' content='+(p&&p.sh));
  log('CLOSE TEXT>>>\n'+(p?p.t:'(none)')+'\n<<<');
  let i=0;
  if(p) for(let top=0; top<p.sh; top+=Math.max(60,p.ch-16)){
    await page.evaluate(t=>{const e=document.querySelector('.tr-panel__scroll')||document.querySelector('.cx-sheet__body'); e.scrollTop=t;},top);
    await page.waitForTimeout(200); await shot('c'+String(++i).padStart(2,'0'));
    if(i>=12) break;
  }
  // print?
  const pr = await page.evaluate(()=>[...document.querySelectorAll('button,a')].filter(e=>e.offsetParent&&/print|A4|page/i.test(e.textContent||'')).map(e=>(e.textContent||'').trim().slice(0,50)));
  log('PRINT CONTROLS '+JSON.stringify(pr));
};
