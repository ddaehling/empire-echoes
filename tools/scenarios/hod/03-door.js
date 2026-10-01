module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.waitForTimeout(6000);
  // enumerate buttons
  const btns = await page.evaluate(() => [...document.querySelectorAll('button,a[role=button],a[href]')]
    .map(b=>({t:(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,80), aria:b.getAttribute('aria-label'), id:b.id, cls:b.className&&String(b.className).slice(0,60)}))
    .filter(b=>b.t||b.aria));
  log('BUTTONS:\n'+btns.map(b=>`  [${b.t}] aria=${b.aria||''} cls=${b.cls||''}`).join('\n'));
  // click Start the lesson
  const start = await page.$('text=Start the lesson');
  if (start) { await start.click(); await page.waitForTimeout(2500); await shot('after-start'); }
  const t = await page.evaluate(()=>document.body.innerText);
  log('--- AFTER START ---'); log(t);
  log('ERR '+errs.length+' '+errs.join('|'));
};
