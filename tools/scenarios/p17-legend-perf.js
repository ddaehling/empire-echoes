/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 — what the legend costs during a scrub.
   node tools/inspect.js tools/scenarios/p17-legend-perf.js --out /tmp/p17-perf */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForSelector('.legend', { timeout: 15000 });
  await page.waitForTimeout(400);

  const measure = async (label) => log(label, JSON.stringify(await page.evaluate(async () => {
    const { totalsAt } = await import('/app/js/legend/totals.js');
    const d = window.BEA.data;
    // cold: every year touched once
    let t0 = performance.now();
    for (let y = 1600; y <= 1997; y++) totalsAt(d, y);
    const cold = performance.now() - t0;
    t0 = performance.now();
    for (let y = 1600; y <= 1997; y++) totalsAt(d, y);
    const warm = performance.now() - t0;
    return { years: 398, coldMs: +cold.toFixed(1), warmMs: +warm.toFixed(2),
      perYearCold: +(cold / 398).toFixed(3), perYearWarm: +(warm / 398).toFixed(4) };
  }))); 
  await measure('totalsAt over the whole timeline:');

  // full legend re-render cost, driven through the store the way playback does
  log('render cost:', JSON.stringify(await page.evaluate(() => {
    const s = window.BEA.store;
    const samples = [];
    for (let y = 1750; y < 1850; y++) {
      const t = performance.now();
      s.dispatch('setYear', y);
      s.flush();
      samples.push(performance.now() - t);
    }
    samples.sort((a, b) => a - b);
    return { years: samples.length,
      medianMs: +samples[Math.floor(samples.length / 2)].toFixed(2),
      p95Ms: +samples[Math.floor(samples.length * 0.95)].toFixed(2),
      maxMs: +samples[samples.length - 1].toFixed(2) };
  })));
  log('note: dispatch+flush drives every mounted module, not the legend alone.');
};
