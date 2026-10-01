/* hh/27-cold — one rejoin link, opened on a machine that has never run the lesson. */
module.exports = async ({ page, log, shot }) => {
  const h = process.env.HHLINK || '#tour=period&step=8';
  await page.goto('http://localhost:8777/app/' + h, { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 25000 });
  await page.waitForTimeout(2200);
  log(h + ' -> ' + JSON.stringify(await page.evaluate(() => ({
    year: window.BEA.store.getState().year,
    count: document.querySelector('.tr-bar__count')?.textContent,
    title: document.querySelector('.cx-sheet__title')?.textContent,
    lede: document.querySelector('.tr-panel__lede, .app__lede')?.innerText.replace(/\s+/g,' ').slice(0,90),
  }))));
  await shot('cold');
};
