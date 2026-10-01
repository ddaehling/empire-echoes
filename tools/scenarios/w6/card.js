/** w6/card.js — beat 1's route card: what the door now offers, and at what length. */
module.exports = async ({ page, log, shot }) => {
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console ' + m.text()); });
  await page.goto('http://localhost:8777/app/#tour=core&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { const b = document.querySelector('.tr-routes__open'); if (b) b.click(); });
  await page.waitForTimeout(500);
  const t = await page.evaluate(() => {
    const n = document.querySelector('.tr-routes');
    return n ? n.innerText : '(no route strip)';
  });
  log(t);
  const over = await page.evaluate(() => ({
    h: document.documentElement.scrollWidth - window.innerWidth,
    v: document.documentElement.scrollHeight - window.innerHeight,
  }));
  log('overflow h=' + over.h + ' v=' + over.v);
  await shot('routecard');
  log('ERRORS: ' + (errs.join(' | ') || 'none'));
};
