/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 6 — FEATURE_SPEC §2's five acceptance tests, run against the app
   as it is now: a ribbon in the key strip, a byline at data-stage="apparatus",
   and four sheets in the shell's rail. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.waitForTimeout(2800);

  /* ---- T1: every layer, in every state, has a one-sentence definition ---- */
  const t1 = await page.evaluate(() => {
    const m = window.BEA && window.BEA.symbology;
    const meanings = m && m.LAYER_MEANING ? m.LAYER_MEANING : {};
    const short = m && m.LAYER_SHORT ? m.LAYER_SHORT : {};
    const missing = Object.keys(meanings).filter(k => !meanings[k] || !short[k]);
    return { layers: Object.keys(meanings).length, missing,
      onScreen: (document.querySelector('.legend__say') || {}).textContent || null };
  });
  log('T1 ' + JSON.stringify(t1));

  /* ---- T2: the four fields, in every state, matching the render --------- */
  const fields = () => page.evaluate(() => {
    const f = (root, k) => { const n = root && root.querySelector(`[data-field="${k}"]`); return n ? n.textContent.trim() : null; };
    const by = document.getElementById('legend-byline');
    const sheet = document.querySelector('.lsheet');
    const grab = (r) => r ? { projection: f(r, 'projection'), colour: f(r, 'colour'), year: f(r, 'year'), definition: f(r, 'definition') } : null;
    return {
      stage: document.getElementById('app').dataset.stage,
      byline: grab(by), sheet: grab(sheet),
      def: (window.BEA.map && window.BEA.map.definition) || null,
      year: window.BEA.store.getState().year,
    };
  });
  const states = [];
  const open = (s) => page.evaluate((x) => window.BEA.legend.openPlate(x), s);
  await open('criticism'); await page.waitForTimeout(500);
  states.push(['plate + sheet', await fields()]);
  for (const k of ['2', '3', '4', '1']) { await page.keyboard.press(k); await page.waitForTimeout(500); states.push(['def ' + k, await fields()]); }
  await page.keyboard.press('p'); await page.waitForTimeout(800); states.push(['equal-area', await fields()]);
  await page.keyboard.press('w'); await page.waitForTimeout(600); states.push(['weight', await fields()]);
  await page.keyboard.press('h'); await page.waitForTimeout(700); states.push(['silence', await fields()]);
  await page.evaluate(() => window.BEA.store.dispatch('setFilter', { stage: 'apparatus' }));
  await page.waitForTimeout(700);
  states.push(['apparatus', await fields()]);
  for (const [t, s] of states) log('T2 ' + t + ' :: ' + JSON.stringify(s));

  /* ---- T3: three things wrong, changing, never stale -------------------- */
  await page.keyboard.press('h'); await page.keyboard.press('w'); await page.waitForTimeout(600);
  const crit = [];
  const readCrit = async (tag) => {
    await open('criticism'); await page.waitForTimeout(450);
    crit.push([tag, await page.evaluate(() => [...document.querySelectorAll('.lplate__crit > li strong')].map(n => n.textContent.trim()))]);
  };
  await readCrit('mercator/claimed');
  await page.keyboard.press('p'); await page.waitForTimeout(800); await readCrit('equal-area/claimed');
  await page.keyboard.press('3'); await page.waitForTimeout(600); await readCrit('equal-area/controlled');
  await page.keyboard.press('4'); await page.waitForTimeout(600); await readCrit('equal-area/influenced');
  log('T3 ' + crit.map(([t, l]) => t + ' => ' + JSON.stringify(l)).join('\n     '));
  const dupes = crit.filter((c, i) => i && JSON.stringify(c[1]) === JSON.stringify(crit[i - 1][1]));
  log('T3 repeats: ' + dupes.length + '  (must be 0)  · all three set: ' + crit.every(c => c[1].length >= 1));

  /* ---- T4: colour + texture + word on every swatch ---------------------- */
  await open('colour'); await page.waitForTimeout(500);
  const t4 = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.lsheet .legend__row .legend__entry')].map(r => {
      const sym = r.querySelector('.sym');
      const word = r.querySelector('.legend__word');
      return { word: word ? word.textContent.trim() : null,
        fill: sym ? getComputedStyle(sym).getPropertyValue('--sym-fill').trim() : null,
        tex: sym ? (sym.dataset.tex || 'plain') : null };
    });
    const rib = [...document.querySelectorAll('.legend--ribbon .legend__rib')].map(r => {
      const sym = r.querySelector('.sym');
      return { word: (r.querySelector('.legend__rib-w') || {}).textContent,
        n: (r.querySelector('.legend__rib-n') || {}).textContent,
        tex: sym ? (sym.dataset.tex || 'plain') : null };
    });
    return { rows: rows.length, rowsComplete: rows.every(r => r.word && r.tex !== null), rib,
      noWord: rows.filter(r => !r.word).length };
  });
  log('T4 ' + JSON.stringify(t4));

  /* ---- T5: the totals equal data.metricsAt / totalsAt ------------------- */
  const t5 = await page.evaluate(() => {
    const st = window.BEA.store.getState();
    const T = window.BEA.legend.totalsAt(st.year);
    const m = window.BEA.data.metricsAt(st.year);
    const byDeg = m.byDegree || {};
    const sumFrom = lo => [1, 2, 3, 4, 5].filter(d => d >= lo).reduce((n, d) => n + (Number(byDeg[d]) || 0), 0);
    const ribbonSum = [...document.querySelectorAll('.legend--ribbon .legend__rib-n')]
      .reduce((n, e) => n + Number(String(e.textContent).replace(/[^\d]/g, '')), 0);
    const defId = (window.BEA.map && window.BEA.map.definition) || 'claimed';
    return { year: st.year, defId,
      metricsDegreeOne: m.controlledUnits, panelDegreeOne: T.degreeOneUnits,
      admin: [sumFrom(3), T.sets.administered.units],
      controlled: [Number(byDeg[5]) || 0, T.sets.controlled.units],
      ribbonShownSum: ribbonSum, setUnits: T.sets[defId].units };
  });
  log('T5 ' + JSON.stringify(t5));

  await shot('accept');
  log('ERRORS ' + JSON.stringify(errs));
};
