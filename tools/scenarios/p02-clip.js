/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const stage = require('./p02-stage.js');
module.exports = async ({ page, log }) => {
  await page.waitForSelector('.map__plate', { timeout: 20000 });
  for (const [w,h] of [[1440,900],[1366,768],[1280,800],[1920,1080],[390,844]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(1800); await stage(page); await page.waitForTimeout(1200);
    const d = await page.evaluate(() => {
      const map = document.querySelector('.map').getBoundingClientRect();
      const rail = document.querySelector('.map__rail').getBoundingClientRect();
      const clipped = [];
      for (const n of document.querySelectorAll('.map__rail *')) {
        if (n.children.length) continue;
        if (n.scrollWidth > n.clientWidth + 1 && n.clientWidth > 0) clipped.push(n.className + ':"' + n.textContent.trim().slice(0, 22) + '" ' + n.clientWidth + '<' + n.scrollWidth);
      }
      const out = [];
      for (const n of document.querySelectorAll('.map__rail > *, .map__modes, .map__zooms, .map__mode, .map__def')) {
        const b = n.getBoundingClientRect();
        if (b.right > map.right - 1 || b.left < map.left + 1 || b.bottom > map.bottom - 1) out.push(n.className + ' ' + [b.left|0,b.top|0,b.right|0,b.bottom|0].join(','));
      }
      const body = document.querySelector('.map__switchbody');
      return { map: [map.width|0, map.height|0], rail: [rail.left|0, rail.width|0, rail.height|0],
        card: [document.querySelector('.map__switch').getBoundingClientRect().width|0, document.querySelector('.map__switch').getBoundingClientRect().height|0],
        hidden: Math.max(0, body.scrollHeight - body.clientHeight), clipped, outside: out };
    });
    log(`${w}x${h} map=${d.map} rail=${d.rail} card=${d.card} cardHiddenPx=${d.hidden}\n   textClipped=${JSON.stringify(d.clipped)}\n   outsidePlate=${JSON.stringify(d.outside)}`);
  }
};
