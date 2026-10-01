module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=period&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
  await page.waitForTimeout(3000);
  const t = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button,a')).filter(x=>x.offsetParent).find(x=>/other route|leaves out|route/i.test(x.innerText||''));
    if (b) { const s=(b.innerText||'').trim(); b.click(); return s; } return null;
  });
  log('clicked: ' + t);
  await page.waitForTimeout(1500);
  await shot('routes');
  const txt = await page.evaluate(()=>{ const o=document.querySelector('.tr-panel, .cx-sheet, .app__overlay'); return (o||document.body).innerText; });
  log('ROUTE CHOOSER:\n' + txt.slice(0,6000));
};
