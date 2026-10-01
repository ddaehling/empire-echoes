module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=period&step=10', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2200);
  log('bar buttons: ' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.tr-bar button')].map(b => [b.innerText.trim(), b.getAttribute('aria-label'), b.disabled]))));
  await page.evaluate(() => { const b = [...document.querySelectorAll('.tr-bar button')].find(x => /finish/i.test(x.innerText)); b && b.focus(); });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  await shot('close');
  log('\n===== CLOSE =====\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 9000));
};
