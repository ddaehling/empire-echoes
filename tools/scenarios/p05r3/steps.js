module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2000);
  const d = await page.evaluate(() => {
    const ix = window.BEA && window.BEA.toursIndex;
    if (!ix) return 'no index';
    const out = {};
    for (const k of Object.keys(ix.routes)) out[k] = ix.routes[k].steps.map(s => s.step + ' ' + s.kind + ' ' + s.id + (s.optional ? ' (opt)' : ''));
    return out;
  });
  log(JSON.stringify(d, null, 1));
};
