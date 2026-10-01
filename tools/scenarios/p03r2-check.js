/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'click').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P03 round 2 — the labels the critic broke us on, read straight from the DOM. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && document.querySelector('.tl .tl__year'), null, { timeout: 20000 });
  const read = async (y) => {
    await page.evaluate((yy) => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(120);
    return page.evaluate(() => {
      const q = s => [...document.querySelectorAll(s)];
      return {
        year: document.querySelector('.tl__year').textContent,
        count: document.querySelector('.tl__count').textContent,
        head: (document.querySelector('.tl__changecount') || {}).textContent,
        delta: (document.querySelector('.tl__delta') || {}).textContent,
        cards: q('.tl-chg:not([hidden])').map(c => ({
          dir: c.dataset.dir,
          subject: (c.querySelector('.tl-chg__subject') || {}).textContent,
          mech: (c.querySelector('.tl-chg__mech') || {}).textContent,
          how: ((c.querySelector('.tl-chg__how') || {}).textContent || '').slice(0, 80),
          aria: c.getAttribute('aria-label'),
        })),
      };
    });
  };
  for (const y of [1858, 1948, 1942, 1945, 1947]) {
    log('--- ' + y + ' ---');
    log(JSON.stringify(await read(y), null, 1));
  }
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1947));
  await page.waitForTimeout(150);
  await page.evaluate(() => document.querySelector('.tl-chg--more').click());
  await page.waitForTimeout(200);
  log('EXPANDER rows: ' + await page.evaluate(() => document.querySelectorAll('.tl-all__row').length));
  log('EXPANDER first: ' + await page.evaluate(() => (document.querySelector('.tl-all__row')||{}).innerText));
};
