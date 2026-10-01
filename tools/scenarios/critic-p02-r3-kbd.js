/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
  await page.goto('http://localhost:8777/app/#year=1913');
  await page.waitForTimeout(3200);
  // tab until we land in the map targets
  let found = null;
  for (let i=0;i<70;i++){
    await page.keyboard.press('Tab');
    const a = await page.evaluate(()=>{ const e=document.activeElement; return { cls: e.className, tag: e.tagName, role: e.getAttribute('role'), ad: e.getAttribute('aria-activedescendant'), lbl: (e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,80) }; });
    if (/map__targets|listbox/.test(a.cls + ' ' + a.role)) { found = { i, ...a }; break; }
  }
  log('reached listbox after tabs:', JSON.stringify(found));
  if (found) {
    const seq = [];
    for (let i=0;i<6;i++){
      await page.keyboard.press('ArrowRight'); await page.waitForTimeout(220);
      seq.push(await page.evaluate(()=>{
        const lb = document.querySelector('.map__targets');
        const id = lb && lb.getAttribute('aria-activedescendant');
        const o = id && document.getElementById(id);
        return { ad: id, label: o ? (o.getAttribute('aria-label')||'').slice(0,120) : null };
      }));
    }
    log('arrow sequence:', JSON.stringify(seq, null, 1));
    await page.keyboard.press('Enter'); await page.waitForTimeout(700);
    log('after Enter hash:', await page.evaluate(()=>location.hash));
    await shot('kbd-focus');
  }
  log('ERR', JSON.stringify(errs));
};
