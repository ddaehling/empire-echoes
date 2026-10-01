/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2600);
  const r = await page.evaluate(() => {
    const leg = document.querySelector('.legend');
    const h = s => { const n = leg.querySelector(s); return n ? Math.round(n.getBoundingClientRect().height) : null; };
    const box = getComputedStyle(leg);
    return {
      legendMax: leg.style.getPropertyValue('--legend-max') || getComputedStyle(leg).maxBlockSize,
      legH: Math.round(leg.getBoundingClientRect().height),
      head: h('.legend__head'), colours: h('.legend__colours'), foot: h('.legend__foot'), scroll: h('.legend__scroll'),
      scrollState: leg.querySelector('.legend__scroll') && leg.querySelector('.legend__scroll').dataset.state,
      pad: [box.paddingBlockStart, box.paddingBlockEnd, box.borderBlockStartWidth, box.borderBlockEndWidth],
      dense: leg.dataset.dense,
      rootDense: (document.querySelector('[data-mount=legend]')||{}).dataset,
    };
  });
  log(JSON.stringify(r, null, 1));
};
