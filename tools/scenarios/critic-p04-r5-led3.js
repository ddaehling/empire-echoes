/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  await page.addStyleTag({content:'.map__furniture{display:none !important}'});
  // click a claim block heading
  await page.evaluate(()=>{ const s=document.querySelector('[data-claim="bengal-presidency:status:1765"]'); s.click(); });
  await page.waitForTimeout(500);
  log('after claim click LS:', await page.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k).slice(0,300)}return o;}));
  log('dossierLedger:', await page.evaluate(()=>JSON.stringify(window.BEA.dossierLedger)));
  // commit the belief
  const b = await page.$('.dossier button:has-text("I think that is true")');
  await b.scrollIntoViewIfNeeded(); await b.click(); await page.waitForTimeout(700);
  log('after belief LS:', JSON.stringify(await page.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k).slice(0,500)}return o;})));
  log('dossierLedger:', await page.evaluate(()=>JSON.stringify(window.BEA.dossierLedger).slice(0,900)));
  // commit an attribution gate
  const g = await page.$('.dossier button:has-text("To run something, for the administration")');
  if (g) { await g.scrollIntoViewIfNeeded(); await g.click(); await page.waitForTimeout(700); await shot('gate-committed');
    log('gate result:', await page.evaluate(()=>{const t=document.querySelector('.dossier').innerText; const i=t.indexOf('WHAT IT WAS MADE FOR'); return t.slice(i,i+800).replace(/\n+/g,' | ');})); }
  else log('no attribution gate button found');
  log('final LS:', JSON.stringify(await page.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k).slice(0,400)}return o;})));
};
