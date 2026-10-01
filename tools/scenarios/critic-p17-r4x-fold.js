/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.evaluate(()=>{location.hash='#year=1914';}); await page.waitForTimeout(1600);
  await shot('a-unfolded');
  await page.locator('.legend__toggle').first().click(); await page.waitForTimeout(1200);
  await shot('b-folded');
  const m = await page.evaluate(()=>{ const l=document.querySelector('.legend'); const b=l.getBoundingClientRect();
    return {h:Math.round(b.height), txt:l.innerText.slice(0,200)}; });
  log(JSON.stringify(m));
};
