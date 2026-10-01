/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 });
  await page.waitForTimeout(900);
  log(await page.evaluate(() => {
    const a = document.querySelector('.app'); const cs = getComputedStyle(a);
    return JSON.stringify({
      rows: cs.gridTemplateRows, cols: cs.gridTemplateColumns,
      stageMin: getComputedStyle(document.documentElement).getPropertyValue('--stage-min'),
      appMin: cs.minHeight, appH: a.getBoundingClientRect().height,
      bodyScroll: document.body.scrollHeight, vh: innerHeight,
      appOverflow: cs.overflow, htmlH: getComputedStyle(document.documentElement).height,
    });
  }));
};
