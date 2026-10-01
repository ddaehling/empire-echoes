/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2600);
  await page.keyboard.press('w'); await page.waitForTimeout(500);
  await page.keyboard.press('s'); await page.waitForTimeout(500);
  await page.keyboard.press('h'); await page.waitForTimeout(1200);
  const r = await page.evaluate(() => {
    const leg = document.querySelector('.legend'); const by = document.getElementById('legend-byline');
    const st = document.querySelector('.app__stage');
    const h = s => { const n = leg.querySelector(s); if(!n) return 0; const cs=getComputedStyle(n);
      return Math.round(n.getBoundingClientRect().height + (parseFloat(cs.marginBlockStart)||0)+(parseFloat(cs.marginBlockEnd)||0)); };
    return { stage: Math.round(st.getBoundingClientRect().height), byline: Math.round(by.getBoundingClientRect().height),
      max: leg.style.getPropertyValue('--legend-max') || document.querySelector('[data-mount=legend]').style.getPropertyValue('--legend-max'),
      rootMax: document.querySelector('[data-mount=legend]').style.cssText,
      legH: Math.round(leg.getBoundingClientRect().height),
      head: h('.legend__head'), colours: h('.legend__colours'), foot: h('.legend__foot'),
      micro: leg.dataset.micro, dense: leg.dataset.dense,
      figures: (leg.querySelector('.legend__figures')||{}).textContent };
  });
  log(JSON.stringify(r, null, 1));
};
