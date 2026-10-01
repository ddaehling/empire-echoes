/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', { waitUntil: 'load' });
  await page.waitForTimeout(3200);
  await shot('01-mobile');
  const info = await page.evaluate(() => {
    const m = window.__map, r = document.querySelector('.map').getBoundingClientRect();
    const sw = document.querySelector('.map__switch').getBoundingClientRect();
    return {
      plate: [Math.round(r.width), Math.round(r.height)],
      switchBox: [Math.round(sw.x), Math.round(sw.y), Math.round(sw.width), Math.round(sw.height)],
      switchShare: +((sw.width * sw.height) / (r.width * r.height)).toFixed(2),
      painted: m.plate.paint.size, marks: m.markLayout().size,
      moved: [...m.markLayout().values()].filter(x => x.moved).length,
    };
  });
  log('mobile', JSON.stringify(info));
};
