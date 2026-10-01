module.exports = async ({ page, shot, log }) => {
  await page.goto(page.url().split('#')[0] + '#tour=thirty&step=19', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  const seen = [];
  for (let i = 0; i < 14; i++) {
    await page.waitForTimeout(500);
    seen.push(await page.evaluate(() => { const f = document.querySelector('.map__furniture');
      return f.dataset.footslot + '/' + f.dataset.zoomslot + '/' + (f.dataset.tight || 'no') + '/' + (f.style.getPropertyValue('--map-foot-lift') || '0px'); }));
  }
  log('7 seconds of samples: ' + JSON.stringify([...new Set(seen)]) + '  (' + seen.length + ' samples, ' + new Set(seen).size + ' distinct)');
  await shot('step19');
  // now scrub the year hard and watch it settle
  for (const y of [1600, 1783, 1857, 1913, 1947, 1997]) {
    await page.evaluate((yy) => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(700);
    log('year ' + y + ' -> ' + await page.evaluate(() => { const f = document.querySelector('.map__furniture');
      return f.dataset.footslot + '/' + f.dataset.zoomslot + '/' + (f.dataset.tight || 'no') + '/' + (f.style.getPropertyValue('--map-foot-lift') || '0px'); }));
  }
  await shot('after-scrub');
};
