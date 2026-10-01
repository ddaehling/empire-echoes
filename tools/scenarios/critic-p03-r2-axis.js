/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1919'; });
  await page.waitForTimeout(800);
  await shot('axis', '.tl-ax');
  await shot('spine', '.tl-spine');
  // hover a mark
  const mk = await page.$$('.tl-mark');
  log('marks: '+mk.length);
  if (mk.length>40) { await mk[40].hover(); await page.waitForTimeout(600); await shot('mark-hover'); 
    log('pop text: '+await page.evaluate(()=>{const p=document.querySelector('.tl-pop'); return p&&!p.hidden?p.innerText.slice(0,500):'(hidden)';})); }
  if (mk.length>40) { await mk[40].click({force:true}); await page.waitForTimeout(600); await shot('mark-click');
    log('pop after click: '+await page.evaluate(()=>{const p=document.querySelector('.tl-pop'); return p&&!p.hidden?p.innerText.slice(0,600):'(hidden)';})); }
};
