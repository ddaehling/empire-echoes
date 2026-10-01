module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
  await page.waitForTimeout(3500);
  await shot('cold');
  const txt = await page.evaluate(() => document.body.innerText);
  log('BODY TEXT:\n' + txt);
};
