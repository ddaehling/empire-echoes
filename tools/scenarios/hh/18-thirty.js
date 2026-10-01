/* hh/18-thirty — walk the full path and record every stop and every forward edge. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=0', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  const seen = [];
  for (let i = 0; i < 60; i++) {
    const st = await page.evaluate(() => {
      const n = document.querySelector('.tr-bar__next');
      return { count: document.querySelector('.tr-bar__count')?.textContent || '',
        title: document.querySelector('.cx-sheet__title')?.textContent || '',
        field: !!document.querySelector('.tr-field'), cp: !!document.querySelector('.qz-cp__lede'),
        locked: !!(n && n.disabled) };
    });
    seen.push(st.count + ' | ' + st.title + (st.field ? ' [FIELD]' : '') + (st.cp ? ' [CHECKPOINT]' : '') + (st.locked ? ' locked' : ''));
    if (st.field) { await page.evaluate(() => document.querySelector('.tr-field__cell')?.click()); await page.waitForTimeout(300); }
    if (st.cp) {
      const back = await page.evaluate(() => { const b = [...document.querySelectorAll('.cx-cta, button')].find(n => /back to the beat/i.test(n.textContent||'')); if (!b) return false; b.click(); return true; });
      if (back) { await page.waitForTimeout(500); continue; }
    }
    const moved = await page.evaluate(() => { const n = document.querySelector('.tr-bar__next'); if (!n || n.disabled) return false; n.click(); return true; });
    if (!moved) { seen.push('  -> NEXT NOT AVAILABLE, stop'); break; }
    await page.waitForTimeout(500);
  }
  log(seen.join('\n'));
  log('FIELDS SEEN: ' + seen.filter(s => /FIELD/.test(s)).length);
};
