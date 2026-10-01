module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /^Finish here$/i }).first().click();
  await page.waitForTimeout(2000);
  await shot('close-cold');
  log('CLOSE>>> ' + (await page.evaluate(()=>document.body.innerText)).slice(0,6500));
};
