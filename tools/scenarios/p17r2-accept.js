/* RETIRED, WAVE 9 — NOT PART OF THE ACCEPTANCE SUITE (`tools/acceptance.js`).
 * P17 round 2. Superseded by rounds 5, 6, 8, 9 and 10 of the same piece. It waits 20 seconds for `#legend-byline`, which the legend no longer mounts under that id.
 * The guarantee it protected is now protected by `tools/scenarios/p17-r10-accept.js`.
 * Kept, unedited below, as the record of what that round measured. Running it
 * will fail against the current DOM; that is expected and is not a build break. */
/* P17 round 2 — the five FEATURE_SPEC acceptance tests, run against the real app.
   node tools/inspect.js tools/scenarios/p17r2-accept.js --out /tmp/p17r2-accept    */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.waitForFunction(() => window.BEA && window.BEA.data && document.querySelector('#legend-byline'), null, { timeout: 20000 });
  await page.waitForTimeout(1200);

  const fields = () => page.evaluate(() => {
    const o = {};
    for (const e of document.querySelectorAll('#legend-byline [data-field]')) o[e.dataset.field] = e.textContent;
    o._defect = [...document.querySelectorAll('#legend-byline .byline__value--defect')].map(e => e.dataset.field);
    o._present = !!document.querySelector('#legend-byline');
    return o;
  });

  /* ---------------- TEST 1 — every layer prints a one-sentence definition -- */
  const layers = await page.evaluate(() => Object.keys(window.BEA.symbology.LAYER_MEANING));
  const t1 = [];
  for (const L of layers.concat(['not-a-layer'])) {
    await page.evaluate((l) => window.BEA.store.dispatch('setLayer', l), L);
    await page.waitForTimeout(1300);
    const f = await fields();
    t1.push({ layer: L, colour: (f.colour || '').slice(0, 90), defect: f._defect.includes('colour') });
  }
  log('T1 ' + JSON.stringify(t1, null, 1));
  await page.evaluate(() => window.BEA.store.dispatch('setLayer', 'status'));
  await page.waitForTimeout(600);

  /* ---------------- TEST 2 — byline present + fields match the render ----- */
  const states = [
    ['year 1783', () => window.BEA.store.dispatch('setYear', 1783)],
    ['year 1913', () => window.BEA.store.dispatch('setYear', 1913)],
    ['select', () => window.BEA.store.dispatch('setSelected', window.BEA.data.territories[3].id)],
    ['compare', () => window.BEA.store.dispatch('setCompareYear', 1770)],
    ['no compare', () => window.BEA.store.dispatch('setCompareYear', null)],
    ['panel', () => window.BEA.store.dispatch('setPanel', { overlay: 'about' })],
    ['panel off', () => window.BEA.store.dispatch('setPanel', { overlay: null })],
    ['definition 3', () => window.__map.setDefinition('controlled')],
    ['projection', () => window.__map.setProjection(window.__map.projection === 'mercator' ? 'equal-earth' : 'mercator')],
    ['weight', () => window.__map.sizeByPopulation()],
    ['weight off', () => window.__map.setWeight(null)],
  ];
  const t2 = [];
  for (const [tag, fn] of states) {
    await page.evaluate(fn).catch(e => errs.push('STATE ' + tag + ' ' + e.message));
    await page.waitForTimeout(900);
    const f = await fields();
    const truth = await page.evaluate(() => {
      const s = window.BEA.store.getState();
      const m = window.__map;
      return {
        year: s.year,
        projection: m ? (m.projection === 'equal-earth' ? 'equal-area' : m.projection) : null,
        definition: m ? m.definition : null,
      };
    });
    const okProj = (f.projection || '').toLowerCase().includes(truth.projection === 'mercator' ? 'mercator' : 'equal earth');
    const okYear = (f.year || '').startsWith(String(truth.year));
    const okDef = (f.definition || '').startsWith(truth.definition);
    t2.push({ tag, present: f._present, okProj, okYear, okDef, year: f.year, proj: f.projection, def: (f.definition||'').slice(0,50) });
  }
  log('T2 ' + JSON.stringify(t2, null, 1));

  /* ---------------- TEST 3 — the criticism list changes, never stale ------ */
  const readCrit = async () => {
    await page.evaluate(() => { const b = document.querySelector('.byline__crit'); if (b.getAttribute('aria-expanded') !== 'true') b.click(); });
    await page.waitForTimeout(250);
    const ids = await page.evaluate(() => [...document.querySelectorAll('#legend-criticism li strong')].map(e => e.textContent));
    return ids;
  };
  const seq = [];
  await page.evaluate(() => { window.__map.setProjection('mercator'); window.__map.setDefinition('claimed'); window.BEA.store.dispatch('setLayer', 'status'); });
  await page.waitForTimeout(1000);
  seq.push(['start', await readCrit()]);
  const steps = [
    ['projection→equal-earth', () => window.__map.setProjection('equal-earth')],
    ['layer→exit', () => window.BEA.store.dispatch('setLayer', 'exit')],
    ['definition→administered', () => window.__map.setDefinition('administered')],
    ['projection→mercator', () => window.__map.setProjection('mercator')],
    ['layer→informal', () => window.BEA.store.dispatch('setLayer', 'informal')],
    ['definition→influenced', () => window.__map.setDefinition('influenced')],
  ];
  for (const [tag, fn] of steps) {
    await page.evaluate(fn);
    await page.waitForTimeout(1100);
    seq.push([tag, await readCrit()]);
  }
  let changedEvery = true, staleSlot = [];
  for (let i = 1; i < seq.length; i++) {
    const a = seq[i - 1][1], b = seq[i][1];
    if (JSON.stringify(a) === JSON.stringify(b)) changedEvery = false;
    for (let k = 0; k < 3; k++) if (a[k] && a[k] === b[k]) staleSlot.push(seq[i][0] + ' slot' + (k + 1) + ': ' + a[k].slice(0, 40));
  }
  log('T3 changedEveryStep=' + changedEvery);
  log('T3 seq ' + JSON.stringify(seq, null, 1));
  log('T3 repeatedSlots ' + JSON.stringify(staleSlot, null, 1));
  await shot('crit');

  /* ---------------- TEST 5 — totals equal an independent count ------------ */
  await page.evaluate(() => { const b = document.querySelector('.byline__crit'); if (b.getAttribute('aria-expanded') === 'true') b.click(); });
  await page.waitForTimeout(400);
  await page.evaluate(() => { window.BEA.store.dispatch('setLayer', 'status'); window.__map.setProjection('equal-earth'); });
  await page.waitForTimeout(600);
  const t5 = [];
  for (const year of [1700, 1783, 1900, 1913, 1922, 1947, 1997]) {
    for (const def of ['claimed', 'administered', 'controlled', 'influenced']) {
      await page.evaluate(([y, d]) => { window.BEA.store.dispatch('setYear', y); window.__map.setDefinition(d); }, [year, def]);
      await page.waitForTimeout(320);
      const r = await page.evaluate(([y, d]) => {
        const TESTS = {
          claimed: e => e.controlDegree >= 1 && e.status !== 'informal-sphere',
          administered: e => e.controlDegree >= 3,
          controlled: e => e.controlDegree === 5,
          influenced: e => e.controlDegree >= 1 || e.status === 'informal-sphere',
        };
        let units = 0; const terr = new Set(); let km2 = 0;
        for (const e of window.BEA.data.statusAt(y).values()) {
          if (!TESTS[d](e)) continue;
          units++; if (e.territoryId) terr.add(e.territoryId);
          const m = window.BEA.data.unitMeta.get(e.unitId);
          const a = m && Number(m.area_km2);
          if (Number.isFinite(a) && a > 0) km2 += e.partial ? a / 2 : a;
        }
        const txt = document.querySelector('.legend__figures').innerText;
        const nums = txt.match(/[\d,.]+/g) || [];
        const mm = window.BEA.data.metricsAt(y);
        return {
          truthUnits: units, truthTerr: terr.size, truthKm2: Math.round(km2),
          legendText: txt.replace(/\n/g, ' '),
          metricsControlled: mm.controlledUnits, metricsTerr: mm.territories,
          timeline: (document.querySelector('.tl__counts, .tl__totals, .time__slot') || {}).innerText || '',
          nums,
        };
      }, [year, def]);
      const parsed = { units: Number((r.nums[0] || '').replace(/,/g, '')), terr: Number((r.nums[1] || '').replace(/,/g, '')) };
      t5.push({
        year, def,
        legendUnits: parsed.units, truthUnits: r.truthUnits,
        legendTerr: parsed.terr, truthTerr: r.truthTerr,
        ok: parsed.units === r.truthUnits && parsed.terr === r.truthTerr,
        metricsControlled: r.metricsControlled, metricsTerr: r.metricsTerr,
        text: r.legendText.slice(0, 110),
      });
    }
  }
  log('T5 ' + JSON.stringify(t5, null, 1));
  log('T5 allOk=' + t5.every(x => x.ok));
  log('ERRORS ' + JSON.stringify(errs));
};
