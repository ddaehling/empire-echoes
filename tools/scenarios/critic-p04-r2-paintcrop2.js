/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  // fold the legend so it does not cover the map
  const f = await page.$('.legend__toggle'); if (f) { await f.click(); await page.waitForTimeout(500); }
  await page.evaluate(() => { const b=document.querySelector('[data-block="nested"]'); if(b) b.scrollIntoView({block:'center'}); });
  await page.waitForTimeout(400);
  const clip = { x: 380, y: 250, width: 480, height: 340 };
  await page.screenshot({ path: '/tmp/cp04r2q/a-before.png', clip });
  await page.click('[data-act="paint-direct"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/cp04r2q/b-direct.png', clip });
  await page.click('[data-act="paint-children"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/cp04r2q/c-children.png', clip });
  log('ok');
};
