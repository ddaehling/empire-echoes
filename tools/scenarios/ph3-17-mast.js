/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1600);
  const report = async (i) => {
    const r = await page.evaluate(()=>{
      const h=document.querySelector('.tr-bar')||document.querySelector('header');
      const kids=[...document.querySelectorAll('header button, .tr-bar button, [class*=masthead] button')].filter(b=>b.offsetParent);
      return { n:kids.length, over:kids.filter(b=>{const x=b.getBoundingClientRect(); return x.right>innerWidth+1||x.left<-1;}).map(b=>{const x=b.getBoundingClientRect(); return ((b.getAttribute('aria-label')||b.textContent).trim().replace(/\s+/g,' ').slice(0,45))+` [${Math.round(x.left)}..${Math.round(x.right)}]`;}),
        all:kids.map(b=>{const x=b.getBoundingClientRect(); return ((b.getAttribute('aria-label')||b.textContent).trim().replace(/\s+/g,' ').slice(0,30))+`@${Math.round(x.left)}-${Math.round(x.right)}`;}) };
    });
    log(`step ${i}: controls=${r.n} OVERFLOW=${JSON.stringify(r.over)}`);
    log(`   ${r.all.join(' | ')}`);
  };
  for (let i=1;i<=15;i++){
    await report(i);
    if ([1,5,8,9,14].includes(i)) await shot('m'+String(i).padStart(2,'0'));
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^(weakens) it, sure$/i.test((x.getAttribute('aria-label')||'').trim())&&!x.disabled); if(b)b.click();});
    await page.waitForTimeout(350);
    const ok=await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>/tr-panel__next|tr-bar__next/.test(x.className)&&!x.disabled)[0]; if(b){b.click();return 1;} return 0;});
    if(!ok){ await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/rather read this atlas|rather not/i.test(x.textContent)&&!x.disabled); if(b)b.click();});
      await page.waitForTimeout(400);
      await page.evaluate(()=>{const bs=[...document.querySelectorAll('[class*=tension] button')].filter(b=>!b.disabled&&!/Show me/.test(b.textContent)); bs.forEach((b,ix)=>{if(ix%3===0)b.click();});});
      await page.waitForTimeout(400);
      await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Show me what they wrote/i.test(x.textContent)&&!x.disabled); if(b)b.click();});
      await page.waitForTimeout(800);
      await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>/tr-panel__next|tr-bar__next/.test(x.className)&&!x.disabled)[0]; if(b)b.click();});
    }
    await page.waitForTimeout(1300);
  }
};
