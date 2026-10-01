module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2400); await shot('cold');
  await page.goto('http://localhost:8777/app/#tour=core&step=6&filter=stage:working,pressure:off');
  await page.waitForTimeout(2400); await shot('beat6');
  await page.goto('http://localhost:8777/app/#tour=core&step=11&filter=stage:working,pressure:off');
  await page.waitForTimeout(2400); await shot('beat11');
  await page.goto('http://localhost:8777/app/#tour=core&step=15&filter=stage:working,pressure:off');
  await page.waitForTimeout(2400); await shot('beat15');
};
