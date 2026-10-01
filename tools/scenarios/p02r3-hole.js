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
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1955));
  await page.keyboard.press('h');
  await page.waitForTimeout(900);
  await page.evaluate(() => window.__map.module.camera.flyTo('kenya', { zoom: 4 }));
  await page.waitForTimeout(1200);
  log('holes: ' + JSON.stringify(await page.evaluate(() => { const o=[]; for (const [u,r] of window.__map.plate.paint) if (r.mode==='hole') o.push(u); return o; })));
  await shot('kenya-hole');
  // and the hover card on the hole
  const p = await page.evaluate(() => { const s = window.__map.unitScreen('kenya'); const b = window.__map.module.el.getBoundingClientRect(); return [Math.round(b.left + s.mx), Math.round(b.top + s.my)]; });
  await page.mouse.move(p[0]-30, p[1]-30); await page.mouse.move(p[0], p[1]);
  await page.waitForTimeout(500);
  log('TIP: ' + await page.evaluate(() => { const t = document.querySelector('.map__tip'); return t.hidden ? 'HIDDEN' : t.innerText.replace(/\s+/g,' '); }));
  await shot('kenya-tip');
};
