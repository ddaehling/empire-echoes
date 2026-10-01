/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 ROUND 6 — FEATURE_SPEC §2 P17 acceptance tests 1–5, re-run after the
   naming pass and the strip's position fix. */
const CVD = {
  protanopia: '0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0',
  deuteranopia: '0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0',
  tritanopia: '0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0',
};
module.exports = async ({ page, shot, log }) => {
  const fails = [];
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });

  /* T1 — every layer has a one-sentence definition; an unknown one cannot register */
  const t1 = await page.evaluate(() => {
    const S = window.BEA.symbology; const ids = Object.keys(S.LAYER_MEANING);
    return { layers: ids.length, missing: ids.filter(i => !S.layerSentence(i)), unknown: S.layerSentence('not-a-layer') };
  });
  log('T1 ' + JSON.stringify(t1));
  if (t1.missing.length || t1.unknown) fails.push('T1 a layer without a definition sentence');

  /* T1b — and the strip PRINTS one, in every state where there is room */
  await page.evaluate(() => { location.hash = '#year=1900&layer=status'; });
  await page.waitForTimeout(1200);
  const said = await page.evaluate(() => {
    const p = document.querySelector('.legend__say');
    const g = document.querySelector('.legend--ribbon');
    return { printed: p && !p.hidden ? p.textContent.trim() : null, groupName: g ? g.getAttribute('aria-label') : null,
      defect: !!document.querySelector('.legend__say--defect') };
  });
  log('T1b ' + JSON.stringify(said));
  if (said.defect) fails.push('T1b a layer registered with no definition sentence');
  if (!said.printed && !said.groupName) fails.push('T1b the definition is neither printed nor spoken');

  /* T2 — the byline, in the state that reserves a column for it */
  await page.evaluate(() => { location.hash = '#year=1900&layer=status&filter=stage:apparatus'; });
  await page.waitForTimeout(1800);
  const t2 = await page.evaluate(() => {
    const b = document.getElementById('legend-byline');
    if (!b) return { present: false };
    const o = { present: true };
    for (const k of ['projection', 'colour', 'year', 'definition']) {
      const n = b.querySelector(`[data-field="${k}"]`);
      o[k] = n ? n.textContent.trim().slice(0, 46) : null;
    }
    return o;
  });
  log('T2 ' + JSON.stringify(t2));
  if (!t2.present || !t2.projection || !t2.colour || !t2.year || !t2.definition) fails.push('T2 the byline is missing a field at apparatus');

  /* T3 — the three criticisms change with projection, layer and definition */
  const crit = async () => page.evaluate(() => [...document.querySelectorAll('.lplate__crit > li strong')].map(n => n.textContent.trim()));
  await page.evaluate(() => window.BEA.legend.openPlate('criticism'));
  await page.waitForTimeout(1000);
  const seenCrit = [];
  const step = async (tag, fn) => { await fn(); await page.waitForTimeout(950);
    const c = await crit(); seenCrit.push(c.join('|')); log('T3 ' + tag + ' ' + JSON.stringify(c)); };
  await step('start', async () => {});
  await step('projection', async () => page.keyboard.press('p'));
  await step('layer=tenure', async () => page.evaluate(() => window.BEA.store.dispatch('setLayer', 'tenure')));
  await step('def=controlled', async () => page.keyboard.press('3'));
  await step('def=influenced', async () => page.keyboard.press('4'));
  log('T3 distinct: ' + new Set(seenCrit).size + ' of ' + seenCrit.length);
  if (new Set(seenCrit).size !== seenCrit.length) fails.push('T3 the criticism list repeated a stale entry');

  /* T4 — every swatch carries colour AND texture AND word, and survives CVD */
  await page.evaluate(() => { location.hash = '#year=1900&layer=status'; });
  await page.waitForTimeout(1300);
  const t4 = await page.evaluate(() => {
    const bad = [];
    for (const li of document.querySelectorAll('.legend__rib')) {
      const sym = li.querySelector('.sym'); const w = li.querySelector('.legend__rib-w');
      const fill = sym ? getComputedStyle(sym).getPropertyValue('--sym-fill').trim() : '';
      const tex = sym ? (sym.dataset.tex || 'plain') : null;
      if (!sym) bad.push('no swatch: ' + (w && w.textContent));
      else if (!w || !w.textContent.trim()) bad.push('no word beside a swatch');
      else if (!fill && sym.dataset.kind === 'status') bad.push('no fill: ' + w.textContent);
      if (sym && sym.getAttribute('aria-hidden') !== 'true') bad.push('a swatch is in the accessibility tree: ' + (w && w.textContent));
    }
    return { chips: document.querySelectorAll('.legend__rib').length, bad };
  });
  log('T4 ' + JSON.stringify(t4));
  if (t4.bad.length) fails.push('T4 ' + t4.bad.join('; '));
  await page.evaluate(() => window.BEA.legend.openPlate('colour'));
  await page.waitForTimeout(1000);
  await shot('T4-normal');
  for (const [k, v] of Object.entries(CVD)) {
    await page.evaluate(([key, mat]) => {
      const ns = 'http://www.w3.org/2000/svg';
      let svg = document.getElementById('cvd-host');
      if (!svg) { svg = document.createElementNS(ns, 'svg'); svg.id = 'cvd-host'; svg.setAttribute('style', 'position:fixed;width:0;height:0'); document.body.appendChild(svg); }
      svg.innerHTML = '';
      const f = document.createElementNS(ns, 'filter'); f.setAttribute('id', 'cvd'); f.setAttribute('color-interpolation-filters', 'sRGB');
      const cm = document.createElementNS(ns, 'feColorMatrix'); cm.setAttribute('type', 'matrix'); cm.setAttribute('values', mat);
      f.appendChild(cm); svg.appendChild(f);
      document.getElementById('app').style.filter = 'url(#cvd)';
    }, [k, v]);
    await page.waitForTimeout(400);
    await shot('T4-' + k);
  }
  await page.evaluate(() => { document.getElementById('app').style.filter = ''; });

  /* T5 — the totals equal data.metricsAt for the definition in force */
  const t5 = await page.evaluate(() => {
    const y = window.BEA.store.getState().year;
    const t = window.BEA.legend.totalsAt(y), m = window.BEA.data.metricsAt(y);
    const byDeg = m.byDegree || {};
    return { y, panelDegreeOne: t.degreeOneUnits, metricsControlled: m.controlledUnits,
      ctrl5: byDeg[5] || 0, panelCtrl: t.sets.controlled.units, panelClaimed: t.sets.claimed.units };
  });
  log('T5 ' + JSON.stringify(t5));
  if (t5.panelDegreeOne !== t5.metricsControlled) fails.push('T5 the legend\'s degree-1 count ' + t5.panelDegreeOne + ' != metricsAt ' + t5.metricsControlled);
  if (t5.panelCtrl !== t5.ctrl5) fails.push('T5 the legend\'s controlled count ' + t5.panelCtrl + ' != byDegree[5] ' + t5.ctrl5);

  log('');
  log('=== acceptance failures: ' + fails.length + ' ===');
  fails.forEach(f => log('   FAIL ' + f));
  log(fails.length ? '>>> P17 ACCEPTANCE BROKEN' : '>>> P17 acceptance tests 1-5 pass');
};
