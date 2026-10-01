/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.__map && window.__map.plate && window.__map.plate.geom, null, { timeout: 25000 });
  await page.waitForTimeout(2800);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(700);
  await shot('a-1913');
  // hover card
  const p = await page.evaluate(() => { const s = window.__map.unitScreen('gibraltar'); const b = window.__map.module.el.getBoundingClientRect(); return [Math.round(b.left + s.mx), Math.round(b.top + s.my)]; });
  await page.mouse.move(p[0] - 40, p[1] - 40);
  await page.mouse.move(p[0], p[1]);
  await page.waitForTimeout(500);
  log('TIP: ' + await page.evaluate(() => { const t = document.querySelector('.map__tip'); return t.hidden ? 'HIDDEN' : t.innerText.replace(/\s+/g,' '); }));
  await shot('b-hover');
  // weight
  await page.keyboard.press('w'); await page.waitForTimeout(800); await shot('c-weight');
  await page.keyboard.press('w'); await page.waitForTimeout(300);
  // stitching
  await page.keyboard.press('s'); await page.waitForTimeout(800); await shot('d-stitch');
  await page.keyboard.press('s'); await page.waitForTimeout(300);
  // silences
  await page.keyboard.press('h'); await page.waitForTimeout(800); await shot('e-silence');
  await page.keyboard.press('h'); await page.waitForTimeout(300);
  // equal earth
  await page.keyboard.press('p'); await page.waitForTimeout(1400); await shot('f-equal-earth');
  // zoomed in, with labels
  await page.keyboard.press('p'); await page.waitForTimeout(1400);
  await page.evaluate(() => { window.__map.module.camera.flyTo('gibraltar', { zoom: 6 }); });
  await page.waitForTimeout(1200);
  log('ZOOM labels: ' + JSON.stringify(await page.evaluate(() => window.__map.labels)));
  await shot('g-zoom');
};
