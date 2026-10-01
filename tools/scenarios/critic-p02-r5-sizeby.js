/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'innerText').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  await page.evaluate(() => { location.hash = '#year=1913'; }); await page.waitForTimeout(1200);
  const r = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('.map__target')].map(e=>e.dataset.unit).slice(0, 10);
    const values = {}; ids.forEach((id,i) => values[id] = (i+1)*1000);
    window.BEA.bus.emit('ask:sizeBy', { metric: 'test-metric', year: 1913, values, caption: 'A test quantity with ten units only.' });
    return ids;
  });
  await page.waitForTimeout(2000);
  await shot('sizeby');
  const w = await page.evaluate(() => JSON.stringify(window.__map.weight).slice(0,500));
  log('ids: ' + JSON.stringify(r));
  log('weight state: ' + w);
  log('byline: ' + await page.evaluate(()=>document.querySelector('.byline').innerText.replace(/\n+/g,' | ')));
};
