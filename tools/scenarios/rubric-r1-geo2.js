/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const dump = async(tag)=>{
    const l = await page.evaluate(()=>{
      const out=[]; document.querySelectorAll('.map__label, [class*=lbl], .map__targets *').forEach(e=>{const t=(e.textContent||'').trim(); if(t&&t.length<40) out.push(t);});
      return [...new Set(out)];
    });
    log(tag+' :: '+JSON.stringify(l).slice(0,1200));
  };
  await page.goto('http://localhost:8777/app/#year=2020',{waitUntil:'load'}); await page.waitForTimeout(2600);
  await dump('COLD2020'); await shot('cold2020');
  await page.goto('http://localhost:8777/app/#tour=thirty&step=23',{waitUntil:'load'}); await page.waitForTimeout(2600);
  await dump('LESSON-S23'); await shot('s23');
};
