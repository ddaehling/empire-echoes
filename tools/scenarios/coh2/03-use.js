// A 15-year-old uses it: scrub, click, read, follow a colour, look for a place.
module.exports = async ({ page, shot, log }) => {
  const st = () => page.evaluate(() => { const s = window.BEA.store.getState(); return {year:s.year, sel:s.selectedTerritoryId, layer:s.activeLayer, hash:location.hash}; });
  await page.waitForTimeout(2200);

  // 1. Grab the scrubber and drag it
  const rail = await page.locator('[data-mount="timeline"] input[type=range], .tl-axis, .tl__axis, [role="slider"]').first();
  log('slider count', await page.locator('[data-mount="timeline"] [role="slider"], [data-mount="timeline"] input[type=range]').count());
  await page.keyboard.press('End'); await page.waitForTimeout(600); await shot('end-year'); log('after End', JSON.stringify(await st()));
  await page.keyboard.press('Home'); await page.waitForTimeout(600); await shot('home-year'); log('after Home', JSON.stringify(await st()));

  // 2. A year where nothing is British
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1601));
  await page.waitForTimeout(900); await shot('1601-empty');

  // 3. Scrub to 1857 and click India-ish
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1857));
  await page.waitForTimeout(900); await shot('1857');

  // 4. select a territory via the store, see the dossier
  await page.evaluate(() => window.BEA.store.dispatch('select', 'bengal'));
  await page.waitForTimeout(1000); await shot('dossier-bengal');
  log('after select', JSON.stringify(await st()));

  // 5. move the year past its independence
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1990));
  await page.waitForTimeout(900); await shot('dossier-dead-selection');

  // 6. Back button
  await page.goBack(); await page.waitForTimeout(800); await shot('after-back'); log('after back', JSON.stringify(await st()));
  await page.goBack(); await page.waitForTimeout(800); log('after back2', JSON.stringify(await st()));
};
