module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#panel=classroom', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
  await page.waitForTimeout(4000);
  const names = await page.evaluate(() => Array.from(document.querySelectorAll('button')).filter(b=>b.offsetParent && /^print/i.test((b.innerText||'').trim())).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()));
  log('PRINT BUTTONS: ' + JSON.stringify(names));
  const want = process.env.RUB_PRINT || 'Print the lesson plan';
  await page.evaluate((w) => {
    const b = Array.from(document.querySelectorAll('button')).filter(x=>x.offsetParent).find(x=>(x.innerText||'').replace(/\s+/g,' ').trim() === w);
    if (b) b.click();
  }, want);
  await page.waitForTimeout(2500);
  await shot('print');
  const txt = await page.evaluate(() => {
    const p = document.querySelector('.tp-print, .print, [data-print], .tp-sheet') || document.body;
    return p.innerText;
  });
  log('PRINT [' + want + ']:\n' + txt.slice(0, 14000));
};
