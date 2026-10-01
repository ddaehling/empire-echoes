/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  for (const y of [1870, 1955]) {
    await page.evaluate((y) => window.BEA.store.dispatch('setYear', y), y).catch(() => {});
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(2600);
  for (const y of [1870, 1955]) {
    await page.evaluate((y) => window.BEA.store.dispatch('setYear', y), y);
    await page.waitForTimeout(900);
    const txt = await page.evaluate(() => {
      const b = document.querySelector('.map__switchbody');
      return b ? b.innerText.replace(/\s+/g, ' ') : 'NO CARD';
    });
    log('year ' + y + ' — card:', txt.slice(0, 900));
    const und = await page.evaluate(() => (window.__map.undrawable || []).map(u => u.title + ' :: ' + (u.quoteText || 'NO QUOTE')));
    log('  undrawable:', JSON.stringify(und));
  }
  await shot('charge9');
};
