/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913');
  await page.waitForTimeout(3200);
  for (let i=0;i<3;i++) await page.keyboard.press('Tab');
  const a = await page.evaluate(()=>{ const e=document.activeElement; return { cls:e.className, role:e.getAttribute('role'), unit:e.getAttribute('data-unit'), lbl:(e.getAttribute('aria-label')||'').slice(0,160) }; });
  log('focus after 3 tabs:', JSON.stringify(a));
  await shot('focus-first');
  const seq=[];
  for (let i=0;i<10;i++){ await page.keyboard.press('ArrowRight'); await page.waitForTimeout(200);
    seq.push(await page.evaluate(()=>{ const e=document.activeElement; return (e.getAttribute('data-unit')||e.className)+' :: '+(e.getAttribute('aria-label')||'').slice(0,110); })); }
  log('arrows:', JSON.stringify(seq, null, 1));
  await shot('focus-after-arrows');
  await page.keyboard.press('Enter'); await page.waitForTimeout(800);
  log('hash after Enter:', await page.evaluate(()=>location.hash));
  // can we reach the tiny ones?
  const reach = await page.evaluate(()=>{
    const opts=[...document.querySelectorAll('.map__targets [role="option"]')];
    return { tabbable: opts.filter(o=>o.tabIndex>=0).map(o=>o.getAttribute('data-unit')), total: opts.length };
  });
  log('tabbable options:', JSON.stringify(reach));
};
