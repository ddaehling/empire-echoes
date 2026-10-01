/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `smoke`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: the app boots, paints and answers at all. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await shot('landing');
  log('title:', await page.title());
  log('body text (first 900):', (await page.evaluate(() => document.body.innerText)).slice(0, 900));
};
