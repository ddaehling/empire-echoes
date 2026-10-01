/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push('PAGEERROR '+e)); page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  const failed=[]; page.on('requestfailed',r=>failed.push(r.url()));
  await page.waitForTimeout(3200);
  await shot('01-landing-1900');
  await page.evaluate(() => { location.hash='#year=1765'; }); await page.waitForTimeout(600);
  await shot('02-1765');
  await page.evaluate(() => { location.hash='#year=1947'; }); await page.waitForTimeout(600);
  await shot('03-1947');
  await page.click('.tl__track .tl-chg:not([hidden])'); await page.waitForTimeout(700);
  await shot('04-card-open');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  await page.click('.tl-rate__ask'); await page.waitForTimeout(500);
  await page.fill('.tl-pred__year', '1935'); await page.click('.tl-pred__go'); await page.waitForTimeout(400);
  await page.click('.tl-pred__choice[data-band="c"]'); await page.waitForTimeout(500);
  await shot('05-predict');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  await page.evaluate(() => { location.hash='#year=1203'; }); await page.waitForTimeout(600);
  await shot('06-empty-1203');
  await page.evaluate(() => { location.hash='#year=1820'; }); await page.waitForTimeout(600);
  await shot('07-1820');
  log('errors:', JSON.stringify(errs), 'failed:', JSON.stringify(failed));
};
