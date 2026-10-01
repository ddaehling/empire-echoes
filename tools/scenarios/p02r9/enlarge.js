module.exports = async ({ page, log, shot }) => {
  await page.goto(page.url().split('#')[0] + '#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForTimeout(1800);
  const read = () => page.evaluate(() => {
    const m = document.querySelector('.map');
    const c = document.querySelector('.stage__map canvas') || document.querySelector('.map canvas');
    const sm = document.querySelector('.stage__map');
    const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
      return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)].join(','); };
    return { enlarged: !!(m && m.classList.contains('is-enlarged')), map: R(m), canvas: R(c), stageMap: R(sm) };
  });
  log('cold: ' + JSON.stringify(await read()));
  await page.evaluate(() => window.BEA.store.dispatch('setSelection', { territoryIds: ['egypt'] }));
  await page.waitForTimeout(1600);
  log('selected: ' + JSON.stringify(await read()));
  await shot('sel');
};
