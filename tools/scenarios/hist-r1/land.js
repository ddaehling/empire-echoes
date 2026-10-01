module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('landing');
  log('TITLE:', await page.title());
  const t = await page.evaluate(() => document.body.innerText);
  log('TEXT LEN', t.length);
  log(t.slice(0, 4000));
};
