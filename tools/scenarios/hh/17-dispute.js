module.exports = async ({ page, log, shot }) => {
  for (const step of [22, 21, 25]) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step=' + step, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(2200);
    const st = await page.evaluate(() => {
      const n = document.querySelector('.tr-bar__next');
      return { count: document.querySelector('.tr-bar__count')?.textContent || '',
        title: document.querySelector('.cx-sheet__title')?.textContent || '',
        field: !!document.querySelector('.tr-field'), locked: !!(n && n.disabled), tab: n ? n.getAttribute('tabindex') : null,
        hgarg: !!document.querySelector('.hg-arg'), bar: (document.querySelector('.tr-bar')||{innerText:''}).innerText.replace(/\s+/g,' ') };
    });
    log('step ' + step + ' -> ' + JSON.stringify(st));
    await shot('s' + step);
  }
};
