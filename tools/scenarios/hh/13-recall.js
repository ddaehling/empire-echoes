module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=period&step=7', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2400);
  await shot('recall');
  log('CARD:\n' + (await page.evaluate(() => {
    const c = document.querySelector('.qz, .qz-card, [class*="qz"], .cx-sheet__body, .tr-panel');
    return c ? c.innerText : document.body.innerText;
  })).slice(0, 2200));
  log('\nFOCUSABLES in card:');
  const list = [];
  for (let i = 0; i < 22; i++) {
    await page.keyboard.press('Tab');
    const a = await page.evaluate(() => { const a = document.activeElement; const r=a.getBoundingClientRect();
      return a.tagName + '.' + String(a.className).split(' ')[0] + ' [' + (a.getAttribute('role')||'-') + '] ' + Math.round(r.width)+'x'+Math.round(r.height) + ' "' + (a.getAttribute('aria-label')||a.innerText||a.value||'').trim().replace(/\s+/g,' ').slice(0,60) + '"'; });
    list.push(a); log('  ' + (i+1) + ' ' + a);
  }
};
