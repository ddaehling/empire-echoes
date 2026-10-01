/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.evaluate(() => { location.hash = '#year=1900&layer=exit'; });
  await page.waitForTimeout(1000);
  /* walk the tab order until we reach the legend's one control */
  let found = null;
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab');
    const cur = await page.evaluate(() => {
      const a = document.activeElement;
      if (!a) return null;
      const b = a.getBoundingClientRect();
      const mid = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
      const st = getComputedStyle(a);
      return {
        cls: a.className.toString().slice(0, 40),
        legend: !!a.closest('.legend, .lsheet, #legend-byline'),
        w: Math.round(b.width), h: Math.round(b.height),
        covered: !(mid === a || a.contains(mid)),
        ring: st.outlineStyle !== 'none' || st.boxShadow !== 'none',
      };
    });
    if (cur && cur.legend) { found = { i, ...cur }; break; }
  }
  log('legend control reached at tab stop ' + JSON.stringify(found));
  await shot('focus-ring');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  const opened = await page.evaluate(() => !!document.querySelector('.lsheet') && !!document.querySelector('.legend__live'));
  log('Enter opened the sheet with the live block: ' + opened);
  const focus = await page.evaluate(() => (document.activeElement && document.activeElement.className.toString().slice(0, 50)) || null);
  log('focus after opening: ' + focus);
  await shot('after-enter');
};
