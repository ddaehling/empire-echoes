module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1700);
  await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(x=>/teaching desk|§/i.test(x.innerText||'')); if(b)b.click(); });
  await page.waitForTimeout(900);
  await page.evaluate(() => { const t=[...document.querySelectorAll('[role="tab"]')].find(x=>/classroom/i.test(x.innerText)); if(t)t.click(); });
  await page.waitForTimeout(1100);
  for (const n of ['1','2']) {
    await page.evaluate((k)=>{document.querySelector('.tp-unit__b[data-lesson="'+k+'"]').click();}, n);
    await page.waitForTimeout(900);
    log('L'+n+' ROWS ' + JSON.stringify(await page.evaluate(() =>
      [...document.querySelectorAll('.tp-lesson__b')].map(li => ({
        min: (li.querySelector('.tp-lesson__at')||{}).innerText,
        t: (li.querySelector('.tp-lesson__t')||{}).innerText,
        ask: ((li.querySelector('.tp-lesson__ask')||{}).innerText||'').slice(0,60),
        step: (li.querySelector('.tp-lesson__stepn')||{}).innerText || '—',
      })))));
    log('L'+n+' MOVES ' + JSON.stringify(await page.evaluate(() =>
      [...document.querySelectorAll('.tp-moves__i')].map(x=>x.innerText.replace(/\n/g,' | ')))));
  }
};
