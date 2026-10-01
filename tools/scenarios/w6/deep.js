/** w6/deep.js — a mid-route deep link: skipped must still read as skipped. */
module.exports = async ({ page, log }) => {
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console ' + m.text()); });
  await page.goto('http://localhost:8777/app/#tour=core&step=11', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.evaluate(() => { try { localStorage.removeItem('bea.ledger.v1'); } catch (_) {} });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  await page.evaluate(() => window.BEA.bus.emit('close:open', { reason: 'w6' }));
  await page.waitForTimeout(1500);
  const c = await page.evaluate(() => {
    const root = document.querySelector('.cl-close');
    if (!root) return null;
    return {
      stand: (root.querySelector('.cl-close__stand') || {}).textContent || '',
      late: (root.querySelector('.cl-close__late') || {}).textContent || '',
      why: [...root.querySelectorAll('li.cl-line')].map((li) => li.dataset.why).join(','),
      audit: window.BEA.closeVoiceAudit,
      through: window.BEA.throughLineAudit && window.BEA.throughLineAudit.ok,
    };
  });
  log(JSON.stringify(c, null, 1));
  log('ERRORS: ' + (errs.join(' | ') || 'none'));
};
