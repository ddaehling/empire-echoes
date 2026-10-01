module.exports = async ({ page, log, shot }) => {
  const base = 'http://localhost:8777/app/';
  const probe = async (hash) => {
    await page.goto(base + hash, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store
      && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
    await page.waitForTimeout(1600);
    return await page.evaluate(() => {
      const sc = document.querySelector('.tr-panel__scroll') || document.querySelector('.qz');
      const nest = [];
      if (sc) { let n = sc.parentElement;
        while (n && n !== document.body) { const c = getComputedStyle(n);
          if (/(auto|scroll)/.test(c.overflowY) && n.scrollHeight > n.clientHeight + 2 && n.clientHeight > 8)
            nest.push(String(n.className) + ' ' + n.clientHeight + '/' + n.scrollHeight);
          n = n.parentElement; } }
      return { read: document.documentElement.getAttribute('data-read'),
        title: (document.querySelector('.cx-sheet__head') || {}).innerText,
        win: sc ? sc.clientHeight + '/' + sc.scrollHeight : null, nest };
    });
  };
  const idx = await (async () => {
    await page.goto(base, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.toursIndex, { timeout: 30000 });
    return await page.evaluate(() => {
      const o = {};
      const t = window.BEA.toursIndex.routes;
      for (const k of Object.keys(t)) {
        const s = t[k].steps.find(x => x.id === 'revenue-loop');
        if (s) o[k] = s.step;
      }
      return o;
    });
  })();
  log('revenue-loop step per route: ' + JSON.stringify(idx));
  for (const [route, step] of Object.entries(idx)) {
    for (let k = 0; k < 3; k++) {
      const r = await probe('#tour=' + route + '&step=' + step);
      log('[try' + k + '] ' + route + ' step ' + step + ' read=' + r.read + ' win=' + r.win
        + ' NEST=' + (r.nest.length ? JSON.stringify(r.nest) : 'none') + ' | ' + String(r.title || '').split('\n')[0]);
    }
    await shot(route + '-loop');
  }
};
