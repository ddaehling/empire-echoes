/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.goto('http://localhost:8777/app/#year=1913', { waitUntil: 'load' });
  await page.waitForTimeout(3400);
  await shot('01-as-shipped');
  const info = await page.evaluate(() => {
    const m = window.__map, cam = m.plate.camera();
    return { ins: m.plate.insets, availW: Math.round(cam.availW), availH: Math.round(cam.availH), worldW: Math.round(cam.worldW / m.plate.dpr), worldH: Math.round(cam.worldH / m.plate.dpr), proj: m.projection, marks: m.markLayout().size, minMark: +m.plate.minMark().toFixed(1), refused: m.module.insetRefused };
  });
  log('mobile camera', JSON.stringify(info));
  await page.evaluate(() => { document.querySelectorAll('.mount--orphan, .legend, .byline').forEach(n => n.style.display = 'none'); });
  await page.waitForTimeout(300);
  await shot('02-plate-only');
  log('errors', JSON.stringify(errs));
};
