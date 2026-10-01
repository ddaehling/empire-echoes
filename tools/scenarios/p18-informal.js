/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { preset: 'informal' }));
  await page.waitForTimeout(900);
  await shot('informal-ask');
  await page.click('.cmp__choice[data-id="few"]');
  await page.waitForTimeout(1000);
  await shot('informal-revealed');
  log('INFORMAL', JSON.stringify(await page.evaluate(() => ({
    hash: location.hash,
    figs: [...document.querySelectorAll('.cmp__f')].map(e => e.textContent),
    totals: [...document.querySelectorAll('.cmp__totals')].map(e => e.textContent),
    labs: [...document.querySelectorAll('.cmp__lab')].map(e => e.textContent),
    rows: [...document.querySelectorAll('.cmp__row')].map(e => e.textContent).slice(0, 14),
    verdict: (document.querySelector('.cmp__verdict')||{}).textContent,
    caution: (document.querySelector('.cmp__caution')||{}).textContent,
    cite: (document.querySelector('.cmp__cite')||{}).textContent,
    empty: [...document.querySelectorAll('.cmp__empty')].map(e => e.textContent),
  }))));
  // hover spotlight
  await page.hover('.cmp__row');
  await page.waitForTimeout(500);
  await shot('spotlight-hover');
  await page.click('.cmp__row');
  await page.waitForTimeout(600);
  await shot('spotlight-pressed');
  log('SAY', await page.evaluate(() => (document.querySelector('.cx-lede__say')||{}).textContent));
  // only what changed
  await page.click('.cmp__toggle');
  await page.waitForTimeout(600);
  await shot('diff-only');
  log('HASH2', await page.evaluate(() => location.hash));
};
