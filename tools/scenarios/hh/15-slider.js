module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#tour=period&step=7', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2400);
  const probe = () => page.evaluate(() => {
    const r = document.querySelector('.qz-range');
    return { value: r.value, valuetext: r.getAttribute('aria-valuetext'), valuenow: r.getAttribute('aria-valuenow'),
      shown: (r.closest('div')||{}).innerText ? r.closest('div').innerText.replace(/\s+/g,' ') : '' };
  });
  log('before: ' + JSON.stringify(await probe()));
  await page.focus('.qz-range');
  for (let i = 0; i < 20; i++) await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  log('after 20 right: ' + JSON.stringify(await probe()));
  // commit
  await page.getByRole('button', { name: /^Commit$/ }).click();
  await page.waitForTimeout(1600);
  log('after commit:\n' + (await page.evaluate(() => document.querySelector('.cx-sheet, .qz-card, .app__sheet') ? document.querySelector('.cx-sheet, .qz-card, .app__sheet').innerText : document.body.innerText)).slice(0, 2000));
};
