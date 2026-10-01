/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.click('.tl__track .tl-chg:not([hidden])');
  await page.waitForTimeout(600);
  log(JSON.stringify(await page.evaluate(() => {
    const R=(s)=>{const n=document.querySelector(s); if(!n) return null; const r=n.getBoundingClientRect(); return [Math.round(r.top),Math.round(r.bottom),Math.round(r.height)];};
    return { map:R('#stage'), tl:R('.tl'), drawer:R('.tl__drawer'), pop:R('.tl__pop'), spine:R('.tl-spine'), rate:R('.tl-rate') };
  })));
  await shot('01-card-open');
};
