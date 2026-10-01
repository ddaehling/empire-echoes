module.exports = async ({ page, log, shot }) => {
  const base = page.url().split('#')[0];
  for (const y of [2020, 1992, 1900, 1800]) {
    await page.goto(base + '#year=' + y, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__map && window.__map.plate && window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => {
      const M = window.__map, y = window.BEA.store.getState().year;
      const t = window.BEA.data.byId.get('south-georgia-and-the-south-sandwich-islands');
      const units = (t.units || []).map((u) => (typeof u === 'string' ? u : u.id));
      return { labels: M.plate.labelsDrawn.map((l) => l.text).filter((s) => /georgia|sandwich/i.test(s)),
        per: units.map((u) => u + '=' + M.module._plateName(u, M.plate.paint.get(u) || {}, y)),
        group: M.module._plateGroupName('south-georgia-and-the-south-sandwich-islands', units, y),
        spoken: units.map((u) => M.module._describe(u, M.plate.paint.get(u) || {}).slice(0, 60)) };
    });
    log(y + '  drawn: ' + JSON.stringify(r.labels) + '  per-unit: ' + JSON.stringify(r.per) + '  group: ' + r.group);
    log('      spoken: ' + JSON.stringify(r.spoken));
  }
};
