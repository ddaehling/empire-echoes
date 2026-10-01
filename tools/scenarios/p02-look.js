/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const stage = require('./p02-stage.js');
module.exports = async ({ page, shot, log }) => {
  await page.waitForSelector('.map__plate', { timeout: 20000 });
  await page.waitForTimeout(2500);
  const raw = await page.evaluate(() => { const m = document.querySelector('.map').getBoundingClientRect(); const t = document.querySelector('.app__time').getBoundingClientRect(); return { plate: [m.width|0, m.height|0], timeline: [t.width|0, t.height|0] }; });
  log('UNCAPPED: ' + JSON.stringify(raw));
  await stage(page); await page.waitForTimeout(1200);
  await shot('a-home');
  await page.evaluate(() => window.__map.setProjection('equal-earth'));
  await page.waitForTimeout(1600);
  await shot('b-equal-earth');
  await page.evaluate(() => window.__map.setProjection('mercator'));
  await page.waitForTimeout(1400);
  await page.evaluate(() => { window.BEA.store.dispatch('setYear', 1783); window.BEA.store.flush(); window.__map.setDefinition('controlled'); });
  await page.waitForTimeout(900);
  await shot('c-1783-controlled');
  await page.evaluate(() => { window.__map.setDefinition('influenced'); window.BEA.store.dispatch('setYear', 1860); window.BEA.store.flush(); });
  await page.waitForTimeout(900);
  await shot('d-1860-influenced');
};
