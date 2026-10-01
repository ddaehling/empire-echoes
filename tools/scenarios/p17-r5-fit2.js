/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2600);
  const m = async (tag) => {
    const r = await page.evaluate(() => {
      const leg = document.querySelector('.legend'); const by = document.querySelector('#legend-byline');
      const st = document.querySelector('.app__stage');
      const h = s => { const n = leg.querySelector(s); if(!n) return 0; const cs=getComputedStyle(n);
        return Math.round(n.getBoundingClientRect().height + (parseFloat(cs.marginBlockStart)||0) + (parseFloat(cs.marginBlockEnd)||0)); };
      const sc = leg.querySelector('.legend__scroll');
      return { stage: Math.round(st.getBoundingClientRect().height), byline: Math.round(by.getBoundingClientRect().height),
        legendMax: leg.style.getPropertyValue('--legend-max') || getComputedStyle(leg).maxBlockSize,
        legH: Math.round(leg.getBoundingClientRect().height),
        head: h('.legend__head'), colours: h('.legend__colours'), foot: h('.legend__foot'),
        scrollState: sc && sc.dataset.state, micro: leg.dataset.micro, dense: leg.dataset.dense,
        footBottom: Math.round(leg.querySelector('.legend__foot').getBoundingClientRect().bottom),
        legBottom: Math.round(leg.getBoundingClientRect().bottom) };
    });
    log(tag + ' ' + JSON.stringify(r));
  };
  await m('boot');
  await page.keyboard.press('2'); await page.waitForTimeout(600);
  await page.keyboard.press('w'); await page.waitForTimeout(500);
  await page.keyboard.press('s'); await page.waitForTimeout(500);
  await page.keyboard.press('h'); await page.waitForTimeout(1200);
  await m('def2+WSH');
};
