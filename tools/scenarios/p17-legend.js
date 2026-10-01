/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'click').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 — legend, symbology and map literacy. Reusable by critics and later builders.
   node tools/inspect.js tools/scenarios/p17-legend.js --out /tmp/p17  [--dark] [--mobile] [--reduced] */
module.exports = async ({ page, shot, log }) => {
  const ready = async () => {
    await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
    await page.waitForSelector('.legend, .legend--compact', { timeout: 15000 });
    await page.waitForTimeout(250);
  };

  await ready();
  log('registry:', JSON.stringify(await page.evaluate(() => {
    const r = window.BEA.registry.report();
    return { mounted: r.mounted, failed: r.failed, absent: (r.absent || []).length };
  })));

  /* Another module currently stretches the app grid (.app__dossier's body
     reports a 4600px scrollHeight with nothing mounted in it), which pushes the
     bottom-left legend slot below the fold. Pin the grid to the viewport so this
     scenario photographs the composition the shell intends. Remove this block
     once the stage row is 1fr again. */
  await page.addStyleTag({ content: '.app { height: 100dvh; } .app__stage { min-height: 0; }' });
  await page.waitForTimeout(200);

  /* --- 1: default state, 1900 --------------------------------------------- */
  await shot('01-default-1900');
  await shot('01b-legend-only', '[data-mount="legend"]');
  await shot('01c-byline-only', '[data-mount="stage-note"]');

  log('legend text:', (await page.evaluate(() =>
    (document.querySelector('[data-mount="legend"]') || {}).innerText || '(none)')).slice(0, 2600));
  log('byline text:', (await page.evaluate(() =>
    (document.querySelector('#legend-byline') || {}).innerText || '(none)')));

  /* --- 2: the definition switch, holding the year ------------------------- */
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(200);
  const readTotals = () => page.evaluate(() => {
    const t = document.querySelector('.legend__figures');
    const s = window.BEA.store.getState();
    return {
      year: s.year, def: (s.filters || {}).def || 'claimed',
      figures: t ? t.innerText.replace(/\n/g, ' | ') : null,
      delta: (document.querySelector('.legend__delta') || {}).innerText || null,
      rows: [...document.querySelectorAll('.legend__entry[data-status]')].length,
    };
  });
  const defs = [];
  for (const key of ['1', '2', '3', '4']) {
    await page.keyboard.press(key);
    await page.waitForTimeout(180);
    const t = await readTotals();
    defs.push({ key, ...t, crit: await page.evaluate(() => [...document.querySelectorAll('.byline__crit-list li strong')].map(n => n.innerText)) });
    log('definition key ' + key + ':', JSON.stringify(t));
  }
  await shot('02-definition-controlled');

  /* Cross-check the legend's own totals against data.metricsAt. */
  const check = await page.evaluate(() => {
    const d = window.BEA.data, y = window.BEA.store.getState().year;
    const m = d.metricsAt(y);
    let claimed = 0, administered = 0, controlled = 0, influenced = 0, informal = 0;
    for (const e of d.statusAt(y).values()) {
      if (e.status === 'informal-sphere') informal++;
      if (e.controlDegree >= 1 && e.status !== 'informal-sphere') claimed++;
      if (e.controlDegree >= 3) administered++;
      if (e.controlDegree === 5) controlled++;
      if (e.controlDegree >= 1 || e.status === 'informal-sphere') influenced++;
    }
    const byDeg = Object.entries(m.byDegree).reduce((a, [k, v]) => (a[k] = v, a), {});
    const degSum = (min) => Object.entries(m.byDegree).reduce((a, [k, v]) => a + (+k >= min ? v : 0), 0);
    return { year: y, claimed, administered, controlled, influenced, informal,
      metricsUnits: m.units, metricsControlled: m.controlledUnits, byDeg,
      metricsAdministered: degSum(3), metricsClaimedPlusInformal: degSum(1) };
  });
  log('cross-check vs metricsAt:', JSON.stringify(check));

  /* --- 3: criticism list changes with state ------------------------------- */
  await page.evaluate(() => document.querySelector('.byline__crit').click());
  await page.waitForTimeout(200);
  await shot('03-criticism-open');
  log('criticism (definition=influenced):', await page.evaluate(() =>
    (document.querySelector('#legend-criticism') || {}).innerText || '(none)'));

  /* Drive the real control, not a synthetic bus event: the byline must report
     the projection the plate is actually drawn in. */
  const flipProjection = async () => {
    const ok = await page.evaluate(() => { const b = document.querySelector('.map__proj'); if (!b) return false; b.click(); return true; });
    await page.waitForTimeout(400);
    return ok;
  };
  log('flipped projection with the map\'s own control:', String(await flipProjection()));
  const merc = await page.evaluate(() => [...document.querySelectorAll('.byline__crit-list li strong')].map(n => n.innerText));
  log('criticism heads, mercator:', JSON.stringify(merc));
  await shot('04-criticism-mercator');

  await flipProjection();
  await page.evaluate(() => window.BEA.store.dispatch('setLayer', 'tenure'));
  await page.waitForTimeout(250);
  const eq = await page.evaluate(() => [...document.querySelectorAll('.byline__crit-list li strong')].map(n => n.innerText));
  log('criticism heads, equal-area + tenure layer:', JSON.stringify(eq));
  log('byline now:', await page.evaluate(() => document.querySelector('#legend-byline').innerText));
  await shot('05-equalarea-tenure');

  await page.evaluate(() => window.BEA.bus.emit('ask:sizeBy', { metric: 'population' }));
  await page.waitForTimeout(200);
  log('criticism heads, weight mode:', await page.evaluate(() =>
    [...document.querySelectorAll('.byline__crit-list li strong')].map(n => n.innerText)));
  await page.evaluate(() => window.BEA.bus.emit('ask:sizeBy', { metric: null }));

  /* --- 4: every row has colour, texture and word -------------------------- */
  const marks = await page.evaluate(() => {
    const out = [];
    for (const s of document.querySelectorAll('.legend .sym')) {
      const cs = getComputedStyle(s);
      const row = s.closest('.legend__row, .legend__ramp-step, .legend__family-head, .legend__family-list > li');
      out.push({
        kind: s.dataset.kind || null, tex: s.dataset.tex || 'plain',
        bg: cs.backgroundColor, img: cs.backgroundImage === 'none' ? 'none' : 'image',
        border: cs.borderTopColor + ' ' + cs.borderTopWidth,
        word: row ? (row.innerText || '').split('\n')[0].slice(0, 46) : '(no row)',
      });
    }
    return out;
  });
  log('marks (' + marks.length + '):');
  marks.forEach(m => log('  ' + JSON.stringify(m)));

  /* --- 5: clicking a row filters -------------------------------------------*/
  await page.evaluate(() => window.BEA.store.dispatch('setLayer', 'status'));
  await page.waitForTimeout(150);
  const before = await page.evaluate(() => JSON.stringify(window.BEA.store.getState().filters));
  await page.evaluate(() => {
    const b = document.querySelector('.legend__entry[data-status]');
    if (b) b.click();
  });
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => JSON.stringify(window.BEA.store.getState().filters));
  log('filters before/after row click:', before, '->', after);
  log('url after click:', await page.evaluate(() => location.hash));
  await shot('06-row-filtered');
  await page.evaluate(() => { const b = document.querySelector('.legend__entry[aria-pressed="true"][data-status]'); if (b) b.click(); });

  /* --- 6: keyboard reachability ------------------------------------------- */
  await page.evaluate(() => (document.querySelector('.legend__toggle') || {}).focus?.());
  const tabbed = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    tabbed.push(await page.evaluate(() => {
      const a = document.activeElement;
      return a ? (a.tagName + ':' + (a.getAttribute('data-focus-key') || (a.innerText || '').slice(0, 28)).replace(/\n/g, ' ')) : 'none';
    }));
  }
  log('tab order from the legend:', JSON.stringify(tabbed));
  await shot('07-keyboard-focus');

  /* --- 7: the sections a reviewer must actually look at -------------------- */
  await page.evaluate(() => {
    const b = document.querySelector('.legend__bodywrap');
    const marks = document.querySelector('.legend__rows--marks');
    if (marks) marks.scrollIntoView({ block: 'start' });
    void b;
  });
  await page.waitForTimeout(200);
  await shot('08-marks-in-panel', '[data-mount="legend"]');
  await page.evaluate(() => {
    document.querySelectorAll('.legend details').forEach(d => (d.open = true));
    const v = document.querySelector('.legend__criticise');
    if (v) v.scrollIntoView({ block: 'start' });
  });
  await page.waitForTimeout(200);
  await shot('09-vocabulary-and-criticise', '[data-mount="legend"]');
  log('FULL legend text:', await page.evaluate(() => document.querySelector('.legend').innerText));

  /* --- 7b: every layer has a definition sentence; an unknown one is a visible
     defect, not a silent blank ------------------------------------------------ */
  log('layer sentences:', await page.evaluate(async () => {
    const m = await import('/app/js/legend/symbology.js');
    const layers = ['status', 'control', 'mechanism', 'exit', 'tenure', 'informal', 'system', 'resistance', 'war-service', 'weight'];
    const missing = layers.filter(l => !m.layerSentence(l));
    return JSON.stringify({ checked: layers.length, missing });
  }));
  await page.evaluate(() => window.BEA.store.dispatch('setLayer', 'not-a-real-layer'));
  await page.waitForTimeout(250);
  log('unknown layer renders a visible defect:', await page.evaluate(() => JSON.stringify({
    legend: (document.querySelector('.legend .legend__defect') || {}).innerText || null,
    byline: (document.querySelector('.byline__value--defect') || {}).innerText || null,
    bylineColour: document.querySelector('.byline__value--defect')
      ? getComputedStyle(document.querySelector('.byline__value--defect')).color : null,
  })));
  await shot('10-unknown-layer-defect');
  await page.evaluate(() => window.BEA.store.dispatch('setLayer', 'status'));

  /* --- 7c: the criticism list never repeats an entry, and changes with state -- */
  const critFor = async (fn) => { await page.evaluate(fn); await page.waitForTimeout(200);
    return page.evaluate(() => [...document.querySelectorAll('.byline__crit-list li strong')].map(n => n.innerText)); };
  const setA = await critFor(() => { const b = document.querySelector('.map__proj'); if (b) b.click(); window.BEA.store.dispatch('setLayer', 'status'); });
  const setB = await critFor(() => { const b = document.querySelector('.map__proj'); if (b) b.click(); });
  const setC = await critFor(() => { window.BEA.store.dispatch('setLayer', 'mechanism'); });
  const dup = [setA, setB, setC].map(a => a.length !== new Set(a).size);
  log('criticism sets:', JSON.stringify({ setA, setB, setC, anyInternalDuplicate: dup, aEqualsB: JSON.stringify(setA) === JSON.stringify(setB), bEqualsC: JSON.stringify(setB) === JSON.stringify(setC) }));
  await page.evaluate(() => window.BEA.store.dispatch('setLayer', 'status'));

  /* --- 8: is the symbology published? ------------------------------------- */
  log('window.BEA.symbology statuses:', await page.evaluate(() =>
    window.BEA.symbology ? Object.keys(window.BEA.symbology.STATUS_SYMBOL).length : 'MISSING'));
  log('unknown statuses (dataset minus vocabulary):', await page.evaluate(() =>
    window.BEA.symbology ? JSON.stringify(window.BEA.symbology.unknownStatuses(window.BEA.data.statuses)) : 'n/a'));
  log('map adopted the vocabulary:', await page.evaluate(async () => {
    const m = await import('/app/js/map/palette.js');
    return m.hasSymbology ? String(m.hasSymbology()) : 'map module has no hasSymbology()';
  }));
};
