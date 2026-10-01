module.exports = async ({ page, log, shot }) => {
  await page.waitForTimeout(2200);
  const routes = await page.evaluate(() => {
    const R = window.BEA?.toursRoutes; const I = window.BEA?.toursIndex;
    const list = (R && (R.routes || R)) || null;
    return { keys: R ? Object.keys(R) : null, routes: (R && R.routes) ? R.routes.map(r => ({ id: r.id, n: (r.steps || []).length, def: !!r.isDefault })) : null, idx: I ? Object.keys(I).slice(0, 10) : null };
  });
  log('ROUTES', JSON.stringify(routes));
  const M = async label => {
    const m = await page.evaluate(() => {
      const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [+b.y.toFixed(1), +b.height.toFixed(1)]; };
      const time = document.querySelector('.app__time'); if (!time) return { none: 1 };
      const box = time.getBoundingClientRect(); let worst = 0, who = '';
      time.querySelectorAll('*').forEach(el => { if (!el.getClientRects().length) return; const q = el.getBoundingClientRect();
        const d = Math.max(q.bottom - box.bottom, box.top - q.top); if (d > worst) { worst = d; who = (typeof el.className === 'string' ? el.className : el.tagName); } });
      return { stage: document.documentElement.dataset.stage, band: document.getElementById('app')?.dataset.timeband || '-',
        time: r('.app__time'), ax: r('.tl-ax'), axis: r('.tl-ax__axis'), spine: r('.tl-spine'), over: +worst.toFixed(1), who };
    });
    log(label.padEnd(24), JSON.stringify(m)); return m;
  };
  const id = routes.routes ? (routes.routes.find(r => r.def) || routes.routes[0]).id : 'default';
  const n = routes.routes ? (routes.routes.find(r => r.def) || routes.routes[0]).n : 10;
  const base = page.url().split('#')[0];
  for (const step of [1, 2, 3, 5, 8, Math.max(1, n - 1), n]) {
    await page.goto(base + '#tour=' + id + '&step=' + step, { waitUntil: 'load' });
    await page.waitForTimeout(2200);
    await M('tour ' + id + ' step ' + step);
  }
  await shot('tour-last');
};
