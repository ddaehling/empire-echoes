/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const t0 = Date.now();
  await page.click('.cx-cta');
  await page.waitForTimeout(1000);
  for (let i=1;i<=26;i++){
    // satisfy any blocker generically
    for (let k=0;k<3;k++){
      const blocked = await page.evaluate(()=>{const n=document.querySelector('.tr-bar__next'); return !n||n.disabled;});
      if (!blocked) break;
      await page.evaluate(()=>{
        const c=document.querySelector('.tr-field__cell'); if(c){c.click(); return;}
        const ch=document.querySelector('.tr-choice'); if(ch){ch.click(); return;}
        const up=document.querySelector('.tr-order__up, [aria-label*="Move"], [class*=order] button'); if(up){up.click(); return;}
        const b=[...document.querySelectorAll('button')].filter(x=>!x.disabled&&/commit|that is my guess|skip it|settle|show me/i.test(x.textContent));
        if(b[0]) b[0].click();
      });
      await page.waitForTimeout(500);
    }
    const moved = await page.evaluate(()=>{const n=document.querySelector('.tr-bar__next'); if(!n||n.disabled)return false; n.click(); return true;});
    if(!moved){ log('stuck at '+i); await shot('stuck'+i); break; }
    await page.waitForTimeout(700);
    const end = await page.evaluate(()=>/THE END/.test((document.querySelector('.tr-bar')||{}).innerText||''));
    if (end) { log('reached END after '+i+' advances'); break; }
  }
  await shot('at-end');
  const st = await page.evaluate(()=>({bar:(document.querySelector('.tr-bar')||{}).innerText, body: document.body.innerText.slice(0,300)}));
  log('BAR>>'+JSON.stringify(st.bar));
  // open the Close
  const opened = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button,a')].filter(x=>/finish here|the close|close the lesson/i.test(x.textContent||x.getAttribute('aria-label')||''));
    if(b[0]){b[0].click(); return b[0].textContent.trim();} return null;
  });
  log('opened close: '+opened);
  await page.waitForTimeout(1500);
  await shot('close');
  const ct = await page.evaluate(()=>{
    const c=document.querySelector('[class*=cl-]:not(.cl-bar), .close, [class*=close]');
    return document.body.innerText.slice(0,6000);
  });
  log('CLOSETEXT>>'+ct);
};
