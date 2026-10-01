/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  // tab from the skip-link "Skip to the timeline"
  const link = await page.$('a[href="#timeline"], a[href*="timeline"]');
  log('skip link:', link ? await link.evaluate(n=>n.outerHTML) : 'none');
  await page.evaluate(()=>document.querySelector('.tl-btn--play').focus());
  const seq=[];
  for (let i=0;i<16;i++){ await page.keyboard.press('Tab'); await page.waitForTimeout(90);
    seq.push(await page.evaluate(()=>{const a=document.activeElement; return (a.tagName+'.'+String(a.className||'')).slice(0,60)+' :: '+(a.getAttribute('aria-label')||a.textContent||'').trim().slice(0,40);})); }
  log('tab order from Play:\n'+seq.join('\n'));
  await shot('focusring');
  // live region
  log('live regions:', await page.evaluate(()=>[...document.querySelectorAll('[aria-live]')].map(n=>String(n.className)+'='+n.getAttribute('aria-live')+' :: '+n.textContent.slice(0,120)).join(' || ')));
};
