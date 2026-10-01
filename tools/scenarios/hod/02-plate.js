module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.waitForTimeout(7000);
  await shot('plate');
  const txt = await page.evaluate(() => {
    const el = document.querySelector('.plate, [class*=plate], main') || document.body;
    return document.body.innerText;
  });
  log('--- BODY TEXT ---'); log(txt);
  log('--- ERRORS ' + errs.length);
  errs.slice(0,10).forEach(e=>log(e));
};
