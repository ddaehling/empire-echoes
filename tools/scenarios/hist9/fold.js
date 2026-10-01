module.exports = async ({ page, shot, log }) => {
  for (const [id, yr] of [['kenya',1964],['bengal-presidency',1765],['british-india',1900],['jamaica',1838]]) {
    await page.goto('http://localhost:8777/app/#year=' + yr + '&sel=' + id, { waitUntil: 'load' });
    await page.waitForTimeout(2400);
    const r = await page.evaluate(() => {
      const a = document.querySelector('.app__dossier');
      const rr = a ? a.getBoundingClientRect() : null;
      const box = (s) => { const n = document.querySelector(s); if (!n) return null; const b = n.getBoundingClientRect(); return {b:Math.round(b.bottom), t:Math.round(b.top), h:Math.round(b.height), txt:(n.innerText||'').replace(/\s+/g,' ').slice(0,60)}; };
      return { panel: rr ? {top:Math.round(rr.top), bottom:Math.round(rr.bottom), h:Math.round(rr.height)} : null,
        scrollTop: a?a.scrollTop:null, scrollH: a?a.scrollHeight:null,
        status: box('#dsr-status'), taken: box('#dsr-taken'), ended: box('#dsr-ended'),
        anyStatusId: !!document.getElementById('dsr-status') };
    });
    log(id + ' ' + yr + ' -> ' + JSON.stringify(r));
    await shot('fold-' + id);
  }
  /* the full route card */
  await page.goto('http://localhost:8777/app/#tour=lesson-one&step=1', { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  const t = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button,a')].find(x=>/other routes|routes, and what/i.test(x.textContent||''));
    if (b) b.click();
    return null;
  });
  await page.waitForTimeout(1400);
  const card = await page.evaluate(() => (document.querySelector('.app__sheet')||document.body).innerText.replace(/\n{3,}/g,'\n\n'));
  log('===== ROUTE CARD =====');
  log(card.slice(0, 6000));
  await shot('routecard');
};
