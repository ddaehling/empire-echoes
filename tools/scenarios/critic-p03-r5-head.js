/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  for (const y of [1784, 1948, 1947, 1997]) {
    await page.evaluate((yy) => { location.hash = '#year=' + yy; }, y);
    await page.waitForTimeout(900);
    const t = await page.evaluate(() => {
      const h = document.querySelector('.tl__changehead')?.innerText.replace(/\n/g,' · ');
      const cards = Array.from(document.querySelectorAll('.tl__changes .tl-chg, .tl__changes [class*="card"]')).map(e => e.innerText.replace(/\n/g,' | ').slice(0,220));
      return { h, cards };
    });
    log('YEAR', y, 'HEAD:', t.h);
    log('  CARDS:', JSON.stringify(t.cards, null, 1));
  }
  await page.evaluate(() => { location.hash='#year=1947'; });
  await page.waitForTimeout(900);
  await shot('y1947');
};
