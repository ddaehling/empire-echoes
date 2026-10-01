module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.waitForTimeout(800);
  const r = await page.evaluate(() => {
    const out = {};
    for (const sel of ['.map', '.map__frame', '.stage__map', '.app__stage']) {
      const e = document.querySelector(sel);
      if (!e) { out[sel] = 'absent'; continue; }
      const cs = getComputedStyle(e);
      out[sel] = cs.transition + ' | ' + cs.width + ' | motion=' + (document.documentElement.dataset.motion || '-');
    }
    return out;
  });
  for (const k of Object.keys(r)) log(k + ' :: ' + r[k]);
};
