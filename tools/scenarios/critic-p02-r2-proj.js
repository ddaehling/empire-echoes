/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — elementHandle.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const geom = async () => await page.evaluate(() => {
    const t = document.getElementById('map-u-ca-nunavut');
    const q = document.getElementById('map-u-ca-quebec');
    const ind = document.getElementById('map-u-in-bengal') || document.querySelector('[data-unit*="bengal"]');
    const g = e => e ? (e.style.transform + ' ' + e.style.width + 'x' + e.style.height) : null;
    return { proj: document.querySelector('.map')?.dataset.projection,
      btn: document.querySelector('.map__proj')?.innerText,
      nunavut: g(t), quebec: g(q), bengal: g(ind),
      sel: document.querySelector('[aria-selected="true"]')?.id || null };
  });
  log('BEFORE ' + JSON.stringify(await geom()));
  await shot('mercator');
  const btn = await page.$('.map__proj');
  await btn.click();
  await page.waitForTimeout(400);
  await shot('mid-morph');
  await page.waitForTimeout(2000);
  await shot('equal-area');
  log('AFTER ' + JSON.stringify(await geom()));
  // toggle back
  await btn.click(); await page.waitForTimeout(2200);
  log('BACK ' + JSON.stringify(await geom()));
  await shot('back');
};
