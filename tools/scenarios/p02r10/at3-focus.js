/** p02r10/at3-focus.js — AT3 under reduced motion, with the rect read AFTER
 *  the focus-driven camera move has settled rather than in the same turn. */
const ids = ['gibraltar', 'malta', 'ascension', 'barbados', 'ye-aden-colony', 'singapore', 'hk-hong-kong-island'];
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(1600);
  const out = [];
  for (const id of ids) {
    await page.evaluate((uid) => { const n = [...document.querySelectorAll('.map__target')].find((e) => e.dataset.unit === uid); if (n) n.focus(); }, id);
    await page.waitForTimeout(420);                       // let the focus move settle
    const spot = await page.evaluate((uid) => {
      const n = [...document.querySelectorAll('.map__target')].find((e) => e.dataset.unit === uid);
      const r = n.getBoundingClientRect();
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), w: Math.round(r.width), h: Math.round(r.height) };
    }, id);
    await page.mouse.click(spot.x, spot.y);
    await page.waitForTimeout(300);
    const sel = await page.evaluate(() => window.BEA.store.getState().focusedUnitId);
    out.push(id + ' ' + spot.w + 'x' + spot.h + ' -> ' + (sel === id ? 'selects' : 'MISSED (' + sel + ')'));
  }
  out.forEach((r) => log(r));
};
