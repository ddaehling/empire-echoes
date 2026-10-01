// Land cold. What does a 15-year-old see in the first 3 seconds?
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(400);
  await shot('t0-400ms');
  await page.waitForTimeout(700);
  await shot('t1-1100ms');
  await page.waitForTimeout(1900);
  await shot('t2-3s');
  await page.waitForTimeout(2500);
  await shot('t3-settled');
  log('TITLE', await page.title());
  log('BOOT', await page.evaluate(() => document.documentElement.dataset.boot));
  log('STATE', await page.evaluate(() => { const s = window.BEA?.store?.getState?.(); return s ? JSON.stringify({year:s.year, sel:s.selectedTerritoryId, layer:s.activeLayer, tour:s.activeTour, step:s.tourStep, panel:s.panelState, theme:s.theme}) : 'no BEA'; }));
  log('REGISTRY', await page.evaluate(() => JSON.stringify(window.BEA?.registry?.report?.() ?? {}, (k,v)=> v instanceof Map ? [...v.keys()] : v).slice(0,1200)));
  log('HASH', await page.evaluate(() => location.hash));
  const txt = await page.evaluate(() => document.body.innerText);
  log('BODY TEXT ('+txt.length+' chars):\n' + txt.slice(0, 4000));
};
