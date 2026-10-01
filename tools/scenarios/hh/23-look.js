module.exports = async ({ page, shot, log }) => {
  const steps = (process.env.HHSTEPS || '1,4,6,8,10').split(',');
  for (const s of steps) {
    await page.goto('http://localhost:8777/app/#tour=period&step=' + s, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(2400);
    await shot('step-' + s);
  }
};
