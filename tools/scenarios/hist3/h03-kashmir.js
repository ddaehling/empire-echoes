module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1200);
  await page.evaluate(() => { window.BEA.store.act.setYear(1860); window.BEA.store.act.select('jammu-and-kashmir'); });
  await page.waitForTimeout(900);
  await shot('kashmir-dossier');
  log('K:', (await page.evaluate(() => (document.querySelector('[data-mount=dossier]')||{}).innerText||'')).slice(0,2000));
  // madras 1639
  await page.evaluate(() => { window.BEA.store.act.setYear(1650); window.BEA.store.act.select('madras-presidency'); });
  await page.waitForTimeout(900);
  await shot('madras-dossier');
  log('M:', (await page.evaluate(() => (document.querySelector('[data-mount=dossier]')||{}).innerText||'')).slice(0,1400));
  // year 2020 map
  await page.evaluate(() => { window.BEA.store.act.select(null); window.BEA.store.act.setYear(2020); });
  await page.waitForTimeout(1500);
  await shot('map-2020');
  log('labels2020:', await page.evaluate(()=>[...document.querySelectorAll('svg text')].map(t=>t.textContent.trim()).filter(Boolean).join(' | ').slice(0,1500)));
  await page.evaluate(() => window.BEA.store.act.setYear(1750));
  await page.waitForTimeout(1200); await shot('map-1750');
  await page.evaluate(() => window.BEA.store.act.setYear(1922));
  await page.waitForTimeout(1200); await shot('map-1922');
  await page.evaluate(() => window.BEA.store.act.setYear(1957));
  await page.waitForTimeout(1200); await shot('map-1957');
};
