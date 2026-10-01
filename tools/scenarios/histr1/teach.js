module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const b = page.locator('button:has-text("Teaching desk")').first();
  await b.click();
  await page.waitForTimeout(1600);
  await shot('desk');
  const t = await page.evaluate(() => document.body.innerText);
  log('=== DESK ===\n' + t.slice(0, 16000));
};
