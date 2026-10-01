/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1400);
  const defs = ['claimed','administered','controlled','influenced','claimed'];
  for (const d of defs) {
    await page.evaluate((d) => window.BEA.bus.emit('map:setDefinition', d), d);
    await page.waitForTimeout(250);
    await page.evaluate(async () => {
      for (let y = 1700; y <= 1997; y += 3) { window.BEA.store.dispatch('setYear', y); if (y % 30 === 0) await new Promise(r => requestAnimationFrame(r)); }
    });
    await page.waitForTimeout(250);
  }
  // open every kind of panel
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1858));
  await page.waitForTimeout(300);
  await page.click('.tl-chg--more'); await page.waitForTimeout(300);
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  await page.click('.tl-chg'); await page.waitForTimeout(300);
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  await page.locator('.tl-lane').first().click(); await page.waitForTimeout(300);
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  await page.locator('.tl-mark').first().click(); await page.waitForTimeout(300);
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  // resize
  await page.setViewportSize({ width: 700, height: 900 }); await page.waitForTimeout(500);
  await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(500);
  log('final year:', await page.evaluate(() => window.BEA.store.getState().year));
  log('registry:', await page.evaluate(() => JSON.stringify(window.BEA.registry.report().failed || [])));
};
