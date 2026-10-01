module.exports = async ({ page, log }) => {
  const base = page.url().split('#')[0];
  await page.goto(base + '#tour=thirty&step=17', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__map && window.__map.plate && window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForTimeout(1600);
  const r = await page.evaluate(() => {
    const b = (s) => { const e = document.querySelector(s); if (!e) return null; const r2 = e.getBoundingClientRect();
      return { x: Math.round(r2.x), y: Math.round(r2.y), w: Math.round(r2.width), h: Math.round(r2.height), ov: getComputedStyle(e).overflow, mb: getComputedStyle(e).maxBlockSize }; };
    return { stage: b('.stage__map'), map: b('.map'), frame: b('.map__frame'), plate: b('.map__plate'),
      plateWH: window.__map.plate.w + 'x' + window.__map.plate.h,
      mapStyle: document.querySelector('.map').getAttribute('style') };
  });
  for (const k of Object.keys(r)) log(k + ' :: ' + JSON.stringify(r[k]));
};
