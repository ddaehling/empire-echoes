module.exports = async ({ page, shot, log }) => {
  const route = process.env.RUB_ROUTE || 'period';
  await page.goto('http://localhost:8777/app/#tour=' + route + '&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
  await page.waitForTimeout(3000);
  for (let i = 0; i < 40; i++) {
    const st = await page.evaluate(() => document.getElementById('app').getAttribute('data-step'));
    const clicked = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).filter(x=>x.offsetParent)
        .find(x => /^(next|finish)/i.test((x.innerText||'').replace(/\s+/g,' ').trim()));
      if (b) { const t=(b.innerText||'').replace(/\s+/g,' ').trim(); b.click(); return t; }
      return null;
    });
    log('step ' + st + ' -> ' + clicked);
    if (!clicked) break;
    await page.waitForTimeout(1100);
    if (/finish/i.test(clicked)) break;
  }
  await page.waitForTimeout(2500);
  await shot('close');
  const txt = await page.evaluate(()=>{ const o=document.querySelector('.cl-sheet, .close, .app__overlay'); return (o||document.body).innerText; });
  log('CLOSE:\n' + txt.slice(0,9000));
};
