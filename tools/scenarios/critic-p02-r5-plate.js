/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('map-el', '.map');
  const box = await page.evaluate(() => {
    const c = document.querySelector('.map__plate').getBoundingClientRect();
    const overlays = [...document.querySelectorAll('.map *, .stage *')]
      .filter(e => e.children.length === 0 || e.classList.length)
      .map(e => ({ cls: e.className && e.className.toString().slice(0,60), r: e.getBoundingClientRect() }))
      .filter(o => o.r.width > 120 && o.r.height > 60 && o.r.left < c.right && o.r.right > c.left && o.r.top < c.bottom && o.r.bottom > c.top);
    return { plate: c, overlaysCount: overlays.length, overlays: overlays.slice(0, 20) };
  });
  log(JSON.stringify(box, null, 1).slice(0, 4000));
  // Press E to enlarge
  await page.keyboard.press('e');
  await page.waitForTimeout(1200);
  await shot('after-E');
  await shot('map-el-E', '.map');
  log('plate after E: ' + await page.evaluate(() => JSON.stringify(document.querySelector('.map__plate').getBoundingClientRect())));
};
