/** p02r11/quebec.js — the grey ground of the 1774 Quebec Act, at the years the
 *  historian looked at. It must not be labelled with the name of the province
 *  of Quebec, which is drawn in pink a few hundred kilometres north-east. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.__map && window.__map.plate && window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForTimeout(1200);
  for (const y of [1783, 1842, 1900, 1919, 2020]) {
    await page.evaluate((yy) => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(900);
    const r = await page.evaluate(() => {
      const mod = window.BEA.registry.get('map').mod, P = window.__map.plate;
      const y = window.BEA.store.getState().year;
      const names = {};
      for (const uid of ['us-northwest-territory', 'ca-quebec']) {
        const rec = P.paint.get(uid);
        names[uid] = rec ? { plate: mod._plateName(uid, rec, y), spoken: mod._describe(uid, rec).slice(0, 120) } : null;
      }
      return { y, names, drawn: P.labelsDrawn.filter((l) => /quebec|québec|northwest|canada/i.test(l.text)).map((l) => l.text + '@' + Math.round(l.x) + ',' + Math.round(l.y)) };
    });
    log(r.y + '  us-northwest-territory: ' + JSON.stringify(r.names['us-northwest-territory'])
      + '\n      ca-quebec: ' + JSON.stringify(r.names['ca-quebec'])
      + '\n      drawn: ' + JSON.stringify(r.drawn));
  }
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1900));
  await page.waitForTimeout(900);
  await shot('1900');
};
