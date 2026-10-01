/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const count = () => {
  const leg = document.querySelector('.stage__legend');
  if (!leg) return { err: 'no legend' };
  const lr = leg.getBoundingClientRect();
  const sw = [...leg.querySelectorAll('svg, .legend__swatch, [class*="swatch"], [class*="chip-w"]')];
  const vis = sw.filter(n => { const r = n.getBoundingClientRect();
    return r.width > 3 && r.height > 3 && r.bottom <= lr.bottom + 1 && r.top >= lr.top - 1 && getComputedStyle(n).visibility !== 'hidden'; });
  const by = document.querySelector('[class*="byline"]');
  return { legendH: Math.round(lr.height), legendY: Math.round(lr.y),
    swatchTotal: sw.length, swatchVisible: vis.length,
    hasColours: /COLOURS/.test(leg.innerText),
    bylineH: by ? Math.round(by.getBoundingClientRect().height) : null,
    bylineBottom: by ? Math.round(by.getBoundingClientRect().bottom) : null,
    legendTop: Math.round(lr.top),
    overlap: by ? Math.round(by.getBoundingClientRect().bottom - lr.top) : null,
    text: leg.innerText.replace(/\s+/g,' ').slice(0,300) };
};
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  const steps = [['base',null],['press2','2'],['press1','1'],['pressP','p'],['pressW','w'],['pressS','s'],['pressH','h'],['pressH-off','h'],['pressS-off','s'],['pressW-off','w'],['pressP-off','p']];
  for (const [n,k] of steps) {
    if (k) { await page.keyboard.press(k); await page.waitForTimeout(800); }
    log(n + ' => ' + JSON.stringify(await page.evaluate(count)));
  }
  await shot('after-all-off');
};
