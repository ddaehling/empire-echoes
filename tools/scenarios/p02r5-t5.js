/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'innerText').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.waitForTimeout(2600);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(600);
  log('T5 ' + JSON.stringify(await page.evaluate(async () => {
    const m = window.BEA.map;
    const ten = ['gibraltar','malta','ascension','barbados','singapore','hk-hong-kong-island','ye-aden-colony','jamaica','mauritius','cyprus'];
    const values = new Map(); ten.forEach((id, i) => values.set(id, 1000 * (i + 1)));
    m.setWeight({ metric: 'test-metric', caption: 'a test metric', source: 'a test source', values });
    await new Promise(r => setTimeout(r, 700));
    const w = m.plate.weight;
    const scaled = w ? [...w.keys()].sort() : [];
    let absence = 0, drawn = 0;
    for (const [id, r] of m.plate.paint) { drawn++; if (r.mode === 'absence') absence++; }
    const out = { scaled, scaledN: scaled.length, absence, drawn, state: { counted: m.weight.counted, missing: m.weight.missing } };
    m.setWeight(null);
    await new Promise(r => setTimeout(r, 500));
    out.afterOff = m.plate.weight === null;
    return out;
  })));
  // built-in population weight, visual
  await page.evaluate(() => window.BEA.map.toggleWeight());
  await page.waitForTimeout(900);
  log('W card ' + JSON.stringify(await page.evaluate(() => document.querySelector('.map__switchbody').innerText.slice(0, 900))));
  await shot('weight');
  await page.evaluate(() => window.BEA.map.toggleWeight());
};
