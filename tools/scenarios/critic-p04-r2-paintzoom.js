/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  const f = await page.$('.legend__toggle'); if (f) { await f.click(); await page.waitForTimeout(400); }
  // zoom onto India
  await page.evaluate(() => { location.hash = '#year=1913&sel=british-india&view=6,0.245,-0.06'; });
  await page.waitForTimeout(1400);
  await page.evaluate(() => { const b=document.querySelector('[data-block="nested"]'); if(b) b.scrollIntoView({block:'center'}); });
  await page.waitForTimeout(400);
  await shot('zoom-before');
  await page.click('[data-act="paint-direct"]');
  await page.waitForTimeout(1200);
  await shot('zoom-direct');
  await page.click('[data-act="paint-children"]');
  await page.waitForTimeout(1200);
  await shot('zoom-inside');
};
