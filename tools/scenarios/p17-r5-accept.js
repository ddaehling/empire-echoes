/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 5 — the FEATURE_SPEC §2 acceptance tests, run against the app. */
module.exports = async ({ page, shot, log }) => {
  const errs = [], fails = [];
  page.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR '+e.message));
  page.on('requestfailed', r => errs.push('REQFAIL '+r.url()));
  await page.waitForTimeout(2800);

  const snap = () => page.evaluate(() => {
    const by = document.getElementById('legend-byline');
    const leg = document.querySelector('.legend');
    const f = (n) => n ? n.textContent.trim() : null;
    return {
      byPresent: !!by,
      fields: by ? {
        projection: f(by.querySelector('[data-field="projection"]')),
        colour: f(by.querySelector('[data-field="colour"]')),
        year: f(by.querySelector('[data-field="year"]')),
        definition: f(by.querySelector('[data-field="definition"]')),
      } : null,
      legPresent: !!leg,
      hasColours: !!(leg && leg.querySelector('.legend__colours .sym')),
      swatches: leg ? [...leg.querySelectorAll('.legend__colours .legend__chip--fam')].map(c => ({
        word: c.querySelector('.legend__chip-w').textContent,
        n: c.querySelector('.legend__count').textContent,
        tex: c.querySelector('.sym') ? c.querySelector('.sym').dataset.tex || 'plain' : null,
      })) : [],
      ruleText: leg ? (leg.querySelector('.legend__rule-inline, .legend__rule-line') || {}).textContent : null,
      figures: leg ? (leg.querySelector('.legend__figures')||{}).textContent : null,
      def: (window.BEA.map && window.BEA.map.definition) || null,
    };
  });

  /* ---- T1 every layer, in every state, shows a one-sentence definition ---- */
  const layers = await page.evaluate(() => {
    const out = {};
    const mod = window.BEA && window.BEA.symbology;
    if (mod && mod.LAYER_MEANING) for (const k of Object.keys(mod.LAYER_MEANING)) out[k] = mod.LAYER_MEANING[k];
    return out;
  });
  log('T1 layer sentences: ' + JSON.stringify(layers));

  /* ---- T2 the byline in every state ------------------------------------- */
  const states = [];
  states.push(['default', await snap()]);
  for (const k of ['2','3','4','1']) { await page.keyboard.press(k); await page.waitForTimeout(600); states.push(['def '+k, await snap()]); }
  await page.keyboard.press('p'); await page.waitForTimeout(900); states.push(['equal-area', await snap()]);
  await page.keyboard.press('w'); await page.waitForTimeout(700); states.push(['weight', await snap()]);
  await page.keyboard.press('s'); await page.waitForTimeout(600); states.push(['stitch', await snap()]);
  await page.keyboard.press('h'); await page.waitForTimeout(800); states.push(['silence', await snap()]);
  for (const [t, s] of states) log('STATE ' + t + ' :: ' + JSON.stringify(s));

  /* ---- T3 the three-things-wrong list changes and never repeats ---------- */
  await page.keyboard.press('h'); await page.keyboard.press('s'); await page.keyboard.press('w');
  await page.waitForTimeout(700);
  const crit = [];
  const readCrit = async (tag) => {
    await page.evaluate(() => window.BEA.legend.openPlate('criticism'));
    await page.waitForTimeout(500);
    const t = await page.evaluate(() => [...document.querySelectorAll('.lplate__crit > li strong')].map(n=>n.textContent.trim()));
    crit.push([tag, t]);
    await page.evaluate(() => window.BEA.legend.closePlate());
    await page.waitForTimeout(300);
  };
  await readCrit('mercator/status/claimed');
  await page.keyboard.press('p'); await page.waitForTimeout(900); await readCrit('equal-area/status/claimed');
  await page.keyboard.press('3'); await page.waitForTimeout(700); await readCrit('equal-area/status/controlled');
  await page.keyboard.press('4'); await page.waitForTimeout(700); await readCrit('equal-area/status/influenced');
  log('T3 criticism lists:\n' + crit.map(([t,l])=>t+' => '+JSON.stringify(l)).join('\n'));

  /* ---- T5 totals equal data.metricsAt / totalsAt ------------------------- */
  const t5 = await page.evaluate(() => {
    const st = window.BEA.store.getState();
    const T = window.BEA.legend.totalsAt(st.year);
    const m = window.BEA.data.metricsAt(st.year);
    const byDeg = m.byDegree || {};
    const sumFrom = lo => [1,2,3,4,5].filter(d=>d>=lo).reduce((n,d)=>n+(Number(byDeg[d])||0),0);
    return { year: st.year,
      claimedUnits: T.sets.claimed.units, administered: T.sets.administered.units, controlled: T.sets.controlled.units,
      influenced: T.sets.influenced.units,
      metricsControlledUnits: m.controlledUnits, degreeOneUnits: T.degreeOneUnits,
      admFromDeg: sumFrom(3), ctrlFromDeg: Number(byDeg[5])||0,
      byStatusSums: Object.fromEntries(['claimed','administered','controlled','influenced'].map(id =>
        [id, T.sets[id].byStatus.reduce((n,s)=>n+s.units,0)])),
    };
  });
  log('T5 ' + JSON.stringify(t5));

  await shot('final');
  log('ERRORS ' + JSON.stringify(errs));
};
