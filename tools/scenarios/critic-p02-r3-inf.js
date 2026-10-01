/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1860');
  await page.waitForTimeout(3200);
  const fold = await page.$('text=FOLD'); if (fold) { await fold.click(); await page.waitForTimeout(400); }
  await shot('1860-claimed');
  await page.keyboard.press('4'); await page.waitForTimeout(1500);
  await shot('1860-influenced');
  log('card:', (await page.evaluate(()=>document.querySelector('.map__switch')?.innerText||'')).replace(/\n/g,' | ').slice(0,1400));
  // expand more
  const more = await page.$('.map__more');
  if (more) { await more.click(); await page.waitForTimeout(700); await shot('1860-card-more');
    log('card after more:', (await page.evaluate(()=>document.querySelector('.map__switch')?.innerText||'')).replace(/\n/g,' | ').slice(0,2500)); }
};
