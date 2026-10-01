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
  log('dossierLedger:', await page.evaluate(()=>{try{return JSON.stringify(window.BEA.dossierLedger).slice(0,2000)}catch(e){return 'err '+e.message}}));
  const cl = await page.evaluate(()=>[...document.querySelectorAll('.dossier [data-claim],[data-claim-id]')].slice(0,6).map(n=>n.outerHTML.slice(0,160)));
  log('claims:\n'+cl.join('\n'));
  // does ledger:append fire on bus?
  await page.evaluate(()=>{ window.__evts=[]; window.BEA.bus.on && window.BEA.bus.on('ledger:append', e=>window.__evts.push(e)); });
  await page.evaluate(()=>{location.hash='#year=1913&sel=kenya';}); await page.waitForTimeout(1500);
  log('ledger:append events:', await page.evaluate(()=>JSON.stringify((window.__evts||[]).slice(0,6))));
  log('dossierLedger after:', await page.evaluate(()=>{try{return JSON.stringify(window.BEA.dossierLedger).slice(0,1200)}catch(e){return 'err'}}));
  const ls = await page.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k).slice(0,400)}return o;});
  log('LS:', JSON.stringify(ls).slice(0,1500));
};
