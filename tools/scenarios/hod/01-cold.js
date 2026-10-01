module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.waitForTimeout(2500);
  await shot('cold');
  const txt = await page.evaluate(() => document.body.innerText);
  log('--- BODY TEXT ---');
  log(txt.slice(0, 4000));
  log('--- CONSOLE ERRORS: ' + errs.length + ' ---');
  errs.slice(0,10).forEach(e => log(e));
  const routes = await page.evaluate(() => {
    const a = window.__BEA || window.BEA || {};
    return Object.keys(a);
  });
  log('globals: ' + JSON.stringify(routes));
};
