/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && document.querySelector('.tl') && document.querySelector('.tl').__p03, null, { timeout: 20000 });
  log('1947 stop: ' + await page.evaluate(() => document.querySelector('.tl').__p03.stops.get(1947).why));
  // announcements
  for (const y of [1947, 1919, 1996]) {
    await page.evaluate((yy) => {
      const tl = document.querySelector('.tl').__p03;
      window.BEA.store.dispatch('setYear', yy);
      window.BEA.store.flush();
      tl.announceYear(true);
    }, y);
    await page.waitForTimeout(400);
    const a = await page.evaluate(() => document.getElementById('live-status').textContent || '(none)');
    log(y + ' announce: ' + String(a).slice(0, 320));
  }
  // full-bar screenshots
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1947));
  await page.waitForTimeout(200);
  await shot('bar-1947', '.tl');
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1845));
  await page.waitForTimeout(200);
  await shot('bar-1845', '.tl');
  // reduced-motion play button glyph
  log('keys: ' + JSON.stringify(await page.evaluate(() => {
    const tl = document.querySelector('.tl').__p03;
    return { changeYears: tl.def.changeYears.length, storyYears: tl.storyYears.length, events: tl.events.total };
  })));
};
