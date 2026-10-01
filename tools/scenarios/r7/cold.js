module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.waitForTimeout(3000);
  await shot('cold');
  log('TITLE: ' + await page.title());
  log('BODY:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 2500));
  log('CONSOLE ERRORS: ' + JSON.stringify(errs));
};
