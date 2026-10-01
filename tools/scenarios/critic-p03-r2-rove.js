/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(()=>{ const m=document.querySelector('.tl-mark[tabindex="0"]')||document.querySelector('.tl-mark'); m.focus(); });
  log('focused: '+await page.evaluate(()=>document.activeElement.dataset.year+' '+document.activeElement.className));
  for (const k of ['ArrowRight','ArrowRight','ArrowRight']) { await page.keyboard.press(k); await page.waitForTimeout(250);
    log(k+' -> '+await page.evaluate(()=>document.activeElement.dataset.year+' | '+document.activeElement.className)); }
  await page.keyboard.press('Enter'); await page.waitForTimeout(600);
  log('after Enter, pop: '+await page.evaluate(()=>{const p=document.querySelector('.tl-pop'); return p&&!p.hidden?p.innerText.slice(0,400).replace(/\n/g,' | '):'(hidden)';}));
  await shot('rove');
};
