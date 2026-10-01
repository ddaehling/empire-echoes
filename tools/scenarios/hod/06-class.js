module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(7000);
  await page.click('text=Teaching desk'); await page.waitForTimeout(2500);
  await page.click('button:has-text("Classroom")'); await page.waitForTimeout(2500);
  await shot('classroom');
  log(await page.evaluate(()=>document.body.innerText));
};
