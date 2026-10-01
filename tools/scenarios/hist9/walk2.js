module.exports = async ({ page, shot, log }) => {
  const route = process.env.HIST_ROUTE || 'lesson-two';
  await page.goto('http://localhost:8777/app/#tour=' + route + '&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1400);
  const idx = await page.evaluate((r) => {
    const p = window.BEA.toursIndex;
    return (p && p.routes && p.routes[r]) ? p.routes[r].steps : null;
  }, route);
  log('STEPS: ' + JSON.stringify(idx));
  const n = idx ? idx.length : 12;
  for (let s = 1; s <= n; s++) {
    await page.evaluate((h) => { window.location.hash = h; }, '#tour=' + route + '&step=' + s);
    await page.waitForTimeout(1100);
    const txt = await page.evaluate(() => {
      const el = document.querySelector('.app__sheet') || document.body;
      return el.innerText.replace(/\n{3,}/g, '\n\n');
    });
    log('======== ' + route + ' STEP ' + s + ' ========');
    log(txt.slice(0, 3200));
  }
};
