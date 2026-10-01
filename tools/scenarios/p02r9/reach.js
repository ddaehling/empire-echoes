module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.evaluate(() => window.BEA.bus.emit('ask:stage', { level: 'working' }));
  await page.waitForTimeout(1800);
  log(JSON.stringify(await page.evaluate(() => {
    const m = window.BEA.registry.get('map').mod;
    const ids = ['falkland-islands', 'south-georgia', 'south-sandwich-islands', 'heard-mcdonald-islands',
      'new-zealand', 'gibraltar', 'malta', 'ascension', 'barbados', 'singapore', 'hk-hong-kong-island', 'tobago', 'trinidad'];
    const out = {};
    for (const id of ids) {
      const s = m.plate.unitScreen(id);
      if (!s) { out[id] = 'not drawn'; continue; }
      const r = m.plateRect;
      const x = r.x + (s.tiny ? s.mx : s.px), y = r.y + (s.tiny ? s.my : s.py);
      const top = document.elementFromPoint(x, y);
      out[id] = (top ? (top.className || top.tagName) : 'none')
        + '  at ' + Math.round(x) + ',' + Math.round(y)
        + '  plate ' + Math.round(r.x) + ',' + Math.round(r.y) + ' ' + Math.round(r.w) + 'x' + Math.round(r.h)
        + (y > r.y + r.h ? '  BELOW THE PLATE' : '') + (s.tiny ? '  tiny' : '');
    }
    return out;
  }), null, 1));
};
