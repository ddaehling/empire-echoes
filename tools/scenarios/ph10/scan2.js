module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(700);
  const seen = new Set();
  for (const p of ['workshop', 'evidence', 'classroom', 'methods']) {
    await page.evaluate((k) => { location.hash = '#panel=' + k; }, p);
    await page.waitForTimeout(2200);
    await page.evaluate(() => { document.querySelectorAll('details').forEach(d => { d.open = true; }); });
    await page.waitForTimeout(800);
    const t = await page.evaluate(() => {
      const el = document.querySelector('.app__sheet') || document.body; return el.innerText;
    });
    log('=== PANEL ' + p + ' (' + t.length + ' chars) ===');
    let n = 0;
    for (const m of (t.match(/[^.\n]{0,150}\b(?:minutes?|thirty|period)\b[^.\n]{0,120}/gi) || [])) {
      const k = m.trim().replace(/\s+/g, ' ');
      if (seen.has(k)) continue; seen.add(k); n++;
      log('  · ' + k);
    }
    if (!n) log('  (no minute/period strings)');
  }
};
