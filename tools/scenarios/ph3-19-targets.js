/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  page.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
  page.on('requestfailed',r=>errs.push('REQFAIL '+r.url()));
  await page.waitForTimeout(2500);
  const scan = async (tag) => {
    const r = await page.evaluate(()=>{
      const small=[]; let total=0;
      document.querySelectorAll('button,a[href],input,select,[role=button]').forEach(e=>{
        if(!e.offsetParent) return; const b=e.getBoundingClientRect(); if(b.width<2||b.height<2) return;
        if (b.top<0||b.bottom>innerHeight) return;
        total++;
        if (b.width<44||b.height<44) small.push(`${(e.getAttribute('aria-label')||e.textContent||'').trim().replace(/\s+/g,' ').slice(0,40)} ${Math.round(b.width)}x${Math.round(b.height)}`);
      });
      // overlapping pairs among top-bar controls
      const els=[...document.querySelectorAll('header button,.tr-bar button')].filter(e=>e.offsetParent);
      const ov=[];
      for(let i=0;i<els.length;i++)for(let j=i+1;j<els.length;j++){
        const a=els[i].getBoundingClientRect(), c=els[j].getBoundingClientRect();
        if(a.left<c.right&&c.left<a.right&&a.top<c.bottom&&c.top<a.bottom) ov.push(`${(els[i].getAttribute('aria-label')||els[i].textContent).trim().slice(0,25)} ⨯ ${(els[j].getAttribute('aria-label')||els[j].textContent).trim().slice(0,25)}`);
      }
      return {total, small, ov};
    });
    log(`${tag}: ${r.total} on-screen controls, ${r.small.length} below 44px`);
    r.small.forEach(s=>log('   small: '+s));
    r.ov.forEach(s=>log('   OVERLAP: '+s));
  };
  await scan('cold');
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1700);
  await scan('beat1');
  for(let k=0;k<7;k++){ await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^(weakens) it, sure$/i.test((x.getAttribute('aria-label')||'').trim())&&!x.disabled); if(b)b.click();}); await page.waitForTimeout(350);
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>/tr-panel__next|tr-bar__next/.test(x.className)&&!x.disabled)[0]; if(b)b.click();}); await page.waitForTimeout(1200);}
  await scan('beat8');
  await shot('beat8');
  log('--- errors ---'); errs.forEach(e=>log(e));
};
