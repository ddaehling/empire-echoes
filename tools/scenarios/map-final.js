/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P02 map — the whole piece in one pass, for a critic.
   Boots, drives every mechanism, and reports what it found. Run it with
   --dark, --mobile and --reduced too; the assertions hold in all four. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.__map && window.BEA && window.BEA.store, null, { timeout: 30000 });
  await page.waitForTimeout(600);
  const go = (fn, a) => page.evaluate(fn, a);

  await go(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(500);
  await shot('01-status-1913');

  log('coastline + palette:', JSON.stringify(await go(() => {
    const T = window.__map.plate.tokens;
    const bad = Object.entries(T.fills).filter(([, v]) => /^#(000|fff)(fff|000)?$/i.test(String(v).trim()));
    return { badFills: bad, coast: T.coast, sea: T.sea, paper: T.paper, drawnUnits: window.__map.plate.paint.size };
  })));

  /* keys 1-4 hold the year and change the definition */
  const defs = [];
  for (const key of ['1', '2', '3', '4']) {
    await page.keyboard.press(key);
    await page.waitForTimeout(320);
    defs.push(await go(() => {
      const m = window.__map, s = window.BEA.store.getState();
      const x = m.measures[m.definition];
      return { key: m.definition, year: s.year, units: x.units, km2: x.km2, territories: x.territories,
        pop: x.population.total, popCounted: x.population.counted, popMissing: x.population.missing };
    }));
  }
  log('definition switch:', JSON.stringify(defs));
  await shot('02-influenced');
  await page.keyboard.press('1');
  await page.waitForTimeout(300);

  /* P swaps the projection */
  await page.keyboard.press('p');
  await page.waitForTimeout(1000);
  await shot('03-mercator');
  log('projection:', JSON.stringify(await go(() => ({ id: window.__map.projection, byline: (document.querySelector('.map__proj') || {}).innerText }))));
  await page.keyboard.press('p');
  await page.waitForTimeout(1000);

  /* weight mode from the module's own cited metric */
  await go(() => window.__map.sizeByPopulation());
  await page.waitForTimeout(600);
  await shot('04-weight-population');
  log('weight:', JSON.stringify(await go(() => {
    const w = window.__map.weight, p = window.__map.plate;
    let absence = 0; for (const r of p.paint.values()) if (r.mode === 'absence') absence++;
    return { metric: w.metric, counted: w.counted, missing: w.missing, absenceDrawn: absence };
  })));
  await go(() => window.__map.setWeight(null));
  await page.waitForTimeout(300);

  /* a silence, drawn as a hole */
  await go(() => window.BEA.bus.emit('ask:paintSilence', { unitIds: ['kenya'], reason: 'Operation Legacy', agent: 'the Colonial Office' }));
  await page.waitForTimeout(500);
  await shot('05-silence');
  await go(() => window.BEA.bus.emit('ask:paintSilence', { unitIds: [], clear: true }));
  await page.waitForTimeout(250);

  /* tiny units */
  log('tiny units:', JSON.stringify(await go(() => {
    const m = window.__map;
    return ['gibraltar', 'malta', 'ascension', 'barbados', 'ye-aden-colony', 'singapore', 'hk-hong-kong-island'].map((id) => {
      const s = m.unitScreen(id), o = document.getElementById('map-u-' + id);
      const r = o && o.getBoundingClientRect();
      return { id, pick: m.pick(s.px, s.py), target: r ? Math.round(Math.min(r.width, r.height)) : null };
    });
  })));

  const errs = await go(() => window.BEA.registry.report().failed);
  log('failed modules:', JSON.stringify(errs));
};
