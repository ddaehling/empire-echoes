/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Failed to execute 'getComputedStyle' on 'Window': parameter 1 is.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.legend, null, { timeout: 20000 });
  for (const t of [500, 1500, 3000]) {
    await page.waitForTimeout(t === 500 ? 500 : 1000);
    log(t + ' ' + JSON.stringify(await page.evaluate(() => {
      const slot = document.querySelector('.stage__legend');
      const leg = document.querySelector('.legend');
      const cs = getComputedStyle(leg);
      return {
        inline: slot.getAttribute('style'),
        block: cs.blockSize, maxBlock: cs.maxBlockSize,
        legH: Math.round(leg.getBoundingClientRect().height),
        slotMax: getComputedStyle(slot).maxHeight,
        stageH: document.querySelector('.app__stage').clientHeight,
        noteH: Math.round(document.querySelector('.stage__note').getBoundingClientRect().height),
        marksMax: getComputedStyle(document.querySelector('.legend__marksfix')).maxBlockSize,
      };
    })));
  }
};
