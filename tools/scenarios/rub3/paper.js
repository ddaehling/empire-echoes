module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#panel=classroom', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
  await page.waitForTimeout(4000);
  const labels = await page.evaluate(() => Array.from(document.querySelectorAll('button')).filter(b=>b.offsetParent && /print/i.test(b.innerText||'')).map((b,i)=>i+':'+(b.innerText||'').replace(/\s+/g,' ').trim()));
  log('PRINT BUTTONS: ' + labels.join(' | '));
  const idxs = (process.env.RUB_IDX || '0,1,2').split(',').map(Number);
  for (const idx of idxs) {
    const t = await page.evaluate((i) => {
      const bs = Array.from(document.querySelectorAll('button')).filter(b=>b.offsetParent && /print/i.test(b.innerText||''));
      const b = bs[i]; if (!b) return null; const lab=(b.innerText||'').replace(/\s+/g,' ').trim(); b.click(); return lab;
    }, idx);
    await page.waitForTimeout(1800);
    const paper = await page.evaluate(() => { const p = document.querySelector('.tp-paper'); return p ? p.innerText : '(no .tp-paper)'; });
    log('=== PAPER [' + idx + ' ' + t + '] (' + paper.length + ' chars)\n' + paper.slice(0, 12000));
  }
};
