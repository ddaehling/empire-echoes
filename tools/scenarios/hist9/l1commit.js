module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=lesson-one&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  const press = async (label) => {
    const b = page.locator('button', { hasText: label }).first();
    if (await b.count() && await b.isVisible().catch(()=>false)) { await b.click().catch(()=>{}); await page.waitForTimeout(700); return true; }
    return false;
  };
  for (let s = 1; s <= 9; s++) {
    await page.evaluate((h) => { window.location.hash = h; }, '#tour=lesson-one&step=' + s);
    await page.waitForTimeout(1000);
    /* commit anything committable on this step */
    await press('Commit this guess');
    await press('Commit');
    await press('Place it');
    const txt = await page.evaluate(() => (document.querySelector('.app__sheet')||document.body).innerText.replace(/\n{3,}/g,'\n\n'));
    log('======== STEP ' + s + ' (after commits) ========');
    log(txt.slice(0, 2200));
  }
  /* the Close */
  await page.evaluate(() => { window.location.hash = '#tour=lesson-one&step=99'; });
  await page.waitForTimeout(1800);
  const close = await page.evaluate(() => (document.querySelector('.app__sheet')||document.body).innerText.replace(/\n{3,}/g,'\n\n'));
  log('======== CLOSE ========');
  log(close.slice(0, 9000));
  await shot('l1-close');
};
