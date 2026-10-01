module.exports = async ({ page, log, shot }) => {
  await page.addInitScript(() => { window.__printed = 0; window.print = () => { window.__printed++; }; });
  const base = 'http://localhost:8777/app/';
  await page.goto(base + '#tour=period&step=10', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(2000);
  /* go past the last step into the Close */
  for (let i = 0; i < 3; i++) {
    const n = page.locator('button:has-text("Next")').first();
    if (await n.count() && await n.isVisible()) { await n.click({ force: true }).catch(()=>{}); await page.waitForTimeout(1500); }
  }
  await shot('01-close');
  const m = await page.evaluate(() => {
    const sc = document.querySelector('.cx-sheet__body') || document.querySelector('.tr-panel__scroll');
    return { read: document.documentElement.getAttribute('data-read'),
      head: ((document.querySelector('.cx-sheet__head') || {}).innerText || '').replace(/\s+/g, ' '),
      win: sc ? sc.clientHeight + '/' + sc.scrollHeight : null,
      printBtns: [...document.querySelectorAll('button,a')].map(e => (e.textContent || '').trim()).filter(t => /^print/i.test(t)) };
  });
  log('CLOSE ' + JSON.stringify(m));
  const p = page.locator('button:has-text("Print")').first();
  if (await p.count()) {
    await p.click().catch(e => log('print click ' + e.message));
    await page.waitForTimeout(2000);
    const n = await page.evaluate(() => window.__printed);
    log('window.print() calls: ' + n);
    const paper = await page.evaluate(() => {
      const el = document.querySelector('.cl-paper, .tp-paper, .print, [data-paper]');
      return el ? { cls: el.className, h: el.scrollHeight, text: el.innerText.slice(0, 3000) } : null;
    });
    log('PAPER ' + JSON.stringify(paper, null, 1));
    await shot('02-printed');
  } else log('NO PRINT CONTROL');
};
