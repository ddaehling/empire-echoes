module.exports = async ({ page, log, shot }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1800);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(900);
  log('ESC ESC (clean): ' + await page.evaluate(() => !!document.querySelector('.cl-close')));
  await shot('esc');
};
