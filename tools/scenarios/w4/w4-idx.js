module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.toursIndex, null, { timeout: 25000 });
  const out = await page.evaluate(() => {
    const r = {};
    for (const [id, v] of Object.entries(BEA.toursIndex.routes)) r[id] = v.steps.map((s) => s.kind[0] + ':' + s.id + (s.optional ? '*' : ''));
    return r;
  });
  for (const [k, v] of Object.entries(out)) log(k + ' (' + v.length + '): ' + v.join(' | '));
};
