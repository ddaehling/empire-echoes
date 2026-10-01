/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForTimeout(2600);
  const m = async (tag) => log(tag + ' ' + JSON.stringify(await page.evaluate(() => {
    const b = document.querySelector('#legend-byline').getBoundingClientRect();
    const l = document.querySelector('.stage__legend').getBoundingClientRect();
    const leg = document.querySelector('.legend');
    return {
      bylineBottom: Math.round(b.bottom), legendTop: Math.round(l.top),
      overlap: Math.round(b.bottom - l.top),
      legendH: Math.round(l.height), legendSh: leg ? leg.scrollHeight : null, legendCh: leg ? leg.clientHeight : null,
      max: getComputedStyle(document.querySelector('.stage__legend')).getPropertyValue('--legend-max'),
    };
  })));
  await m('closed');
  await page.click('.byline__crit'); await page.waitForTimeout(600);
  await m('open');
  await shot('crit');
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  await m('closed2');
};
