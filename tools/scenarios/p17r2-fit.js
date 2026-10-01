/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2800);
  log(JSON.stringify(await page.evaluate(() => {
    const slot = document.querySelector('.stage__legend');
    const leg = document.querySelector('.legend');
    const cs = getComputedStyle(leg);
    return {
      slotInline: slot.getAttribute('style'),
      legendMax: getComputedStyle(slot).getPropertyValue('--legend-max'),
      blockSize: cs.blockSize, maxBlock: cs.maxBlockSize, height: cs.height,
      slotH: slot.getBoundingClientRect().height,
      slotMaxH: getComputedStyle(slot).maxHeight,
      stageH: document.querySelector('.app__stage').clientHeight,
      noteH: document.querySelector('.stage__note').getBoundingClientRect().height,
    };
  }), null, 1));
};
