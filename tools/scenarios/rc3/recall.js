module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1900');
  await page.waitForTimeout(2400);
  await page.keyboard.press('r');
  await page.waitForTimeout(1500);
  await shot('recall');
  log('RECALL >>> ' + (await page.evaluate(()=>document.body.innerText)).slice(0,2600));
};
