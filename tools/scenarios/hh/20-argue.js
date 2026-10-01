module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=21', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.evaluate(() => document.querySelector('.tr-field__cell')?.click());
  await page.waitForTimeout(400);
  const t0 = Date.now();
  await page.evaluate(() => { const n = document.querySelector('.tr-bar__next'); n && !n.disabled && n.click(); });
  for (let i = 0; i < 60; i++) {
    const s = await page.evaluate(() => ({ c: document.querySelector('.tr-bar__count')?.textContent || '', f: !!document.querySelector('.tr-field') }));
    if (/22/.test(s.c) && s.f) { log('field present after ' + (Date.now() - t0) + 'ms (counter ' + s.c + ')'); break; }
    if (i === 59) log('NOT PRESENT after ' + (Date.now() - t0) + 'ms; last ' + JSON.stringify(s));
    await page.waitForTimeout(50);
  }
  // and how long until the counter updates
};
