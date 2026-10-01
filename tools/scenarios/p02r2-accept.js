/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P02 round 2 — the six acceptance tests from FEATURE_SPEC §2, run for real. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 240)); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.goto('http://localhost:8777/app/#year=1913', { waitUntil: 'load' });
  await page.waitForTimeout(3200);

  /* ---- T2: definition counts come from the dataset ---------------------- */
  const t2 = await page.evaluate(() => {
    const m = window.__map, d = window.BEA.data;
    const out = {};
    for (const id of ['claimed', 'administered', 'controlled', 'influenced']) {
      m.setDefinition(id);
      out[id] = { painted: [...m.plate.paint.values()].filter(r => !r.lost && r.mode !== 'hole').length, measure: m.measures[id].units };
    }
    m.setDefinition('claimed');
    const st = d.statusAt(1913);
    const tally = { ge1NotInformal: 0, ge3: 0, eq5: 0, ge1OrInformal: 0 };
    for (const e of st.values()) {
      if (e.controlDegree >= 1 && e.status !== 'informal-sphere') tally.ge1NotInformal++;
      if (e.controlDegree >= 3) tally.ge3++;
      if (e.controlDegree === 5) tally.eq5++;
      if (e.controlDegree >= 1 || e.status === 'informal-sphere') tally.ge1OrInformal++;
    }
    const byDegree = d.metricsAt(1913).byDegree;
    return { out, tally, byDegree };
  });
  log('T2', JSON.stringify(t2));

  /* ---- the round-1 killer: a real mouse press on every control ---------- */
  const st = () => page.evaluate(() => ({ def: document.querySelector('.map').dataset.definition, proj: document.querySelector('.map').dataset.projection, stitch: document.querySelector('.map').dataset.stitch || '', k: +window.__map.plate.view.k.toFixed(3) }));
  const realClick = async (sel, idx) => {
    const p = await page.evaluate(([s, i]) => { const b = [...document.querySelectorAll(s)][i]; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, [sel, idx]);
    await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.waitForTimeout(50); await page.mouse.up();
    await page.waitForTimeout(800);
    return st();
  };
  log('before controls', JSON.stringify(await st()));
  log('mouse .map__def[1] administered', JSON.stringify(await realClick('.map__def', 1)));
  log('mouse .map__def[2] controlled', JSON.stringify(await realClick('.map__def', 2)));
  log('mouse .map__def[0] claimed', JSON.stringify(await realClick('.map__def', 0)));
  log('mouse .map__proj', JSON.stringify(await realClick('.map__proj', 0)));
  log('mouse .map__stitch', JSON.stringify(await realClick('.map__stitch', 0)));
  await shot('01-stitching');
  log('mouse .map__stitch again', JSON.stringify(await realClick('.map__stitch', 0)));
  log('mouse zoom in', JSON.stringify(await realClick('.map__zoom', 0)));
  log('mouse zoom out', JSON.stringify(await realClick('.map__zoom', 1)));
  log('mouse home', JSON.stringify(await realClick('.map__zoom', 2)));
  log('mouse .map__proj back', JSON.stringify(await realClick('.map__proj', 0)));

  /* ---- T4: projection toggle ------------------------------------------- */
  const t4 = await page.evaluate(async () => {
    const m = window.__map;
    const area = (u) => { const s = m.unitScreen(u); return s ? Math.round(s.w * s.h) : null; };
    const fills = () => [...m.plate.paint].slice(0, 40).map(([u, r]) => u + ':' + (r.fill || r.mode));
    const before = { proj: m.projection, canada: area('ca-nunavut') || area('ca-quebec'), fills: fills().join(',') };
    m.setProjection(m.projection === 'mercator' ? 'equal-earth' : 'mercator');
    await new Promise(r => setTimeout(r, 1400));
    const after = { proj: m.projection, canada: area('ca-nunavut') || area('ca-quebec'), fills: fills().join(',') };
    return { before, after, sameFills: before.fills === after.fills };
  });
  log('T4', JSON.stringify({ before: t4.before.proj, beforeCanada: t4.before.canada, after: t4.after.proj, afterCanada: t4.after.canada, sameFills: t4.sameFills }));
  await shot('02-equal-earth');

  /* ---- T5: weight mode over a ten-unit metric --------------------------- */
  const t5 = await page.evaluate(() => {
    const m = window.__map;
    const ids = [...m.plate.paint.keys()].filter(u => { const r = m.plate.paint.get(u); return r && !r.lost && r.mode === 'fill'; }).slice(0, 10);
    const values = {}; ids.forEach((u, i) => { values[u] = 1000 * (i + 1); });
    window.BEA.bus.emit('ask:sizeBy', { metric: 'test-metric', year: 1913, values, caption: 'A test quantity, ten units only.' });
    const scaled = [...m.plate.paint].filter(([, r]) => r.mode === 'fill' && !r.lost).length;
    const absent = [...m.plate.paint].filter(([, r]) => r.mode === 'absence').length;
    const w = m.weight;
    return { asked: ids.length, scaled, absent, counted: w && w.counted, missing: w && w.missing, sample: ids.slice(0, 3) };
  });
  log('T5', JSON.stringify(t5));
  await shot('03-weight');
  await page.evaluate(() => window.BEA.bus.emit('ask:sizeBy', { metric: null }));

  /* ---- silence: five named, one drawable -------------------------------- */
  const sil = await page.evaluate(() => {
    window.BEA.bus.emit('ask:paintSilence', { unitIds: ['kenya', 'zzz-fake', 'also-fake', 'nope4', 'nope5'], reason: 'Operation Legacy', agent: 'the Colonial Office' });
    return document.querySelector('.map__switch').innerText.replace(/\n+/g, ' | ');
  });
  log('silence readout', sil.slice(-400));

  /* ---- paintUnits actually paints --------------------------------------- */
  const hl = await page.evaluate(() => {
    window.BEA.bus.emit('ask:paintSilence', { unitIds: [], clear: true });
    window.BEA.bus.emit('ask:paintUnits', { unitIds: ['new-zealand', 'nope-x'], reason: 'the Waitangi texts are open' });
    const m = window.__map;
    return { dimmed: [...m.plate.paint.values()].filter(r => r.dim).length, note: document.querySelector('.map__switch').innerText.split('\n').filter(l => l.startsWith('Showing a set')).join(' ') };
  });
  log('paintUnits', JSON.stringify(hl));
  await shot('04-paintunits');

  /* ---- T6 + frame budget: a 600-frame scrub ------------------------------ */
  const perf = await page.evaluate(async () => {
    const m = window.__map, store = window.BEA.store;
    window.BEA.bus.emit('ask:paintUnits', { unitIds: [] });
    m.resetStats();
    const t0 = performance.now();
    for (let y = 1600; y <= 1997; y++) {
      store.dispatch('setYear', y); store.flush();
      m.draw();
    }
    const wall = performance.now() - t0;
    return { stats: m.frameStats(), wallMs: Math.round(wall), years: 398 };
  });
  log('T6 scrub', JSON.stringify(perf));

  log('errors', JSON.stringify(errs));
};
