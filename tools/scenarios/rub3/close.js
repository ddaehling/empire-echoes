module.exports = async ({ page, shot, log }) => {
  const route = process.env.RUB_ROUTE || 'period';
  await page.goto('http://localhost:8777/app/#tour=' + route + '&step=99', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
  await page.waitForTimeout(3000);
  log('hash after clamp: ' + await page.evaluate(()=>location.hash));
  const btns = await page.evaluate(() => Array.from(document.querySelectorAll('button,a')).filter(b=>b.offsetParent).map(b=>b.tagName+':'+(b.innerText||'').trim().replace(/\n/g,' | ').slice(0,70)));
  log('BUTTONS:\n' + btns.join('\n'));
  await shot('last');
  // click the close/finish
  const hit = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button,a')).filter(x=>x.offsetParent).find(x=>/close|finish|end|through-line|sentence/i.test(x.innerText||''));
    if (b) { b.click(); return (b.innerText||'').trim(); } return null;
  });
  log('clicked: ' + hit);
  await page.waitForTimeout(2000);
  await shot('close');
  const txt = await page.evaluate(()=>{ const o=document.querySelector('.app__overlay')||document.body; return o.innerText; });
  log('CLOSE TEXT:\n' + txt.slice(0,7000));
};
