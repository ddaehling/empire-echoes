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
  await page.waitForTimeout(1500);
  for (let i=0;i<2;i++){ await page.getByRole('button',{name:/^Next/i}).first().click(); await page.waitForTimeout(1300);} 
  log('--- panel full text at beat 3 ---');
  log(await page.evaluate(()=>{const e=document.querySelector('[aria-label*="scrollable"]'); return e?e.innerText:'?';}));
  log('--- tension controls ---');
  const c = await page.evaluate(()=>[...document.querySelectorAll('.tr-tension button,.tr-tension input,.tr-tension select,[class*=tension] button,[class*=tension] input')].map(e=>`${e.tagName}|${e.disabled?'DISABLED':'ok'}|${(e.getAttribute('aria-label')||e.textContent||e.value||'').trim().replace(/\s+/g,' ').slice(0,70)}`));
  c.forEach(x=>log(x));
  await page.evaluate(()=>{const e=document.querySelector('[aria-label*="scrollable"]'); if(e) e.scrollTop = 700;});
  await page.waitForTimeout(400); await shot('tension');
};
