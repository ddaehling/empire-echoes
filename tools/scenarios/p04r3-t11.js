/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'scrollIntoView').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* T11: the pink is not all direct rule — and the map has to move to show it. */
const px = require('fs');
module.exports = async ({ page, shot, log }) => {
  page.on('pageerror', (e) => log('PAGEERROR ' + e.message));
  await page.goto('http://localhost:8777/app/#year=1913&sel=british-india', { waitUntil: 'load' });
  await page.waitForTimeout(2200);
  await page.evaluate(() => document.querySelector('#dsr-nested').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(300);
  log('T11 TEXT', await page.evaluate(() => document.querySelector('#dsr-nested').innerText.replace(/\s+/g, ' ').slice(0, 700)));
  await shot('01-t11-copy');

  const view0 = await page.evaluate(() => location.hash);
  await page.click('[data-act="paint-direct"]');
  await page.waitForTimeout(900);
  await shot('02-paint-direct');
  const v1 = await page.evaluate(() => ({ hash: location.hash, view: window.BEA.store.getState().mapView }));
  await page.click('[data-act="paint-children"]');
  await page.waitForTimeout(900);
  await shot('03-paint-states');
  const v2 = await page.evaluate(() => ({ hash: location.hash, view: window.BEA.store.getState().mapView }));
  log('view before', view0, '\nafter direct', JSON.stringify(v1), '\nafter states', JSON.stringify(v2));
};
