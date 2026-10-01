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
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Finish here/i.test(x.getAttribute('aria-label')||'')); if(b)b.click();});
  await page.waitForTimeout(2200); await shot('close');
  const c = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>((b.getAttribute('aria-label')||b.textContent).trim().replace(/\s+/g,' ').slice(0,60))));
  c.forEach(x=>log('btn: '+x));
  log('--- close text ---');
  log((await page.evaluate(()=>document.body.innerText)).slice(0,2200));
  // sign the through-line and print
  const sign = await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/sign|print|A4|page you can/i.test((x.getAttribute('aria-label')||x.textContent||''))); if(b){b.click(); return (b.getAttribute('aria-label')||b.textContent).trim().slice(0,60);} return null;});
  log('clicked: '+sign);
  await page.waitForTimeout(1600); await shot('after-sign');
  log('--- errors ---'); errs.forEach(e=>log(e));
};
