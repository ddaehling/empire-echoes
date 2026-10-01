/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.evaluate(()=>{ const m=document.querySelectorAll('.tl-mark')[3]; m.scrollIntoView({block:'center'}); m.focus(); });
  await page.waitForTimeout(700);
  await shot('mark-focused');
  log('focused:', await page.evaluate(()=>document.activeElement.getAttribute('aria-label')));
  log('visible note?:', await page.evaluate(()=>{
    const cands = document.querySelectorAll('.tl-ax [class*="note"], .tl-ax__tip, .tl__tip, [role=tooltip]');
    return Array.from(cands).map(e=>e.className+' :: '+e.innerText.slice(0,200)+' :: '+getComputedStyle(e).display);
  }));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  await shot('mark-activated');
  log('after Enter, year:', await page.evaluate(()=>document.querySelector('.tl__year').textContent));
  log('drawer:', await page.evaluate(()=>document.querySelector('.tl__drawer-scroll')?.innerText.slice(0,500)||'none'));
};
