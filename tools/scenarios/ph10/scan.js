module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(700);
  const panels = ['workshop', 'evidence', 'classroom', 'methods'];
  const seen = new Set();
  for (const p of panels) {
    await page.evaluate((k) => { location.hash = '#panel=' + k; }, p);
    await page.waitForTimeout(1800);
    /* expand everything expandable, twice */
    for (let r = 0; r < 3; r++) {
      await page.evaluate(() => {
        document.querySelectorAll('details').forEach(d => { d.open = true; });
        document.querySelectorAll('[aria-expanded="false"]').forEach(b => { try { b.click(); } catch (_) {} });
      });
      await page.waitForTimeout(900);
    }
    const t = await page.evaluate(() => document.body.innerText);
    log('=== PANEL ' + p + ' (' + t.length + ' chars) ===');
    for (const m of (t.match(/[^.\n]{0,150}\b(?:minutes?|thirty|period)\b[^.\n]{0,120}/gi) || [])) {
      const k = m.trim().replace(/\s+/g, ' ');
      if (seen.has(k)) continue; seen.add(k);
      log('  · ' + k);
    }
  }
};
