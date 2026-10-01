/**
 * p02r10/vision.js — every fill against the ground it is drawn on, under four
 * vision models, in CIEDE2000; and which families the module is therefore
 * drawing with the heavy engraving in this theme.
 */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.__map && window.__map.plate && window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.goto(page.url().split('#')[0] + '#year=1900', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__map && window.__map.plate && window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForTimeout(1500);
  const r = await page.evaluate(async () => {
    const mod = window.BEA.registry.get('map').mod;
    const pal = await import('/app/js/map/palette.js');
    const sep = pal.separations(mod.tokens);
    return { sep, weak: [...(mod.weakFills || [])], floor: pal.TEXTURE_FLOOR,
      theme: document.documentElement.dataset.theme || 'auto',
      engraved: [...mod.plate.paint.values()].filter((r2) => r2.engrave === 'heavy').length,
      painted: mod.plate.paint.size };
  });
  log('theme ' + r.theme + '   floor ' + r.floor + ' dE00   heavy: ' + JSON.stringify(r.weak)
    + '   (' + r.engraved + ' of ' + r.painted + ' units drawn at 1900)');
  for (const [k, v] of Object.entries(r.sep).sort((a, b) => a[1].worst - b[1].worst)) {
    log('   ' + k.padEnd(17) + ' worst ' + String(v.worst).padStart(5) + '   normal ' + String(v.byModel.normal).padStart(5)
      + '  protan ' + String(v.byModel.protan).padStart(5) + '  deutan ' + String(v.byModel.deutan).padStart(5)
      + '  tritan ' + String(v.byModel.tritan).padStart(5) + (r.weak.includes(k) ? '   <- heavy engraving' : ''));
  }
  await shot('plate1900');
};
