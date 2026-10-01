/* tpack/03-steps — ground truth: what beat does #tour=core&step=N actually land on? */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1200);
  const routes = await page.evaluate(() => new Promise((res) => {
    const off = window.BEA.bus.on('tours:routes', (p) => { off(); res(p); });
    window.BEA.bus.emit('app:ready', {});
    setTimeout(() => res('timeout'), 4000);
  }));
  log('ROUTES: ' + JSON.stringify(routes));

  for (const route of ['core', 'thirty']) {
    const max = route === 'core' ? 17 : 27;
    const seen = [];
    for (let n = 1; n <= max; n++) {
      await page.evaluate(([r, s]) => { location.hash = '#tour=' + r + '&step=' + s; }, [route, n]);
      await page.waitForTimeout(320);
      const st = await page.evaluate(() => {
        const s = window.BEA.store.getState();
        const t = document.querySelector('.tr-count');
        return { step: s.tourStep, count: t ? t.innerText.replace(/\s+/g, ' ') : null,
                 head: (document.querySelector('.tr-panel__title') || document.querySelector('.tr-lede__mark') || {}).innerText || null,
                 lede: (document.querySelector('.tr-lede') || {}).innerText ? (document.querySelector('.tr-lede').innerText || '').slice(0, 60) : null };
      });
      seen.push(n + '=' + JSON.stringify(st));
    }
    log(route + ':\n  ' + seen.join('\n  '));
  }
};
