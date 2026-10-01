/** p02r11/probe.js — what the plate actually says at one year, and why. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForFunction(() => { const e = window.BEA.registry.get('map'); return e && e.status === 'mounted' && e.mod.plate; }, null, { timeout: 30000 });
  const YEARS = [1847, 1930, 1957, 1976, 2020];
  for (const y of YEARS) {
    const r = await page.evaluate((yy) => {
      const mod = window.BEA.registry.get('map').mod;
      const N = mod.namer, data = window.BEA.data;
      window.BEA.store.dispatch('setYear', yy);
      const paint = mod._paintFor(yy);
      const rows = [];
      const watch = ['us-oregon-country', 'gr-ionian-islands', 'in-west-bengal', 'bd-sylhet',
        'za-cape-colony', 'so-italian-somaliland', 'bermuda', 'pitcairn-islands', 'ie-connacht',
        'us-northwest-territory', 'ca-quebec', 'cm-french-cameroun', 'sc-outer-islands', 'ng-southern-nigeria'];
      for (const [uid, rec] of paint) {
        if (!watch.some((w) => uid.includes(w) || w.includes(uid))) continue;
        const tid = mod._tidFor(uid, rec);
        const p = tid ? N.periodName(tid, yy) : null;
        rows.push({ uid, tid, held: !!(rec && rec.entry && rec.entry.territoryId), lost: !!rec.lost, mode: rec.mode || null,
          plate: mod._plateName(uid, rec, yy),
          spoken: tid ? N.label(uid, tid, yy).text : null,
          unitName: data.unitName ? data.unitName(uid) : uid,
          p: p ? { name: p.name, picked: p.picked, dead: p.dead, successor: p.successor, modern: p.modern, unitCount: p.unitCount, source: p.source } : null });
      }
      return rows;
    }, y);
    log('=== ' + y);
    for (const row of r) log('   ' + row.uid + ' [' + row.tid + '] held=' + row.held + ' lost=' + row.lost
      + '\n        plate  "' + row.plate + '"\n        spoken "' + row.spoken + '"\n        unit "' + row.unitName + '"  p=' + JSON.stringify(row.p));
  }
  // and what is actually DRAWN at 2020
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 2020));
  await page.waitForTimeout(1200);
  const drawn = await page.evaluate(() => window.__map.plate.labelsDrawn.map((l) => l.text));
  log('DRAWN AT 2020 (' + drawn.length + '): ' + JSON.stringify(drawn));
};
