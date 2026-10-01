module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1400);
  const m = async (tag) => {
    const r = await page.evaluate(() => {
      const b = (s) => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return { w: Math.round(q.width), h: Math.round(q.height) }; };
      return { map: b('.stage__map canvas') || b('.stage__map svg'), stage: b('.app__stage'), key: b('.stage__key'),
               scrollH: document.documentElement.scrollHeight, inner: innerHeight,
               rail: getComputedStyle(document.getElementById('app')).getPropertyValue('--rail-w') };
    });
    log(tag + ' ' + JSON.stringify(r));
    return r;
  };
  await m('CLOSED');
  await page.evaluate(() => window.BEA.store.dispatch('select', 'bengal-presidency'));
  await page.waitForTimeout(900);
  await m('DOSSIER');
  await page.evaluate(() => window.BEA.store.dispatch('deselect'));
  await page.waitForTimeout(700);
  await page.evaluate(() => window.BEA.bus.emit('mechanism:open', { reveal: true }));
  await page.waitForTimeout(900);
  await m('MECHANISM');
};
