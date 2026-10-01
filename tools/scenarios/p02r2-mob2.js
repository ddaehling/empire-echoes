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
  await shot("01-as-shipped"); log("proj", await page.evaluate(()=>document.querySelector(".map").dataset.projection));
  await page.evaluate(() => { document.querySelectorAll('.mount--orphan, .legend, .byline').forEach(n => n.style.display = 'none'); });
  await page.waitForTimeout(200);
  await shot('02-plate-only');
  // tap a tiny unit with a real touch-ish click on the canvas
  const before = await page.evaluate(() => window.BEA.store.getState().selectedTerritoryId);
  const pt = await page.evaluate(() => { const s = window.__map.unitScreen('gibraltar'); const r = document.querySelector('.map__plate').getBoundingClientRect(); return { x: r.x + s.mx, y: r.y + s.my }; });
  await page.mouse.click(pt.x, pt.y);
  await page.waitForTimeout(600);
  log('gibraltar tap', JSON.stringify({ before, after: await page.evaluate(() => window.BEA.store.getState().selectedTerritoryId) }));
  await shot('03-after-tap');
};
