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
  const info = await page.evaluate(() => {
    const lb = document.querySelector('.map__targets');
    const all = [...document.querySelectorAll('a,button,input,select,textarea,[tabindex]')].filter(e=>e.tabIndex>=0 && e.offsetParent!==null);
    return { lbExists: !!lb, lbTabIndex: lb ? lb.tabIndex : null, lbRole: lb&&lb.getAttribute('role'),
      focusables: all.length,
      order: all.slice(0,60).map(e=>(e.className||e.tagName)+'').slice(0,60) };
  });
  log(JSON.stringify(info, null, 1).slice(0,3500));
  // focus the listbox directly
  const r = await page.evaluate(()=>{ const lb=document.querySelector('.map__targets'); if(!lb) return 'none'; lb.focus(); return document.activeElement.className; });
  log('direct focus ->', r);
  for (let i=0;i<4;i++){ await page.keyboard.press('ArrowRight'); await page.waitForTimeout(250); }
  log('activedescendant:', await page.evaluate(()=>{ const lb=document.querySelector('.map__targets'); const id=lb.getAttribute('aria-activedescendant'); const o=id&&document.getElementById(id); return id + ' :: ' + (o?o.getAttribute('aria-label'):'(none)'); }));
  await shot('kbd');
};
