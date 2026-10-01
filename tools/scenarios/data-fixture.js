/**
 * data-fixture.js — regression check for app/js/core/data.js. Owner: shell/core agent.
 * Covers both shapes it must read:
 *   A) the v1 schema (docs/DATA_MODEL.md) via app/data/territories/_TEMPLATE.json
 *   B) the flat legacy shape via tools/fixtures/
 * plus geometry loading (shared files, lazy layers, unit metadata).
 *
 *   node tools/inspect.js tools/scenarios/data-fixture.js --out /tmp/datacheck
 */
/* GUARANTEE THIS FILE PROTECTS: `core/data.js` reads both dataset shapes and
   loads its geometry — the layer under everything else in the app.
   WAVE 9: `await page.waitForFunction(() => window.BEA)` was not enough and had
   started failing outright with "Cannot read properties of undefined (reading
   'geo')". `main.js` publishes the BEA handle and REPLACES it on the line after
   `app:ready`, so there is a window in which `window.BEA` is truthy and
   `window.BEA.data` is not there yet. Wait for the thing that is about to be
   read, not for the namespace it will live in. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data && window.BEA.data.geo
    && window.BEA.store && window.BEA.store.getState().status === 'ready',
    null, { timeout: 30000 });

  log('GEOMETRY:', JSON.stringify(await page.evaluate(async () => {
    const d = window.BEA.data;
    const before = Object.entries(d.geo).map(([k, v]) => k + (v.loaded ? ' loaded' : ' lazy'));
    const fine = await d.loadGeoLayer('fine');
    return {
      available: d.geoAvailable, before,
      after: Object.entries(d.geo).map(([k, v]) => k + (v.loaded ? ' loaded' : ' lazy')),
      fineGeometries: fine ? fine.objects.units.geometries.length : 0,
      sharedTopology: d.geo.land.data === d.geo.lakes.data,
      unitMeta: d.unitMeta ? d.unitMeta.size : 0,
      unitName: d.unitName('hk-kowloon'),
    };
  }), null, 1));

  log('V1 SCHEMA (_TEMPLATE.json):', JSON.stringify(await page.evaluate(async () => {
    const { loadData } = await import('/app/js/core/data.js');
    const shard = await (await fetch('/app/data/territories/_TEMPLATE.json')).json();
    const d = await loadData({ territories: shard.territories, base: 'http://localhost:8777/app/data/' });
    const t = d.get('barbados');
    const at = y => { const e = d.statusAt(y).get('barbados'); return e && (e.status + '/deg' + e.controlDegree + '/since' + e.since + '/' + e.tenureYears + 'y'); };
    return {
      counts: d.meta.counts, bounds: d.bounds, aka: t.aka, units: t.units,
      spans: t.spans.map(s => s.start + '-' + (s.end ?? 'now') + ' ' + s.status + ' deg' + s.controlDegree),
      acquired: t.acquiredYear, ended: t.endedYear, tenure: t.tenureYears,
      at1700: at(1700), at1900: at(1900), after: d.statusAt(1970).size,
      acquisition: d.acquisitions.map(a => a.year + ' ' + a.mechanism),
      departure: d.departures.map(x => x.year + ' ' + x.mechanism),
    };
  }), null, 1));

  log('LEGACY SHAPE (tools/fixtures):', JSON.stringify(await page.evaluate(async () => {
    const { loadData } = await import('/app/js/core/data.js');
    const d = await loadData({ base: 'http://localhost:8777/tools/fixtures/' });
    const m = d.statusAt(1900);
    return {
      placeholder: d.meta.placeholder, counts: d.meta.counts, dataset: d.meta.dataset,
      statuses: d.statuses.map(s => s.id + '|' + (s.label || '-') + '|' + s.controlled),
      regions: d.regions.map(r => r.id + '|' + (r.label || '-')),
      at1900: [...m].map(([u, e]) => u + '=' + e.territoryId + '/' + e.status + '/since' + e.since),
      passthrough: d.get('bengal').populationNote, aka: d.get('bengal').aka,
      contested: m.get('LKA').contested,
    };
  }), null, 1));
};
