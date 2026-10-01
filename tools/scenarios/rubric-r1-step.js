/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const steps = (process.env.STEPS||'17').split(',');
  for (const s of steps) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step='+s, {waitUntil:'load'});
    await page.waitForTimeout(2200);
    await shot('step'+s);
    const t = await page.evaluate(()=>({
      bar: (document.querySelector('.tr-bar')||{}).innerText,
      head: (document.querySelector('.cx-say,.cx-head')||{}).innerText,
      panel: (document.querySelector('.tr-panel,[class*=panel]')||{}).innerText
    }));
    log('STEP '+s+' bar='+JSON.stringify(t.bar));
    log('  head='+JSON.stringify(t.head));
    log('  panel='+(t.panel||'').replace(/\s+/g,' ').slice(0,2500));
  }
};
