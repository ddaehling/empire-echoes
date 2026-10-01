/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — elementHandle.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && document.querySelector('.tl') && document.querySelector('.tl').__p03, null, { timeout: 20000 });
  const tlSel = '.tl';
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1947));
  await page.waitForTimeout(200);
  await shot('1947-row', tlSel);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1919));
  await page.waitForTimeout(200);
  await shot('1919-row', tlSel);
  // open an event popover
  const ev = await page.$('.tl-chg[data-dir="event"]');
  if (ev) { await ev.click(); await page.waitForTimeout(200); await shot('event-pop'); }
  await page.keyboard.press('Escape');
  // phase popover
  await page.click('.tl-lane[data-phase="dissolution"]');
  await page.waitForTimeout(200);
  await shot('phase-pop');
  await page.keyboard.press('Escape');
  // a multi-year uncertainty cluster
  const m = await page.$('.tl-mark:not([data-years="1"])');
  if (m) { await m.click(); await page.waitForTimeout(200); await shot('mark-pop'); log('cluster clicked ok'); }
  await page.keyboard.press('Escape');
  // the expander
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1947));
  await page.waitForTimeout(150);
  await page.click('.tl-chg--more');
  await page.waitForTimeout(250);
  await shot('expander');
};
