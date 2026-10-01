module.exports = async ({ page, shot, log }) => {
  const base = page.url().split('#')[0];
  await page.goto(base + '#year=1900', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__map && window.__map.plate && window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForTimeout(1600);
  await shot('plate', '.stage__map');
  log('labels: ' + (await page.evaluate(() => window.__map.labels.length)));
};
