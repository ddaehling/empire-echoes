module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
  await page.waitForTimeout(3500);
  const routes = await page.evaluate(() => window.BEA && window.BEA.toursRoutes || null);
  log('ROUTES payload:\n' + JSON.stringify(routes, null, 1));
};
