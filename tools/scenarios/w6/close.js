module.exports = async ({ page, log, shot }) => {
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console ' + m.text()); });
  await page.goto('http://localhost:8777/app/' + (process.env.ADDR || '#tour=core&step=3'), { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1400);
  const r = await page.evaluate(() => {
    try { window.BEA.bus.emit('close:open', { reason: 'w6' }); return 'emitted'; }
    catch (e) { return 'THREW ' + e.message; }
  });
  log('emit: ' + r);
  await page.waitForTimeout(1500);
  const c = await page.evaluate(() => {
    const root = document.querySelector('.cl-close');
    if (!root) return { none: true, sheet: !!document.querySelector('.cx-sheet__body'), body: (document.querySelector('.cx-sheet__body')||{}).textContent?.slice(0,200) };
    return {
      stand: (root.querySelector('.cl-close__stand') || {}).textContent || '',
      audit: window.BEA.closeVoiceAudit,
      lines: [...root.querySelectorAll('li.cl-line')].map((li) => li.dataset.why),
    };
  });
  log(JSON.stringify(c, null, 1));
  log('ERRORS: ' + (errs.join(' | ') || 'none'));
};
