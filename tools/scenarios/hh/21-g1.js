/* hh/21-g1 — arriving at the first Complication Gate: is Next locked before the field renders? */
module.exports = async ({ page, log, shot }) => {
  const route = process.env.HHROUTE || 'period';
  const from = +(process.env.HHFROM || 3);
  await page.goto('http://localhost:8777/app/#tour=' + route + '&step=' + from, { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2500);
  log('at step ' + from + ': ' + await page.evaluate(() => document.querySelector('.tr-bar__count')?.textContent));
  const t0 = Date.now();
  await page.evaluate(() => { const n = document.querySelector('.tr-bar__next'); n && !n.disabled && n.click(); });
  const trace = [];
  for (let i = 0; i < 40; i++) {
    const s = await page.evaluate(() => {
      const n = document.querySelector('.tr-bar__next');
      return { t: Date.now(), c: document.querySelector('.tr-bar__count')?.textContent || '',
        next: n ? (n.disabled ? 'disabled' : 'ENABLED') : 'absent', tab: n ? n.getAttribute('tabindex') : null,
        field: !!document.querySelector('.tr-field') };
    });
    trace.push((Date.now() - t0) + 'ms  counter="' + s.c + '"  next=' + s.next + ' tabindex=' + s.tab + ' field=' + s.field);
    if (s.field && s.next === 'disabled') break;
    await page.waitForTimeout(40);
  }
  log(trace.join('\n'));
  // now: could a fast student press Next again and skip the gate?
  await page.goto('http://localhost:8777/app/#tour=' + route + '&step=' + from, { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.evaluate(() => { const n = document.querySelector('.tr-bar__next'); n && !n.disabled && n.click(); });
  await page.waitForTimeout(60);
  const second = await page.evaluate(() => { const n = document.querySelector('.tr-bar__next'); if (!n || n.disabled) return 'blocked'; n.click(); return 'pressed'; });
  await page.waitForTimeout(1500);
  log('double-press 60ms apart -> ' + second + '; now at ' + await page.evaluate(() => document.querySelector('.tr-bar__count')?.textContent + ' / ' + (document.querySelector('.cx-sheet__title')?.textContent||'')));
  await shot('after-double-press');
};
