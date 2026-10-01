/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(()=>{location.hash='#year=1860';});
  await page.waitForTimeout(1400);
  await page.keyboard.press('4');
  await page.waitForTimeout(1600);
  await shot('1860-influenced');
  log('1860: ' + await page.evaluate(()=>document.querySelector('.map__plate').getAttribute('aria-label')));
  const inf = await page.evaluate(async () => {
    const m = await import('/app/js/core/data.js'); const data = await m.loadData({});
    const st = data.statusAt(1860);
    return [...st.entries()].filter(([u,e])=>e.status==='informal-sphere').map(([u,e])=>u);
  });
  log('informal units 1860: ' + JSON.stringify(inf));
  await page.evaluate(()=>{location.hash='#year=1900';});
  await page.waitForTimeout(1600);
  await shot('1900-influenced');
  log('1900: ' + await page.evaluate(()=>document.querySelector('.map__plate').getAttribute('aria-label')));
};
