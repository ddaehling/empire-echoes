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
  for (let i=0;i<3;i++){ await page.getByRole('button',{name:/^Next/i}).first().click(); await page.waitForTimeout(1200);} 
  // now at gate (4)
  await page.getByRole('button', { name: /More of this beat/i }).first().click();
  await page.waitForTimeout(900);
  await shot('gate-scrolled');
  const ctrls = await page.evaluate(() => [...document.querySelectorAll('button,[role=button],input,select')]
    .filter(e => e.offsetParent !== null)
    .map(e => { const r = e.getBoundingClientRect(); return `${e.tagName}|${(e.getAttribute('aria-label')||e.textContent||'').trim().replace(/\s+/g,' ').slice(0,80)}|${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`; }));
  ctrls.forEach(c=>log(c));
  log('--- panel text ---');
  log(await page.evaluate(()=>{const e=document.querySelector('[aria-label*="scrollable"]'); return e?e.innerText:'?';}));
};
