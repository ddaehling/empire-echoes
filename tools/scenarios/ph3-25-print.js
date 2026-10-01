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
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1600);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Finish here/i.test(x.getAttribute('aria-label')||'')); if(b)b.click();});
  await page.waitForTimeout(2000);
  const s = await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/Go and sign it/i.test(x.textContent||'')); if(b){b.click(); return 'signed-nav';} return 'nf';});
  log('sign: '+s); await page.waitForTimeout(1500); await shot('sign-area');
  const ctrls = await page.evaluate(()=>[...document.querySelectorAll('button,a,input')].filter(e=>e.offsetParent).map(e=>((e.getAttribute('aria-label')||e.textContent||e.placeholder||'').trim().replace(/\s+/g,' ').slice(0,60))).filter(x=>/sign|print|page|A4|word|blank|choose/i.test(x)));
  ctrls.forEach(x=>log('c: '+x));
  const pr = await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/Print my revision sheet/i.test((x.getAttribute('aria-label')||x.textContent||''))); if(b){b.click(); return (b.getAttribute('aria-label')||b.textContent).trim().slice(0,50);} return 'no print control';});
  log('print: '+pr);
  await page.waitForTimeout(1500);
  await page.emulateMedia({media:'print'}).catch(()=>{});
  await page.waitForTimeout(800); await shot('printmedia');
  log('print doc text: '+ (await page.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ').slice(0,1800));
  await page.emulateMedia({media:'screen'}).catch(()=>{});
  await page.waitForTimeout(1800); await shot('print');
  log(await page.evaluate(()=>document.body.innerText.replace(/\s+/g,' ').slice(0,1200)));
  log('--- errors ---'); errs.forEach(e=>log(e));
};
