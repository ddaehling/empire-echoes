/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(1200);
  await page.evaluate(()=>{ location.hash='#year=1913&def=claimed'; });
  await page.waitForTimeout(2500);
  const L = '[data-mount="legend"]';
  const info = await page.evaluate((s)=>{const e=document.querySelector(s); const r=e.getBoundingClientRect(); return {h:Math.round(r.height), sh:e.scrollHeight, y:Math.round(r.y)};}, L);
  log('legend box: '+JSON.stringify(info));
  await shot('key-top', L);
  for (let i=1;i<=6;i++){
    await page.evaluate((s)=>{const e=document.querySelector(s); e.scrollTop += e.clientHeight-40;}, L);
    await page.waitForTimeout(350);
    await shot('key-scroll'+i, L);
  }
};
