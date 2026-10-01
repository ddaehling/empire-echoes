module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1400);
  for (let i = 0; i < 20; i++) {
    const cell = page.locator('.tr-field__cell').first();
    if (await cell.count()) { try { await cell.click({ timeout: 400 }); } catch (_) {} }
    const next = page.locator('.tr-bar__next');
    if (!(await next.count())) break;
    try { await next.click({ timeout: 800 }); } catch (_) { break; }
    await page.waitForTimeout(200);
  }
  await page.evaluate(() => window.BEA.bus.emit('close:open', { reason: 'grey' }));
  await page.waitForTimeout(900);
  await page.evaluate(() => {
    const l = document.querySelector('.cl-line[data-why="unanswered"]');
    if (l) l.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(500);
  const rows = await page.evaluate(() => [...document.querySelectorAll('.cl-line')].map((l) => l.dataset.can + '/' + l.dataset.why + ' :: ' + (l.querySelector('.cl-line__missing') || l.querySelector('.cl-line__mine') || {}).textContent?.replace(/\s+/g, ' ').trim().slice(0, 80)));
  log(rows.join('\n'));
  await shot('grey');
};
