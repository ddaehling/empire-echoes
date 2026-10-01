/** w6/measure.js — the numbers, before anything is changed. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(async () => {
    const t = await fetch('/app/js/tours/tours.json').then(x => x.json());
    const byId = new Map(t.beats.map(b => [b.id, b]));
    const out = { routes: {}, index: null };
    for (const id of Object.keys(t.variants)) {
      const ids = t.variants[id];
      const ts = [];
      for (const b of ids) { const bb = byId.get(b); if (bb && bb.t && !ts.includes(bb.t)) ts.push(bb.t); }
      const recalls = [];
      const meta = t.variantMeta[id] || {};
      const wants = (flag, x) => (Array.isArray(flag) ? flag.includes(x) : flag !== false);
      for (const b of ids) {
        const bb = byId.get(b);
        if (bb && bb.recallAfter && wants(meta.recalls, bb.recallAfter.id)) recalls.push(bb.recallAfter.id + '(' + bb.recallAfter.t + ')');
      }
      out.routes[id] = { beats: ids.length, tBeats: ts.sort((a,b)=>+a.slice(1)-+b.slice(1)), recalls };
    }
    const ix = window.BEA.toursIndex;
    out.index = ix ? Object.keys(ix.routes).map(k => k + ': ' + ix.routes[k].steps.length + ' steps') : null;
    return out;
  });
  for (const k of Object.keys(r.routes)) {
    const x = r.routes[k];
    log(k.padEnd(8) + ' beats=' + x.beats + '  T(' + x.tBeats.length + '): ' + x.tBeats.join(',') + '  recalls: ' + (x.recalls.join(', ') || 'none'));
  }
  log('stepIndex: ' + JSON.stringify(r.index));
  const routes = await page.evaluate(() => new Promise((res) => {
    window.BEA.bus.on && window.BEA.bus.on('x', () => {});
    res(null);
  }));
};
