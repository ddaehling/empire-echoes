module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  const ix = await page.evaluate(() => {
    const ix = window.BEA && window.BEA.toursIndex;
    const out = {};
    for (const k of Object.keys(ix.routes || {})) {
      out[k] = (ix.routes[k].steps || []).map((s, i) => (i+1) + ':' + s.kind + (s.optional ? '(opt)' : '') + ':' + (s.id || s.beatId || ''));
    }
    return out;
  });
  for (const k of Object.keys(ix)) log(k + '\n  ' + ix[k].join('\n  '));
};
