/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** Count the map's own accent affordances at each level. */
const red = () => [...document.querySelectorAll('#app a, #app button')].filter((e) => {
  const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false;
  const m = getComputedStyle(e).color.match(/\d+/g); if (!m) return false;
  return +m[0] > 120 && +m[0] > +m[1] * 1.6 && +m[0] > +m[2] * 1.6;
}).map((e) => e.textContent.trim().slice(0, 34));
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1600);
  log('plate     ' + JSON.stringify(await page.evaluate(red)));
  await page.click('.stage__map canvas', { position: { x: 40, y: 40 } }).catch(() => {});
  await page.keyboard.press('w');
  await page.waitForTimeout(1300);
  log('working   ' + JSON.stringify(await page.evaluate(red)));
  await page.evaluate(() => window.BEA.bus.emit('ask:stage', { level: 'apparatus' }));
  await page.waitForTimeout(1600);
  log('apparatus ' + JSON.stringify(await page.evaluate(red)));
};
