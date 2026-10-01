/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.click('.tl-rate__ask');
  await page.waitForTimeout(700);
  const inp = await page.$('.tl-rate input[type=number], .tl-predict input, input[type=number]');
  log('input found:', !!inp);
  await inp.fill('1935');
  await page.waitForTimeout(200);
  await page.getByText('That is my guess').click();
  await page.waitForTimeout(1200);
  await shot('after-guess');
  log('PANEL:', await page.evaluate(() => {
    const p = document.querySelector('.tl-predict, .tl-rate__ask-panel, [class*="predict"]');
    return p ? p.innerText.slice(0,1800) : document.body.innerText.slice(-1800);
  }));
};
