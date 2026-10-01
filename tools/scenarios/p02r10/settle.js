/** p02r10/settle.js — poll the plate's own geometry against the DOM's for two
 *  seconds after the dossier opens, under reduced motion. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(1200);
  const rows = await page.evaluate(async () => {
    const out = [];
    const snap = (t) => {
      const m = window.BEA.map, el = document.querySelector('.map');
      const cv = document.querySelector('.map__plate').getBoundingClientRect();
      const fr = document.querySelector('.map__frame').getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const n = [...document.querySelectorAll('.map__target')].find((e) => e.dataset.unit === 'barbados');
      const nr = n ? n.getBoundingClientRect() : null;
      const fel = document.querySelector('.map__frame');
      out.push(t + 'ms  .map ' + Math.round(r.width) + '  frame.style.width=' + (fel.style.width || '(none)') + '  sizeChanges ' + m.plate.sizeChanges + ' last ' + JSON.stringify(m.plate.lastSize) + '  frame ' + Math.round(fr.width)
        + '  canvas ' + Math.round(cv.width) + ' (attr ' + document.querySelector('.map__plate').width + ')'
        + '  plate.w ' + m.plate.w + '  barbados target x ' + (nr ? Math.round(nr.x) : '-')
        + '  mark x ' + Math.round(m.plate.unitScreen('barbados').mx)
        + '  nodes ' + document.querySelectorAll('.map__target[data-unit="barbados"]').length
        + '  style left ' + (n ? n.style.left : '-') + ' tr ' + (n ? n.style.transform : '-')
        + '  targetsRect ' + Math.round(document.querySelector('.map__targets').getBoundingClientRect().x) + ',' + Math.round(document.querySelector('.map__targets').getBoundingClientRect().width));
    };
    snap(0);
    const n = [...document.querySelectorAll('.map__target')].find((e) => e.dataset.unit === 'ascension');
    n.focus(); n.click();
    for (let i = 1; i <= 20; i++) { await new Promise((r) => setTimeout(r, 100)); snap(i * 100); }
    return out;
  });
  rows.forEach((r) => log(r));
};
