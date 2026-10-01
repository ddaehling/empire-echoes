/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=1',{waitUntil:'load'});
  await page.waitForTimeout(2500);
  await shot('core1');
  log('bar: '+await page.evaluate(()=>(document.querySelector('.tr-bar')||{}).innerText.replace(/\s+/g,' ')));
  let i=0;
  for(;i<30;i++){
    for(let k=0;k<3;k++){
      const blocked = await page.evaluate(()=>{const n=document.querySelector('.tr-bar__next'); return !n||n.disabled;});
      if(!blocked) break;
      await page.evaluate(()=>{
        const c=document.querySelector('.tr-field__cell'); if(c){c.click();return;}
        const ch=document.querySelector('.tr-choice'); if(ch){ch.click();return;}
        const b=[...document.querySelectorAll('button')].filter(x=>!x.disabled&&/commit|guess|skip it|settle|show me|record/i.test(x.textContent)); if(b[0])b[0].click();
      });
      await page.waitForTimeout(450);
    }
    const moved = await page.evaluate(()=>{const n=document.querySelector('.tr-bar__next'); if(!n||n.disabled)return false; n.click(); return true;});
    if(!moved){ log('CORE STUCK at advance '+i); await shot('corestuck'); break; }
    await page.waitForTimeout(600);
    if (await page.evaluate(()=>/THE END/.test((document.querySelector('.tr-bar')||{}).innerText||''))) { log('CORE END after '+(i+1)); break; }
  }
  await shot('coreend');
  const t = await page.evaluate(()=>document.body.innerText);
  const m = t.match(/(\d+) of (\d+) lines/); log('LINES: '+(m?m[0]:'not found'));
  const g = (t.match(/greyed[^]{0,400}/)||[])[0]; log('greyed note: '+(g||'').slice(0,300));
  log('CLOSE excerpt: '+t.slice(t.indexOf('What you can now defend'), t.indexOf('What you can now defend')+2200));
};
