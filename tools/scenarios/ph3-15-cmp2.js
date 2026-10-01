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
  for (let k=0;k<7;k++){ await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^(weakens) it, sure$/i.test((x.getAttribute('aria-label')||'').trim())&&!x.disabled); if(b)b.click();}); await page.waitForTimeout(400);
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>/tr-panel__next|tr-bar__next/.test(x.className)&&!x.disabled)[0]; if(b)b.click();}); await page.waitForTimeout(1300);}
  log('step now: '+await page.evaluate(()=>(document.body.innerText.match(/\d+ \/ \d+/)||[''])[0]) + ' hash ' + await page.evaluate(()=>location.hash));
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^Tools/.test(x.textContent.trim())); if(b)b.click();});
  await page.waitForTimeout(700); await shot('tools');
  const items = await page.evaluate(()=>[...document.querySelectorAll('button,a')].filter(e=>e.offsetParent).map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim().replace(/\s+/g,' ').slice(0,60)));
  log('tools items: ' + JSON.stringify(items.filter(x=>/compare|recall|count|taken|desk|find/i.test(x))));
  const ok = await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(e=>e.offsetParent&&/compare/i.test((e.getAttribute('aria-label')||e.textContent||''))); if(b){b.click(); return (b.getAttribute('aria-label')||b.textContent).trim();} return null;});
  log('clicked: ' + ok);
  await page.waitForTimeout(2000);
  await shot('compare-open');
  const st = await page.evaluate(()=>{
    const t=document.body.innerText;
    return { hash:location.hash, first1500:t.replace(/\s+/g,' ').slice(0,1500) };
  });
  log(JSON.stringify(st,null,1));
  log('--- errors ---'); errs.forEach(e=>log(e));
};
