/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(2800);
  await page.addStyleTag({content:'.map__furniture{display:none !important}'});
  const b = await page.$('.dossier button:has-text("I think that is true")');
  await b.scrollIntoViewIfNeeded(); await b.click(); await page.waitForTimeout(600);
  log('sessionStorage:', await page.evaluate(()=>{const o={};for(let i=0;i<sessionStorage.length;i++){const k=sessionStorage.key(i);o[k]=sessionStorage.getItem(k).slice(0,300)}return o;}));
  log('localStorage:', await page.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k).slice(0,300)}return o;}));
  // reload
  await page.reload({waitUntil:'load'}); await page.waitForTimeout(2800);
  await page.addStyleTag({content:'.map__furniture{display:none !important}'});
  const t = await page.evaluate(()=>{const x=document.querySelector('.dossier').innerText; const i=x.indexOf('THINK, BEFORE'); return x.slice(i,i+500).replace(/\n+/g,' | ');});
  log('after reload think block:', t);
};
