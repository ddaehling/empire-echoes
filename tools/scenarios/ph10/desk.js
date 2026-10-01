module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(900);
  await page.locator('button:has-text("Tools")').first().click();
  await page.waitForTimeout(600);
  await shot('01-tools');
  log('TOOLS>>>\n' + await page.evaluate(() => document.body.innerText) + '\n<<<');
};
