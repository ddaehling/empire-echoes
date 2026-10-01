module.exports = async ({ page, shot, log }) => {
  const st = () => page.evaluate(() => { const s = window.BEA.store.getState(); return {year:s.year, sel:s.selectedTerritoryId, hash:location.hash, dossier:document.querySelector('#app')?.dataset.dossier}; });
  await page.waitForTimeout(2200);
  await page.evaluate(() => window.BEA.store.batch(d => { d('setYear', 1857); d('select','bengal-presidency'); }));
  await page.waitForTimeout(1200); await shot('bengal-1857'); log('A', JSON.stringify(await st()));
  // scroll dossier
  const doss = page.locator('[data-mount="dossier"]');
  log('dossier scrollHeight/clientHeight', JSON.stringify(await page.evaluate(() => {
    const m = document.querySelector('[data-mount="dossier"]');
    const inner = m && m.firstElementChild;
    const sc = [...document.querySelectorAll('[data-mount="dossier"] *')].filter(e=>e.scrollHeight>e.clientHeight+8).map(e=>({c:e.className, sh:e.scrollHeight, ch:e.clientHeight}));
    return { mount:{sh:m.scrollHeight, ch:m.clientHeight, w:m.getBoundingClientRect().width}, scrollers: sc.slice(0,6) };
  })));
  // now move the year past independence
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1990));
  await page.waitForTimeout(1000); await shot('bengal-1990-dead'); log('B', JSON.stringify(await st()));
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1600));
  await page.waitForTimeout(1000); await shot('bengal-1600-notyet'); log('C', JSON.stringify(await st()));
  // deselect
  await page.keyboard.press('Escape'); await page.waitForTimeout(800); await shot('after-escape'); log('D', JSON.stringify(await st()));
};
