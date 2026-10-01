/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1600'; });
  await page.waitForTimeout(900);
  await page.evaluate(() => { const s=document.querySelector('[role="slider"]'); s.focus(); });
  const t0=Date.now();
  for (let i=0;i<397;i++) await page.keyboard.press('ArrowRight');
  log('scrub 1600->1997 in '+(Date.now()-t0)+'ms; landed '+await page.evaluate(()=>document.querySelector('.time__slot').innerText.split('\n').filter(s=>/^\d{4}$/.test(s.trim()))[0]));
  await page.waitForTimeout(1200);
  await shot('after-scrub');
};
