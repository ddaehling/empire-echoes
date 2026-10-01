/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P06 — look at the pixels: the route, the key, the haze, the stitching. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2200);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1860));
  await page.waitForTimeout(500);
  await page.click('.ly-bar__open');
  await page.waitForTimeout(900);
  await shot('01-route-step1');
  await page.click('.ly-run .ly-predict__b');
  await page.waitForTimeout(800);
  await shot('02-route-step1-after');
  await page.evaluate(() => window.BEA.bus.emit('ask:sheet', null));
  await page.waitForTimeout(700);
  await shot('03-mechanism-plate');
  await page.evaluate(() => { window.BEA.store.dispatch('setLayer','slavery'); window.BEA.store.dispatch('setYear',1836); });
  await page.waitForTimeout(1000);
  await shot('04-slavery-1836');
  await page.evaluate(() => { window.BEA.store.dispatch('setLayer','informal'); window.BEA.store.dispatch('setYear',1900); });
  await page.waitForTimeout(1100);
  await shot('05-informal-1900');
  await page.evaluate(() => { window.BEA.store.dispatch('setLayer','system'); window.BEA.store.dispatch('setYear',1913); });
  await page.waitForTimeout(1100);
  await shot('06-system-1913');
  await page.evaluate(() => { window.BEA.store.dispatch('setLayer','resistance'); window.BEA.store.dispatch('setYear',1857); });
  await page.waitForTimeout(1100);
  await shot('07-resistance-1857');
  log('ok');
};
