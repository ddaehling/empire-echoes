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
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1600);
  for(let k=0;k<5;k++){ await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^(weakens) it, sure$/i.test((x.getAttribute('aria-label')||'').trim())&&!x.disabled); if(b)b.click();}); await page.waitForTimeout(350);
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>/tr-panel__next|tr-bar__next/.test(x.className)&&!x.disabled)[0]; if(b)b.click();}); await page.waitForTimeout(1300);}
  log('step: '+await page.evaluate(()=>(document.body.innerText.match(/\d+ \/ \d+/)||[''])[0]));
  await shot('loop-top');
  // scroll the panel to find the loop diagram
  const svg = await page.evaluate(()=>{
    const s=[...document.querySelectorAll('svg')].map(e=>{const r=e.getBoundingClientRect(); return `${(e.getAttribute('class')||e.id||e.parentElement.className||'').toString().slice(0,40)} ${Math.round(r.width)}x${Math.round(r.height)}@${Math.round(r.y)}`;});
    return s;
  });
  svg.forEach(x=>log('svg: '+x));
  for(let i=0;i<6;i++){
    await page.evaluate(()=>{const e=document.querySelector('[aria-label*="scrollable"]'); if(e) e.scrollTop += e.clientHeight*0.85;});
    await page.waitForTimeout(400); await shot('loop-scroll'+i);
  }
  log('panel text: '+await page.evaluate(()=>{const e=document.querySelector('[aria-label*="scrollable"]'); return e?e.innerText.replace(/\s+/g,' ').slice(0,1600):'?';}));
  log('--- errors ---'); errs.forEach(e=>log(e));
};
