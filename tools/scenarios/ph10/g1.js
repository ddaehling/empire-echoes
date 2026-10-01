module.exports = async ({ page, log, shot }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=0', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(2000);
  for (let i = 0; i < 8; i++) {
    const s = await page.evaluate(() => {
      const n = document.querySelector('.tr-bar__next');
      return { counter: ((document.querySelector('.tr-bar') || {}).innerText || '').replace(/\s+/g, ' '),
        head: ((document.querySelector('.cx-sheet__head') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 50),
        field: !!document.querySelector('.tr-field'), nextDisabled: n ? n.disabled : null };
    });
    log('[' + i + '] ' + JSON.stringify(s));
    await shot('w' + i);
    const moved = await page.evaluate(() => { const n = document.querySelector('.tr-bar__next'); if (!n || n.disabled) return false; n.click(); return true; });
    if (!moved) { log('  Next locked — stopping'); break; }
    await page.waitForTimeout(1000);
  }
};
