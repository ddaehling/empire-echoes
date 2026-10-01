/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.route('**/js/tours/**', r => r.abort());
  await page.goto('http://localhost:8777/app/#year=1820');
  await page.waitForTimeout(4000);
  const s = await page.evaluate(()=>{
    const sp = document.querySelector('.tl-spine');
    return sp ? {h: Math.round(sp.getBoundingClientRect().height), text: sp.innerText.slice(0,260)} : 'ABSENT';
  });
  log('tours killed -> spine: '+JSON.stringify(s));
  await shot('tours-killed');
  // now compare mode
  await page.evaluate(()=>{ location.hash='#year=1913&cmp=1860'; });
  await page.waitForTimeout(1500);
  const s2 = await page.evaluate(()=>{ const sp=document.querySelector('.tl-spine'); return sp? {h:Math.round(sp.getBoundingClientRect().height), text: sp.innerText.slice(0,200)}:'ABSENT'; });
  log('compare -> spine: '+JSON.stringify(s2));
  await shot('compare');
};
