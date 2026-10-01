module.exports = async ({ page, log, shot }) => {
  await page.waitForTimeout(1600);
  await page.evaluate(() => { location.hash = '#tour=core&step=5'; });
  await page.waitForTimeout(3200);
  await page.evaluate(() => window.BEA.bus.emit('tours:essay', { chapter: 'atlantic' }));
  await page.waitForTimeout(1600);
  const e = await page.evaluate(() => ({
    title: (document.querySelector('.cx-sheet__head')||{}).innerText,
    figs: [...document.querySelectorAll('.tr-q[data-fig]')].map(x=>x.getAttribute('data-fig')),
    rows: [...document.querySelectorAll('.tr-figs__row')].map(x=>x.getAttribute('data-fig')),
    leak: (document.body.innerText.match(/\{\{fig:[a-z0-9-]+\}\}/g)||[]).length,
    defect: (document.body.innerText.match(/No source for this figure/g)||[]).length,
  }));
  log('essay ' + JSON.stringify(e));
  await shot('essay');
  // back to the beat, complete the ordering strip, check the reveal figures
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /back to the beat/i.test(x.textContent||'')); if (b) b.click(); });
  await page.waitForTimeout(2000);
  for (let pass = 0; pass < 8; pass++) {
    const n = await page.evaluate(() => {
      const pool = [...document.querySelectorAll('.tr-order__btn')];
      const before = pool.length;
      for (const b of pool) { b.click(); if (document.querySelectorAll('.tr-order__btn').length < before) break; }
      return document.querySelectorAll('.tr-order__btn').length;
    });
    if (!n) break;
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(900);
  const o = await page.evaluate(() => ({
    figs: [...document.querySelectorAll('.tr-q[data-fig]')].map(x=>x.getAttribute('data-fig')),
    rows: [...document.querySelectorAll('.tr-figs__row')].map(x=>x.getAttribute('data-fig')),
    blocks: document.querySelectorAll('.tr-figs').length,
    blockParents: [...document.querySelectorAll('.tr-figs')].map(x=>x.parentElement.className),
    marks: [...document.querySelectorAll('.tr-q__m')].map(x=>x.textContent),
    leak: (document.body.innerText.match(/\{\{fig:[a-z0-9-]+\}\}/g)||[]).length,
    text: '',
  }));
  log('order ' + JSON.stringify(o));
  await shot('order');
};
