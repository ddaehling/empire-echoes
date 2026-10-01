module.exports = async ({ page, shot, log }) => {
  const base = page.url().split('#')[0];
  const st = process.env.STEP || '11';
  await page.goto(base + '#tour=thirty&step=' + st, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__map && window.__map.plate && window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForTimeout(1600);
  log('labels: ' + JSON.stringify(await page.evaluate(() => window.__map.labels)));
  await shot('band', '.stage__map');
};
