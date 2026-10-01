module.exports = async ({ page, log, shot }) => {
  const base = 'http://localhost:8777/app/';
  const state = () => page.evaluate(() => ({
    hash: location.hash.slice(0, 90),
    counter: ((document.querySelector('.tr-bar') || {}).innerText || '').replace(/\s+/g, ' '),
    lede: ((document.querySelector('.app__lede') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 70),
  }));
  for (const wait of [400, 900, 1600, 2500, 4000]) {
    await page.goto(base, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
    await page.waitForTimeout(wait);
    await page.goto(base + '#tour=period&step=6');
    await page.waitForTimeout(2500);
    log('settle=' + wait + 'ms → ' + JSON.stringify(await state()));
  }
  /* and the exact nest.js order: read the index first */
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.toursIndex, { timeout: 30000 });
  await page.evaluate(() => Object.keys(window.BEA.toursIndex.routes));
  await page.goto(base + '#tour=period&step=6');
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(1600);
  log('nest.js order → ' + JSON.stringify(await state()));
  await shot('repro');
  await page.waitForTimeout(4000);
  log('nest.js order +4s → ' + JSON.stringify(await state()));
};
