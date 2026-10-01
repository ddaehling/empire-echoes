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
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>/tr-panel__next|tr-bar__next/.test(x.className)&&!x.disabled)[0]; if(b)b.click();}); await page.waitForTimeout(1200);}
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  log('after esc step: '+await page.evaluate(()=>(document.body.innerText.match(/\d+ \/ \d+/)||[''])[0])+' hash '+await page.evaluate(()=>location.hash));
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^Tools/.test(x.textContent.trim())); if(b)b.click();});
  await page.waitForTimeout(600);
  const r = await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(e=>e.offsetParent&&/Compare — two dates/i.test((e.getAttribute('aria-label')||e.textContent||''))); if(b){b.click(); return 'clicked';} return 'notfound';});
  log('compare: '+r);
  await page.waitForTimeout(2200); await shot('cmp');
  log('hash: '+await page.evaluate(()=>location.hash));
  log(await page.evaluate(()=>document.body.innerText.replace(/\s+/g,' ').slice(0,1400)));
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/By twenty places or more/i.test(x.textContent)); if(b)b.click();});
  await page.waitForTimeout(2000); await shot('cmp-committed');
  const g = await page.evaluate(()=>[...document.querySelectorAll('[class*=cmp] canvas, [class*=cmp] svg, .cmp__plate, [class*=split]')].map(e=>{const r=e.getBoundingClientRect(); return `${e.className}`.slice(0,40)+` ${Math.round(r.width)}x${Math.round(r.height)}@${Math.round(r.y)}`;}));
  g.forEach(x=>log('plate: '+x));
  log(await page.evaluate(()=>document.body.innerText.replace(/\s+/g,' ').slice(0,1600)));
  log('--- errors ---'); errs.forEach(e=>log(e));
};
