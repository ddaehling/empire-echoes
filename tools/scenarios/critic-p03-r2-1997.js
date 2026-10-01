/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — elementHandle.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1997'; });
  await page.waitForTimeout(900);
  await shot('y1997');
  await page.evaluate(() => { location.hash = '#year=1947'; });
  await page.waitForTimeout(900);
  await shot('y1947');
  await page.evaluate(() => { location.hash = '#year=1948'; });
  await page.waitForTimeout(900);
  await shot('y1948');
  // click the disputed chip
  await page.evaluate(() => { location.hash = '#year=1820'; });
  await page.waitForTimeout(700);
  const chip = await page.$('button:has-text("account disputed")');
  log('chip found', !!chip);
  if (chip) { await chip.click(); await page.waitForTimeout(600); await shot('disputed'); 
    log('after chip:', await page.evaluate(()=>document.querySelector('.time__slot').innerText.slice(0,1200))); }
};
