/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.evaluate(()=>{ try{localStorage.clear()}catch(e){} });
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  await page.addStyleTag({content:'.map__furniture{display:none !important}'});
  const before = await page.evaluate(()=>{ const o={}; for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i); o[k]=localStorage.getItem(k).slice(0,300);} return o; });
  log('LS after open:\n'+JSON.stringify(before,null,1).slice(0,2500));
  log('BEA globals:', JSON.stringify(await page.evaluate(()=>window.BEA?Object.keys(window.BEA):null)));
  const led = await page.evaluate(()=>{
    const L = window.BEA && (window.BEA.ledger || window.BEA.Ledger);
    if(!L) return '(no ledger global)';
    try { return JSON.stringify((L.all&&L.all())||(L.entries&&L.entries())||L).slice(0,1500); } catch(e){ return 'err '+e.message; }
  });
  log('ledger:', led);
  // click a claim
  const c = await page.$('.dossier [data-claim], .dossier [data-claim-id]');
  log('claim elements:', await page.evaluate(()=>document.querySelectorAll('.dossier [data-claim],[data-claim-id]').length));
};
