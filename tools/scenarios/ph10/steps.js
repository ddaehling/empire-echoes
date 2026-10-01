module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(900);
  const idx = await page.evaluate(() => (window.BEA && window.BEA.toursIndex) || null);
  log(JSON.stringify(idx && idx.period ? idx.period : idx, null, 1).slice(0, 4000));
};
