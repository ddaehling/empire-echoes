/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const steps=[1,5,8,9,14,20,23];
  for (const s of steps) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step='+s, {waitUntil:'load'});
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
    await page.waitForTimeout(1200);
    const m = await page.evaluate(()=>{
      const bar = document.querySelector('.app__bar');
      const kids=[...bar.querySelectorAll('button,a[href],[role="button"],select')].filter(e=>e.offsetParent!==null);
      return { n:kids.length, items:kids.map(e=>({t:(e.textContent||'').trim().replace(/\s+/g,' ').slice(0,30), al:e.getAttribute('aria-label')||'', r:(r=>({x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}))(e.getBoundingClientRect())})),
        raw: bar.innerText.replace(/\n/g,'|') };
    });
    log('STEP '+s+' masthead controls='+m.n+' raw='+JSON.stringify(m.raw));
    log('   '+JSON.stringify(m.items));
    await shot('mast-'+s, '.app__bar');
  }
};
