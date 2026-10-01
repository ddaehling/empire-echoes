/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const path = require('path');
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const b = await page.evaluate(() => { const e = document.querySelector('.legend'); const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  log('box ' + JSON.stringify(b));
  await page.screenshot({ path: '/tmp/p17r3-crop/bottom.png', clip: { x: b.x, y: b.y + b.h - 90, width: b.w, height: 95 } });
  await page.screenshot({ path: '/tmp/p17r3-crop/whole.png', clip: { x: b.x - 4, y: b.y - 4, width: b.w + 8, height: b.h + 8 } });
  log('done');
};
