module.exports = async ({ page, log, shot }) => {
  const base = 'http://localhost:8777/app/';
  const state = () => page.evaluate(() => ({
    hash: location.hash,
    read: document.documentElement.getAttribute('data-read'),
    head: (document.querySelector('.cx-sheet__head') || {}).innerText,
    counter: (document.querySelector('.tr-bar') || {}).innerText,
    lede: (document.querySelector('.app__lede') || {}).innerText,
  }));

  /* A: genuinely cold load of the deep link */
  await page.goto(base + '#tour=period&step=6', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(2000);
  log('A cold #tour=period&step=6 → ' + JSON.stringify(await state()));
  await shot('A-cold-deeplink');

  /* B: open the atlas with no hash, then follow the link */
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { location.hash = '#tour=period&step=6'; });
  await page.waitForTimeout(2500);
  log('B hash-set from cold atlas → ' + JSON.stringify(await state()));
  await shot('B-hashset');

  /* C: same, via goto (what a tapped link does inside the same document) */
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.goto(base + '#tour=period&step=6');
  await page.waitForTimeout(2500);
  log('C goto-with-hash from cold atlas → ' + JSON.stringify(await state()));
  await shot('C-goto');

  /* D: the same for thirty, as a control */
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { location.hash = '#tour=thirty&step=9'; });
  await page.waitForTimeout(2500);
  log('D hash-set thirty step 9 → ' + JSON.stringify(await state()));
  await shot('D-thirty');
};
