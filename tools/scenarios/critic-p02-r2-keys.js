/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  // independent data check
  const truth = await page.evaluate(async () => {
    const m = await import('/app/js/core/data.js');
    const data = await m.loadData({});
    const met = data.metricsAt(1913);
    const st = data.statusAt(1913);
    let informal = 0, byDeg = {};
    for (const [id, e] of st) {
      byDeg[e.controlDegree] = (byDeg[e.controlDegree]||0)+1;
      if (e.status === 'informal-sphere') informal++;
    }
    return { units: met.units, territories: met.territories, byDegree: met.byDegree, informal, statuses: [...new Set([...st.values()].map(e=>e.status))] };
  });
  log('TRUTH 1913 ' + JSON.stringify(truth));
  await page.evaluate(() => { location.hash = '#year=1913'; });
  await page.waitForTimeout(1200);
  for (const k of ['1','2','3','4']) {
    await page.keyboard.press(k);
    await page.waitForTimeout(1400);
    const r = await page.evaluate(() => ({
      def: document.querySelector('.map')?.dataset.definition,
      targets: document.querySelectorAll('.map__target').length,
      plate: document.querySelector('.map__plate')?.getAttribute('aria-label'),
      card: document.querySelector('.map__switch')?.innerText.replace(/\n/g,' | ').slice(0,700)
    }));
    log('KEY ' + k + ' ' + JSON.stringify(r));
    await shot('key-' + k);
  }
};
