/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 4 — FEATURE_SPEC §2 P17 acceptance tests 1..5, run in the browser. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  const ev = (f, a) => page.evaluate(f, a);

  /* T1 — every layer has a one-sentence definition; an unknown one renders a defect */
  log('T1 layer sentences:', JSON.stringify(await ev(() => {
    const S = window.BEA.symbology;
    const ids = Object.keys(S.LAYER_MEANING);
    return { layers: ids.length, missing: ids.filter(i => !S.layerSentence(i)), unknown: S.layerSentence('not-a-layer') };
  })));

  /* T2 — the byline in every state */
  const states = [
    ['default', () => {}],
    ['plate open', () => window.BEA.legend.openPlate('colour')],
    ['compare', () => window.BEA.store.dispatch('setCompareYear', 1770)],
    ['tour', () => window.BEA.store.dispatch('startTour', (window.BEA.data.tours && window.BEA.data.tours[0] && window.BEA.data.tours[0].id) || 'company-rule')],
    ['overlay', () => window.BEA.store.dispatch('openOverlay', 'methods')],
    ['selected', () => window.BEA.store.dispatch('select', 'bengal-presidency')],
  ];
  for (const [name, fn] of states) {
    await ev(fn);
    await page.waitForTimeout(700);
    const r = await ev(() => {
      const b = document.querySelector('#legend-byline');
      if (!b) return { present: false };
      const box = b.getBoundingClientRect();
      const f = {};
      for (const k of ['projection','colour','year','definition']) {
        const n = b.querySelector(`[data-field="${k}"]`);
        f[k] = n ? n.textContent.trim().slice(0, 46) : null;
      }
      return { present: true, h: Math.round(box.height), visible: box.width > 0 && box.height > 0, fields: f };
    });
    log('T2', name, JSON.stringify(r));
  }
  await ev(() => { window.BEA.store.dispatch('closeOverlay'); window.BEA.store.dispatch('endTour');
    window.BEA.store.dispatch('setCompareYear', null); window.BEA.store.dispatch('deselect'); });
  await page.waitForTimeout(600);

  /* T3 — the criticism list changes with projection, layer and definition */
  await ev(() => window.BEA.legend.openPlate('criticism'));
  await page.waitForTimeout(600);
  const read = () => ev(() => [...document.querySelectorAll('.lplate__crit > li strong')].map(n => n.textContent));
  const seen = [];
  seen.push(['start', await read()]);
  await page.keyboard.press('p'); await page.waitForTimeout(900); seen.push(['projection', await read()]);
  await ev(() => window.BEA.store.dispatch('setLayer', 'tenure')); await page.waitForTimeout(800); seen.push(['layer=tenure', await read()]);
  await page.keyboard.press('3'); await page.waitForTimeout(800); seen.push(['def=controlled', await read()]);
  await page.keyboard.press('4'); await page.waitForTimeout(800); seen.push(['def=influenced', await read()]);
  for (const [k, v] of seen) log('T3', k, JSON.stringify(v));
  log('T3 all distinct:', new Set(seen.map(s => s[1].join('|'))).size, 'of', seen.length);
  await shot('crit-influenced');

  /* T5 again after all that state churn */
  log('T5 recheck:', JSON.stringify(await ev(() => {
    const y = window.BEA.store.getState().year;
    const t = window.BEA.legend.totalsAt(y), m = window.BEA.data.metricsAt(y);
    const byDeg = m.byDegree || {};
    return { y, panelClaimed: t.sets.claimed.units, panelDegreeOne: t.degreeOneUnits,
      metrics: m.controlledUnits, ctrl5: byDeg[5] || 0, panelCtrl: t.sets.controlled.units };
  })));
};
