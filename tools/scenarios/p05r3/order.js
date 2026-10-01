module.exports = async ({ page, log, shot }) => {
  await page.waitForTimeout(1600);
  await page.evaluate(() => { location.hash = '#tour=core&step=5'; });
  await page.waitForTimeout(3200);
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
  await page.waitForTimeout(1200);
  const o = await page.evaluate(() => ({
    figs: [...document.querySelectorAll('.tr-q[data-fig]')].map(x=>x.getAttribute('data-fig')),
    marks: [...document.querySelectorAll('.tr-q__m')].map(x=>x.textContent),
    blocks: document.querySelectorAll('.tr-figs').length,
    parents: [...document.querySelectorAll('.tr-figs')].map(x => x.parentElement.className + ' >> ' + (x.parentElement.parentElement||{}).className),
    markParents: [...document.querySelectorAll('.tr-q')].map(x => x.closest('[class]').className.split(' ')[0]),
    rows: [...document.querySelectorAll('.tr-figs__row')].map(x=>x.getAttribute('data-fig')),
    leak: (document.body.innerText.match(/\{\{fig:[a-z0-9-]+\}\}/g)||[]).length,
    defect: (document.body.innerText.match(/No source for this figure/g)||[]).length,
  }));
  log('order ' + JSON.stringify(o));
  await shot('order');
};
