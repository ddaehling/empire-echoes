/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — elementHandle.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const labels = await page.evaluate(()=>[...document.querySelectorAll('.tl-mark')].map((b,i)=>i+': '+b.getAttribute('aria-label').slice(0,160)));
  log(labels.join('\n'));
  const idx = await page.evaluate(()=>[...document.querySelectorAll('.tl-mark')].findIndex(b=>/194[5-9]/.test(b.getAttribute('aria-label'))));
  log('idx', idx);
  if (idx>=0) { const b=(await page.$$('.tl-mark'))[idx]; await b.click(); await page.waitForTimeout(700); await shot('m1947');
    log('pop:', await page.evaluate(()=>{const p=document.querySelector('.tl__pop'); return p&&!p.hidden?p.innerText.slice(0,3000):'none';})); }
};
