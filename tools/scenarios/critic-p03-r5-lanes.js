/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — elementHandle.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{location.hash='#year=1913';});
  await page.waitForTimeout(800);
  const lanes = await page.$$('.tl-lane');
  log('lanes:', lanes.length);
  await lanes[0].click();
  await page.waitForTimeout(800);
  await shot('lane1-open');
  log('DRAWER:', await page.evaluate(()=>document.querySelector('.tl__drawer, .tl-spine__drawer, [class*="drawer"]')?.innerText.slice(0,1600)));
  // contested chip
  await page.evaluate(()=>{location.hash='#year=1900';});
  await page.waitForTimeout(800);
  const warn = await page.$('.tl__warn');
  if (warn) { await warn.click(); await page.waitForTimeout(800); await shot('warn-open');
    log('WARN:', await page.evaluate(()=>{const e=document.querySelector('.tl__warnbody, .tl__note, [class*="warn"]'); return e?e.innerText.slice(0,1200):'none';})); }
};
