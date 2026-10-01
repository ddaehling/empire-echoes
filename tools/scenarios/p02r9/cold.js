module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForTimeout(1500);
  // touch the atlas so the dial exists (data-stage="working")
  await page.evaluate(() => window.BEA.bus.emit('ask:stage', { level: 'working' }));
  await page.waitForTimeout(1500);
  log(JSON.stringify(await page.evaluate(() => {
    const f = document.querySelector('.map__furniture');
    const R = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect();
      return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)].join(','); };
    const m = window.BEA.registry.get('map').mod;
    const full = m._slotBoxes('foot', true), now = m._slotBoxes('foot');
    const sc = (b) => Object.fromEntries(Object.entries(b).map(([k, v]) => [k, m._landUnder(v)]));
    return { fullW: Math.round(m._footFullW || 0), fullScores: sc(full), nowScores: sc(now), zoomScores: sc(m._slotBoxes('zooms')), slots: f.dataset.footslot + '/' + f.dataset.zoomslot + (f.dataset.tight === 'yes' ? ' TIGHT' : ''),
      foot: R('.map__foot'), zooms: R('.map__zooms'), map: R('.stage__map'), canvas: R('.stage__map canvas') };
  })));
  await shot('cold-working');
};
